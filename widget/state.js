export const state = {
  messages: [],
  isProcessing: false,
  loggedThinkMessages: new Set(),
  chatId: null,
  isWidgetReady: false,
  unreadMessages: 0,
  isWidgetOpen: false,
};

export let suggestedPrompts = [];

export function setSuggestedPrompts(prompts) {
  suggestedPrompts = prompts;
}

export function getSuggestedPrompts() {
  return suggestedPrompts;
}
