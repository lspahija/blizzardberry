import { generateText, stepCountIs, convertToModelMessages } from 'ai';
import { createNewChat, addMessage } from '@/app/api/lib/store/chatStore';
import { getAgent } from '@/app/api/lib/store/agentStore';
import { openrouter } from '@openrouter/ai-sdk-provider';
import {
  createSearchKnowledgeBaseTool,
  getToolsFromActions,
} from '@/app/api/lib/tools/toolProvider';
import {
  createCreditHold,
  recordUsedTokens,
} from '@/app/api/lib/llm/tokenUsageManager';
import { buildSystemMessage } from '@/app/api/lib/llm/systemMessageProvider';

export async function POST(req: Request) {
  const { messages, userConfig, agentId, idempotencyKey, chatId } =
    await req.json();

  try {
    const agent = await getAgent(agentId);
    if (!agent) {
      return Response.json({ error: 'Agent not found' }, { status: 404 });
    }

    let usedChatId = chatId;
    if (!usedChatId) {
      usedChatId = await createNewChat(
        agentId,
        agent.created_by,
        userConfig || {}
      );
    }

    const lastMessage = messages[messages.length - 1];
    if (lastMessage && lastMessage.role === 'user') {
      await addMessage(
        usedChatId,
        'user',
        lastMessage.parts?.[0]?.text || lastMessage.content || ''
      );
    }

    const holdIds = await createCreditHold(
      agent.created_by,
      10, // TODO: find a way to pick a sane upper bound
      `chat-completion #${agentId}`,
      idempotencyKey
    );

    const result = await generateText({
      model: openrouter(agent.model),
      system: buildSystemMessage(userConfig),
      messages: convertToModelMessages(messages),
      tools: {
        ...(await getToolsFromActions(agentId)),
        search_knowledge_base: createSearchKnowledgeBaseTool(agentId),
      },
      stopWhen: stepCountIs(5),
    });

    // Handle token usage
    if (result.usage) {
      await recordUsedTokens(
        agent.created_by,
        holdIds,
        result.usage,
        agent.model,
        `chat-completion #${agentId}`,
        idempotencyKey
      );
    }

    const toolCalls =
      result.steps?.flatMap((step) => step.toolCalls || []) || [];
    const toolResults =
      result.steps?.flatMap((step) => step.toolResults || []) || [];

    const hasSearchTool = toolCalls?.some(
      (toolCall) => toolCall.toolName === 'search_knowledge_base'
    );
    const hasOtherTools = toolCalls?.some(
      (toolCall) => toolCall.toolName !== 'search_knowledge_base'
    );

    if (
      result.text &&
      (toolCalls.length === 0 || hasSearchTool) &&
      !hasOtherTools
    ) {
      await addMessage(usedChatId, 'assistant', result.text);
    }

    return Response.json({
      text: result.text,
      toolCalls: toolCalls,
      toolResults: toolResults,
      usage: result.usage,
      chatId: usedChatId,
    });
  } catch (error) {
    console.error('Error in chat API:', error);
    return Response.json(
      { error: 'Failed to process chat request' },
      { status: 500 }
    );
  }
}
