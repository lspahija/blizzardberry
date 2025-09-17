import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { logger } from '../lib/logger/logger'
import { insertLog, getLogs } from '../lib/store/logStore'

const clientLogSchema = z.object({
  level: z.enum(['error', 'warn', 'info', 'debug']),
  message: z.string(),
  timestamp: z.string(),
  url: z.string(),
  userAgent: z.string(),
  userId: z.string().optional(),
  sessionId: z.string().optional(),
  stack: z.string().optional(),
  component: z.string().optional(),
  action: z.string().optional(),
  error: z.object({
    type: z.string(),
    message: z.string(),
    stack: z.string().optional(),
  }).optional(),
  context: z.record(z.string(), z.any()).optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const logEntry = clientLogSchema.parse(body)

    // Log to server console
    const serverLogger = logger.child({
      source: 'client',
      userId: logEntry.userId,
      sessionId: logEntry.sessionId,
    })

    switch (logEntry.level) {
      case 'error':
        serverLogger.error({
          clientLog: logEntry,
          url: logEntry.url,
          userAgent: logEntry.userAgent,
        }, `Client Error: ${logEntry.message}`)
        break
      case 'warn':
        serverLogger.warn({
          clientLog: logEntry,
        }, `Client Warning: ${logEntry.message}`)
        break
      case 'info':
        serverLogger.info({
          clientLog: logEntry,
        }, `Client Info: ${logEntry.message}`)
        break
      case 'debug':
        serverLogger.debug({
          clientLog: logEntry,
        }, `Client Debug: ${logEntry.message}`)
        break
    }

    // Store in database
    await insertLog({
      level: logEntry.level,
      message: logEntry.message,
      timestamp: new Date(logEntry.timestamp),
      source: 'client',
      url: logEntry.url,
      user_agent: logEntry.userAgent,
      user_id: logEntry.userId,
      session_id: logEntry.sessionId,
      stack_trace: logEntry.stack || logEntry.error?.stack,
      component: logEntry.component,
      action: logEntry.action,
      error_type: logEntry.error?.type,
      error_message: logEntry.error?.message,
      context: logEntry.context ? JSON.stringify(logEntry.context) : null,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error({ error }, 'Failed to process client log')
    return NextResponse.json(
      { error: 'Failed to process log' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const level = searchParams.get('level')
    const userId = searchParams.get('userId')
    const sessionId = searchParams.get('sessionId')
    const limit = parseInt(searchParams.get('limit') || '100')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Use the imported getLogs function
    
    const logs = await getLogs({
      level: level as 'error' | 'warn' | 'info' | 'debug' | undefined,
      userId,
      sessionId,
      limit,
      offset,
    })

    return NextResponse.json({ logs })
  } catch (error) {
    logger.error({ error }, 'Failed to retrieve logs')
    return NextResponse.json(
      { error: 'Failed to retrieve logs' },
      { status: 500 }
    )
  }
}