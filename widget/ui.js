import { state } from './state';
import { convertBoldFormatting, getElementById } from './util';
import { shouldFilterMessage } from './constants';

function stripMarkdownImages(input) {
  if (!input) return input;
  let output = String(input);
  // Remove standard markdown images (http/https and data URIs)
  output = output.replace(/!\[[^\]]*\]\((?:data:[^\)]+|https?:\/\/[^\)]+)\)/gi, '');
  // Remove any bare data:image URIs that might not be wrapped in markdown
  output = output.replace(/data:image\/[a-zA-Z]+;base64,[A-Za-z0-9+/=\s]+/gi, '');
  // Remove attachment-style placeholders like (attachment://file.png)
  output = output.replace(/\(attachment:\/\/[^\)]+\)/gi, '');
  output = output.replace(/^.*attachment:\/\/.*$/gmi, '');
  // Remove leftover alt tags if parenthesis missing
  output = output.replace(/!\[[^\]]*\]/g, '');
  // Remove lines that are only images
  output = output.replace(/^\s*!\[[\s\S]*?\]\([\s\S]*?\)\s*$/gm, '');
  // Compress whitespace
  output = output.replace(/\n{3,}/g, '\n\n').replace(/[\t ]{2,}/g, ' ');
  return output.trim();
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
    (message) => !shouldFilterMessage(message.parts[0].text)
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
      const cleanText = stripMarkdownImages(
        messageText
          .replace(/<think>[\s\S]*?<\/think>\n\n?/g, '')
          .trim()
      );
      // Get agent name for fallback
      latestMessageEl.innerHTML = convertBoldFormatting(cleanText);
    }
  }
}
