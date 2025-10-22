import { state } from './state';
import { convertBoldFormatting, getElementById } from './util';
import { shouldFilterMessage } from './constants';

function cleanText(text) {
  if (!text) return '';

  return String(text)
    .replace(/<think>[\s\S]*?<\/think>\n\n?/g, '')
    .replace(/!\[[^\]]*\]\((?:data:[^\)]+|https?:\/\/[^\)]+)\)/gi, '')
    .replace(/data:image\/[a-zA-Z]+;base64,[A-Za-z0-9+/=\s]+/gi, '')
    .replace(/\(attachment:\/\/[^\)]+\)/gi, '')
    .replace(/^.*attachment:\/\/.*$/gim, '')
    .replace(/!\[[^\]]*\]/g, '')
    .replace(/^\s*!\[[\s\S]*?\]\([\s\S]*?\)\s*$/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[\t ]{2,}/g, ' ')
    .trim();
}

function extractTextContent(part) {
  const thinkMatch = part.text.match(/<think>([\s\S]*?)<\/think>\n\n([\s\S]*)/);
  return thinkMatch ? thinkMatch[2].trim() : part.text;
}

export function renderMessagePart(part) {
  if (part.type === 'text') {
    const text = extractTextContent(part);
    return `<div class="text-part">${convertBoldFormatting(cleanText(text))}</div>`;
  }
  if (part.type === 'html') {
    return part.content || '';
  }
  return '';
}

function renderMessage(message) {
  const roleClass =
    message.role === 'user' ? 'user-message' : 'assistant-message';
  const content = message.parts.map((part) => renderMessagePart(part)).join('');
  return `<div class="message ${roleClass}">${content}</div>`;
}

function getLatestMessageText(messages) {
  if (messages.length === 0) return '';

  const latest = messages[messages.length - 1];
  const text = latest.parts
    .filter((part) => part.type === 'text')
    .map((part) => part.text)
    .join('')
    .trim();

  return cleanText(text);
}

export function updateConversationUI() {
  const chatBody = getElementById('messages-container');
  const latestMessageEl = getElementById('latest-message');

  const visibleMessages = state.messages.filter(
    (message) => !shouldFilterMessage(message.parts[0]?.text)
  );

  let html = visibleMessages.map(renderMessage).join('');

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

  if (latestMessageEl) {
    latestMessageEl.innerHTML = convertBoldFormatting(
      getLatestMessageText(visibleMessages)
    );
  }
}
