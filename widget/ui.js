import { state } from './state';
import { convertBoldFormatting, getElementById } from './util';

function stripMarkdownImages(input) {
  if (!input) return input;
  let output = input.replace(/!\[[^\]]*\]\([^\)]+\)/g, '');
  output = output.replace(/\n{3,}/g, '\n\n');
  return output;
}

export function renderMessagePart(part, messageId) {
  if (part.type === 'text') {
    const thinkMatch = part.text.match(
      /<think>([\s\S]*?)<\/think>\n\n([\s\S]*)/
    );
    if (thinkMatch) {
      if (!state.loggedThinkMessages.has(messageId)) {
        state.loggedThinkMessages.add(messageId);
      }
      const clean = stripMarkdownImages(thinkMatch[2].trim());
      return `<div class="text-part">${convertBoldFormatting(clean)}</div>`;
    }
    const clean = stripMarkdownImages(part.text);
    return `<div class="text-part">${convertBoldFormatting(clean)}</div>`;
  }
  if (part.type === 'tool-invocation') {
    return '';
  }
  if (part.type === 'html') {
    return part.content || '';
  }
  return '';
}

export function updateConversationUI() {
  const chatBody = getElementById('messages-container');
  const latestMessageEl = getElementById('latest-message');

  const filteredMessages = state.messages.filter(
    (message) => !message.parts[0].text.startsWith('ACTION_RESULT:')
  );

  let html = filteredMessages
    .map(
      (message) => `
        <div class="message ${message.role === 'user' ? 'user-message' : 'assistant-message'}">
          ${message.parts.map((part) => renderMessagePart(part, message.id)).join('')}
        </div>
      `
    )
    .join('');

  if (state.isProcessing) {
    html += `
      <div class="message assistant-message typing-indicator">
        <span></span><span></span><span></span>
      </div>
    `;
  }

  if (chatBody) {
    chatBody.innerHTML = html;
    chatBody.scrollTop = chatBody.scrollHeight;
  }

  // Update collapsed view with latest assistant message
  if (latestMessageEl) {
    const assistantMessages = filteredMessages.filter(
      (msg) => msg.role === 'assistant'
    );
    if (assistantMessages.length > 0) {
      const latestAssistantMessage =
        assistantMessages[assistantMessages.length - 1];
      const messageText = latestAssistantMessage.parts
        .map((part) => (part.type === 'text' ? part.text : ''))
        .join('')
        .trim();

      // Remove any <think> tags for display in collapsed view
      const cleanText = messageText
        .replace(/<think>[\s\S]*?<\/think>\n\n?/g, '')
        .trim();
      // Get agent name for fallback
      latestMessageEl.innerHTML = convertBoldFormatting(cleanText);
    }
  }
}
