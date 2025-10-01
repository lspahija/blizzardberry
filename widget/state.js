export const state = {
  messages: [],
  isProcessing: false,
  loggedThinkMessages: new Set(),
  conversationId: null,
  widgetIsReady: false,
  unreadMessages: 0,
  widgetIsOpen: false,
};

export let suggestedPrompts = [];

export function setSuggestedPrompts(prompts) {
  suggestedPrompts = prompts;
}

export function getSuggestedPrompts() {
  return suggestedPrompts;
}
