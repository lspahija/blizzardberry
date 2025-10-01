import { tool, Tool } from 'ai';
import { z } from 'zod';
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
