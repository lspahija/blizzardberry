import { tool, Tool } from 'ai';
import { z } from 'zod';
import { getActions } from '@/app/api/lib/store/actionStore';
import {
  ExecutionContext,
  Parameter,
  ParameterType,
} from '@/app/api/lib/model/action/baseAction';
import { Body, HttpRequest } from '@/app/api/lib/model/action/backendAction';

export async function getToolsFromActions(agentId: string) {
  const actions = await getActions(agentId);
  const tools: Record<string, Tool> = {};

  for (const action of actions) {
    const inputSchema = createInputSchema(
      action.executionModel.parameters || []
    );

    const prefix =
      action.executionContext === ExecutionContext.SERVER
        ? 'ACTION_SERVER_'
        : 'ACTION_CLIENT_';

    const normalizedName = action.name.replace(/\s+/g, '_');
    const nameWithPrefix = `${prefix}${normalizedName}`;

    const executeFunction: (input: any) => Promise<any> =
      action.executionContext === ExecutionContext.SERVER
        ? async (input) =>
            injectArgsIntoRequest(action.executionModel.request, input)
        : async (input) => {
            return {
              functionName: action.executionModel.functionName,
              args: input,
            };
          };

    tools[nameWithPrefix] = tool({
      description: action.description,
      inputSchema,
      execute: executeFunction,
    });
  }

  return tools;
}

const typeMap: Record<ParameterType, z.ZodTypeAny> = {
  [ParameterType.String]: z.string(),
  [ParameterType.Number]: z.number(),
  [ParameterType.Boolean]: z.boolean(),
};

function createInputSchema(parameters: Parameter[]): z.ZodObject<any> {
  const schemaFields: Record<string, z.ZodTypeAny> = {};

  for (const param of parameters) {
    const baseSchema = typeMap[param.type] ?? z.unknown();
    schemaFields[param.name] = param.isArray ? z.array(baseSchema) : baseSchema;
  }

  return z.object(schemaFields);
}

function injectArgsIntoPlaceholders(
  input: string,
  args: Record<string, any>
): string {
  let result = input;
  for (const [key, value] of Object.entries(args)) {
    const placeholder = `{{${key}}}`;
    const replacement = Array.isArray(value) ? value.join(',') : String(value);
    result = result.replace(new RegExp(placeholder, 'g'), replacement);
  }
  return result;
}

function injectArgsIntoHeaders(
  headers: Record<string, string> | undefined,
  args: Record<string, any>
): Record<string, string> | undefined {
  if (!headers) return undefined;

  return Object.fromEntries(
    Object.entries(headers).map(([key, value]) => [
      key,
      injectArgsIntoPlaceholders(value, args),
    ])
  );
}

function injectArgsIntoBody(
  body: Body | undefined,
  args: Record<string, any>
): Body | undefined {
  if (!body) return undefined;

  let substitutedString =
    typeof body === 'string' ? body : JSON.stringify(body);

  // Only substitute unquoted variables like {{foo}}, not quoted ones like "{{foo}}"
  for (const [key, value] of Object.entries(args)) {
    const placeholder = `{{${key}}}`;
    const unquotedPattern = new RegExp(`(?<!")${placeholder}(?!")`, 'g');
    substitutedString = substitutedString.replace(
      unquotedPattern,
      JSON.stringify(value)
    );
  }

  try {
    return JSON.parse(substitutedString);
  } catch (e) {
    return substitutedString;
  }
}

function injectArgsIntoRequest(
  request: HttpRequest,
  args: Record<string, any>
): HttpRequest {
  return {
    url: injectArgsIntoPlaceholders(request.url, args),
    method: request.method,
    headers: injectArgsIntoHeaders(request.headers, args),
    body: injectArgsIntoBody(request.body, args),
  };
}
