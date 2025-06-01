import { streamText } from 'ai';
import { getLanguageModel } from '@/app/api/lib/llm/modelProvider';
import {
  createSearchKnowledgeBaseTool,
  getToolsFromActions,
} from '@/app/api/lib/tools/toolProvider';

export async function callLLM(
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
