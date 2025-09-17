import { logger } from '../logger/logger'

// Monkey patch fetch to catch API errors globally
const originalFetch = global.fetch
global.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
  try {
    const response = await originalFetch(input, init)
    
    // Log API errors (4xx, 5xx responses)
    if (!response.ok && response.url?.includes('/api/')) {
      logger.warn({
        component: 'fetch_interceptor',
        action: 'api_error_response',
        context: {
          url: response.url,
          status: response.status,
          statusText: response.statusText,
          method: init?.method || 'GET',
        }
      }, `API responded with ${response.status}: ${response.statusText}`)
    }
    
    return response
  } catch (error) {
    // Log fetch failures
    logger.error({
      error: error instanceof Error ? error : new Error(String(error)),
      component: 'fetch_interceptor', 
      action: 'fetch_failure',
      context: {
        url: typeof input === 'string' ? input : input.toString(),
        method: init?.method || 'GET',
      }
    }, 'Fetch request failed')
    
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
    logger.error({
      error: isError ? firstArg : new Error(message),
      component: 'console_interceptor',
      action: 'console_error',
      context: {
        args: args.slice(1).map(arg => String(arg)),
        timestamp: new Date().toISOString(),
      }
    }, `Console Error: ${message}`)
  }
}

export { /* Export nothing, just run the setup */ }