import { generateId } from './util';
import { state, setSuggestedPrompts } from './state';

export async function fetchSuggestedPrompts(baseUrl, agentId) {
  try {
    const res = await fetch(`${baseUrl}/api/agents/${agentId}/prompts`);
    if (!res.ok) return;
    const data = await res.json();
    const prompts = (data.prompts || [])
      .map((p) => p.content)
      .filter(Boolean);
    setSuggestedPrompts(prompts);
  } catch (e) {
    console.error('Error fetching suggested prompts:', e);
    setSuggestedPrompts([]);
  }
}

export async function persistMessage(baseUrl, message) {
  if (!state.chatId) return;
  await fetch(`${baseUrl}/api/chats/${state.chatId}/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      role: message.role,
      content: message.parts[0].text,
    }),
  });
}

export async function callLLM(baseUrl, userConfig, agentId) {
  const body = {
    messages: state.messages,
    userConfig,
    agentId,
    idempotencyKey: generateId(),
  };
  if (state.chatId) {
    body.chatId = state.chatId;
  }
  const response = await fetch(`${baseUrl}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) throw new Error('Failed to fetch AI response');
  const res = ({
    text,
    toolResults,
    error,
    message,
    chatId: returnedChatId,
  } = await response.json());

  if (returnedChatId) {
    state.chatId = returnedChatId;
  }

  return res;
}