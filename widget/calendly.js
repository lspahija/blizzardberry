import { state } from './state';
import { persistMessage } from './api';
import { updateConversationUI } from './ui';

/**
 * Adds Calendly inline widget to the page (left of chat widget)
 * @param {Object} embedResult - Result from book_calendly_meeting tool
 */
export async function addCalendlyEmbedToMessage(embedResult) {
  if (!embedResult || embedResult.type !== 'calendly_embed') {
    console.warn('Invalid embed result:', embedResult);
    return;
  }

  const embedUrl = embedResult.embed_url;
  if (!embedUrl) {
    console.error('No embed_url in Calendly embed result:', embedResult);
    return;
  }

  // Generate unique ID for this widget instance
  const widgetId = `calendly-inline-widget-${Date.now()}`;
  
  // Load Calendly widget script and show inline widget
  loadCalendlyWidget();
  
  // Wait for script to load, then show inline widget
  setTimeout(() => {
    showCalendlyInlineWidget(embedUrl, widgetId);
  }, 1000);
}

/**
 * Loads Calendly widget script
 */
function loadCalendlyWidget() {
  // Check if Calendly script is already loaded
  if (window.Calendly) {
    return;
  }

  // Check if script is already in the DOM
  const existingScript = document.querySelector('script[src*="calendly.com"]');
  if (existingScript) {
    return;
  }

  // Load Calendly widget script
  const script = document.createElement('script');
  script.type = 'text/javascript';
  script.src = 'https://assets.calendly.com/assets/external/widget.js';
  script.async = true;
  document.head.appendChild(script);
}

/**
 * Shows Calendly inline widget on the page (left of chat widget)
 */
function showCalendlyInlineWidget(embedUrl, widgetId) {
  // Remove any existing Calendly widget
  const existingWidget = document.getElementById('calendly-inline-container');
  if (existingWidget) {
    existingWidget.remove();
  }
  
  // Wait for Calendly script to load if needed
  if (!window.Calendly) {
    setTimeout(() => {
      if (window.Calendly) {
        showCalendlyInlineWidget(embedUrl, widgetId);
      } else {
        loadCalendlyWidget();
        setTimeout(() => {
          if (window.Calendly) {
            showCalendlyInlineWidget(embedUrl, widgetId);
          }
        }, 1500);
      }
    }, 500);
    return;
  }

  // Initialize inline widget
  if (window.Calendly && window.Calendly.initInlineWidget) {
    try {
      // Detect mobile device
      const isMobile = window.innerWidth <= 768;
      
      // Get chat widget position
      const chatWidget = document.getElementById('chatWidget');
      const chatWidgetRect = chatWidget ? chatWidget.getBoundingClientRect() : null;
      
      // Calculate position based on device type
      let containerStyles;
      if (isMobile) {
        // Mobile: position above chat widget, full width with margins
        const mobileWidth = Math.min(window.innerWidth - 30, 400);
        containerStyles = `
          position: fixed;
          bottom: ${chatWidgetRect ? chatWidgetRect.height + 30 : 150}px;
          left: 50%;
          transform: translateX(-50%);
          width: ${mobileWidth}px;
          max-width: calc(100vw - 30px);
          height: ${Math.min(window.innerHeight * 0.7, 600)}px;
          max-height: calc(100vh - ${chatWidgetRect ? chatWidgetRect.height + 60 : 180}px);
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
          z-index: 999;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        `;
      } else {
        // Desktop: position left of chat widget
        containerStyles = `
          position: fixed;
          bottom: 20px;
          right: ${chatWidgetRect ? chatWidgetRect.width + 40 : 420}px;
          width: 400px;
          height: 700px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
          z-index: 999;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        `;
      }
      
      // Create container for Calendly widget
      const container = document.createElement('div');
      container.id = 'calendly-inline-container';
      container.style.cssText = containerStyles;
      
      // Add mobile-specific class for additional styling
      if (isMobile) {
        container.classList.add('calendly-mobile');
      }
      
      // Create header with close button
      const header = document.createElement('div');
      header.style.cssText = `
        padding: ${isMobile ? '12px 16px' : '16px'};
        border-bottom: 1px solid #e5e7eb;
        display: flex;
        justify-content: space-between;
        align-items: center;
        background: white;
        flex-shrink: 0;
      `;
      
      const title = document.createElement('h3');
      title.textContent = 'Choose a Time';
      title.style.cssText = `
        margin: 0;
        font-size: ${isMobile ? '16px' : '18px'};
        font-weight: 600;
        color: #111827;
      `;
      
      const closeButton = document.createElement('button');
      closeButton.innerHTML = '×';
      closeButton.style.cssText = `
        background: none;
        border: none;
        font-size: ${isMobile ? '24px' : '28px'};
        color: #6b7280;
        cursor: pointer;
        padding: 0;
        width: ${isMobile ? '28px' : '32px'};
        height: ${isMobile ? '28px' : '32px'};
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 4px;
        transition: background-color 0.2s;
        -webkit-tap-highlight-color: transparent;
        touch-action: manipulation;
      `;
      closeButton.onmouseover = () => closeButton.style.backgroundColor = '#f3f4f6';
      closeButton.onmouseout = () => closeButton.style.backgroundColor = 'transparent';
      closeButton.ontouchstart = () => closeButton.style.backgroundColor = '#f3f4f6';
      closeButton.ontouchend = () => {
        closeButton.style.backgroundColor = 'transparent';
        container.remove();
      };
      closeButton.onclick = () => {
        container.remove();
      };
      
      header.appendChild(title);
      header.appendChild(closeButton);
      
      // Create widget container
      const widgetContainer = document.createElement('div');
      widgetContainer.id = widgetId;
      widgetContainer.style.cssText = `
        flex: 1;
        min-height: 0;
        overflow: auto;
      `;
      
      container.appendChild(header);
      container.appendChild(widgetContainer);
      document.body.appendChild(container);
      
      window.Calendly.initInlineWidget({
        url: embedUrl,
        parentElement: widgetContainer,
      });
      
      // Listen for Calendly events
      const handleCalendlyEvent = (e) => {
        if (e.data && e.data.event && e.data.event.indexOf('calendly.') === 0) {
          // Check if this is a scheduled event (user successfully booked)
          if (e.data.event === 'calendly.event_scheduled' || 
              (e.data.event === 'calendly.profile_page_viewed' && e.data.payload?.event?.scheduled)) {
            // Only handle once
            if (!window.__calendlyBookingHandled) {
              window.__calendlyBookingHandled = true;
              handleCalendlyBookingSuccess(widgetId);
              // Remove listener after handling
              window.removeEventListener('message', handleCalendlyEvent);
            }
          }
        }
      };
      
      window.addEventListener('message', handleCalendlyEvent);
    } catch (error) {
      console.error('[Calendly] Error showing inline widget:', error);
    }
  } else {
    // Try waiting a bit more
    setTimeout(() => {
      if (window.Calendly && window.Calendly.initInlineWidget) {
        showCalendlyInlineWidget(embedUrl, widgetId);
      }
    }, 500);
  }
}

/**
 * Handles successful Calendly booking
 * Closes the inline widget and sends a confirmation message to the agent
 */
async function handleCalendlyBookingSuccess(widgetId) {
  // Close the inline widget
  const container = document.getElementById('calendly-inline-container');
  if (container) {
    container.style.transition = 'opacity 0.3s ease';
    container.style.opacity = '0';
    setTimeout(() => {
      container.remove();
    }, 300);
  }
  // Wait a moment for popup to close
  setTimeout(async () => {
    // Send a message to the agent to generate a confirmation message
    const { callLLM, persistMessage } = await import('./api');
    const { generateId } = await import('./util');
    const { updateConversationUI } = await import('./ui');
    
    // Add user message to state for context (but don't show it in UI)
    const hiddenUserMessage = {
      id: generateId(),
      role: 'user',
      parts: [{ type: 'text', text: '<hidden>The meeting has been successfully scheduled. Please confirm and ask if there is anything else I can help with.</hidden>' }],
      hidden: true,
    };
    state.messages.push(hiddenUserMessage);
    await persistMessage(hiddenUserMessage);
    
    // Call LLM to generate confirmation response
    try {
      state.isProcessing = true;
      const { text, error } = await callLLM();
      
      if (error) {
        console.error('Error generating confirmation message:', error);
        state.isProcessing = false;
        return;
      }
      
      // Add assistant confirmation message
      const confirmationMessage = {
        id: generateId(),
        role: 'assistant',
        parts: [{ type: 'text', text }],
      };
      state.messages.push(confirmationMessage);
      await persistMessage(confirmationMessage);
      
      state.isProcessing = false;
      updateConversationUI();
    } catch (error) {
      console.error('Error sending confirmation message to agent:', error);
      state.isProcessing = false;
    }
  }, 1000);
}

