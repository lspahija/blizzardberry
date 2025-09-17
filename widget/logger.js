class WidgetLogger {
  constructor() {
    this.endpoint = '/api/logs'
    this.sessionId = this.generateSessionId()
    this.userId = null
    
    window.addEventListener('error', (event) => {
      this.error('Widget Unhandled Error', {
        error: event.error || new Error(event.message),
        context: {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
        },
      })
    })

    window.addEventListener('unhandledrejection', (event) => {
      this.error('Widget Unhandled Promise Rejection', {
        error: event.reason instanceof Error ? event.reason : new Error(String(event.reason)),
      })
    })
  }

  generateSessionId() {
    // Try to get session ID from parent window or sessionStorage
    try {
      if (window.parent && window.parent.sessionStorage) {
        const parentSessionId = window.parent.sessionStorage.getItem('client_session_id')
        if (parentSessionId) return parentSessionId
      }
      
      if (sessionStorage) {
        const existing = sessionStorage.getItem('widget_session_id')
        if (existing) return existing
        
        const newSessionId = `widget_session_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`
        sessionStorage.setItem('widget_session_id', newSessionId)
        return newSessionId
      }
    } catch (error) {
      // Fallback if cross-origin restrictions prevent access
    }
    
    return `widget_session_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`
  }

  setUserId(userId) {
    this.userId = userId
  }

  async sendLog(entry) {
    try {
      await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(entry),
      })
    } catch (error) {
      console.error('Widget: Failed to send log to server:', error)
      console.log('Widget: Original log entry:', entry)
    }
  }

  createLogEntry(level, message, options = {}) {
    return {
      level,
      message,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      userId: this.userId,
      sessionId: this.sessionId,
      component: options.component || 'widget',
      action: options.action,
      ...(options.error && {
        error: {
          type: options.error.name,
          message: options.error.message,
          stack: options.error.stack,
        },
      }),
      context: options.context,
    }
  }

  error(message, options = {}) {
    const entry = this.createLogEntry('error', message, options)
    this.sendLog(entry)
    console.error('Widget Error:', message, options)
  }

  warn(message, options = {}) {
    const entry = this.createLogEntry('warn', message, options)
    this.sendLog(entry)
    console.warn('Widget Warning:', message, options)
  }

  info(message, options = {}) {
    const entry = this.createLogEntry('info', message, options)
    this.sendLog(entry)
    console.info('Widget Info:', message, options)
  }

  debug(message, options = {}) {
    const entry = this.createLogEntry('debug', message, options)
    this.sendLog(entry)
    console.debug('Widget Debug:', message, options)
  }
}

const widgetLogger = new WidgetLogger()

function withWidgetErrorLogging(fn, component, action) {
  return function(...args) {
    try {
      const result = fn.apply(this, args)
      
      if (result && typeof result.then === 'function') {
        result.catch(error => {
          widgetLogger.error(`Async error in ${component} ${action}`, {
            error: error instanceof Error ? error : new Error(String(error)),
            component,
            action,
            context: { args },
          })
          throw error
        })
      }
      
      return result
    } catch (error) {
      widgetLogger.error(`Error in ${component} ${action}`, {
        error: error instanceof Error ? error : new Error(String(error)),
        component,
        action,
        context: { args },
      })
      throw error
    }
  }
}

window.widgetLogger = widgetLogger
window.withWidgetErrorLogging = withWidgetErrorLogging