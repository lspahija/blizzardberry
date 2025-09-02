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
        <!-- Solid Background -->
        <div class="solid-background"></div>
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
                autocomplete="off"
                autocorrect="on"
                autocapitalize="sentences"
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

    // Add touch event listeners for better mobile support
    let touchStartTime = 0;
    let touchStartX = 0;
    let touchStartY = 0;

    widget.addEventListener('touchstart', (e) => {
      touchStartTime = Date.now();
      const touch = e.touches[0];
      touchStartX = touch.clientX;
      touchStartY = touch.clientY;
    }, { passive: true });

    widget.addEventListener('touchend', (e) => {
      // Don't prevent default if the touch target is an input field
      const target = e.target || e.changedTouches[0];
      const isInputElement = target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA');
      
      if (!isInputElement) {
        e.preventDefault();
        e.stopPropagation();
      }
      
      const touchEndTime = Date.now();
      const touchDuration = touchEndTime - touchStartTime;
      
      // Only trigger if it's a quick tap (less than 300ms) and not a long press
      // and not touching an input element
      if (touchDuration < 300 && !widget.classList.contains('expanded') && !isInputElement) {
        const touch = e.changedTouches[0];
        const touchEndX = touch.clientX;
        const touchEndY = touch.clientY;
        
        // Check if touch didn't move much (less than 10px in any direction)
        const moveDistance = Math.sqrt(
          Math.pow(touchEndX - touchStartX, 2) + Math.pow(touchEndY - touchStartY, 2)
        );
        
        if (moveDistance < 10) {
          expandWidget();
        }
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

    // Add click outside to collapse functionality (don't hide the widget)
    document.addEventListener('click', (e) => {
      const isClickInsideWidget = widget.contains(e.target);
      const isClickOnToggle = e.target.closest('#chatWidgetToggle, #chatWidgetToggleContainer');
      
      if (!isClickInsideWidget && !isClickOnToggle && widget.classList.contains('expanded')) {
        collapseWidget();
        // Don't hide the widget, just keep it collapsed
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

    // Add specific touch handling for input field to ensure mobile keyboard appears
    if (inputField) {
      inputField.addEventListener('touchstart', (e) => {
        e.stopPropagation(); // Prevent widget touch handlers from interfering
      }, { passive: true });
      
      inputField.addEventListener('touchend', (e) => {
        e.stopPropagation(); // Prevent widget touch handlers from interfering
        // Allow default behavior for focusing the input
      });
      
      // Ensure input field can be focused on mobile
      inputField.addEventListener('click', (e) => {
        e.stopPropagation();
        inputField.focus();
      });
    }


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

    // No toggle button needed - widget stays as widget in all states

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

  if (!widget) {
    createLoadingWidget();
    return;
  }

  // Simply toggle between expanded and collapsed states
  if (widget.classList.contains('expanded')) {
    // If expanded, collapse it
    collapseWidget();
  } else {
    // If collapsed, expand it
    expandWidget();
  }
}

export function createLoadingWidget() {
  if (getElementById('chatWidgetLoading')) {
    return;
  }

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
