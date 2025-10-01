import { tool, Tool } from 'ai';
import { z } from 'zod';

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
