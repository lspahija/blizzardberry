(function () {
  let agentId = null;

  function initializeAgentId(script) {
    if (script && script.dataset && script.dataset.agentId) {
      agentId = script.dataset.agentId;
    } else {
      console.error(
        'Could not find agent ID. Make sure the script tag has the data-agent-id attribute.'
      );
    }
  }

  function injectStyles(script) {
    if (script && script.src) {
      const css = document.createElement('link');
      css.rel = 'stylesheet';
      css.href = script.src.replace(/\.js$/, '.css');
      document.head.appendChild(css);
    } else {
      console.error('Could not find script src for CSS injection');
    }
  }

  function ensureMobileViewport() {
    // Check if viewport meta tag exists, if not create one
    let viewport = document.querySelector('meta[name="viewport"]');
    if (!viewport) {
      viewport = document.createElement('meta');
      viewport.name = 'viewport';
      viewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
      document.head.appendChild(viewport);
    } else {
      // Update existing viewport to prevent zooming
      viewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
    }
  }

  // --- Initialization Logic ---
  const agentScript = document.currentScript;

  const baseUrl = new URL(agentScript.src).origin;
  initializeAgentId(agentScript);
  injectStyles(agentScript);
  ensureMobileViewport();

  const userConfig = window.agentUserConfig;
  const actions = window.agentActions;
  delete window.agentUserConfig;
  delete window.agentActions;

  console.log('BlizzardBerry Agent initialized:', { agentId, baseUrl });

  let counter = 0;
  const generateId = () => `${agentId}-${Date.now()}-${counter++}`;

  const state = {
    messages: [],
    actionResults: {},
    isProcessing: false,
    loggedThinkMessages: new Set(),
    chatId: null,
    isWidgetReady: false,
  };

  let suggestedPrompts = [];

  async function fetchSuggestedPrompts() {
    try {
      const res = await fetch(`${baseUrl}/api/agents/${agentId}/prompts`);
      if (!res.ok) return;
      const data = await res.json();
      suggestedPrompts = (data.prompts || [])
        .map((p) => p.content)
        .filter(Boolean);
    } catch (e) {
      suggestedPrompts = [];
    }
  }

  async function saveMessageToDB(message) {
    if (!state.chatId) return;
    await fetch(`${baseUrl}/api/chats/${state.chatId}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        role: message.role,
        content: message.parts[0].text,
      }),
    });
  }

  async function createWidgetDOM() {
    try {
      const toggle = document.createElement('div');
      toggle.id = 'chatWidgetToggle';
      toggle.innerHTML = `<svg width="32" height="32" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
<path d="M7.5 8.25H16.5M7.5 11.25H12M2.25 12.7593C2.25 14.3604 3.37341 15.754 4.95746 15.987C6.08596 16.1529 7.22724 16.2796 8.37985 16.3655C8.73004 16.3916 9.05017 16.5753 9.24496 16.8674L12 21L14.755 16.8675C14.9498 16.5753 15.2699 16.3917 15.6201 16.3656C16.7727 16.2796 17.914 16.153 19.0425 15.9871C20.6266 15.7542 21.75 14.3606 21.75 12.7595V6.74056C21.75 5.13946 20.6266 3.74583 19.0425 3.51293C16.744 3.17501 14.3926 3 12.0003 3C9.60776 3 7.25612 3.17504 4.95747 3.51302C3.37342 3.74593 2.25 5.13956 2.25 6.74064V12.7593Z" stroke="black" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
`;
      toggle.addEventListener('click', toggleChatWidget);
      document.body.appendChild(toggle);

      const widget = document.createElement('div');
      widget.id = 'chatWidget';
      widget.classList.add('hidden');

      const header = document.createElement('div');
      header.id = 'chatWidgetHeader';
      header.innerHTML = `
    <div>AI Agent</div>
    <button id="chatWidgetCloseButton">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M6 9l6 6 6-6" /> <!-- Downward chevron -->
        </svg>
    </button>
`;
      header
        .querySelector('#chatWidgetCloseButton')
        .addEventListener('click', toggleChatWidget);
      widget.appendChild(header);

      const body = document.createElement('div');
      body.id = 'chatWidgetBody';
      widget.appendChild(body);

      await fetchSuggestedPrompts();

      const inputArea = document.createElement('div');
      inputArea.id = 'chatWidgetInput';
      inputArea.innerHTML = `
        <textarea id="chatWidgetInputField" placeholder="Type a message..."></textarea>
        <button id="chatWidgetSendButton">
<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 -960 960 960"><path fill="#FFFFFF" d="M440-160v-487L216-423l-56-57 320-320 320 320-56 57-224-224v487z"/></svg>        </button>
      `;

      // Add event listener to adjust textarea height dynamically
      const inputField = inputArea.querySelector('#chatWidgetInputField');
      inputField.addEventListener('input', () => {
        inputField.style.height = 'auto'; // Reset height
        inputField.style.height = `${Math.min(inputField.scrollHeight, 120)}px`; // Set to content height, capped at max-height
      });
      inputArea
        .querySelector('#chatWidgetSendButton')
        .addEventListener('click', handleSubmit);
      inputArea
        .querySelector('#chatWidgetInputField')
        .addEventListener('keypress', (e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            // Allow Shift+Enter for new lines
            e.preventDefault();
            handleSubmit();
          }
        });

      if (suggestedPrompts.length > 0) {
        const promptBar = document.createElement('div');
        promptBar.id = 'chatWidgetPromptBar';
        suggestedPrompts.forEach((prompt) => {
          const btn = document.createElement('button');
          btn.type = 'button';
          btn.textContent = truncatePrompt(prompt,15);
          btn.title = prompt;
          btn.className = 'chat-widget-prompt-btn';
          btn.addEventListener('click', () => sendPromptImmediately(prompt));
          promptBar.appendChild(btn);
        });
        widget.appendChild(promptBar);
      }

      widget.appendChild(inputArea);

      const footer = document.createElement('div');
      footer.id = 'chatWidgetFooter';
      footer.innerHTML = 'Powered By BlizzardBerry';
      footer.style.textAlign = 'center';
      footer.style.padding = '10px';
      footer.style.fontSize = '12px';
      footer.style.color = '#666';
      widget.appendChild(footer);

      document.body.appendChild(widget);

      state.messages.push({
        id: generateId(),
        role: 'assistant',
        parts: [
          {
            type: 'text',
            text: "Hello! I'm your AI Agent, here to assist you. Feel free to ask me anything or let me know how I can help!",
          },
        ],
      });
      
      state.isWidgetReady = true;
      const currentWidget = document.getElementById('chatWidget');
      if (currentWidget && !currentWidget.classList.contains('hidden')) {
        updateChatUI();
      }
    } catch (error) {
      console.error('Error creating widget DOM:', error);
    }
  }

  function toggleChatWidget() {
    const widget = document.getElementById('chatWidget');
    const toggle = document.getElementById('chatWidgetToggle');
    
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
        () => document.getElementById('chatWidgetInputField')?.focus(),
        100
      );
    }
  }

  function createLoadingWidget() {
    if (document.getElementById('chatWidgetLoading')) {
      return;
    }

    const toggle = document.getElementById('chatWidgetToggle');
    if (!toggle) return;

    toggle.classList.add('hidden');

    const loadingWidget = document.createElement('div');
    loadingWidget.id = 'chatWidgetLoading';
    loadingWidget.classList.add('chat-widget-loading');
    loadingWidget.innerHTML = `
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
    `;

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
      const realWidget = document.getElementById('chatWidget');
      if (realWidget && state.isWidgetReady) {
        loadingWidget.remove();
        realWidget.classList.remove('hidden');
        updateChatUI();
        setTimeout(
          () => document.getElementById('chatWidgetInputField')?.focus(),
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

  async function handleError(error, messageText) {
    state.isProcessing = false;
    state.messages.push({
      id: generateId(),
      role: 'assistant',
      parts: [{ type: 'text', text: messageText }],
    });
    await saveMessageToDB(state.messages[state.messages.length - 1]);
    updateChatUI();
  }

  async function executeAction(actionModel, messageId, partIndex) {
    const key = `${messageId}-${partIndex}`;
    try {
      state.actionResults[key] = actionModel.toolName.startsWith(
        'ACTION_CLIENT_'
      )
        ? await executeClientAction(actionModel)
        : await executeServerAction(actionModel);

      // Add the action result to the messages array as part of the text content
      state.messages.push({
        id: generateId(),
        role: 'assistant',
        parts: [
          {
            type: 'text',
            text: `✅ ${actionModel.toolName.replace(/^ACTION_(CLIENT_|SERVER_)/, '') || actionModel.action || 'Action'} successfully executed.`,
          },
        ],
      });
      await saveMessageToDB(state.messages[state.messages.length - 1]);
      updateChatUI();

      const actionResultMessage = {
        role: 'user',
        content: `Tool execution result: ${JSON.stringify(state.actionResults[key])}`,
      };

      state.isProcessing = true;
      updateChatUI();

      const interpretation = await interpretActionResult(actionResultMessage);

      // Append the AI's interpretation of the action result
      state.messages.push({
        id: generateId(),
        role: 'assistant',
        parts: [{ type: 'text', text: interpretation }],
      });
    } catch (error) {
      state.actionResults[key] = {
        error: 'Failed to execute action',
        details: error.message || 'Unknown error',
      };
      handleError(error, 'Error: Failed to execute action');
      return;
    }
    state.isProcessing = false;
    updateChatUI();
  }

  async function interpretActionResult(actionResultMessage) {
    const chatResponse = await fetch(`${baseUrl}/api/chat/interpret`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [...state.messages, actionResultMessage],
        agentId,
        chatId: state.chatId,
        idempotencyKey: generateId(),
      }),
    });

    if (!chatResponse.ok) throw new Error('Failed to fetch AI response');
    const { text } = await chatResponse.json();
    return text;
  }

  async function executeClientAction(actionModel) {
    const functionName = actionModel.functionName.replace('ACTION_CLIENT_', '');
    const action = actions[functionName];
    return await action(actionModel.params);
  }

  async function executeServerAction(actionModel) {
    const response = await fetch(actionModel.url, {
      method: actionModel.method,
      headers: actionModel.headers,
      body: JSON.stringify(actionModel.body),
    });
    return await response.json();
  }

  async function handleSubmit() {
    const input = document.getElementById('chatWidgetInputField');
    const text = input.value.trim();
    if (!text || state.isProcessing) return;
    await processChatMessage(text);
  }

  async function processChatMessage(messageText) {
    state.messages.push({
      id: generateId(),
      role: 'user',
      parts: [{ type: 'text', text: messageText }],
    });
    const promptBar = document.getElementById('chatWidgetPromptBar');
    if (promptBar) promptBar.style.display = 'none';

    const input = document.getElementById('chatWidgetInputField');
    if (input) input.value = '';

    state.isProcessing = true;
    updateChatUI();

    try {
      const body = {
        messages: state.messages,
        userConfig,
        agentId,
        idempotencyKey: generateId(),
      };
      if (state.chatId) {
        body.chatId = state.chatId;
      }
      const response = await fetch(`${baseUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!response.ok) throw new Error('Failed to fetch AI response');
      const {
        text,
        toolCalls,
        toolResults,
        error,
        message,
        chatId: returnedChatId,
      } = await response.json();
      if (returnedChatId) {
        state.chatId = returnedChatId;
      }
      const parts = [];

      // If backend returned an error or message, show it in the chat widget
      if (error || message) {
        handleError(null, error || message);
        return;
      }

      if (text && (!toolResults || toolResults.length === 0)) {
        parts.push({ type: 'text', text });
      }

      if (toolCalls?.length) {
        toolCalls.forEach((toolCall) => {
          const toolResult = toolResults?.find(
            (tr) => tr.toolCallId === toolCall.toolCallId
          );
          parts.push({
            type: 'tool-invocation',
            toolInvocation: {
              toolCallId: toolCall.toolCallId,
              toolName: toolCall.toolName,
              args: toolCall.args,
              state: toolResult ? 'result' : 'partial',
              result: toolResult ? toolResult.result : undefined,
            },
          });
        });
      }

      let hasToolExecution = false;
      const aiMessage = {
        id: generateId(),
        role: 'assistant',
        parts,
      };

      const toolInvocations = parts.filter(
        (part) =>
          part.type === 'tool-invocation' &&
          part.toolInvocation.state === 'result' &&
          part.toolInvocation.result &&
          part.toolInvocation.toolName.startsWith('ACTION_')
      );

      if (toolInvocations.length > 0) {
        hasToolExecution = true;
        toolInvocations.forEach((part, index) => {
          executeAction(
            {
              ...part.toolInvocation.result,
              toolName: part.toolInvocation.toolName,
            },
            aiMessage.id,
            index
          );
        });
      } else if (parts.length > 0) {
        state.messages.push(aiMessage);
      }

      if (!hasToolExecution) {
        state.isProcessing = false;
        updateChatUI();
      }
    } catch (error) {
      handleError(error, 'Error: Failed to get response');
    }
  }

  function convertBoldFormatting(text) {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br>');
  }

  // Render message part
  function renderMessagePart(part, messageId) {
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

  // Update chat UI
  function updateChatUI() {
    const chatBody = document.getElementById('chatWidgetBody');
    let html = state.messages
      .map(
        (message) => `
      <div class="message-container ${message.role === 'user' ? 'user-container' : 'assistant-container'}">
        <div class="message ${message.role === 'user' ? 'user-message' : 'assistant-message'}">
          ${message.parts.map((part) => renderMessagePart(part, message.id)).join('')}
        </div>
      </div>
    `
      )
      .join('');

    if (state.isProcessing) {
      html += `
      <div class="message-container assistant-container">
        <div class="message assistant-message typing-indicator">
          <span></span><span></span><span></span>
        </div>
      </div>
    `;
    }

    chatBody.innerHTML = html;
    chatBody.scrollTop = chatBody.scrollHeight;
  }

  async function sendPromptImmediately(promptText) {
    if (!promptText || state.isProcessing) return;
    await processChatMessage(promptText);
  }

  function truncatePrompt(prompt, wordLimit = 15) {
    const words = prompt.split(/\s+/);
    if (words.length > wordLimit) {
      return words.slice(0, wordLimit).join(' ') + '...';
    }
    return prompt;
  }

  // Initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createWidgetDOM);
  } else {
    createWidgetDOM();
  }
})();
