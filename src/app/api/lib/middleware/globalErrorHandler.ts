import { logger } from '../logger/logger'
import { insertLog } from '../store/logStore'

// Global unhandled error handlers for server-side
export function setupGlobalErrorHandlers() {
  // Catch unhandled promise rejections
  process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
    const error = reason instanceof Error ? reason : new Error(String(reason))
    
    logger.error({
      error,
      component: 'process',
      action: 'unhandled_rejection',
      context: { 
        promise: promise.toString(),
        stack: reason?.stack || 'No stack trace available'
      }
    }, 'Unhandled promise rejection')

    // Also save to database
    insertLog({
      level: 'error',
      message: 'Unhandled promise rejection',
      timestamp: new Date(),
      source: 'server',
      stack_trace: error.stack,
      component: 'process',
      action: 'unhandled_rejection',
      context: JSON.stringify({
        promise: promise.toString(),
        errorType: error.name,
        errorMessage: error.message
      })
    }).catch(dbError => {
      logger.error({ error: dbError }, 'Failed to save error to database')
    })
  })

  // Catch uncaught exceptions
  process.on('uncaughtException', (error: Error) => {
    logger.error({
      error,
      component: 'process', 
      action: 'uncaught_exception'
    }, 'Uncaught exception')

    // Also save to database
    insertLog({
      level: 'error',
      message: 'Uncaught exception',
      timestamp: new Date(),
      source: 'server',
      stack_trace: error.stack,
      component: 'process',
      action: 'uncaught_exception',
      context: JSON.stringify({
        errorType: error.name,
        errorMessage: error.message
      })
    }).catch(dbError => {
      logger.error({ error: dbError }, 'Failed to save error to database')
    })
    
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

    // Also save to database
    insertLog({
      level: 'warn',
      message: `Process warning: ${warning.name}`,
      timestamp: new Date(),
      source: 'server',
      stack_trace: warning.stack,
      component: 'process',
      action: 'warning',
      context: JSON.stringify({
        warningName: warning.name,
        warningMessage: warning.message
      })
    }).catch(dbError => {
      logger.error({ error: dbError }, 'Failed to save warning to database')
    })
  })
}

// Initialize global error handlers
setupGlobalErrorHandlers()