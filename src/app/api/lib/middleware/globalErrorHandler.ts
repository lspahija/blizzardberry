import { logger } from '../logger/logger'

// Global unhandled error handlers for server-side
export function setupGlobalErrorHandlers() {
  // Catch unhandled promise rejections
  process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
    logger.error({
      error: reason instanceof Error ? reason : new Error(String(reason)),
      component: 'process',
      action: 'unhandled_rejection',
      context: { 
        promise: promise.toString(),
        stack: reason?.stack || 'No stack trace available'
      }
    }, 'Unhandled promise rejection')
  })

  // Catch uncaught exceptions
  process.on('uncaughtException', (error: Error) => {
    logger.error({
      error,
      component: 'process', 
      action: 'uncaught_exception'
    }, 'Uncaught exception')
    
    // Don't exit in production - let PM2/docker handle it
    if (process.env.NODE_ENV !== 'production') {
      process.exit(1)
    }
  })

  // Catch warnings
  process.on('warning', (warning: Error) => {
    logger.warn({
      error: warning,
      component: 'process',
      action: 'warning'
    }, `Process warning: ${warning.name}`)
  })
}

// Initialize global error handlers
setupGlobalErrorHandlers()