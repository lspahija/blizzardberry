import { generateId } from './util';
import { state } from './state';
import { callLLM, persistMessage } from './api';
import { executeAction } from './actions';
import { updateChatUI } from './ui';

let baseUrl, userConfig, agentId, actions;

export function initializeChat(config) {
  baseUrl = config.baseUrl;
  userConfig = config.userConfig;
  agentId = config.agentId;
  actions = config.actions;
}

export async function handleError(messageText) {
  state.isProcessing = false;
  state.messages.push({
    id: generateId(),
    role: 'assistant',
    parts: [{ type: 'text', text: messageText }],
  });
  await persistMessage(baseUrl, state.messages[state.messages.length - 1]);
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
    const { text, toolResults, error, message } = await callLLM(baseUrl, userConfig, agentId);

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
            }, actions, baseUrl)
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
    }

    state.isProcessing = false;
    updateChatUI();
  } catch (error) {
    await handleError('Error: Failed to get response. ' + error.message);
  }
}