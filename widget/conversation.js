import { generateId, getStoredConversationId, setStoredConversationId } from './util';
import { state } from './state';
import { callLLM, persistMessage, fetchConversationMessages } from './api';
import { executeAction } from './actions';
import { updateConversationUI } from './ui';
import { updateNotificationBadge } from './dom';

function syncWidgetState() {
  const widget = document.getElementById('chatWidget');
  const isWidgetCurrentlyOpen = widget && !widget.classList.contains('hidden');
  state.isWidgetOpen = isWidgetCurrentlyOpen;
  return isWidgetCurrentlyOpen;
}

export async function handleError(messageText) {
  state.isProcessing = false;
  state.messages.push({
    id: generateId(),
    role: 'assistant',
    parts: [{ type: 'text', text: messageText }],
  });

  // Check widget state in real-time to avoid race conditions
  syncWidgetState();

  if (!state.isWidgetOpen) {
    state.unreadMessages++;
    updateNotificationBadge();
  }

  await persistMessage(state.messages[state.messages.length - 1]);
  updateConversationUI();
}

export async function handleSubmit() {
  const input = document.getElementById('chatWidgetInputField');
  const text = input.value.trim();
  if (!text || state.isProcessing) return;
  await processMessage(text);
}

export async function hydrateConversation() {
  const storedConversationId = getStoredConversationId();

  if (storedConversationId) {
    state.conversationId = storedConversationId;
    const existingMessages = await fetchConversationMessages(storedConversationId);

    if (existingMessages && existingMessages.length > 0) {
      // Convert API message format to widget format
      state.messages = existingMessages.map(msg => ({
        id: generateId(state.conversationId),
        role: msg.role,
        parts: [{ type: 'text', text: msg.content }]
      }));
      return true; // Indicates conversation was hydrated
    }
  }

  return false; // No conversation to hydrate
}

export async function processMessage(messageText) {
  state.messages.push({
    id: generateId(),
    role: 'user',
    parts: [{ type: 'text', text: messageText }],
  });
  await persistMessage(state.messages[state.messages.length - 1]);
  const promptBar = document.getElementById('chatWidgetPromptBar');
  if (promptBar) promptBar.style.display = 'none';

  const input = document.getElementById('chatWidgetInputField');
  if (input) input.value = '';

  state.isProcessing = true;
  updateConversationUI();

  try {
    const { text, toolResults, error, message } = await callLLM();

    if (error || message) {
      await handleError(error || message);
      return;
    }

    if (toolResults?.length > 0) {
      const actionResults = await Promise.all(
        toolResults
          .filter((toolResult) => toolResult.toolName.startsWith('ACTION_'))
          .map((toolResult) =>
            executeAction({
              ...toolResult.output,
              toolName: toolResult.toolName,
            })
          )
      );

      for (const result of actionResults) {
        await processMessage(result);
      }
    }

    const hasSearchTool = toolResults?.some(
      (toolResult) => toolResult.toolName === 'search_knowledge_base'
    );
    const hasOtherTools = toolResults?.some(
      (toolResult) => toolResult.toolName !== 'search_knowledge_base'
    );

    if (
      text &&
      (!toolResults || toolResults.length === 0 || hasSearchTool) &&
      !hasOtherTools
    ) {
      state.messages.push({
        id: generateId(),
        role: 'assistant',
        parts: [{ type: 'text', text }],
      });
      await persistMessage(state.messages[state.messages.length - 1]);

      // Check widget state in real-time to avoid race conditions
      syncWidgetState();

      if (!state.isWidgetOpen) {
        state.unreadMessages++;
        updateNotificationBadge();
      }
    }

    state.isProcessing = false;
    updateConversationUI();
  } catch (error) {
    await handleError('Error: Failed to get response. ' + error.message);
  }
}
