import { streamText } from 'ai';
import { getLanguageModel } from '@/app/api/lib/llm/modelProvider';
import {
  createSearchKnowledgeBaseTool,
  getToolsFromActions,
} from '@/app/api/lib/tools/toolProvider';
import { getAgent } from '@/app/api/lib/store/agentStore';
import {
  createCreditHold,
  recordUsedTokens,
} from '@/app/api/lib/llm/tokenUsageManager';
import { buildSystemMessage } from '@/app/api/lib/llm/systemMessageProvider';

export async function callLLM(
  messages: any,
  userConfig: any,
  agentId: string,
  idempotencyKey: string
) {
  try {
    const agent = await getAgent(agentId);
    if (!agent) {
      throw new Error('Agent not found');
    }

    // Validate that the user making the request exists
    // const userId = userConfig?.userId;
    // if (!userId) {
    //   return {
    //     error: 'User ID is required. Please setup agent user config. See https://blizzardberry.com/docs',
    //     text: '',
    //     toolCalls: [],
    //     toolResults: []
    //   };
    // }
    // Check credits for the agent owner (agent.created_by)
    const holdIds = await createCreditHold(
      agent.created_by,
      5000, // TODO: find a way to pick a sane upper bound
      `chat-completion #${agentId}`,
      idempotencyKey
    );

    const stream = streamText({
      model: getLanguageModel(agent.model),
      messages: messages,
      system: buildSystemMessage(userConfig),
      tools: {
        ...(await getToolsFromActions(agentId)),
        search_knowledge_base: createSearchKnowledgeBaseTool(agentId),
      },
      maxSteps: 5,
      onError: async (event) => {
        console.error(
          'StreamText Error:',
          JSON.stringify({ error: event.error }, null, 2)
        );
      },
      onFinish: async (event) => {
        await recordUsedTokens(
          agent.created_by,
          holdIds,
          event.usage,
          agent.model,
          `chat-completion #${agentId}`,
          idempotencyKey
        );

        // console.log('Stream completed:', JSON.stringify(event, null, 2));
      },
    });

    const data = await processStream(stream);
    // console.log('LLM response:', JSON.stringify(data, null, 2));
    return data;
  } catch (error) {
    // Provide specific error messages based on the error type
    let errorMessage = 'An error occurred while processing your request';
    
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return {
      error: errorMessage,
      text: '',
      toolCalls: [],
      toolResults: []
    };
  }
}

async function processStream(result: any) {
  let text = '';
  const toolCalls: any[] = [];
  const toolResults: any[] = [];

  for await (const part of result.fullStream) {
    switch (part.type) {
      case 'text-delta':
        text += part.textDelta;
        break;
      case 'tool-call':
        toolCalls.push({
          toolCallId: part.toolCallId,
          toolName: part.toolName,
          args: part.args,
        });
        break;
      case 'tool-result':
        toolResults.push({
          toolCallId: part.toolCallId,
          toolName: part.toolName,
          args: part.args,
          result: part.result,
        });
        break;
    }
  }

  return {
    text,
    toolCalls,
    toolResults,
  };
}
