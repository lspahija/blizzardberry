import { state } from './state';

let counter = 0;

export const generateId = () =>
  `${state.conversationId}-${Date.now()}-${counter++}`;

export function getElementById(id) {
  return document.getElementById(id);
}

export function createElement(tag, options = {}) {
  const element = document.createElement(tag);
  if (options.id) element.id = options.id;
  if (options.className) element.className = options.className;
  if (options.innerHTML) element.innerHTML = options.innerHTML;
  return element;
}

export function convertBoldFormatting(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br>');
}

export function getStoredConversationId() {
  try {
    // Check if we're coming from a different domain and clear sessionStorage if so
    if (
      document.referrer &&
      new URL(document.referrer).hostname !== location.hostname &&
      !location.pathname.includes('/scramjet/') // if we are mirroring, don't clear
    ) {
      console.log('Referrer from different domain, clearing sessionStorage');
      sessionStorage.clear();
      return null;
    }
    const conversationId = sessionStorage.getItem('conversationId');
    return conversationId;
  } catch (e) {
    console.error('Error accessing sessionStorage:', e);
    return null;
  }
}

export function setStoredConversationId(conversationId) {
  try {
    if (conversationId) {
      sessionStorage.setItem('conversationId', conversationId);
    } else {
      sessionStorage.removeItem('conversationId');
    }
  } catch (e) {
    console.error('Error setting conversationId in sessionStorage:', e);
  }
}
