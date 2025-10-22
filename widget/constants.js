/**
 * Message prefixes that should be filtered out from user-visible messages
 * Add new prefixes here to automatically exclude them from the UI
 */
export const FILTERED_MESSAGE_PREFIXES = ['ACTION_RESULT:'];

/**
 * Check if a message should be filtered based on registered prefixes
 * @param {string} text - The message text to check
 * @returns {boolean} - True if message should be filtered out
 */
export function shouldFilterMessage(text) {
  if (!text) return false;
  return FILTERED_MESSAGE_PREFIXES.some((prefix) => text.startsWith(prefix));
}
