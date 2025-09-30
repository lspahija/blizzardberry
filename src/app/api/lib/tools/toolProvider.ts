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
import { toCamelCase } from '@/app/(frontend)/lib/actionUtils';

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
      xKey: z
        .string()
        .optional()
        .describe('Key for x-axis data (optional, inferred if omitted)'),
      yKey: z
        .union([z.string(), z.array(z.string())])
        .optional()
        .describe('Key(s) for y-axis/series (optional, inferred if omitted)'),
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
        if (!Array.isArray(data) || data.length === 0) {
          return {
            error: 'No data provided for visualization',
            message: 'Cannot create a chart with empty data.',
          };
        }

        // Basic shape validation: require array of non-null objects
        const isTabular = data.every((row) => row && typeof row === 'object' && !Array.isArray(row));
        if (!isTabular) {
          return {
            error: 'Invalid data format',
            message: 'Visualization requires an array of objects (tabular data).',
          };
        }

        // Require at least one numeric field across rows
        const sample = data[0] ?? {} as Record<string, any>;
        const numericFieldExists = Object.keys(sample).some((k) => {
          const v = sample[k];
          return typeof v === 'number' || (typeof v === 'string' && v.trim() !== '' && !isNaN(Number(v)));
        });
        if (!numericFieldExists) {
          return {
            error: 'No numeric fields',
            message: 'Provide at least one numeric column to visualize.',
          };
        }

        // Chart-type-specific sanity checks
        if (chartType === 'pie') {
          // Determine value field
          const valueKey = Array.isArray(yKey) ? yKey[0] : yKey;
          const values = data.map((row) => Number(valueKey ? row[valueKey] : Object.values(row).find((v) => typeof v === 'number' || (!isNaN(Number(v)) && String(v).trim() !== ''))));
          const hasNegative = values.some((n) => !Number.isFinite(n) || n < 0);
          const total = values.reduce((a, b) => (Number.isFinite(b) ? a + b : a), 0);
          if (hasNegative || total <= 0 || data.length > 24) {
            return {
              error: 'Unsuitable data for pie chart',
              message: 'Pie charts need non-negative values, a positive total, and a manageable number of categories (≤ 24).',
            };
          }
        }

        if (xKey || yKey) {
          const yKeys = Array.isArray(yKey) ? yKey : yKey ? [yKey] : [];
          const hasRequiredKeys = data.every((item) => {
            const hasX = xKey
              ? Object.prototype.hasOwnProperty.call(item, xKey)
              : true;
            const hasYs = yKeys.every((k) =>
              Object.prototype.hasOwnProperty.call(item, k)
            );
            return hasX && hasYs;
          });
          if (!hasRequiredKeys) {
            return {
              error: 'Invalid data structure',
              message: 'One or more specified keys are missing in the data.',
            };
          }
        }

        return {
          type: 'visualization',
          config: {
            data,
            chartType,
            title:
              title ||
              (Array.isArray(yKey)
                ? `${yKey.join(', ')} by ${xKey ?? 'auto'}`
                : yKey
                  ? `${yKey} by ${xKey ?? 'auto'}`
                  : 'Visualization'),
            ...(xKey ? { xKey } : {}),
            ...(yKey ? { yKey } : {}),
            options: {
              width: 600,
              height: 400,
              showLegend: true,
              showGrid: true,
              ...options,
            },
          },
          message: title
            ? `Generated ${chartType} chart: ${title}`
            : `Generated ${chartType} chart`,
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
        ? async (params) =>
            substituteRequestModel(action.executionModel.request, params)
        : async (params) => {
            const filteredParams = filterPlaceholderValues(params);
            return {
              functionName: toCamelCase(action.executionModel.functionName),
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
    const replacement = Array.isArray(value) ? value.join(',') : String(value);
    result = result.replace(new RegExp(placeholder, 'g'), replacement);
  }
  return result;
}

function substituteBodyValue(input: string, params: Record<string, any>): any {
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
    if (typeof body === 'string') {
      // Handle string body with template variables
      let substitutedString = body;
      for (const [key, value] of Object.entries(params)) {
        const placeholder = `{{${key}}}`;
        // For JSON values, replace without quotes if the placeholder is unquoted
        const unquotedPattern = new RegExp(`(?<!")${placeholder}(?!")`, 'g');
        const quotedPattern = new RegExp(`"${placeholder}"`, 'g');

        // Handle unquoted placeholders - replace with JSON representation
        substitutedString = substitutedString.replace(unquotedPattern, JSON.stringify(value));
        // Handle quoted placeholders - replace preserving quotes if string
        substitutedString = substitutedString.replace(quotedPattern, JSON.stringify(value));
      }
      try {
        // Try to parse the substituted string as JSON
        substitutedBody = JSON.parse(substitutedString);
      } catch (e) {
        // If parsing fails, use the string as-is
        substitutedBody = substitutedString;
      }
    } else {
      // Handle object body (legacy format)
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
  }

  return {
    url: substitutedUrl,
    method,
    headers: substitutedHeaders,
    body: substitutedBody,
  };
}
