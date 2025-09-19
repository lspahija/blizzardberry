import { tool, Tool } from 'ai';
import { z } from 'zod';
import { getActions } from '@/app/api/lib/store/actionStore';
import {
  ExecutionContext,
  Parameter,
  ParameterType,
} from '@/app/api/lib/model/action/baseAction';
import { HttpRequest, Body } from '@/app/api/lib/model/action/backendAction';
import { similaritySearch } from '../store/documentStore';

export function createSearchKnowledgeBaseTool(agentId: string): Tool {
  return tool({
    description:
      'Search the knowledge base for information to answer user questions about the application',
    inputSchema: z.object({
      query: z
        .string()
        .describe('The search query to find relevant information'),
    }),
    execute: async (input, options) => {
      const { query } = input;
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

export function createVisualizationTool(): Tool {
  return tool({
    description:
      'Generate data visualizations when data would be better presented as charts or graphs. Use this when you have numerical data that shows trends, comparisons, distributions, or patterns.',
    inputSchema: z.object({
      data: z
        .array(z.record(z.string(), z.any()))
        .describe('Array of data objects to visualize'),
      chartType: z
        .enum(['bar', 'line', 'pie', 'area', 'scatter'])
        .describe('Type of chart to generate'),
      title: z.string().optional().describe('Chart title'),
      xKey: z.string().describe('Key for x-axis data'),
      yKey: z.string().describe('Key for y-axis data'),
      options: z
        .object({
          width: z.number().optional(),
          height: z.number().optional(),
          colors: z.array(z.string()).optional(),
          showLegend: z.boolean().optional(),
          showGrid: z.boolean().optional(),
        })
        .optional()
        .describe('Additional chart configuration options'),
    }),
    execute: async (input) => {
      const { data, chartType, title, xKey, yKey, options = {} } = input;

      try {
        // Validate that data has the required keys
        if (data.length === 0) {
          return {
            error: 'No data provided for visualization',
            message: 'Cannot create a chart with empty data.',
          };
        }

        const hasRequiredKeys = data.every(
          (item) => item.hasOwnProperty(xKey) && item.hasOwnProperty(yKey)
        );

        if (!hasRequiredKeys) {
          return {
            error: 'Invalid data structure',
            message: `Data must contain both "${xKey}" and "${yKey}" keys.`,
          };
        }

        return {
          type: 'visualization',
          config: {
            data,
            chartType,
            title: title || `${yKey} by ${xKey}`,
            xKey,
            yKey,
            options: {
              width: 600,
              height: 400,
              showLegend: true,
              showGrid: true,
              ...options,
            },
          },
          message: `Generated ${chartType} chart showing ${title || `${yKey} by ${xKey}`}`,
        };
      } catch (error) {
        console.error('Error creating visualization:', error);
        return {
          error: 'Failed to create visualization',
          message: 'There was an error generating the chart.',
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

    const sanitizedName = action.name.replace(/\s+/g, '_');
    const actionName = `${prefix}${sanitizedName}`;

    const executeFunction: (params: any) => Promise<any> =
      action.executionContext === ExecutionContext.SERVER
        ? async ( params ) =>
            substituteRequestModel(action.executionModel.request, params)
        : async ( params ) => {
            const filteredParams = filterPlaceholderValues(params);
            return {
              functionName: action.executionModel.functionName,
              params: filteredParams,
            };
          };

    tools[actionName] = tool({
      description: action.description,
      inputSchema: parameterSchema,
      execute: executeFunction,
    });
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
        baseSchema = z.unknown();
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
      : String(value);
    result = result.replace(new RegExp(placeholder, 'g'), replacement);
  }
  return result;
}

function substituteBodyValue(
  input: string,
  params: Record<string, any>
): any {
  const placeholder = /^{{(.+)}}$/;
  const match = input.match(placeholder);

  if (match) {
    const paramName = match[1];
    return params[paramName];
  }

  return substitutePlaceholders(input, params);
}

function filterPlaceholderValues(
  params: Record<string, any>
): Record<string, any> {
  const filteredParams: Record<string, any> = {};
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined) {
      continue;
    }

    if (typeof value === 'string' && value.match(/^{{.*}}$/)) {
      continue;
    }

    if (Array.isArray(value) && value.length === 0) {
      continue;
    }

    filteredParams[key] = value;
  }
  return filteredParams;
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
        substitutedBody[key] = substituteBodyValue(value, params);
      } else if (Array.isArray(value)) {
        substitutedBody[key] = value.map((item) =>
          typeof item === 'string' ? substituteBodyValue(item, params) : item
        );
      } else {
        substitutedBody[key] = value;
      }
    }

    const filteredBody = filterPlaceholderValues(substitutedBody);
    substitutedBody =
      Object.keys(filteredBody).length > 0 ? filteredBody : undefined;
  }

  return {
    url: substitutedUrl,
    method,
    headers: substitutedHeaders,
    body: substitutedBody,
  };
}
