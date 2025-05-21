(function () {
    const actions = {};

    if (window.ChatbotActions && typeof window.ChatbotActions === 'object') {
        console.log('Registering actions:', Object.keys(window.ChatbotActions));
        Object.assign(actions, window.ChatbotActions);
        console.log('Available actions:', Object.keys(actions));
        delete window.ChatbotActions;
    }

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

    // Execute fetch for action invocations
    async function executeAction(actionModel, messageId, partIndex) {
        const key = `${messageId}-${partIndex}`;
        try {
            const result = actionModel.functionName?.startsWith('ACTION_CLIENT_')
                ? await executeClientAction(actionModel)
                : await executeServerAction(actionModel);

            state.fetchResults[key] = {
                status: result.status,
                data: result.data
            };

            // Log raw fetch result for debugging
            console.log('Fetch Result:', state.fetchResults[key]);

            // Add success message with green checkmark
            state.messages.push({
                id: generateId(),
                role: 'assistant',
                parts: [{
                    type: 'text',
                    text: `✅ ${(actionModel.toolName?.replace(/^ACTION_(CLIENT_|SERVER_)/, '') || actionModel.action || 'Action')} successfully executed`
                }]
            });
            updateChatUI();

            // Create a temporary message to hold the fetch result as context
            const fetchResultMessage = {
                role: 'user', // Use 'user' to match expected roles
                content: `Tool execution result: ${JSON.stringify(state.fetchResults[key])}`
            };

            // Send to chat endpoint with fetch result as context
            state.isProcessing = true;
            updateChatUI();

            const chatResponse = await fetch('http://localhost:3000/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: [...state.messages, fetchResultMessage]
                })
            });

            if (!chatResponse.ok) throw new Error('Failed to fetch AI response');
            const { text } = await chatResponse.json();

            // Add the LLM response to messages
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

    async function executeClientAction(actionModel) {
        const functionName = actionModel.functionName.replace('ACTION_CLIENT_', '');
        const action = actions[functionName];
        const result = await action(actionModel.params);
        if (result.status === 'error') throw new Error(result.error);
        return result;
    }

    async function executeServerAction(actionModel) {
        const response = await fetch(actionModel.url, {
            method: actionModel.method,
            headers: actionModel.headers,
            body: JSON.stringify(actionModel.body)
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
            const response = await fetch('http://localhost:3000/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages: state.messages })
            });

            if (!response.ok) throw new Error('Failed to fetch AI response');
            const { text, toolCalls, toolResults } = await response.json();
            const parts = [];

            // Only add text part if there are no toolResults
            if (text && (!toolResults || toolResults.length === 0)) {
                parts.push({ type: 'text', text });
            }

            if (toolCalls?.length) {
                toolCalls.forEach((toolCall, _) => {
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

            // Only create and push aiMessage if it has non-tool parts
            let hasToolExecution = false;
            const aiMessage = {
                id: generateId(),
                role: 'assistant',
                parts
            };

            // Check if there are any tool executions to perform
            const toolInvocations = parts.filter(part =>
                part.type === 'tool-invocation' &&
                part.toolInvocation.state === 'result' &&
                part.toolInvocation.result &&
                part.toolInvocation.toolName.startsWith('ACTION_')
            );

            if (toolInvocations.length > 0) {
                hasToolExecution = true;
                // Execute tool invocations without adding aiMessage to state.messages
                toolInvocations.forEach((part, index) => {
                    executeAction({ ...part.toolInvocation.result, toolName: part.toolInvocation.toolName }, aiMessage.id, index);
                });
            } else if (parts.length > 0) {
                // Only push aiMessage if it has non-tool parts
                state.messages.push(aiMessage);
            }

            // If no tool executions, update UI immediately
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
                    ${message.parts.map((part, _) => renderMessagePart(part, message.id)).join('')}
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