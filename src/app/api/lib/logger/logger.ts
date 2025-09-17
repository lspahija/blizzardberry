import pino from 'pino'

export interface LogEntry {
  level: string
  time: string
  msg: string
  pid?: number
  hostname?: string
  userId?: string
  sessionId?: string
  userAgent?: string
  url?: string
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

const isDev = process.env.NODE_ENV === 'development'

export const logger = pino({
  level: isDev ? 'debug' : 'info',
  ...(isDev && {
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        ignore: 'pid,hostname',
        translateTime: 'SYS:yyyy-mm-dd HH:MM:ss',
      },
    },
  }),
  base: {
    pid: process.pid,
    hostname: process.env.HOSTNAME || 'unknown',
  },
  formatters: {
    level: (label) => ({ level: label }),
  },
})

export const createLogger = (context?: { userId?: string; sessionId?: string }) => {
  return logger.child(context || {})
}

export const logError = (error: Error, context?: Record<string, any>) => {
  logger.error({
    error: {
      type: error.name,
      message: error.message,
      stack: error.stack,
    },
    ...context,
  }, error.message)
}

export const logWarning = (message: string, context?: Record<string, any>) => {
  logger.warn({ ...context }, message)
}

export const logInfo = (message: string, context?: Record<string, any>) => {
  logger.info({ ...context }, message)
}

export const logDebug = (message: string, context?: Record<string, any>) => {
  logger.debug({ ...context }, message)
}