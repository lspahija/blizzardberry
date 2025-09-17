import { generateId, setStoredConversationId } from './util';
import { state, setSuggestedPrompts } from './state';
import { config } from './config';

export async function fetchAgentDetails() {
  try {
    const res = await fetch(`${config.baseUrl}/api/agents/${config.agentId}`);
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
  if (!state.conversationId) return;
  await fetch(
    `${config.baseUrl}/api/conversations/${state.conversationId}/messages`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        role: message.role,
        content: message.parts[0].text,
      }),
    }
  );
}

export async function fetchConversationMessages(conversationId) {
  try {
    const response = await fetch(
      `${config.baseUrl}/api/conversations/${conversationId}/messages`
    );
    if (!response.ok) return null;
    const data = await response.json();
    return data.messages || [];
  } catch (e) {
    console.error('Error fetching conversation messages:', e);
    return null;
  }
}

export async function callLLM() {
  const body = {
    messages: state.messages,
    userConfig: config.userConfig,
    agentId: config.agentId,
    idempotencyKey: generateId(),
  };
  if (state.conversationId) {
    body.conversationId = state.conversationId;
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
    conversationId: returnedConversationId,
  } = await response.json());

  if (returnedConversationId) {
    state.conversationId = returnedConversationId;
    setStoredConversationId(returnedConversationId);
  }

  return res;
}
