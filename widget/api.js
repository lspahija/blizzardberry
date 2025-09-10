import { generateId } from './util';
import { state, setSuggestedPrompts } from './state';
import { config } from './config';

export async function fetchAgentDetails() {
  try {
    const res = await fetch(
      `${config.baseUrl}/api/agents/${config.agentId}`
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data.agent;
  } catch (e) {
    console.error('Error fetching agent details:', e);
    return null;
  }
}

export async function fetchSuggestedPrompts() {
  try {
    const res = await fetch(
      `${config.baseUrl}/api/agents/${config.agentId}/prompts`
    );
    if (!res.ok) return;
    const data = await res.json();
    const prompts = (data.prompts || []).map((p) => p.content).filter(Boolean);
    setSuggestedPrompts(prompts);
  } catch (e) {
    console.error('Error fetching suggested prompts:', e);
    setSuggestedPrompts([]);
  }
}

export async function persistMessage(message) {
  if (!state.chatId) return;
  await fetch(`${config.baseUrl}/api/chats/${state.chatId}/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      role: message.role,
      content: message.parts[0].text,
    }),
  });
}

export async function callLLM() {
  const body = {
    messages: state.messages,
    userConfig: config.userConfig,
    agentId: config.agentId,
    idempotencyKey: generateId(),
  };
  if (state.chatId) {
    body.chatId = state.chatId;
  }
  const response = await fetch(`${config.baseUrl}/api/chat`, {
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
