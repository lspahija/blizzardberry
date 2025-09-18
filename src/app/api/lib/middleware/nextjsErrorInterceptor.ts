import { logger } from '../logger/logger'
import { insertLog } from '../store/logStore'

// Monkey patch fetch to catch API errors globally
const originalFetch = global.fetch
global.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
  try {
    const response = await originalFetch(input, init)
    
    // Log API errors (4xx, 5xx responses)
    if (!response.ok && response.url?.includes('/api/')) {
      const message = `API responded with ${response.status}: ${response.statusText}`
      
      logger.warn({
        component: 'fetch_interceptor',
        action: 'api_error_response',
        context: {
          url: response.url,
          status: response.status,
          statusText: response.statusText,
          method: init?.method || 'GET',
        }
      }, message)

      // Also save to database
      insertLog({
        level: 'warn',
        message,
        timestamp: new Date(),
        source: 'server',
        url: response.url,
        component: 'fetch_interceptor',
        action: 'api_error_response',
        context: JSON.stringify({
          status: response.status,
          statusText: response.statusText,
          method: init?.method || 'GET',
        })
      }).catch(dbError => {
        logger.error({ error: dbError }, 'Failed to save API error to database')
      })
    }
    
    return response
  } catch (error) {
    // Log fetch failures
    const err = error instanceof Error ? error : new Error(String(error))
    
    logger.error({
      error: err,
      component: 'fetch_interceptor', 
      action: 'fetch_failure',
      context: {
        url: typeof input === 'string' ? input : input.toString(),
        method: init?.method || 'GET',
      }
    }, 'Fetch request failed')

    // Also save to database
    insertLog({
      level: 'error',
      message: 'Fetch request failed',
      timestamp: new Date(),
      source: 'server',
      url: typeof input === 'string' ? input : input.toString(),
      stack_trace: err.stack,
      component: 'fetch_interceptor',
      action: 'fetch_failure',
      context: JSON.stringify({
        method: init?.method || 'GET',
        errorType: err.name,
        errorMessage: err.message
      })
    }).catch(dbError => {
      logger.error({ error: dbError }, 'Failed to save fetch error to database')
    })
    
    throw error
  }
}

// Intercept console.error to catch unlogged errors
const originalConsoleError = console.error
console.error = (...args: any[]) => {
  // Call original console.error
  originalConsoleError.apply(console, args)
  
  // Extract error information
  const firstArg = args[0]
  const isError = firstArg instanceof Error
  const message = isError ? firstArg.message : String(firstArg)
  
  // Only log if it looks like an unhandled error (not already logged by our system)
  if (!message.includes('Widget:') && !message.includes('Client:') && !message.includes('API Error:')) {
    const error = isError ? firstArg : new Error(message)
    const logMessage = `Console Error: ${message}`
    
    logger.error({
      error,
      component: 'console_interceptor',
      action: 'console_error',
      context: {
        args: args.slice(1).map(arg => String(arg)),
        timestamp: new Date().toISOString(),
      }
    }, logMessage)

    // Also save to database
    insertLog({
      level: 'error',
      message: logMessage,
      timestamp: new Date(),
      source: 'server',
      stack_trace: error.stack,
      component: 'console_interceptor',
      action: 'console_error',
      context: JSON.stringify({
        args: args.slice(1).map(arg => String(arg)),
        errorType: error.name,
        errorMessage: error.message
      })
    }).catch(dbError => {
      logger.error({ error: dbError }, 'Failed to save console error to database')
    })
  }
}

export { /* Export nothing, just run the setup */ }