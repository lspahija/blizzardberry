import { generateId, truncatePrompt, getElementById, createElement } from './util';
import { state, getSuggestedPrompts } from './state';
import { fetchSuggestedPrompts } from './api';
import { updateChatUI } from './ui';
import { handleSubmit, processChatMessage } from './chat';
import { config } from './config';

export async function createWidgetDOM() {
  try {
    const toggle = createElement('div', {
      id: 'chatWidgetToggle',
      innerHTML: `<svg width="32" height="32" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
<path d="M7.5 8.25H16.5M7.5 11.25H12M2.25 12.7593C2.25 14.3604 3.37341 15.754 4.95746 15.987C6.08596 16.1529 7.22724 16.2796 8.37985 16.3655C8.73004 16.3916 9.05017 16.5753 9.24496 16.8674L12 21L14.755 16.8675C14.9498 16.5753 15.2699 16.3917 15.6201 16.3656C16.7727 16.2796 17.914 16.153 19.0425 15.9871C20.6266 15.7542 21.75 14.3606 21.75 12.7595V6.74056C21.75 5.13946 20.6266 3.74583 19.0425 3.51293C16.744 3.17501 14.3926 3 12.0003 3C9.60776 3 7.25612 3.17504 4.95747 3.51302C3.37342 3.74593 2.25 5.13956 2.25 6.74064V12.7593Z" stroke="black" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`
    });
    toggle.addEventListener('click', toggleChatWidget);
    document.body.appendChild(toggle);

    const widget = createElement('div', {
      id: 'chatWidget',
      className: 'hidden'
    });

    const header = createElement('div', {
      id: 'chatWidgetHeader',
      innerHTML: `
    <div>AI Agent</div>
    <button id="chatWidgetCloseButton">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M6 9l6 6 6-6" /> <!-- Downward chevron -->
        </svg>
    </button>
`
    });
    header
      .querySelector('#chatWidgetCloseButton')
      .addEventListener('click', toggleChatWidget);
    widget.appendChild(header);

    const body = createElement('div', { id: 'chatWidgetBody' });
    widget.appendChild(body);

    await fetchSuggestedPrompts();

    const inputArea = createElement('div', {
      id: 'chatWidgetInput',
      innerHTML: `
        <textarea id="chatWidgetInputField" placeholder="Type a message..."></textarea>
        <button id="chatWidgetSendButton">
<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 -960 960 960"><path fill="#FFFFFF" d="M440-160v-487L216-423l-56-57 320-320 320-320-56 57-224-224v487z"/></svg>        </button>
      `
    });

    const inputField = inputArea.querySelector('#chatWidgetInputField');
    inputField.addEventListener('input', () => {
      inputField.style.height = 'auto';
      inputField.style.height = `${Math.min(inputField.scrollHeight, 120)}px`;
    });
    inputArea
      .querySelector('#chatWidgetSendButton')
      .addEventListener('click', handleSubmit);
    inputArea
      .querySelector('#chatWidgetInputField')
      .addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          handleSubmit();
        }
      });

    const suggestedPrompts = getSuggestedPrompts();
    if (suggestedPrompts.length > 0) {
      const promptBar = createElement('div', { id: 'chatWidgetPromptBar' });
      suggestedPrompts.forEach((prompt) => {
        const btn = createElement('button');
        btn.type = 'button';
        btn.textContent = truncatePrompt(prompt, 15);
        btn.title = prompt;
        btn.className = 'chat-widget-prompt-btn';
        btn.addEventListener(
          'click',
          async () => await processChatMessage(prompt)
        );
        promptBar.appendChild(btn);
      });
      widget.appendChild(promptBar);
    }

    widget.appendChild(inputArea);

    const footer = createElement('div', {
      id: 'chatWidgetFooter',
      innerHTML: 'Powered By BlizzardBerry'
    });
    footer.style.textAlign = 'center';
    footer.style.padding = '10px';
    footer.style.fontSize = '12px';
    footer.style.color = '#666';
    widget.appendChild(footer);

    document.body.appendChild(widget);

    state.messages.push({
      id: generateId(config.agentId),
      role: 'assistant',
      parts: [
        {
          type: 'text',
          text: "Hello! I'm your AI Agent, here to assist you. Feel free to ask me anything or let me know how I can help!",
        },
      ],
    });

    state.isWidgetReady = true;
    const currentWidget = getElementById('chatWidget');
    if (currentWidget && !currentWidget.classList.contains('hidden')) {
      updateChatUI();
    }
  } catch (error) {
    console.error('Error creating widget DOM:', error);
  }
}

export function toggleChatWidget() {
  const widget = getElementById('chatWidget');
  const toggle = getElementById('chatWidgetToggle');

  if (!widget) {
    createLoadingWidget();
    return;
  }

  if (!toggle) return;

  const isHidden = widget.classList.toggle('hidden');
  toggle.classList.toggle('hidden', !isHidden);

  if (!isHidden && state.isWidgetReady) {
    updateChatUI();
    setTimeout(
      () => getElementById('chatWidgetInputField')?.focus(),
      100
    );
  }
}

export function createLoadingWidget() {
  if (getElementById('chatWidgetLoading')) {
    return;
  }

  const toggle = getElementById('chatWidgetToggle');
  if (!toggle) return;

  toggle.classList.add('hidden');

  const loadingWidget = createElement('div', {
    id: 'chatWidgetLoading',
    className: 'chat-widget-loading',
    innerHTML: `
      <div class="chat-widget-loading-header">
        <div>AI Agent</div>
        <button id="chatWidgetLoadingCloseButton">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>
      </div>
      <div class="chat-widget-loading-body">
        <div class="chat-widget-loading-content">
          <div class="loading-spinner">
            <span></span><span></span><span></span>
          </div>
          <div class="loading-text">Loading AI Agent...</div>
        </div>
      </div>
    `
  });

  loadingWidget
    .querySelector('#chatWidgetLoadingCloseButton')
    .addEventListener('click', () => {
      loadingWidget.remove();
      toggle.classList.remove('hidden');
    });

  document.body.appendChild(loadingWidget);

  let checkCount = 0;
  const maxChecks = 100;

  const checkWidgetReady = () => {
    const realWidget = getElementById('chatWidget');
    if (realWidget && state.isWidgetReady) {
      loadingWidget.remove();
      realWidget.classList.remove('hidden');
      updateChatUI();
      setTimeout(
        () => getElementById('chatWidgetInputField')?.focus(),
        100
      );
    } else if (checkCount < maxChecks) {
      checkCount++;
      setTimeout(checkWidgetReady, 100);
    } else {
      console.error('Widget initialization timeout');
      loadingWidget.remove();
      toggle.classList.remove('hidden');
    }
  };

  checkWidgetReady();
}