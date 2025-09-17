// Simple logging utility for the widget
class WidgetLogger {
  constructor() {
    this.endpoint = '/api/logs'
    this.sessionId = this.generateSessionId()
    this.userId = null
    
    // Capture unhandled errors
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

    // Capture unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.error('Widget Unhandled Promise Rejection', {
        error: event.reason instanceof Error ? event.reason : new Error(String(event.reason)),
      })
    })
  }

  generateSessionId() {
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
      // Fallback to console if network fails
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

// Create global logger instance
const widgetLogger = new WidgetLogger()

// Helper function to wrap widget functions with error logging
function withWidgetErrorLogging(fn, component, action) {
  return function(...args) {
    try {
      const result = fn.apply(this, args)
      
      // If the result is a promise, catch any rejections
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

// Export for use in other widget files
window.widgetLogger = widgetLogger
window.withWidgetErrorLogging = withWidgetErrorLogging