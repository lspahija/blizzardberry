import { callLLM } from '@/app/api/lib/llm/llmInvoker';
import { getAgent } from '@/app/api/lib/store/agentStore';
import { addMessage } from '@/app/api/lib/store/chatStore';

export async function POST(req: Request) {
  const { messages, userConfig, agentId, chatId, idempotencyKey } =
    await req.json();

  try {
    const agent = await getAgent(agentId);
    if (!agent) {
      return Response.json({ error: 'Agent not found' }, { status: 404 });
    }

    const llmResponse = await callLLM(
      messages,
      userConfig,
      agentId,
      idempotencyKey
    );

    if (llmResponse.text) {
      await addMessage(chatId, 'assistant', llmResponse.text);
    }

    return Response.json({ ...llmResponse, chatId });
  } catch (error) {
    console.error('Error in interpret API:', error);
    return Response.json(
      { error: 'Failed to interpret action result' },
      { status: 500 }
    );
  }
}
