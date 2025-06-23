(function () {
  // --- Base URL Detection ---
  function detectBaseUrl(script) {
    // Method 1: Check for data attribute on script tag (highest priority)
    if (script && script.dataset && script.dataset.apiBaseUrl) {
      return script.dataset.apiBaseUrl;
    }

    // Method 2: Check for global configuration
    if (window.agentApiBaseUrl) {
      return window.agentApiBaseUrl;
    }

    // Method 3: Extract from script src (most reliable for hosted widgets)
    if (script && script.src) {
      try {
        const scriptUrl = new URL(script.src);
        return `${scriptUrl.protocol}//${scriptUrl.host}`;
      } catch (e) {
        console.warn('Could not parse script URL for base URL detection:', e);
      }
    }

    // Method 4: Fallback to current origin (for local development)
    return window.location.origin;
  }

  function getExecutingScript() {
    // Most reliable: modern browsers support this
    if (document.currentScript) {
      return document.currentScript;
    }

    // Fallback for older browsers or specific scenarios
    // We find the script by its unique src attribute.
    // This part of the logic from the original code is kept,
    // assuming there's a reason to handle multiple scripts with the same src.
    const scripts = document.getElementsByTagName('script');
    for (let i = scripts.length - 1; i >= 0; i--) {
      const script = scripts[i];
      // A more robust check could be to see if this script's src
      // matches a known pattern for your agent.
      // For this refactoring, we'll assume any script with a 'data-agent-id' is a candidate.
      if (script.src && script.dataset.agentId) {
        // This is a simplified approach. If multiple agent scripts could be on a page,
        // a more specific selector would be needed.
        const currentScriptSrc = script.src;
        const matchingScripts = document.querySelectorAll(
          `script[src="${currentScriptSrc}"][data-agent-id]`
        );
        if (matchingScripts.length === 1) {
          return matchingScripts[0];
        } else if (matchingScripts.length > 1) {
          console.error(
            'Multiple scripts with same src and data-agent-id found. Cannot determine which script to use.'
          );
          return null;
        }
      }
    }

    // Last resort: find by a specific ID
    const specificScript = document.getElementById('blizzardberry-agent');
    if (specificScript) {
      return specificScript;
    }

    return null; // Return null if no script was found
  }

  let agentId = null;
  let userConfig = null;
  let baseUrl = null;
  const actions = {};
  let counter = 0;

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

  // --- Initialization Logic ---

  const agentScript = getExecutingScript();

  if (agentScript) {
    initializeAgentId(agentScript);
    injectStyles(agentScript);
    baseUrl = detectBaseUrl(agentScript);
    console.log('BlizzardBerry Agent initialized:', { agentId, baseUrl });
  }

  // Initialize user config
  if (window.agentUserConfig && typeof window.agentUserConfig === 'object') {
    userConfig = window.agentUserConfig;
    delete window.agentUserConfig;
  }

  // Initialize custom actions
  if (window.AgentActions && typeof window.AgentActions === 'object') {
    Object.assign(actions, window.AgentActions);
    delete window.AgentActions;
  }

  const generateId = () => `${agentId}-${Date.now()}-${counter++}`;

  const state = {
    messages: [],
    actionResults: {},
    isProcessing: false,
    loggedThinkMessages: new Set(),
  };

  // Create widget DOM
  function createWidgetDOM() {
    try {
      const toggle = document.createElement('div');
      toggle.id = 'chatWidgetToggle';
      toggle.innerHTML = '💬';
      toggle.addEventListener('click', toggleChatWidget);
      document.body.appendChild(toggle);

      const widget = document.createElement('div');
      widget.id = 'chatWidget';
      widget.classList.add('hidden');

      const header = document.createElement('div');
      header.id = 'chatWidgetHeader';
      header.innerHTML =
        '<div>Chat</div><button id="chatWidgetCloseButton">⌄</button>';
      header
        .querySelector('#chatWidgetCloseButton')
        .addEventListener('click', toggleChatWidget);
      widget.appendChild(header);

      const body = document.createElement('div');
      body.id = 'chatWidgetBody';
      widget.appendChild(body);

      const inputArea = document.createElement('div');
      inputArea.id = 'chatWidgetInput';
      inputArea.innerHTML = `
        <input id="chatWidgetInputField" type="text" placeholder="Type a message...">
        <button id="chatWidgetSendButton">Send</button>
      `;
      inputArea
        .querySelector('#chatWidgetSendButton')
        .addEventListener('click', handleSubmit);
      inputArea
        .querySelector('#chatWidgetInputField')
        .addEventListener('keypress', (e) => {
          if (e.key === 'Enter') handleSubmit();
        });
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
    } catch (error) {
      console.error('Error creating widget DOM:', error);
    }
  }

  // Toggle widget visibility
  function toggleChatWidget() {
    const widget = document.getElementById('chatWidget');
    const toggle = document.getElementById('chatWidgetToggle');
    const isHidden = widget.classList.toggle('hidden');
    toggle.classList.toggle('hidden', !isHidden);
    if (!isHidden)
      setTimeout(
        () => document.getElementById('chatWidgetInputField').focus(),
        100
      );
  }

  // Handle errors
  function handleError(error, messageText) {
    state.isProcessing = false;
    state.messages.push({
      id: generateId(),
      role: 'assistant',
      parts: [{ type: 'text', text: messageText }],
    });
    updateChatUI();
  }

  async function executeAction(actionModel, messageId, partIndex) {
    const key = `${messageId}-${partIndex}`;
    try {
      state.actionResults[key] = actionModel.functionName?.startsWith(
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
            text: `✅ ${actionModel.toolName?.replace(/^ACTION_(CLIENT_|SERVER_)/, '') || actionModel.action || 'Action'} successfully executed. Result: ${JSON.stringify(state.actionResults[key])}`,
          },
        ],
      });
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
    const chatResponse = await fetch(
      `${baseUrl}/api/chat`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...state.messages, actionResultMessage],
          agentId,
          idempotencyKey: generateId(),
        }),
      }
    );

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

  // Handle user input submission
  async function handleSubmit() {
    const input = document.getElementById('chatWidgetInputField');
    const text = input.value.trim();
    if (!text || state.isProcessing) return;

    state.messages.push({
      id: generateId(),
      role: 'user',
      parts: [{ type: 'text', text }],
    });
    input.value = '';
    updateChatUI();

    setTimeout(() => {
      state.isProcessing = true;
      updateChatUI();
    }, 300);

    try {
      const response = await fetch(`${baseUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: state.messages,
          userConfig,
          agentId,
          idempotencyKey: generateId(),
        }),
      });

      if (!response.ok) throw new Error('Failed to fetch AI response');
      const { text, toolCalls, toolResults } = await response.json();
      const parts = [];

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
        return `<div class="text-part">${thinkMatch[2].trim()}</div>`;
      }
      return `<div class="text-part">${part.text}</div>`;
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

  // Initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createWidgetDOM);
  } else {
    createWidgetDOM();
  }
})();