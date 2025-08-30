import {
  generateId,
  truncatePrompt,
  getElementById,
  createElement,
} from './util';
import { state, getSuggestedPrompts } from './state';
import { fetchSuggestedPrompts } from './api';
import { updateChatUI } from './ui';
import { handleSubmit, processChatMessage } from './chat';
import { config } from './config';

// Widget expand/collapse functions
export function expandWidget() {
  const widget = getElementById('chatWidget');
  const collapsedView = widget?.querySelector('#collapsed-view');
  const expandedView = widget?.querySelector('#expanded-view');
  
  if (widget && collapsedView && expandedView) {
    widget.classList.add('expanded');
    collapsedView.style.display = 'none';
    expandedView.style.display = 'flex';
    
    // Set dynamic height based on messages
    const messageCount = state.messages.length;
    const baseHeight = 200;
    const messageHeight = 50;
    const maxHeight = 500;
    const minHeight = 300;
    
    const contentHeight = baseHeight + messageCount * messageHeight;
    const expandedHeight = Math.min(Math.max(contentHeight, minHeight), maxHeight);
    
    widget.style.setProperty('--expanded-height', `${expandedHeight}px`);
    
    // Focus input field after expansion
    setTimeout(() => getElementById('chatWidgetInputField')?.focus(), 100);
  }
}

export function collapseWidget() {
  const widget = getElementById('chatWidget');
  const collapsedView = widget?.querySelector('#collapsed-view');
  const expandedView = widget?.querySelector('#expanded-view');
  
  if (widget && collapsedView && expandedView) {
    widget.classList.remove('expanded');
    collapsedView.style.display = 'block';
    expandedView.style.display = 'none';
  }
}

function syncWidgetState() {
  const widget = document.getElementById('chatWidget');
  const isWidgetCurrentlyOpen = widget && !widget.classList.contains('hidden');
  state.isWidgetOpen = isWidgetCurrentlyOpen;
  return isWidgetCurrentlyOpen;
}

export async function createWidgetDOM() {
  try {
    // Create message preview notification
    const messagePreview = document.createElement('div');
    messagePreview.id = 'messagePreviewNotification';
    messagePreview.style.cssText = `
      position: fixed !important;
      bottom: 90px !important;
      right: 20px !important;
      max-width: 350px !important;
      min-width: 200px !important;
      background: white !important;
      border: 1px solid #e2e8f0 !important;
      border-radius: 12px !important;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15) !important;
      display: none !important;
      padding: 12px 16px !important;
      font-size: 14px !important;
      line-height: 1.4 !important;
      color: #333 !important;
      z-index: 10001 !important;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif !important;
      cursor: pointer !important;
      animation: slideUp 0.3s ease !important;
    `;

    // Add click handler to open widget when message preview is clicked
    messagePreview.addEventListener('click', () => {
      const widget = getElementById('chatWidget');
      if (widget && widget.classList.contains('hidden')) {
        toggleChatWidget();
      }
    });

    document.body.appendChild(messagePreview);

    const widget = createElement('div', {
      id: 'chatWidget',
      className: '',
      innerHTML: `
        <!-- Blurred Mist Background -->
        <div class="mist-background">
          <!-- First gradient layer -->
          <div class="gradient-layer-1"></div>
          <!-- Second gradient layer for more flow -->
          <div class="gradient-layer-2"></div>
          <!-- Shimmering slivers -->
          <div class="shimmer-layer"></div>
        </div>

        <!-- Sharp Text Overlay -->
        <div id="text-overlay" class="text-overlay">
          <div id="collapsed-view" class="collapsed-view">
            <div class="text-content" id="latest-message">
              Hi! I'm your AI Agent. How can I help you today?
            </div>
          </div>
          <div id="expanded-view" class="expanded-view" style="display: none;">
            <div id="messages-container" class="messages-container">
              <div class="message assistant-message">
                Hi! I'm your AI Agent. How can I help you today?
              </div>
            </div>
            <div class="input-container">
              <input 
                type="text" 
                id="chatWidgetInputField"
                placeholder="Type a message..."
                class="message-input"
              />
              <button id="chatWidgetSendButton" class="send-button">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="m3 3 3 9-3 9 19-9Z"/>
                  <path d="m6 12 16 0"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      `,
    });

    // Add event listeners for the send button
    widget.querySelector('#chatWidgetSendButton')
      ?.addEventListener('click', handleSubmit);
    
    // Add click listener to widget to expand when clicked
    widget.addEventListener('click', (e) => {
      e.stopPropagation();
      if (!widget.classList.contains('expanded')) {
        expandWidget();
      }
    });

    // Add hover listeners for expand/collapse behavior
    widget.addEventListener('mouseenter', () => {
      if (!widget.classList.contains('hidden')) {
        expandWidget();
      }
    });

    widget.addEventListener('mouseleave', () => {
      if (!widget.classList.contains('hidden')) {
        collapseWidget();
      }
    });

    // Add click outside to close functionality
    document.addEventListener('click', (e) => {
      const isClickInsideWidget = widget.contains(e.target);
      const isClickOnToggle = e.target.closest('#chatWidgetToggle, #chatWidgetToggleContainer');
      
      if (!isClickInsideWidget && !isClickOnToggle && widget.classList.contains('expanded')) {
        collapseWidget();
        setTimeout(() => {
          widget.classList.add('hidden');
          const toggleContainer = getElementById('chatWidgetToggleContainer');
          if (toggleContainer) {
            toggleContainer.classList.remove('hidden');
            state.isWidgetOpen = false;
          }
        }, 300);
      }
    });

    await fetchSuggestedPrompts();

    // Add event listener for input field
    const inputField = widget.querySelector('#chatWidgetInputField');
    inputField?.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
      }
    });

    // Add suggested prompts if available (keep for backward compatibility but won't be visible in collapsed state)
    const suggestedPrompts = getSuggestedPrompts();

    document.body.appendChild(widget);

    state.messages.push({
      id: generateId(config.agentId),
      role: 'assistant',
      parts: [
        {
          type: 'text',
          text: "Hi! I'm your AI Agent, here to help with any questions or tasks. Just let me know what you need!",
        },
      ],
    });

    // Create toggle button AFTER main widget exists (initially hidden since widget is shown)
    const toggleContainer = createElement('div', {
      id: 'chatWidgetToggleContainer',
      className: 'hidden',
      style: `
        position: fixed;
        bottom: 20px;
        right: 20px;
        z-index: 1001;
      `,
    });

    const toggle = createElement('div', {
      id: 'chatWidgetToggle',
      style: `
        width: 60px;
        height: 60px;
        border-radius: 30px;
        background: black;
        color: #ffffff;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
        font-size: 24px;
        transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
      `,
      innerHTML: `<svg width="32" height="32" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
<path d="M7.5 8.25H16.5M7.5 11.25H12M2.25 12.7593C2.25 14.3604 3.37341 15.754 4.95746 15.987C6.08596 16.1529 7.22724 16.2796 8.37985 16.3655C8.73004 16.3916 9.05017 16.5753 9.24496 16.8674L12 21L14.755 16.8675C14.9498 16.5753 15.2699 16.3917 15.6201 16.3656C16.7727 16.2796 17.914 16.153 19.0425 15.9871C20.6266 15.7542 21.75 14.3606 21.75 12.7595V6.74056C21.75 5.13946 20.6266 3.74583 19.0425 3.51293C16.744 3.17501 14.3926 3 12.0003 3C9.60776 3 7.25612 3.17504 4.95747 3.51302C3.37342 3.74593 2.25 5.13956 2.25 6.74064V12.7593Z" stroke="black" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`,
    });

    toggleContainer.appendChild(toggle);
    toggle.addEventListener('click', toggleChatWidget);
    document.body.appendChild(toggleContainer);

    state.isWidgetReady = true;
    state.isWidgetOpen = true; // Widget is open by default now

    // Widget is open by default, so clear any notifications and show chat UI
    state.unreadMessages = 0;
    updateChatUI();
    updateNotificationBadge();
  } catch (error) {
    console.error('Error creating widget DOM:', error);
  }
}

export function toggleChatWidget() {
  const widget = getElementById('chatWidget');
  const toggleContainer = getElementById('chatWidgetToggleContainer');

  if (!widget) {
    createLoadingWidget();
    return;
  }

  if (!toggleContainer) return;

  const isHidden = widget.classList.contains('hidden');
  
  if (isHidden) {
    // Show widget in collapsed state
    widget.classList.remove('hidden');
    toggleContainer.classList.add('hidden');
    collapseWidget();
    state.isWidgetOpen = true;
    
    // Clear notifications when widget is opened
    state.unreadMessages = 0;
    updateNotificationBadge();
    updateChatUI();
  } else if (widget.classList.contains('expanded')) {
    // If expanded, first collapse, then hide after a delay
    collapseWidget();
    setTimeout(() => {
      widget.classList.add('hidden');
      toggleContainer.classList.remove('hidden');
      state.isWidgetOpen = false;
    }, 300); // Wait for collapse animation
  } else {
    // If collapsed, hide immediately
    widget.classList.add('hidden');
    toggleContainer.classList.remove('hidden');
    state.isWidgetOpen = false;
  }
}

export function createLoadingWidget() {
  if (getElementById('chatWidgetLoading')) {
    return;
  }

  const toggleContainer = getElementById('chatWidgetToggleContainer');
  if (!toggleContainer) return;

  toggleContainer.classList.add('hidden');

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
    `,
  });

  loadingWidget
    .querySelector('#chatWidgetLoadingCloseButton')
    .addEventListener('click', () => {
      loadingWidget.remove();
      toggleContainer.classList.remove('hidden');
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
      setTimeout(() => getElementById('chatWidgetInputField')?.focus(), 100);
    } else if (checkCount < maxChecks) {
      checkCount++;
      setTimeout(checkWidgetReady, 100);
    } else {
      console.error('Widget initialization timeout');
      loadingWidget.remove();
      toggleContainer.classList.remove('hidden');
    }
  };

  checkWidgetReady();
}

export function updateNotificationBadge() {
  const messagePreview = document.getElementById('messagePreviewNotification');
  if (!messagePreview) return;

  // Sync widget state in real-time
  syncWidgetState();

  if (state.unreadMessages > 0 && !state.isWidgetOpen) {
    // Get the latest assistant message
    const assistantMessages = state.messages.filter(
      (msg) => msg.role === 'assistant'
    );
    if (assistantMessages.length > 0) {
      const latestMessage = assistantMessages[assistantMessages.length - 1];
      const messageText = latestMessage.parts[0]?.text || 'New message';

      // Truncate long messages
      const truncatedText =
        messageText.length > 150
          ? messageText.substring(0, 150) + '...'
          : messageText;

      messagePreview.innerHTML = `
        <div>${truncatedText}</div>
        <button id="messagePreviewClose" style="
          position: absolute;
          top: -12px;
          right: -12px;
          background: #ffffff;
          border: 2px solid #e2e8f0;
          color: #666;
          cursor: pointer;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: all 0.2s ease;
          font-size: 18px;
          font-weight: bold;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
          z-index: 1;
        ">×</button>
      `;
      messagePreview.style.setProperty('display', 'block', 'important');

      // Add hover functionality to show/hide close button
      messagePreview.addEventListener('mouseenter', () => {
        const closeBtn = messagePreview.querySelector('#messagePreviewClose');
        if (closeBtn) {
          closeBtn.style.opacity = '1';
        }
      });

      messagePreview.addEventListener('mouseleave', () => {
        const closeBtn = messagePreview.querySelector('#messagePreviewClose');
        if (closeBtn) {
          closeBtn.style.opacity = '0';
        }
      });

      // Add click handler for close button
      const closeBtn = messagePreview.querySelector('#messagePreviewClose');
      if (closeBtn) {
        closeBtn.addEventListener('click', (e) => {
          e.stopPropagation(); // Prevent triggering the widget open
          state.unreadMessages = 0;
          updateNotificationBadge();
        });

        closeBtn.addEventListener('mouseenter', () => {
          closeBtn.style.background = '#6b7280';
          closeBtn.style.borderColor = '#4b5563';
          closeBtn.style.color = '#ffffff';
          closeBtn.style.transform = 'scale(1.1)';
        });

        closeBtn.addEventListener('mouseleave', () => {
          closeBtn.style.background = '#ffffff';
          closeBtn.style.borderColor = '#e2e8f0';
          closeBtn.style.color = '#666';
          closeBtn.style.transform = 'scale(1)';
        });
      }
    }
  } else {
    messagePreview.style.setProperty('display', 'none', 'important');
  }
}
