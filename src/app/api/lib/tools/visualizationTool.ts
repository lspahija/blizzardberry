import { tool, Tool } from 'ai';
import { z } from 'zod';
import { generateVisualizationWithLLM } from './llmVisualization';
import { getAgent } from '@/app/api/lib/store/agentStore';

export function createVisualizationTool(
  agentId: string,
  conversationId?: string
): Tool {
  return tool({
    description:
      'Generate data visualizations for any type of data. The LLM will analyze the data and create an appropriate SVG chart. Works with arrays, objects, nested structures - any data format.',
    inputSchema: z.object({
      data: z
        .any()
        .describe('data to visualize'),
      description: z
        .string()
        .optional()
        .describe(
          'Optional description of what to visualize (e.g., "show sales trends", "compare categories")'
        ),
    }),
    execute: async (input) => {
      const { data, description } = input;

      try {
        const agent = await getAgent(agentId);
        const userId = agent?.created_by;

        const result = await generateVisualizationWithLLM(
          data,
          userId,
          conversationId,
          description
        );

        if (result.error || !result.svg) {
          return {
            error: 'Failed to generate visualization',
            message: result.error || 'No SVG was generated',
          };
        }
        // Return the SVG
        return {
          type: 'visualization',
          svg: result.svg,
          message: 'Generated visualization with an LLM',
        };
      } catch (error) {
        console.error('Error creating visualization:', error);
        return {
          error: 'Failed to create visualization',
          message:
            error instanceof Error ? error.message : 'Unknown error occurred',
        };
      }
    },
  });
}
