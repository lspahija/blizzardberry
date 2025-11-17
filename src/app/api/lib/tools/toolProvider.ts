import { Tool } from 'ai';
import { createSearchKnowledgeBaseTool } from './searchKnowledgeBaseTool';
import { createVisualizationTool } from './visualizationTool';
import { getToolsFromActions } from './actionTools';
import {
  createCalendlyAvailabilityTool,
  createCalendlyBookingTool,
  createCalendlyEventTypesTool,
} from './calendlyTools';
import { getAgent } from '../store/agentStore';

export { createSearchKnowledgeBaseTool, createVisualizationTool, getToolsFromActions };

export async function getTools(
  agentId: string,
  conversationId?: string
): Promise<Record<string, Tool>> {
  const tools: Record<string, Tool> = {
    ...(await getToolsFromActions(agentId)),
    search_knowledge_base: createSearchKnowledgeBaseTool(agentId),
    visualize_data: createVisualizationTool(agentId, conversationId),
  };

  // Add Calendly tools only if Calendly is enabled for this agent
  const agent = await getAgent(agentId);
  if (agent?.calendly_config) {
    // Handle JSONB - it might be a string or already parsed object
    const calendlyConfig = typeof agent.calendly_config === 'string' 
      ? JSON.parse(agent.calendly_config) 
      : agent.calendly_config;
    
    if (calendlyConfig?.enabled) {
      tools.check_calendly_availability = createCalendlyAvailabilityTool(agentId);
      tools.book_calendly_meeting = createCalendlyBookingTool(agentId);
      tools.list_calendly_event_types = createCalendlyEventTypesTool(agentId);
    }
  }

  return tools;
}
