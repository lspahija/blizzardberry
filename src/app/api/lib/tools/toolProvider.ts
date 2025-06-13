import { tool, Tool } from 'ai';
import { z } from 'zod';
import { getActions } from '@/app/api/lib/store/actionStore';
import {
  ExecutionContext,
  Parameter,
  ParameterType,
} from '@/app/api/lib/model/action/baseAction';
import {
  BackendAction,
  HttpRequest,
  Body,
} from '@/app/api/lib/model/action/backendAction';
import { similaritySearch } from '../store/documentStore';

export function createSearchKnowledgeBaseTool(agentId: string): Tool {
  return tool({
    description:
      'Search the knowledge base for information to answer user questions about the application',
    parameters: z.object({
      query: z
        .string()
        .describe('The search query to find relevant information'),
    }),
    execute: async ({ query }) => {
      try {
        const groupedResults = await similaritySearch(query, 5, agentId);

        if (Object.keys(groupedResults).length === 0) {
          return {
            message: 'No relevant information found in the knowledge base.',
          };
        }

        return {
          results: groupedResults,
          message: `Found ${Object.keys(groupedResults).length} relevant document groups that may help answer the query.`,
        };
      } catch (error) {
        console.error(
          'Error searching knowledge base:',
          JSON.stringify({ error }, null, 2)
        );
        return {
          error: 'Failed to search knowledge base',
          message:
            'There was an error retrieving information from the knowledge base.',
        };
      }
    },
  });
}

export async function getToolsFromActions(agentId: string) {
  const actions = await getActions(agentId);
  const tools: Record<string, Tool> = {};

  for (const action of actions) {
    const parameterSchema = createParameterSchema(
      action.executionModel.parameters || []
    );
    const prefix =
      action.executionContext === ExecutionContext.SERVER
        ? 'ACTION_SERVER_'
        : 'ACTION_CLIENT_';
    const actionName = `${prefix}${action.name}`;

    if (action.executionContext === ExecutionContext.SERVER) {
      tools[actionName] = tool({
        description: action.description,
        parameters: parameterSchema,
        execute: async (params: Record<string, any>) =>
          substituteRequestModel(
            (action as BackendAction).executionModel.request,
            params
          ),
      });
    } else {
      tools[actionName] = tool({
        description: action.description,
        parameters: parameterSchema,
        execute: async (params) => ({
          functionName: actionName,
          params,
        }),
      });
    }
  }

  return tools;
}

function createParameterSchema(parameters: Parameter[]): z.ZodObject<any> {
  const schemaFields: Record<string, z.ZodTypeAny> = {};

  for (const param of parameters) {
    let baseSchema: z.ZodTypeAny;
    switch (param.type) {
      case ParameterType.String:
        baseSchema = z.string();
        break;
      case ParameterType.Number:
        baseSchema = z.number();
        break;
      case ParameterType.Boolean:
        baseSchema = z.boolean();
        break;
      default:
        baseSchema = z.any();
    }

    const finalSchema = param.isArray ? z.array(baseSchema) : baseSchema;
    schemaFields[param.name] = finalSchema.optional();
  }

  return z.object(schemaFields);
}

function substitutePlaceholders(
  input: string,
  params: Record<string, any>
): string {
  let result = input;
  for (const [key, value] of Object.entries(params)) {
    const placeholder = `{{${key}}}`;
    const replacement = Array.isArray(value)
      ? value.join(',')
      : value.toString();
    result = result.replace(new RegExp(placeholder, 'g'), replacement);
  }
  return result;
}

function substituteRequestModel(
  request: HttpRequest,
  params: Record<string, any>
): HttpRequest {
  const { url, method, headers, body } = request;

  const substitutedUrl = substitutePlaceholders(url, params);
  const substitutedHeaders = headers
    ? Object.fromEntries(
        Object.entries(headers).map(([key, value]) => [
          key,
          substitutePlaceholders(value, params),
        ])
      )
    : undefined;

  let substitutedBody: Body | undefined;
  if (body) {
    substitutedBody = {};
    for (const [key, value] of Object.entries(body)) {
      if (typeof value === 'string') {
        substitutedBody[key] = substitutePlaceholders(value, params);
      } else if (Array.isArray(value)) {
        substitutedBody[key] = value.map((item) =>
          typeof item === 'string' ? substitutePlaceholders(item, params) : item
        );
      } else {
        substitutedBody[key] = value;
      }
    }
  }

  return {
    url: substitutedUrl,
    method,
    headers: substitutedHeaders,
    body: substitutedBody,
  };
}
