import {
  generateId,
  getStoredConversationId,
  setStoredConversationId,
} from './util';
import { state } from './state';
import {
  callLLM,
  persistMessage,
  fetchConversationMessages,
  createNewConversation,
} from './api';
import { executeAction } from './actions';
import { updateConversationUI } from './ui';
import { updateNotificationBadge } from './dom';
import { addVisualizationToMessage } from './visualization';

function syncWidgetState() {
  const widget = document.getElementById('chatWidget');
  const isWidgetCurrentlyOpen = widget && !widget.classList.contains('hidden');
  state.widgetIsOpen = isWidgetCurrentlyOpen;
  return isWidgetCurrentlyOpen;
}

export async function handleError(error) {
  console.error('Failed to get response. ' + error);
  state.isProcessing = false;
  state.messages.push({
    id: generateId(),
    role: 'assistant',
    parts: [{ type: 'text', text: error }],
  });
  await persistMessage(state.messages[state.messages.length - 1]);

  syncWidgetState();

  if (!state.widgetIsOpen) {
    state.unreadMessages++;
    updateNotificationBadge();
  }

  updateConversationUI();
}

export async function handleSubmit() {
  const input = document.getElementById('chatWidgetInputField');
  const text = input.value.trim();
  if (!text || state.isProcessing) return;
  await processMessage(text, 'user');
}

export async function hydrateConversation() {
  const storedConversationId = getStoredConversationId();

  if (storedConversationId) {
    state.conversationId = storedConversationId;
    const existingMessages =
      await fetchConversationMessages(storedConversationId);

    if (existingMessages && existingMessages.length > 0) {
      // Convert API message format to widget format
      state.messages = existingMessages.map((msg) => ({
        id: generateId(state.conversationId),
        role: msg.role,
        parts: [{ type: 'text', text: msg.content }],
      }));
      return true; // Indicates conversation was hydrated
    }
  }

  // No stored conversation ID or existing messages, create a new conversation
  const newConversation = await createNewConversation();
  if (newConversation) {
    state.conversationId = newConversation.conversationId;
    setStoredConversationId(newConversation.conversationId);

    // Convert API message format to widget format
    state.messages = newConversation.messages.map((msg) => ({
      id: generateId(state.conversationId),
      role: msg.role,
      parts: [{ type: 'text', text: msg.content }],
    }));
    return true; // Indicates conversation was hydrated with new conversation
  }

  return false; // Failed to create new conversation
}

export async function processMessage(messageText, role) {
  state.messages.push({
    id: generateId(),
    role: role,
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
    const { text, toolResult, error } = await callLLM();

    if (error) {
      await handleError(error);
      return;
    }

    if (toolResult?.toolName.startsWith('ACTION_')) {
      const result = await executeAction({
        ...toolResult.output,
        toolName: toolResult.toolName,
      });

      await processMessage(result, 'user');
      state.isProcessing = false;
      updateConversationUI();
      return;
    }

    state.messages.push({
      id: generateId(),
      role: 'assistant',
      parts: [{ type: 'text', text }],
    });
    await persistMessage(state.messages[state.messages.length - 1]);

    if (toolResult?.toolName === 'visualize_data') {
      const output = toolResult.output;
      if (output && output.type === 'visualization') {
        await addVisualizationToMessage(output);
      }
    }

    syncWidgetState();
    if (!state.widgetIsOpen) {
      state.unreadMessages++;
      updateNotificationBadge();
    }

    state.isProcessing = false;
    updateConversationUI();
  } catch (error) {
    await handleError('Error: Failed to get response. ' + error);
  }
}
