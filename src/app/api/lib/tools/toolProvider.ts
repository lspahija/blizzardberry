import { dynamicTool, tool, Tool } from 'ai';
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
        const isTabular = data.every(
          (row) => row && typeof row === 'object' && !Array.isArray(row)
        );
        if (!isTabular) {
          return {
            error: 'Invalid data format',
            message:
              'Visualization requires an array of objects (tabular data).',
          };
        }

        // Require at least one numeric field across rows
        const sample = data[0] ?? ({} as Record<string, any>);
        const numericFieldExists = Object.keys(sample).some((k) => {
          const v = sample[k];
          return (
            typeof v === 'number' ||
            (typeof v === 'string' && v.trim() !== '' && !isNaN(Number(v)))
          );
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
          const values = data.map((row) =>
            Number(
              valueKey
                ? row[valueKey]
                : Object.values(row).find(
                    (v) =>
                      typeof v === 'number' ||
                      (!isNaN(Number(v)) && String(v).trim() !== '')
                  )
            )
          );
          const hasNegative = values.some((n) => !Number.isFinite(n) || n < 0);
          const total = values.reduce(
            (a, b) => (Number.isFinite(b) ? a + b : a),
            0
          );
          if (hasNegative || total <= 0 || data.length > 24) {
            return {
              error: 'Unsuitable data for pie chart',
              message:
                'Pie charts need non-negative values, a positive total, and a manageable number of categories (≤ 24).',
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
    const inputSchema = createInputSchema(
      action.executionModel.parameters || []
    );

    const prefix =
      action.executionContext === ExecutionContext.SERVER
        ? 'ACTION_SERVER_'
        : 'ACTION_CLIENT_';

    const normalizedName = action.name.replace(/\s+/g, '_');
    const actionName = `${prefix}${normalizedName}`;

    const executeFunction: (input: any) => Promise<any> =
      action.executionContext === ExecutionContext.SERVER
        ? async (input) =>
            substituteRequestModel(action.executionModel.request, input)
        : async (input) => {
            return {
              functionName: toCamelCase(action.executionModel.functionName),
              args: input,
            };
          };

    tools[actionName] = dynamicTool({
      description: action.description,
      inputSchema,
      execute: executeFunction,
    });
  }

  return tools;
}

function createInputSchema(parameters: Parameter[]): z.ZodObject<any> {
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

function substituteHeaders(
  headers: Record<string, string> | undefined,
  args: Record<string, any>
): Record<string, string> | undefined {
  if (!headers) return undefined;

  return Object.fromEntries(
    Object.entries(headers).map(([key, value]) => [
      key,
      substitutePlaceholders(value, args),
    ])
  );
}

function substituteBody(
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

function substituteRequestModel(
  request: HttpRequest,
  args: Record<string, any>
): HttpRequest {
  return {
    url: substitutePlaceholders(request.url, args),
    method: request.method,
    headers: substituteHeaders(request.headers, args),
    body: substituteBody(request.body, args),
  };
}
