/**
 * ChatBot Widget
 * A vanilla JavaScript implementation of a chatbot widget that can be injected into any website
 */

(function () {
    // Create unique IDs similar to UUID v4
    function generateId() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    // State management
    const state = {
        messages: [],
        fetchResults: {}
    };

    // Inject CSS
    function injectStyles() {
        const style = document.createElement('style');
        style.textContent = `
        #chatWidget {
  width: 350px;
  height: 500px;
  border: none;
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 1000;
  background-color: #ffffff;
  border-radius: 16px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
}

#chatWidgetHeader {
  padding: 16px;
  background-color: #0055cc;
  color: #ffffff;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  user-select: none;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

#chatWidgetBody {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  background-color: #f5f7fa;
  gap: 16px;
}

#chatWidgetInput {
  padding: 12px 16px;
  border-top: 1px solid #e9ecef;
  display: flex;
  background-color: #ffffff;
}

#chatWidgetInputField {
  flex: 1;
  padding: 12px;
  border: 1px solid #e0e0e0;
  border-radius: 20px;
  margin-right: 10px;
  font-size: 14px;
  outline: none;
}

#chatWidgetInputField:focus {
  border-color: #0055cc;
  box-shadow: 0 0 0 2px rgba(0, 85, 204, 0.1);
}

#chatWidgetSendButton {
  background-color: #0055cc;
  color: #ffffff;
  border: none;
  border-radius: 20px;
  padding: 8px 16px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
  min-width: 64px;
}

#chatWidgetSendButton:hover {
  background-color: #003d99;
  transform: translateY(-1px);
}

.message-container {
  width: 100%;
  margin-bottom: 4px;
  display: flex;
  flex-direction: column;
}

.role-label {
  font-weight: 500;
  margin-bottom: 4px;
  font-size: 12px;
  color: #6b7280;
  padding: 0 4px;
}

.message {
  border-radius: 18px;
  padding: 12px 16px;
  font-size: 14px;
  line-height: 1.5;
  max-width: 80%;
  word-wrap: break-word;
  white-space: normal;
  box-sizing: border-box;
}

.user-message {
  background-color: #0055cc;
  color: #ffffff;
  align-self: flex-end;
  margin-left: auto;
  border-bottom-right-radius: 4px;
}

.assistant-message {
  background-color: #e6e9ef;
  color: #333;
  align-self: flex-start;
  border-bottom-left-radius: 4px;
}

.tool-invocation {
  background-color: #f1f3f5;
  border-radius: 8px;
  padding: 10px;
  margin-top: 8px;
  font-size: 12px;
  font-family: monospace;
  white-space: pre-wrap;
  overflow-x: auto;
  width: 100%;
  box-sizing: border-box;
}

.tool-result {
  background-color: #e6f0fa;
  border-radius: 8px;
  padding: 10px;
  margin-top: 6px;
  font-size: 12px;
  font-family: monospace;
  white-space: pre-wrap;
  overflow-x: auto;
  width: 100%;
  box-sizing: border-box;
}

/* Make code blocks with horizontal scrolling instead of text wrapping */
.tool-invocation pre,
.tool-result pre {
  margin: 0;
  overflow-x: auto;
  white-space: pre;
}

#chatWidgetToggle {
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 60px;
  height: 60px;
  border-radius: 30px;
  background-color: #0055cc;
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  font-size: 24px;
  z-index: 1001;
  transition: all 0.3s;
}

#chatWidgetToggle:hover {
  transform: scale(1.05);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.25);
}

.hidden {
  display: none !important;
}
    `;
        document.head.appendChild(style);
    }

    // Create widget DOM
    function createWidgetDOM() {
        // Create toggle button
        const toggleButton = document.createElement('div');
        toggleButton.id = 'chatWidgetToggle';
        toggleButton.innerHTML = '💬';
        toggleButton.addEventListener('click', toggleChatWidget);
        document.body.appendChild(toggleButton);

        // Create main widget container
        const widget = document.createElement('div');
        widget.id = 'chatWidget';
        widget.classList.add('hidden');

        // Create header
        const header = document.createElement('div');
        header.id = 'chatWidgetHeader';
        header.textContent = 'Chat';
        widget.appendChild(header);

        // Create body for messages
        const body = document.createElement('div');
        body.id = 'chatWidgetBody';
        widget.appendChild(body);

        // Create input area
        const inputArea = document.createElement('div');
        inputArea.id = 'chatWidgetInput';

        const inputField = document.createElement('input');
        inputField.id = 'chatWidgetInputField';
        inputField.type = 'text';
        inputField.placeholder = 'Say something...';
        inputArea.appendChild(inputField);

        const sendButton = document.createElement('button');
        sendButton.id = 'chatWidgetSendButton';
        sendButton.textContent = 'Send';
        sendButton.addEventListener('click', handleSubmit);
        inputArea.appendChild(sendButton);

        widget.appendChild(inputArea);
        document.body.appendChild(widget);

        // Add event listener for Enter key
        inputField.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') {
                handleSubmit();
            }
        });
    }

    // Toggle chat widget visibility
    function toggleChatWidget() {
        const widget = document.getElementById('chatWidget');
        const toggle = document.getElementById('chatWidgetToggle');

        if (widget.classList.contains('hidden')) {
            widget.classList.remove('hidden');
            toggle.classList.add('hidden');
        } else {
            widget.classList.add('hidden');
            toggle.classList.remove('hidden');
        }
    }

    // Execute fetch for tool invocations
    async function executeFetch(httpModel, messageId, partIndex) {
        const key = `${messageId}-${partIndex}`;
        try {
            const response = await fetch(httpModel.url, {
                method: httpModel.method,
                headers: httpModel.headers,
                body: httpModel.body,
            });
            const data = await response.json();

            state.fetchResults[key] = {
                status: response.status,
                data
            };

            // Update UI to show fetch results
            updateChatUI();
        } catch (error) {
            state.fetchResults[key] = {
                error: 'Failed to execute request',
                details: error.message || 'Unknown error occurred',
            };

            // Update UI to show error
            updateChatUI();
        }
    }

    // Handle submit action
    async function handleSubmit() {
        const inputField = document.getElementById('chatWidgetInputField');
        const userInput = inputField.value.trim();

        if (!userInput) return;

        // Add user message
        const userMessage = {
            id: generateId(),
            role: 'user',
            parts: [{type: 'text', text: userInput}],
        };

        state.messages.push(userMessage);
        inputField.value = '';

        // Update UI
        updateChatUI();

        // Call backend API
        try {
            const response = await fetch('http://localhost:3000/api/chat', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({messages: state.messages}),
            });

            if (!response.ok) throw new Error('Failed to fetch AI response');

            const {text, toolCalls, toolResults} = await response.json();

            // Construct AI message parts
            const parts = [];

            // Add text part if present
            if (text) {
                parts.push({type: 'text', text});
            }

            // Add tool invocation parts
            if (toolCalls && Array.isArray(toolCalls)) {
                toolCalls.forEach((toolCall, index) => {
                    const toolResult = toolResults?.find(tr => tr.toolCallId === toolCall.toolCallId);
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

            // Add AI message
            const aiMessage = {
                id: generateId(),
                role: 'assistant',
                parts,
            };

            state.messages.push(aiMessage);

            // Process any tool invocations that need to be executed
            aiMessage.parts.forEach((part, index) => {
                if (
                    part.type === 'tool-invocation' &&
                    part.toolInvocation.state === 'result' &&
                    part.toolInvocation.result
                ) {
                    executeFetch(part.toolInvocation.result, aiMessage.id, index);
                }
            });

            // Update UI
            updateChatUI();

        } catch (error) {
            console.error('Error fetching AI response:', error);

            const errorMessage = {
                id: generateId(),
                role: 'assistant',
                parts: [{type: 'text', text: 'Error: Failed to get AI response'}],
            };

            state.messages.push(errorMessage);

            // Update UI
            updateChatUI();
        }
    }

    // Render a message part
    function renderMessagePart(part, messageId, index) {
        const key = `${messageId}-${index}`;
        const fetchResult = state.fetchResults[key];

        if (part.type === 'text') {
            return `<div>${part.text}</div>`;
        } else if (part.type === 'tool-invocation') {
            let html = `
        <div class="tool-invocation">
          <div style="font-weight: bold;">Action to perform:</div>
          <pre>${JSON.stringify(part.toolInvocation, null, 2)}</pre>
        </div>
      `;

            if (fetchResult) {
                html += `
          <div class="tool-result">
            <div style="font-weight: bold;">Action result:</div>
            <pre>${JSON.stringify(fetchResult, null, 2)}</pre>
          </div>
        `;
            } else {
                html += `<div style="color: gray; margin-top: 4px;">Executing request...</div>`;
            }

            return html;
        }

        return '';
    }

    // Update the chat UI with current messages
    function updateChatUI() {
        const chatBody = document.getElementById('chatWidgetBody');
        let html = '';

        state.messages.forEach(message => {
            const isUser = message.role === 'user';
            html += `
        <div class="message-container">
          <div class="role-label">${isUser ? 'User' : 'Assistant'}</div>
          <div class="message ${isUser ? 'user-message' : 'assistant-message'}">
      `;

            message.parts.forEach((part, index) => {
                html += renderMessagePart(part, message.id, index);
            });

            html += `
          </div>
        </div>
      `;
        });

        chatBody.innerHTML = html;
        chatBody.scrollTop = chatBody.scrollHeight;
    }

    // Check for tool invocations that need execution
    function checkToolInvocations() {
        state.messages.forEach(message => {
            message.parts.forEach((part, index) => {
                if (
                    part.type === 'tool-invocation' &&
                    part.toolInvocation.state === 'result' &&
                    part.toolInvocation.result
                ) {
                    const key = `${message.id}-${index}`;
                    if (!state.fetchResults[key]) {
                        executeFetch(part.toolInvocation.result, message.id, index);
                    }
                }
            });
        });
    }

    // Initialize the widget
    function init() {
        injectStyles();
        createWidgetDOM();
    }

    // Start the widget when DOM is fully loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();