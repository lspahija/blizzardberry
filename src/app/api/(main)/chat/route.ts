import { callLLM } from '@/app/api/lib/llm/llmInvoker';
import { createNewChat, addMessage } from '@/app/api/lib/store/chatStore';
import { getAgent } from '@/app/api/lib/store/agentStore';

export async function POST(req: Request) {
  const { messages, userConfig, agentId, idempotencyKey, chatId } = await req.json();

  try {
    // Get the agent to find the owner
    const agent = await getAgent(agentId);
    if (!agent) {
      return Response.json({ error: 'Agent not found' }, { status: 404 });
    }

    let usedChatId = chatId;
    if (!usedChatId) {
      // Create a new chat session for this conversation
      usedChatId = await createNewChat(agentId, agent.created_by, userConfig || {});
    }

    // Save the user's message if it's the last one
    const lastMessage = messages[messages.length - 1];
    if (lastMessage && lastMessage.role === 'user') {
      await addMessage(usedChatId, 'user', lastMessage.parts?.[0]?.text || lastMessage.content || '');
    }

    // Call LLM
    const llmResponse = await callLLM(messages, userConfig, agentId, idempotencyKey);

    // Save the assistant's response
    if (llmResponse.text) {
      await addMessage(usedChatId, 'assistant', llmResponse.text);
    }

    // Always return chatId so the client can track it
    return Response.json({ ...llmResponse, chatId: usedChatId });
  } catch (error) {
    console.error('Error in chat API:', error);
    return Response.json(
      { error: 'Failed to process chat request' },
      { status: 500 }
    );
  }
}
