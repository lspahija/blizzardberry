import { Tool } from 'ai';
import { createSearchKnowledgeBaseTool } from './searchKnowledgeBaseTool';
import { createVisualizationTool } from './visualizationTool';
import { getToolsFromActions } from './actionTools';

export { createSearchKnowledgeBaseTool, createVisualizationTool, getToolsFromActions };

export async function getTools(agentId: string): Promise<Record<string, Tool>> {
  return {
    ...(await getToolsFromActions(agentId)),
    search_knowledge_base: createSearchKnowledgeBaseTool(agentId),
    visualize_data: createVisualizationTool(),
  };
}
