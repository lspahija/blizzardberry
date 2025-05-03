(function () {
    // Generate UUID-like IDs
    function generateId() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
            const r = Math.random() * 16 | 0;
            return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
        });
    }

    const state = {
        messages: [],
        fetchResults: {},
        isProcessing: false,
        loggedThinkMessages: new Set() // Track messages with logged think content
    };

    // Inject CSS
    function injectStyles() {
        const script = document.currentScript;
        const css = document.createElement('link');
        css.rel = 'stylesheet';
        css.href = script.src.replace(/\.js$/, '.css');
        document.head.appendChild(css);
    }

    // Create widget DOM
    function createWidgetDOM() {
        // Toggle button
        const toggle = document.createElement('div');
        toggle.id = 'chatWidgetToggle';
        toggle.innerHTML = '💬';
        toggle.addEventListener('click', toggleChatWidget);
        document.body.appendChild(toggle);

        // Main widget
        const widget = document.createElement('div');
        widget.id = 'chatWidget';
        widget.classList.add('hidden');

        // Header
        const header = document.createElement('div');
        header.id = 'chatWidgetHeader';
        header.innerHTML = '<div>Chat</div><button id="chatWidgetCloseButton">⌄</button>';
        header.querySelector('#chatWidgetCloseButton').addEventListener('click', toggleChatWidget);
        widget.appendChild(header);

        // Body
        const body = document.createElement('div');
        body.id = 'chatWidgetBody';
        widget.appendChild(body);

        // Input area
        const inputArea = document.createElement('div');
        inputArea.id = 'chatWidgetInput';
        inputArea.innerHTML = `
            <input id="chatWidgetInputField" type="text" placeholder="Type a message...">
            <button id="chatWidgetSendButton">Send</button>
        `;
        inputArea.querySelector('#chatWidgetSendButton').addEventListener('click', handleSubmit);
        inputArea.querySelector('#chatWidgetInputField').addEventListener('keypress', e => {
            if (e.key === 'Enter') handleSubmit();
        });
        widget.appendChild(inputArea);
        document.body.appendChild(widget);
    }

    // Toggle widget visibility
    function toggleChatWidget() {
        const widget = document.getElementById('chatWidget');
        const toggle = document.getElementById('chatWidgetToggle');
        const isHidden = widget.classList.toggle('hidden');
        toggle.classList.toggle('hidden', !isHidden);
        if (!isHidden) setTimeout(() => document.getElementById('chatWidgetInputField').focus(), 100);
    }

    // Handle errors consistently
    function handleError(error, messageText) {
        console.error(error);
        state.isProcessing = false;
        state.messages.push({
            id: generateId(),
            role: 'assistant',
            parts: [{ type: 'text', text: messageText }]
        });
        updateChatUI();
    }

    // Execute fetch for tool invocations
    async function executeFetch(httpModel, messageId, partIndex) {
        const key = `${messageId}-${partIndex}`;
        try {
            const response = await fetch(httpModel.url, {
                method: httpModel.method,
                headers: httpModel.headers,
                body: httpModel.body
            });
            const data = await response.json();
            state.fetchResults[key] = { status: response.status, data };

            // Log raw fetch result for debugging
            console.log('Fetch Result:', state.fetchResults[key]);

            // Update message with fetch result
            const message = state.messages.find(msg => msg.id === messageId);
            if (message && message.parts[partIndex]) {
                message.parts[partIndex].toolInvocation.result = state.fetchResults[key];
                message.parts[partIndex].toolInvocation.state = 'result';
            }

            // Send to chat endpoint for friendly response
            state.isProcessing = true;
            updateChatUI();

            const chatResponse = await fetch('http://localhost:3000/api/test-chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages: state.messages })
            });

            if (!chatResponse.ok) throw new Error('Failed to fetch AI response');
            const { text } = await chatResponse.json();

            state.messages.push({
                id: generateId(),
                role: 'assistant',
                parts: [{ type: 'text', text: text || 'Here is the result of your request.' }]
            });
        } catch (error) {
            state.fetchResults[key] = {
                error: 'Failed to execute request',
                details: error.message || 'Unknown error'
            };
            handleError(error, 'Error: Failed to process tool request');
            return;
        }
        state.isProcessing = false;
        updateChatUI();
    }

    // Handle user input submission
    async function handleSubmit() {
        const input = document.getElementById('chatWidgetInputField');
        const text = input.value.trim();
        if (!text || state.isProcessing) return;

        state.messages.push({
            id: generateId(),
            role: 'user',
            parts: [{ type: 'text', text }]
        });
        input.value = '';
        updateChatUI(); // Show user message immediately

        // Delay typing indicator appearance
        setTimeout(() => {
            state.isProcessing = true;
            updateChatUI(); // Show typing indicator
        }, 300); // 300ms delay for typing indicator

        try {
            const response = await fetch('http://localhost:3000/api/test-chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages: state.messages })
            });

            if (!response.ok) throw new Error('Failed to fetch AI response');
            const { text, toolCalls, toolResults } = await response.json();
            const parts = [];

            if (text) parts.push({ type: 'text', text });
            if (toolCalls?.length) {
                toolCalls.forEach((toolCall, index) => {
                    const toolResult = toolResults?.find(tr => tr.toolCallId === toolCall.toolCallId);
                    parts.push({
                        type: 'tool-invocation',
                        toolInvocation: {
                            toolCallId: toolCall.toolCallId,
                            toolName: toolCall.toolName,
                            args: toolCall.args,
                            state: toolResult ? 'result' : 'partial',
                            result: toolResult ? toolResult.result : undefined
                        }
                    });
                    // Log tool invocation when it's created
                    console.log('Tool Invoked:', {
                        toolCallId: toolCall.toolCallId,
                        toolName: toolCall.toolName,
                        args: toolCall.args
                    });
                });
            }

            const aiMessage = {
                id: generateId(),
                role: 'assistant',
                parts
            };
            state.messages.push(aiMessage);

            // Execute tool invocations only for toolNames starting with "ACTION:"
            aiMessage.parts.forEach((part, index) => {
                if (
                    part.type === 'tool-invocation' &&
                    part.toolInvocation.state === 'result' &&
                    part.toolInvocation.result &&
                    part.toolInvocation.toolName.startsWith('ACTION:')
                ) {
                    executeFetch(part.toolInvocation.result, aiMessage.id, index);
                }
            });

            state.isProcessing = false;
            updateChatUI();
        } catch (error) {
            handleError(error, 'Error: Failed to get response');
        }
    }

    function renderMessagePart(part, messageId, index) {
        if (part.type === 'text') {
            // Extract <think> content for logging and get display text
            const thinkMatch = part.text.match(/<think>([\s\S]*?)<\/think>\n\n([\s\S]*)/);
            if (thinkMatch) {
                // Log think content only if not already logged
                if (!state.loggedThinkMessages.has(messageId)) {
                    console.log('Think Content:', thinkMatch[1].trim());
                    state.loggedThinkMessages.add(messageId);
                }
                // Always return only the text after </think> for rendering
                return `<div class="text-part">${thinkMatch[2].trim()}</div>`;
            }
            // If no <think> tag, render the text as is
            return `<div class="text-part">${part.text}</div>`;
        }
        if (part.type === 'tool-invocation') {
            return ''; // Don't render tool-invocation in UI
        }
        return '';
    }

    // Update chat UI
    function updateChatUI() {
        const chatBody = document.getElementById('chatWidgetBody');
        let html = state.messages.map(message => `
            <div class="message-container ${message.role === 'user' ? 'user-container' : 'assistant-container'}">
                <div class="message ${message.role === 'user' ? 'user-message' : 'assistant-message'}">
                    ${message.parts.map((part, index) => renderMessagePart(part, message.id, index)).join('')}
                </div>
            </div>
        `).join('');

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

    // Initialize
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            injectStyles();
            createWidgetDOM();
        });
    } else {
        injectStyles();
        createWidgetDOM();
    }
})();