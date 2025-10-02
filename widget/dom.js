import { generateId, getElementById, createElement } from './util';
import { state, getSuggestedPrompts } from './state';
import { fetchSuggestedPrompts, fetchAgentDetails } from './api';
import { updateConversationUI } from './ui';
import { handleSubmit, hydrateConversation } from './conversation';
import { config } from './config';

// Widget expand/collapse functions
export function expandWidget() {
  const widget = getElementById('chatWidget');
  const collapsedView = widget?.querySelector('#collapsed-view');
  const expandedView = widget?.querySelector('#expanded-view');

  if (widget && collapsedView && expandedView) {
    // Get current position and dimensions before expansion
    const rect = widget.getBoundingClientRect();
    const currentLeft = rect.left;
    const currentTop = rect.top;
    const currentWidth = rect.width;
    const currentHeight = rect.height;

    // Set dynamic height based on messages
    const messageCount = state.messages.length;
    const baseHeight = 200;
    const messageHeight = 50;
    const maxHeight = 500;
    const minHeight = 300;

    const contentHeight = baseHeight + messageCount * messageHeight;
    const expandedHeight = Math.min(
      Math.max(contentHeight, minHeight),
      maxHeight
    );

    widget.style.setProperty('--expanded-height', `${expandedHeight}px`);

    // Expand the widget
    widget.classList.add('expanded');
    collapsedView.style.display = 'none';
    expandedView.style.display = 'flex';

    // Calculate position adjustment to keep the widget in a similar visual position
    // We want to maintain the bottom-right corner position when expanding
    const expandedWidth = 400; // from CSS
    const widthDiff = expandedWidth - currentWidth;
    const heightDiff = expandedHeight - currentHeight;

    // Adjust position to maintain bottom-right reference point
    let newLeft = currentLeft - widthDiff;
    let newTop = currentTop - heightDiff;

    // Apply relaxed boundary constraints for the expanded widget
    // Allow widget to go off-screen but keep minimum draggable area visible
    const minVisibleWidth = Math.min(100, expandedWidth);
    const minVisibleHeight = Math.min(50, expandedHeight);

    const minX = -expandedWidth + minVisibleWidth;
    const maxX = window.innerWidth - minVisibleWidth;
    const minY = -expandedHeight + minVisibleHeight;
    const maxY = window.innerHeight - minVisibleHeight;

    newLeft = Math.max(minX, Math.min(newLeft, maxX));
    newTop = Math.max(minY, Math.min(newTop, maxY));

    // Only adjust position if widget has been moved from default position
    if (widget.style.left !== '' || widget.style.top !== '') {
      widget.style.left = newLeft + 'px';
      widget.style.top = newTop + 'px';
      widget.style.right = 'auto';
      widget.style.bottom = 'auto';
    }

    // Focus input field after expansion
    setTimeout(() => getElementById('chatWidgetInputField')?.focus(), 100);
  }
}

export function collapseWidget() {
  const widget = getElementById('chatWidget');
  const collapsedView = widget?.querySelector('#collapsed-view');
  const expandedView = widget?.querySelector('#expanded-view');

  if (widget && collapsedView && expandedView) {
    // Get current position and dimensions before collapsing
    const rect = widget.getBoundingClientRect();
    const currentLeft = rect.left;
    const currentTop = rect.top;
    const currentWidth = rect.width;
    const currentHeight = rect.height;

    // Collapse the widget
    widget.classList.remove('expanded');
    collapsedView.style.display = 'block';
    expandedView.style.display = 'none';

    // Calculate position adjustment to maintain bottom-right reference point
    const collapsedWidth = window.innerWidth <= 768 ? 200 : 250; // from CSS
    const collapsedHeight = window.innerWidth <= 768 ? 100 : 120; // from CSS
    const widthDiff = currentWidth - collapsedWidth;
    const heightDiff = currentHeight - collapsedHeight;

    // Adjust position to maintain bottom-right reference point
    let newLeft = currentLeft + widthDiff;
    let newTop = currentTop + heightDiff;

    // Apply relaxed boundary constraints for the collapsed widget
    // Allow widget to go off-screen but keep minimum draggable area visible
    const minVisibleWidth = Math.min(100, collapsedWidth);
    const minVisibleHeight = Math.min(50, collapsedHeight);

    const minX = -collapsedWidth + minVisibleWidth;
    const maxX = window.innerWidth - minVisibleWidth;
    const minY = -collapsedHeight + minVisibleHeight;
    const maxY = window.innerHeight - minVisibleHeight;

    newLeft = Math.max(minX, Math.min(newLeft, maxX));
    newTop = Math.max(minY, Math.min(newTop, maxY));

    // Only adjust position if widget has been moved from default position
    if (widget.style.left !== '' || widget.style.top !== '') {
      widget.style.left = newLeft + 'px';
      widget.style.top = newTop + 'px';
      widget.style.right = 'auto';
      widget.style.bottom = 'auto';
    }
  }
}

function syncWidgetState() {
  const widget = document.getElementById('chatWidget');
  const isWidgetCurrentlyOpen = widget && !widget.classList.contains('hidden');
  state.widgetIsOpen = isWidgetCurrentlyOpen;
  return isWidgetCurrentlyOpen;
}

export async function createWidgetDOM() {
  try {
    // Fetch agent details to get the name
    const agentDetails = await fetchAgentDetails();
    const agentName = agentDetails?.name || 'AI Agent';

    // Try to hydrate existing conversation first
    const conversationHydrated = await hydrateConversation();

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
              ${conversationHydrated ? '' : `Hi! I'm ${agentName}. How can I help you today?`}
            </div>
          </div>
          <div id="expanded-view" class="expanded-view" style="display: none;">
            <div id="messages-container" class="messages-container">
              ${conversationHydrated ? '' : `<div class="message assistant-message">Hi! I'm ${agentName}. How can I help you today?</div>`}
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
    widget
      .querySelector('#chatWidgetSendButton')
      ?.addEventListener('click', handleSubmit);

    // Add drag functionality
    let isDragging = false;
    let dragStartX = 0;
    let dragStartY = 0;
    let widgetStartX = 0;
    let widgetStartY = 0;
    let hasMoved = false;

    widget.addEventListener('mousedown', (e) => {
      // Don't drag if clicking on input field or send button
      if (e.target.closest('.message-input, .send-button')) return;

      isDragging = true;
      hasMoved = false;
      dragStartX = e.clientX;
      dragStartY = e.clientY;

      // Get current position
      const rect = widget.getBoundingClientRect();
      widgetStartX = rect.left;
      widgetStartY = rect.top;

      widget.style.transition = 'none'; // Disable transition during drag
      widget.style.cursor = 'grabbing';

      e.preventDefault();
    });

    document.addEventListener('mousemove', (e) => {
      if (!isDragging) return;

      const deltaX = e.clientX - dragStartX;
      const deltaY = e.clientY - dragStartY;

      // Mark as moved if dragged more than 5px
      if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
        hasMoved = true;
      }

      // Get current widget dimensions
      const rect = widget.getBoundingClientRect();
      const currentWidth = rect.width;
      const currentHeight = rect.height;

      // Calculate new position from current top-left
      const newX = widgetStartX + deltaX;
      const newY = widgetStartY + deltaY;

      // Apply relaxed boundary constraints - allow widget to go off-screen
      // but keep at least 100px of draggable area visible
      const minVisibleWidth = Math.min(100, currentWidth);
      const minVisibleHeight = Math.min(50, currentHeight);

      const minX = -currentWidth + minVisibleWidth;
      const maxX = window.innerWidth - minVisibleWidth;
      const minY = -currentHeight + minVisibleHeight;
      const maxY = window.innerHeight - minVisibleHeight;

      const boundedX = Math.max(minX, Math.min(newX, maxX));
      const boundedY = Math.max(minY, Math.min(newY, maxY));

      widget.style.left = boundedX + 'px';
      widget.style.top = boundedY + 'px';
      widget.style.right = 'auto';
      widget.style.bottom = 'auto';
    });

    document.addEventListener('mouseup', () => {
      if (isDragging) {
        isDragging = false;
        widget.style.transition = 'all 0.3s ease'; // Re-enable transition
        widget.style.cursor = 'pointer';
      }
    });

    // Add click listener to widget to expand when clicked (only if not dragged)
    widget.addEventListener('click', (e) => {
      e.stopPropagation();
      if (!hasMoved && !widget.classList.contains('expanded')) {
        expandWidget();
      }
      hasMoved = false; // Reset for next interaction
    });

    // Add touch event listeners for drag support on mobile
    let touchStartTime = 0;
    let touchStartX = 0;
    let touchStartY = 0;
    let isTouchDragging = false;
    let touchWidgetStartX = 0;
    let touchWidgetStartY = 0;
    let touchHasMoved = false;

    widget.addEventListener(
      'touchstart',
      (e) => {
        // Don't drag if touching input field or send button
        if (e.target.closest('.message-input, .send-button')) return;

        // On mobile, only allow dragging when widget is collapsed
        const isMobile = window.innerWidth <= 768;
        const isExpanded = widget.classList.contains('expanded');

        if (isMobile && isExpanded) {
          // Don't prevent default - allow normal scrolling in expanded chat
          return;
        }

        // Always prevent page scrolling when touching the widget (except expanded mobile)
        e.preventDefault();

        touchStartTime = Date.now();
        const touch = e.touches[0];
        touchStartX = touch.clientX;
        touchStartY = touch.clientY;
        touchHasMoved = false;

        // Set up drag state
        isTouchDragging = true;
        const rect = widget.getBoundingClientRect();
        touchWidgetStartX = rect.left;
        touchWidgetStartY = rect.top;

        widget.style.transition = 'none';
      },
      { passive: false }
    );

    widget.addEventListener(
      'touchmove',
      (e) => {
        if (!isTouchDragging) return;

        // On mobile, only allow dragging when widget is collapsed
        const isMobile = window.innerWidth <= 768;
        const isExpanded = widget.classList.contains('expanded');

        if (isMobile && isExpanded) {
          // Don't prevent default - allow normal scrolling in expanded chat
          return;
        }

        // Always prevent page scrolling when touching the widget (except expanded mobile)
        e.preventDefault();

        const touch = e.touches[0];
        const deltaX = touch.clientX - touchStartX;
        const deltaY = touch.clientY - touchStartY;

        // Mark as moved if dragged more than 10px (larger threshold for touch)
        if (Math.abs(deltaX) > 10 || Math.abs(deltaY) > 10) {
          touchHasMoved = true;
        }

        if (touchHasMoved) {
          const newX = touchWidgetStartX + deltaX;
          const newY = touchWidgetStartY + deltaY;

          // Get current widget dimensions for accurate boundary calculations
          const rect = widget.getBoundingClientRect();
          const currentWidth = rect.width;
          const currentHeight = rect.height;

          // Apply relaxed boundary constraints - allow widget to go off-screen
          // but keep at least 100px of draggable area visible (or 80px on mobile)
          const minVisibleWidth = Math.min(
            window.innerWidth <= 768 ? 80 : 100,
            currentWidth
          );
          const minVisibleHeight = Math.min(50, currentHeight);

          const minX = -currentWidth + minVisibleWidth;
          const maxX = window.innerWidth - minVisibleWidth;
          const minY = -currentHeight + minVisibleHeight;
          const maxY = window.innerHeight - minVisibleHeight;

          const boundedX = Math.max(minX, Math.min(newX, maxX));
          const boundedY = Math.max(minY, Math.min(newY, maxY));

          widget.style.left = boundedX + 'px';
          widget.style.top = boundedY + 'px';
          widget.style.right = 'auto';
          widget.style.bottom = 'auto';
        }
      },
      { passive: false }
    );

    widget.addEventListener('touchend', (e) => {
      // Don't prevent default if the touch target is an input field
      const target = e.target || e.changedTouches[0];
      const isInputElement =
        target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA');

      if (!isInputElement && !touchHasMoved) {
        e.preventDefault();
        e.stopPropagation();
      }

      const touchEndTime = Date.now();
      const touchDuration = touchEndTime - touchStartTime;

      // Only trigger expand if it's a quick tap and widget wasn't dragged
      if (
        touchDuration < 300 &&
        !touchHasMoved &&
        !widget.classList.contains('expanded') &&
        !isInputElement
      ) {
        expandWidget();
      }

      // Reset drag state
      isTouchDragging = false;
      widget.style.transition = 'all 0.3s ease';
      touchHasMoved = false;
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
      const isClickOnToggle = e.target.closest(
        '#chatWidgetToggle, #chatWidgetToggleContainer'
      );

      if (
        !isClickInsideWidget &&
        !isClickOnToggle &&
        widget.classList.contains('expanded')
      ) {
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
      inputField.addEventListener(
        'touchstart',
        (e) => {
          e.stopPropagation(); // Prevent widget touch handlers from interfering
        },
        { passive: true }
      );

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

    // Only add default greeting if no conversation was hydrated
    if (!conversationHydrated) {
      state.messages.push({
        id: generateId(),
        role: 'assistant',
        parts: [
          {
            type: 'text',
            text: `Hi! I'm ${agentName}, here to help with any questions or tasks. Just let me know what you need!`,
          },
        ],
      });
    }

    // No toggle button needed - widget stays as widget in all states

    state.widgetIsReady = true;
    state.widgetIsOpen = true; // Widget is open by default now

    // Widget is open by default, so clear any notifications and show chat UI
    state.unreadMessages = 0;
    updateConversationUI();
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
    if (realWidget && state.widgetIsReady) {
      loadingWidget.remove();
      realWidget.classList.remove('hidden');
      updateConversationUI();
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

  if (state.unreadMessages > 0 && !state.widgetIsOpen) {
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
