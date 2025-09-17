// Next.js instrumentation hook - runs once when the server starts
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Import and setup global error handlers
    const { logger } = await import('./app/api/lib/logger/logger')
    
    // Enhanced global error handlers with more context
    process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
      logger.error({
        error: reason instanceof Error ? reason : new Error(String(reason)),
        component: 'instrumentation',
        action: 'unhandled_rejection',
        context: { 
          type: 'promise_rejection',
          reason: String(reason),
          nodeVersion: process.version,
          memoryUsage: process.memoryUsage(),
        }
      }, 'Global: Unhandled promise rejection')
    })

    process.on('uncaughtException', (error: Error) => {
      logger.error({
        error,
        component: 'instrumentation',
        action: 'uncaught_exception',
        context: {
          type: 'uncaught_exception',
          nodeVersion: process.version,
          memoryUsage: process.memoryUsage(),
        }
      }, 'Global: Uncaught exception')
      
      // Log and exit gracefully
      if (process.env.NODE_ENV === 'production') {
        setTimeout(() => process.exit(1), 1000) // Give time to log
      } else {
        process.exit(1)
      }
    })

    // Optional: Log when server starts
    logger.info({
      component: 'instrumentation',
      action: 'server_start',
      context: {
        nodeVersion: process.version,
        env: process.env.NODE_ENV,
        platform: process.platform,
      }
    }, 'Server started with global error handling')
  }
}