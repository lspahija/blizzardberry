class AgentWidget {
    constructor() {
        this.isExpanded = false;
        this.isHovered = false;
        this.messages = [
            {
                id: '1',
                text: "Hi! I'm your AI Agent. How can I help you today?",
                sender: 'agent',
                timestamp: new Date()
            }
        ];
        this.inputText = '';
        
        this.init();
    }
    
    init() {
        this.widget = document.getElementById('agent-widget');
        this.textOverlay = document.getElementById('text-overlay');
        this.collapsedView = document.getElementById('collapsed-view');
        this.expandedView = document.getElementById('expanded-view');
        this.messagesContainer = document.getElementById('messages-container');
        this.messageInput = document.getElementById('message-input');
        this.latestMessage = document.getElementById('latest-message');
        
        this.setupEventListeners();
        this.updateExpandedHeight();
    }
    
    setupEventListeners() {
        // Mouse events
        this.widget.addEventListener('mouseenter', () => {
            this.isHovered = true;
            this.setExpanded(true);
        });
        
        this.widget.addEventListener('mouseleave', () => {
            this.isHovered = false;
            this.setExpanded(false);
        });
        
        this.widget.addEventListener('click', () => {
            this.setExpanded(!this.isExpanded);
        });
        
        // Input events
        this.messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && this.messageInput.value.trim()) {
                this.addMessage(this.messageInput.value.trim(), 'user');
                this.messageInput.value = '';
            }
        });
        
        // Prevent event bubbling on expanded view
        this.expandedView.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    }
    
    setExpanded(expanded) {
        this.isExpanded = expanded;
        
        if (expanded) {
            this.widget.classList.add('expanded');
            this.collapsedView.style.display = 'none';
            this.expandedView.style.display = 'flex';
        } else {
            this.widget.classList.remove('expanded');
            this.collapsedView.style.display = 'block';
            this.expandedView.style.display = 'none';
        }
        
        this.updateExpandedHeight();
    }
    
    updateExpandedHeight() {
        const baseHeight = 120; // Header + input area
        const messageHeight = 40; // Approximate height per message
        const maxHeight = 500;
        const minHeight = 200;
        
        const contentHeight = baseHeight + this.messages.length * messageHeight;
        const expandedHeight = Math.min(Math.max(contentHeight, minHeight), maxHeight);
        
        this.widget.style.setProperty('--expanded-height', `${expandedHeight}px`);
    }
    
    addMessage(text, sender) {
        const newMessage = {
            id: Date.now().toString(),
            text: text,
            sender: sender,
            timestamp: new Date()
        };
        
        this.messages.push(newMessage);
        this.renderMessages();
        this.updateLatestMessage();
        this.updateExpandedHeight();
        
        // Scroll to bottom
        this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }
    
    renderMessages() {
        this.messagesContainer.innerHTML = '';
        
        this.messages.forEach(message => {
            const messageElement = document.createElement('div');
            messageElement.className = `message ${message.sender}-message`;
            messageElement.textContent = message.text;
            this.messagesContainer.appendChild(messageElement);
        });
    }
    
    updateLatestMessage() {
        const latestAgentMessage = this.messages
            .filter(m => m.sender === 'agent')
            .slice(-1)[0];
            
        if (latestAgentMessage) {
            this.latestMessage.textContent = latestAgentMessage.text;
        }
    }
}

// Initialize the widget when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new AgentWidget();
});