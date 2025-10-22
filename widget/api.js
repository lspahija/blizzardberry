import { generateId, setStoredConversationId } from './util';
import { state, setSuggestedPrompts } from './state';
import { config } from './config';

// Global AbortController for handling navigation-induced fetch cancellations
const abortController = new AbortController();

// Setup beforeunload listener to abort pending requests on navigation
window.addEventListener('beforeunload', () => {
  abortController.abort();
});

export async function fetchAgentDetails() {
  try {
    const res = await fetch(`${config.baseUrl}/api/agents/${config.agentId}`, {
      signal: abortController.signal,
    });
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
      `${config.baseUrl}/api/agents/${config.agentId}/prompts`,
      {
        signal: abortController.signal,
      }
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
      signal: abortController.signal,
    }
  );
}

export async function fetchConversationMessages(conversationId) {
  try {
    const response = await fetch(
      `${config.baseUrl}/api/conversations/${conversationId}/messages`,
      {
        signal: abortController.signal,
      }
    );
    if (!response.ok) return null;
    const data = await response.json();
    return data.messages || [];
  } catch (e) {
    console.error('Error fetching conversation messages:', e);
    return null;
  }
}

export async function createNewConversation() {
  try {
    const response = await fetch(`${config.baseUrl}/api/conversations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        agentId: config.agentId,
        endUserConfig: config.userConfig || {},
      }),
      signal: abortController.signal,
    });
    if (!response.ok) return null;
    const data = await response.json();
    return {
      conversationId: data.conversationId,
      messages: data.messages || [],
    };
  } catch (e) {
    console.error('Error creating new conversation:', e);
    return null;
  }
}

export async function callLLM() {
  const url = `${config.baseUrl}/api/inference`;
  const body = {
    messages: state.messages,
    userConfig: config.userConfig,
    agentId: config.agentId,
    idempotencyKey: generateId(),
  };
  if (state.conversationId) {
    body.conversationId = state.conversationId;
  }
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal: abortController.signal,
  });

  if (!response.ok) {
    const errorBody = await response.text().catch(() => 'Unable to read response body');
    console.error('Failed to fetch AI response:', {
      status: response.status,
      headers: Object.fromEntries(response.headers.entries()),
      body: errorBody,
    });
    throw new Error('Failed to fetch AI response');
  }
  const res = ({
    text,
    toolResults,
    error,
    conversationId: returnedConversationId,
  } = await response.json());

  if (returnedConversationId) {
    state.conversationId = returnedConversationId;
    setStoredConversationId(returnedConversationId);
  }

  return res;
}
