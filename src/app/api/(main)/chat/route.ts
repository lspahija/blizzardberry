import { callLLM } from '@/app/api/lib/llm/llmInvoker';
import { createNewChat, addMessage } from '@/app/api/lib/store/chatStore';
import { getAgent } from '@/app/api/lib/store/agentStore';

export async function POST(req: Request) {
  const { messages, userConfig, agentId, idempotencyKey, chatId, interpretOnly } =
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

    if (!interpretOnly) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage && lastMessage.role === 'user') {
        await addMessage(
          usedChatId,
          'user',
          lastMessage.parts?.[0]?.text || lastMessage.content || ''
        );
      }
    }

    const llmResponse = await callLLM(
      messages,
      userConfig,
      agentId,
      idempotencyKey
    );

    if (!interpretOnly && llmResponse.text) {
      await addMessage(usedChatId, 'assistant', llmResponse.text);
    }

    return Response.json({ ...llmResponse, chatId: usedChatId });
  } catch (error) {
    console.error('Error in chat API:', error);
    return Response.json(
      { error: 'Failed to process chat request' },
      { status: 500 }
    );
  }
}
