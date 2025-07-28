import { state } from './state';
import { convertBoldFormatting, getElementById } from './util';

export function renderMessagePart(part, messageId) {
  if (part.type === 'text') {
    const thinkMatch = part.text.match(
      /<think>([\s\S]*?)<\/think>\n\n([\s\S]*)/
    );
    if (thinkMatch) {
      if (!state.loggedThinkMessages.has(messageId)) {
        state.loggedThinkMessages.add(messageId);
      }
      return `<div class="text-part">${convertBoldFormatting(thinkMatch[2].trim())}</div>`;
    }
    return `<div class="text-part">${convertBoldFormatting(part.text)}</div>`;
  }
  if (part.type === 'tool-invocation') {
    return '';
  }
  return '';
}

export function updateChatUI() {
  const chatBody = getElementById('chatWidgetBody');
  let html = state.messages
    .filter((message) => !message.parts[0].text.startsWith('ACTION_RESULT:'))
    .map(
      (message) => `
      <div class="message-container ${message.role === 'user' ? 'user-container' : 'assistant-container'}">
        <div class="message ${message.role === 'user' ? 'user-message' : 'assistant-message'}">
          ${message.parts.map((part) => renderMessagePart(part, message.id)).join('')}
        </div>
      </div>
    `
    )
    .join('');

  if (state.isProcessing) {
    html += `
      <div class="message-container assistant-container">
        <div class="message assistant-message typing-indicator">
          <span></span><span></span><span></span>
        </div>
      </div>
    `;
  }

  chatBody.innerHTML = html;
  chatBody.scrollTop = chatBody.scrollHeight;
}