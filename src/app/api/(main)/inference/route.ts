import { convertToModelMessages, generateText, stepCountIs } from 'ai';
import { getAgent } from '@/app/api/lib/store/agentStore';
import { openrouter } from '@openrouter/ai-sdk-provider';
import { getTools } from '@/app/api/lib/tools/toolProvider';
import {
  createCreditHold,
  recordUsedTokens,
} from '@/app/api/lib/llm/tokenUsageManager';
import { buildSystemMessage } from '@/app/api/lib/llm/systemMessageProvider';

export async function POST(req: Request) {
  const { messages, userConfig, agentId, idempotencyKey, conversationId } =
    await req.json();

  try {
    const agent = await getAgent(agentId);
    if (!agent) {
      return Response.json({ error: 'Agent not found' }, { status: 404 });
    }

    const holdIds = await createCreditHold(
      agent.created_by,
      10, // TODO: find a way to pick a sane upper bound
      `chat-completion #${agentId}`,
      idempotencyKey
    );

    const result = await generateText({
      model: openrouter(`${agent.model}:floor`),
      system: buildSystemMessage(userConfig, agent.system_message),
      messages: convertToModelMessages(messages),
      tools: await getTools(agentId, conversationId),
      stopWhen: stepCountIs(5),
      maxOutputTokens: 1000,
    });

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

    // Prioritize book_calendly_meeting tool result if it exists, otherwise use first
    let toolResult = toolResults.length > 0 ? toolResults[0] : undefined;
    if (toolResults.length > 1) {
      // Check if book_calendly_meeting tool result exists - prioritize it
      const calendlyBookingResult = toolResults.find(
        (tr) => tr.toolName === 'book_calendly_meeting'
      );
      if (calendlyBookingResult) {
        toolResult = calendlyBookingResult;
      } else {
        console.warn(
          `${agent.model} yielded ${toolResults.length} toolResults. Returning only first one because the LLM didn't follow system prompt instructions to only call a single tool.`
        );
      }
    }

    return Response.json({
      text: result.text,
      toolResult: toolResult,
      conversationId: conversationId,
    });
  } catch (error) {
    console.error('Error in inference API:', error);
    return Response.json(
      { error: 'Failed to process conversation request' },
      { status: 500 }
    );
  }
}
