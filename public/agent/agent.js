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

  // --- Initialization Logic ---
  const agentScript = document.currentScript;

  const baseUrl = new URL(agentScript.src).origin;
  initializeAgentId(agentScript);
  injectStyles(agentScript);

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
      `/api/chat`,
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
    state.isProcessing = true;
    updateChatUI();

    try {
      const response = await fetch(`/api/chat`, {
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
      const { text, toolCalls, toolResults, error, message } =
        await response.json();
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