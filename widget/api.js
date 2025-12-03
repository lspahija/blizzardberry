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

/**
 * Get action inference based on DOM state using Claude AI
 * @param {Object} domState - DOM state captured from the page
 * @param {string} prompt - User prompt/instruction
 * @returns {Promise<Object>} Action to execute
 */
export async function getActionInference(domState, prompt) {
  const url = `${config.baseUrl}/api/action-inference`;
  const body = {
    domState,
    prompt,
    conversationId: state.conversationId,
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: abortController.signal,
    });

    if (!response.ok) {
      const errorBody = await response
        .text()
        .catch(() => 'Unable to read response body');
      console.error('Failed to get action inference:', {
        status: response.status,
        headers: Object.fromEntries(response.headers.entries()),
        body: errorBody,
      });
      throw new Error('Failed to get action inference');
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error calling action inference:', error);
    throw error;
  }
}

/**
 * Run a complete Skyvern task
 * @param {string} url - URL to navigate to
 * @param {string} prompt - Task prompt/instruction
 * @param {Object} options - Additional options
 * @returns {Promise<Object>} Task result
 */
export async function runSkyvernTask(url, prompt, options = {}) {
  const apiUrl = `${config.baseUrl}/api/skyvern/task`;
  const body = {
    url,
    prompt,
    ...options,
  };

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: abortController.signal,
    });

    if (!response.ok) {
      const errorBody = await response
        .text()
        .catch(() => 'Unable to read response body');
      console.error('Failed to run Skyvern task:', {
        status: response.status,
        headers: Object.fromEntries(response.headers.entries()),
        body: errorBody,
      });
      throw new Error('Failed to run Skyvern task');
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error running Skyvern task:', error);
    throw error;
  }
}

/**
 * Check status of a Skyvern task
 * @param {string} taskId - Task ID to check
 * @returns {Promise<Object>} Task status
 */
export async function getSkyvernTaskStatus(taskId) {
  const apiUrl = `${config.baseUrl}/api/skyvern/task?taskId=${taskId}`;

  try {
    const response = await fetch(apiUrl, {
      signal: abortController.signal,
    });

    if (!response.ok) {
      throw new Error('Failed to get task status');
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error getting Skyvern task status:', error);
    throw error;
  }
}
