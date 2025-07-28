let counter = 0;

export const generateId = (agentId) => `${agentId}-${Date.now()}-${counter++}`;

export function truncatePrompt(prompt, wordLimit = 15) {
  const words = prompt.split(/\s+/);
  if (words.length > wordLimit) {
    return words.slice(0, wordLimit).join(' ') + '...';
  }
  return prompt;
}

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
