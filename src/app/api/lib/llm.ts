import { streamText } from 'ai';
import { getLanguageModel } from '@/app/api/lib/modelProvider';
import { CHATBOT_SYSTEM_MESSAGE } from '@/app/api/lib/constants';
import {
  createSearchKnowledgeBaseTool,
  getToolsFromActions,
} from '@/app/api/lib/toolProvider';

export async function callAIModel(
  messages: any,
  userConfig: any,
  chatbotId: string
) {
  const stream = streamText({
    model: getLanguageModel(),
    messages: messages,
    system: buildSystemMessage(userConfig),
    tools: {
      ...(await getToolsFromActions(chatbotId)),
      search_knowledge_base: createSearchKnowledgeBaseTool(chatbotId),
    },
    maxSteps: 5,
    onError: async (event) => {
      console.error(
        'StreamText Error:',
        JSON.stringify({ error: event.error }, null, 2)
      );
    },
    onFinish: async (event) => {
      console.log('Stream completed:', JSON.stringify(event, null, 2));
    },
  });

  const data = await processStream(stream);
  console.log('LLM response:', JSON.stringify(data, null, 2));
  return data;
}

function buildSystemMessage(userConfig: any) {
  let message = CHATBOT_SYSTEM_MESSAGE;

  if (userConfig)
    message += `\n\nThis is the user's metadata. Use this information to pre-fill data in actions when appropriate:\n${JSON.stringify(userConfig, null, 2)}`;

  return message;
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
