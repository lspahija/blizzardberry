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
  const startTime = Date.now();
  console.log(`[${new Date().toISOString()}] Request received`);

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

    const beforeGenerateTime = Date.now();
    console.log(
      `[${new Date().toISOString()}] Calling generateText (setup took ${beforeGenerateTime - startTime}ms)`
    );

    const result = await generateText({
      model: openrouter(`${agent.model}:floor`),
      system: buildSystemMessage(userConfig, agent.system_message),
      messages: convertToModelMessages(messages),
      tools: await getTools(agentId, conversationId),
      stopWhen: stepCountIs(5),
      maxOutputTokens: 1000,
    });

    const afterGenerateTime = Date.now();
    console.log(
      `[${new Date().toISOString()}] generateText completed (took ${afterGenerateTime - beforeGenerateTime}ms)`
    );

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

    console.log(`text generated:\n ${result.text}`);

    const toolCalls =
      result.steps?.flatMap((step) => step.toolCalls || []) || [];
    console.log(`toolCalls: ${JSON.stringify(toolCalls)}`);

    let toolResults =
      result.steps?.flatMap((step) => step.toolResults || []) || [];
    console.log(`toolResults: ${JSON.stringify(toolResults)}`);

    // Prioritize book_calendly_meeting tool result if it exists - put it first in the array
    if (toolResults.length > 1) {
      const calendlyBookingResult = toolResults.find(
        (tr) => tr.toolName === 'book_calendly_meeting'
      );
      if (calendlyBookingResult) {
        // Remove Calendly booking from its current position and put it first
        const filteredResults = toolResults.filter(
          (tr) => tr.toolName !== 'book_calendly_meeting'
        );
        toolResults = [calendlyBookingResult, ...filteredResults];
      }
    }

    const beforeReturnTime = Date.now();
    console.log(
      `[${new Date().toISOString()}] Returning response (post-processing took ${beforeReturnTime - afterGenerateTime}ms)`
    );
    console.log(
      `[${new Date().toISOString()}] Total request duration: ${beforeReturnTime - startTime}ms | Breakdown: setup=${beforeGenerateTime - startTime}ms, generateText=${afterGenerateTime - beforeGenerateTime}ms, post-processing=${beforeReturnTime - afterGenerateTime}ms`
    );

    return Response.json({
      text: result.text,
      toolResults: toolResults,
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
