export interface ClientLogEntry {
  level: 'error' | 'warn' | 'info' | 'debug'
  message: string
  timestamp: string
  url: string
  userAgent: string
  userId?: string
  sessionId?: string
  stack?: string
  component?: string
  action?: string
  error?: {
    type: string
    message: string
    stack?: string
  }
  context?: Record<string, any>
}

class ClientLogger {
  private userId?: string
  private sessionId?: string
  private endpoint: string

  constructor() {
    this.endpoint = '/api/logs'
    this.sessionId = this.generateSessionId()
    
    // Capture unhandled errors
    if (typeof window !== 'undefined') {
      window.addEventListener('error', (event) => {
        this.error('Unhandled error', {
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
        this.error('Unhandled promise rejection', {
          error: event.reason instanceof Error ? event.reason : new Error(String(event.reason)),
        })
      })
    }
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`
  }

  setUserId(userId: string) {
    this.userId = userId
  }

  private async sendLog(entry: ClientLogEntry) {
    try {
      await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(entry),
      })
    } catch (error) {
      console.error('Failed to send log to server:', error)
      console.log('Original log entry:', entry)
    }
  }

  private createLogEntry(
    level: ClientLogEntry['level'],
    message: string,
    options?: {
      error?: Error
      component?: string
      action?: string
      context?: Record<string, any>
    }
  ): ClientLogEntry {
    return {
      level,
      message,
      timestamp: new Date().toISOString(),
      url: typeof window !== 'undefined' ? window.location.href : '',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
      userId: this.userId,
      sessionId: this.sessionId,
      component: options?.component,
      action: options?.action,
      ...(options?.error && {
        error: {
          type: options.error.name,
          message: options.error.message,
          stack: options.error.stack,
        },
      }),
      context: options?.context,
    }
  }

  error(message: string, options?: Parameters<typeof this.createLogEntry>[2]) {
    const entry = this.createLogEntry('error', message, options)
    this.sendLog(entry)
    console.error(message, options)
  }

  warn(message: string, options?: Parameters<typeof this.createLogEntry>[2]) {
    const entry = this.createLogEntry('warn', message, options)
    this.sendLog(entry)
    console.warn(message, options)
  }

  info(message: string, options?: Parameters<typeof this.createLogEntry>[2]) {
    const entry = this.createLogEntry('info', message, options)
    this.sendLog(entry)
    console.info(message, options)
  }

  debug(message: string, options?: Parameters<typeof this.createLogEntry>[2]) {
    const entry = this.createLogEntry('debug', message, options)
    this.sendLog(entry)
    console.debug(message, options)
  }
}

export const clientLogger = new ClientLogger()

// Helper function to wrap async functions with error logging
export function withErrorLogging<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  component?: string,
  action?: string
): T {
  return (async (...args: any[]) => {
    try {
      return await fn(...args)
    } catch (error) {
      clientLogger.error(`Error in ${component || 'unknown'} ${action || 'action'}`, {
        error: error instanceof Error ? error : new Error(String(error)),
        component,
        action,
        context: { args },
      })
      throw error
    }
  }) as T
}

// Helper function to wrap sync functions with error logging
export function withSyncErrorLogging<T extends (...args: any[]) => any>(
  fn: T,
  component?: string,
  action?: string
): T {
  return ((...args: any[]) => {
    try {
      return fn(...args)
    } catch (error) {
      clientLogger.error(`Error in ${component || 'unknown'} ${action || 'action'}`, {
        error: error instanceof Error ? error : new Error(String(error)),
        component,
        action,
        context: { args },
      })
      throw error
    }
  }) as T
}