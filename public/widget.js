/**
 * ChatBot Widget
 * A vanilla JavaScript implementation of a chatbot widget that can be injected into any website
 */
// TODO: this should probably be minified and obfuscated at build time
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
        fetchResults: {},
        isProcessing: false
    };

    function injectStyles() {
        const script = document.currentScript;
        const cssHref = script.src.replace(/\.js$/, '.css');

        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = cssHref;
        document.head.appendChild(link);
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

        // Create title element
        const title = document.createElement('div');
        title.textContent = 'Chat';
        header.appendChild(title);

        // Create close button
        const closeButton = document.createElement('button');
        closeButton.id = 'chatWidgetCloseButton';
        closeButton.innerHTML = '⌄';
        closeButton.addEventListener('click', toggleChatWidget);
        header.appendChild(closeButton);

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
        inputField.placeholder = 'Type a message...';
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
            // Focus input field when opening
            setTimeout(() => {
                document.getElementById('chatWidgetInputField').focus();
            }, 100);
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

        if (!userInput || state.isProcessing) return;

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

        // Set processing state
        state.isProcessing = true;

        // Call backend API
        try {
            const response = await fetch('http://localhost:3000/api/chat', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({messages: state.messages}),
            });

            if (!response.ok) throw new Error('Failed to fetch AI response');

            const {text, toolCalls, toolResults} = await response.json();

            // Reset processing state
            state.isProcessing = false;

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

            // Reset processing state
            state.isProcessing = false;

            const errorMessage = {
                id: generateId(),
                role: 'assistant',
                parts: [{type: 'text', text: 'Error: Failed to get response'}],
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
            // Log tool invocation details to console for debugging
            console.log('Tool Invocation:', {
                toolInvocation: part.toolInvocation
            });

            // Render only the fetch result (if available)
            if (fetchResult) {
                return `
                    <div class="tool-result">
                        <div class="tool-result-header">Response (${fetchResult.status})</div>
                        <pre>${JSON.stringify(fetchResult.data || fetchResult.error, null, 2)}</pre>
                    </div>
                `;
            } else {
                return `<div class="tool-pending">Processing request...</div>`;
            }
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
                <div class="message-container ${isUser ? 'user-container' : 'assistant-container'}">
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

        // Add typing indicator if processing
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