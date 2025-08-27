import { generateId } from './util';
import { state } from './state';
import { callLLM, persistMessage } from './api';
import { executeAction } from './actions';
import { updateChatUI } from './ui';
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
  updateChatUI();
}

export async function handleSubmit() {
  const input = document.getElementById('chatWidgetInputField');
  const text = input.value.trim();
  if (!text || state.isProcessing) return;
  await processChatMessage(text);
}

export async function processChatMessage(messageText) {
  state.messages.push({
    id: generateId(),
    role: 'user',
    parts: [{ type: 'text', text: messageText }],
  });
  const promptBar = document.getElementById('chatWidgetPromptBar');
  if (promptBar) promptBar.style.display = 'none';

  const input = document.getElementById('chatWidgetInputField');
  if (input) input.value = '';

  state.isProcessing = true;
  updateChatUI();

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
              ...toolResult.result,
              toolName: toolResult.toolName,
            })
          )
      );

      for (const result of actionResults) {
        await processChatMessage(result);
      }
    }

    if (text && (!toolResults || toolResults.length === 0)) {
      state.messages.push({
        id: generateId(),
        role: 'assistant',
        parts: [{ type: 'text', text }],
      });

      // Check widget state in real-time to avoid race conditions
      syncWidgetState();

      if (!state.isWidgetOpen) {
        state.unreadMessages++;
        updateNotificationBadge();
      }
    }

    state.isProcessing = false;
    updateChatUI();
  } catch (error) {
    await handleError('Error: Failed to get response. ' + error.message);
  }
}
