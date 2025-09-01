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
  const chatBody = getElementById('messages-container');
  const latestMessageEl = getElementById('latest-message');
  
  const filteredMessages = state.messages
    .filter((message) => !message.parts[0].text.startsWith('ACTION_RESULT:'));
    
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
    const assistantMessages = filteredMessages.filter(msg => msg.role === 'assistant');
    if (assistantMessages.length > 0) {
      const latestAssistantMessage = assistantMessages[assistantMessages.length - 1];
      const messageText = latestAssistantMessage.parts.map(part => 
        part.type === 'text' ? part.text : ''
      ).join('').trim();
      
      // Remove any <think> tags for display in collapsed view
      const cleanText = messageText.replace(/<think>[\s\S]*?<\/think>\n\n?/g, '').trim();
      latestMessageEl.innerHTML = convertBoldFormatting(cleanText || "Hi! I'm your AI Agent. How can I help you today?");
    }
  }
}
