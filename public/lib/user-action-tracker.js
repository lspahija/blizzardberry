(function() {
  // Configuration: Replace with your logging endpoint or storage mechanism
  const LOG_ENDPOINT = 'https://your-server.com/log'; // Update with your actual endpoint
  const logs = []; // Local storage for logs if no endpoint is used
  let isUserAction = false; // Track when we're in a user-initiated action

  // Helper to send logs (or store locally)
  function sendLog(data) {
    // Option 1: Store locally (for debugging or if no endpoint)
    logs.push(data);
    console.log('Log:', data);

    // Option 2: Send to remote endpoint (uncomment to enable)
    /*
    fetch(LOG_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      keepalive: true
    }).catch(err => console.error('Log send failed:', err));
    */
  }

  // 1. Track User Actions and Enable Logging During Them
  function traceUserActions() {
    // Track clicks and enable logging during the click handler execution
    document.addEventListener('click', function(event) {
      isUserAction = true;
      const logData = {
        type: 'user_action',
        action: 'click',
        target: event.target?.tagName || 'unknown',
        targetId: event.target?.id || null,
        targetClass: event.target?.className || null,
        text: event.target?.textContent?.slice(0, 50) || null,
        timestamp: Date.now()
      };
      sendLog(logData);
      
      // Reset flag after a short delay to capture subsequent calls
      setTimeout(() => { isUserAction = false; }, 100);
    }, true);

    // Track form submissions
    document.addEventListener('submit', function(event) {
      isUserAction = true;
      const logData = {
        type: 'user_action',
        action: 'submit',
        target: event.target?.tagName || 'unknown',
        targetId: event.target?.id || null,
        action: event.target?.action || null,
        timestamp: Date.now()
      };
      sendLog(logData);
      
      setTimeout(() => { isUserAction = false; }, 100);
    }, true);

    // Track other key user interactions
    ['keydown', 'input', 'change'].forEach(eventType => {
      document.addEventListener(eventType, function(event) {
        // Only track if it's a meaningful interaction
        if (eventType === 'keydown' && !['Enter', ' '].includes(event.key)) return;
        
        isUserAction = true;
        const logData = {
          type: 'user_action',
          action: eventType,
          target: event.target?.tagName || 'unknown',
          targetId: event.target?.id || null,
          key: event.key || null,
          timestamp: Date.now()
        };
        sendLog(logData);
        
        setTimeout(() => { isUserAction = false; }, 100);
      }, true);
    });
  }

  // 2. Trace Network Calls (fetch) - Only During User Actions
  const originalFetch = window.fetch;
  window.fetch = function (...args) {
    const [url, options = {}] = args;
    
    // Only log if this is triggered by a user action
    if (isUserAction) {
      const logData = {
        type: 'network_call',
        method: options.method || 'GET',
        url: url.toString(),
        headers: options.headers ? JSON.stringify(options.headers) : '{}',
        body: options.body ? options.body.toString().slice(0, 500) : null,
        timestamp: Date.now()
      };
      sendLog(logData);
    }
    
    return originalFetch.apply(this, args).then(response => {
      if (isUserAction) {
        sendLog({
          type: 'network_response',
          url: url.toString(),
          status: response.status,
          timestamp: Date.now()
        });
      }
      return response;
    }).catch(err => {
      if (isUserAction) {
        sendLog({
          type: 'network_error',
          url: url.toString(),
          error: err.message,
          timestamp: Date.now()
        });
      }
      throw err;
    });
  };

  // 3. Trace Network Calls (XMLHttpRequest) - Only During User Actions
  const OriginalXMLHttpRequest = window.XMLHttpRequest;
  window.XMLHttpRequest = function () {
    const xhr = new OriginalXMLHttpRequest();
    const open = xhr.open;
    let requestDetails = {};
    let wasUserAction = false;

    xhr.open = function (method, url, ...rest) {
      wasUserAction = isUserAction; // Capture the flag at open time
      requestDetails = {
        type: 'network_call',
        method,
        url: url.toString(),
        timestamp: Date.now()
      };
      return open.apply(this, [method, url, ...rest]);
    };

    xhr.setRequestHeader = function (header, value) {
      requestDetails.headers = requestDetails.headers || {};
      requestDetails.headers[header] = value;
      return OriginalXMLHttpRequest.prototype.setRequestHeader.apply(this, [header, value]);
    };

    xhr.send = function (body) {
      if (wasUserAction) {
        requestDetails.body = body ? body.toString().slice(0, 500) : null;
        requestDetails.headers = JSON.stringify(requestDetails.headers || {});
        sendLog(requestDetails);
        
        xhr.addEventListener('load', () => {
          sendLog({
            type: 'network_response',
            url: requestDetails.url,
            status: xhr.status,
            timestamp: Date.now()
          });
        });
        
        xhr.addEventListener('error', () => {
          sendLog({
            type: 'network_error',
            url: requestDetails.url,
            error: 'XMLHttpRequest failed',
            timestamp: Date.now()
          });
        });
      }
      return OriginalXMLHttpRequest.prototype.send.apply(this, [body]);
    };

    return xhr;
  };

  // Initialize tracing
  try {
    traceUserActions();
    sendLog({ type: 'init', message: 'User action tracing started', timestamp: Date.now() });
    console.log('🔍 BlizzardBerry Tracing: Started. Only logs during user actions. Use window.__getLogs() to view captured events.');
  } catch (e) {
    sendLog({ type: 'error', message: 'Tracing setup failed: ' + e.message, timestamp: Date.now() });
    console.error('🔍 BlizzardBerry Tracing: Setup failed:', e);
  }

  // Expose logs for debugging (optional)
  window.__getLogs = () => logs;
  window.__clearLogs = () => { logs.length = 0; console.log('🔍 Logs cleared'); };
})();