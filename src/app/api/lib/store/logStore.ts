import db from './db'

export interface LogRecord {
  id?: number
  level: 'error' | 'warn' | 'info' | 'debug'
  message: string
  timestamp: Date
  source: 'client' | 'server'
  url?: string
  user_agent?: string
  user_id?: string
  session_id?: string
  stack_trace?: string
  component?: string
  action?: string
  context?: string // JSON string
  created_at?: Date
}

export interface LogQuery {
  level?: 'error' | 'warn' | 'info' | 'debug'
  userId?: string
  sessionId?: string
  source?: 'client' | 'server'
  startDate?: Date
  endDate?: Date
  limit?: number
  offset?: number
}

export async function insertLog(log: LogRecord): Promise<number> {
  const result = await db`
    INSERT INTO logs (
      level, message, timestamp, source, url, user_agent, 
      user_id, session_id, stack_trace, component, action, context
    ) VALUES (
      ${log.level}, ${log.message}, ${log.timestamp}, ${log.source},
      ${log.url || null}, ${log.user_agent || null}, ${log.user_id || null},
      ${log.session_id || null}, ${log.stack_trace || null}, 
      ${log.component || null}, ${log.action || null},
      ${log.context ? db`${log.context}::jsonb` : null}
    ) RETURNING id
  `
  
  return result[0].id
}

export async function getLogs(query: LogQuery = {}): Promise<LogRecord[]> {
  const {
    level,
    userId,
    sessionId,
    source,
    startDate,
    endDate,
    limit = 100,
    offset = 0,
  } = query

  // Build the query dynamically with proper postgres.js syntax
  let whereConditions = []
  
  if (level) {
    whereConditions.push(db`level = ${level}`)
  }

  if (userId) {
    whereConditions.push(db`user_id = ${userId}`)
  }

  if (sessionId) {
    whereConditions.push(db`session_id = ${sessionId}`)
  }

  if (source) {
    whereConditions.push(db`source = ${source}`)
  }

  if (startDate) {
    whereConditions.push(db`timestamp >= ${startDate}`)
  }

  if (endDate) {
    whereConditions.push(db`timestamp <= ${endDate}`)
  }

  // Build the final query
  let result: any
  if (whereConditions.length > 0) {
    // Join conditions with AND
    const whereClause = whereConditions.reduce((acc, condition, index) => {
      return index === 0 ? condition : db`${acc} AND ${condition}`
    })
    
    result = await db`
      SELECT * FROM logs 
      WHERE ${whereClause}
      ORDER BY timestamp DESC 
      LIMIT ${limit} 
      OFFSET ${offset}
    `
  } else {
    result = await db`
      SELECT * FROM logs 
      ORDER BY timestamp DESC 
      LIMIT ${limit} 
      OFFSET ${offset}
    `
  }

  return result.map((row: any) => ({
    id: row.id,
    level: row.level,
    message: row.message,
    timestamp: row.timestamp,
    source: row.source,
    url: row.url,
    user_agent: row.user_agent,
    user_id: row.user_id,
    session_id: row.session_id,
    stack_trace: row.stack_trace,
    component: row.component,
    action: row.action,
    context: row.context,
    created_at: row.created_at,
  }))
}

export async function getLogStats(userId?: string): Promise<{
  total: number
  errors: number
  warnings: number
  info: number
  debug: number
  last24Hours: number
}> {
  const userFilter = userId ? db`WHERE user_id = ${userId}` : db``
  const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000)

  const [stats] = await db`
    SELECT 
      COUNT(*) as total,
      COUNT(CASE WHEN level = 'error' THEN 1 END) as errors,
      COUNT(CASE WHEN level = 'warn' THEN 1 END) as warnings,
      COUNT(CASE WHEN level = 'info' THEN 1 END) as info,
      COUNT(CASE WHEN level = 'debug' THEN 1 END) as debug,
      COUNT(CASE WHEN timestamp >= ${last24Hours} THEN 1 END) as last24Hours
    FROM logs 
    ${userFilter}
  `

  return {
    total: parseInt(stats.total),
    errors: parseInt(stats.errors),
    warnings: parseInt(stats.warnings),
    info: parseInt(stats.info),
    debug: parseInt(stats.debug),
    last24Hours: parseInt(stats.last24hours),
  }
}

export async function deleteOldLogs(daysToKeep: number = 30): Promise<number> {
  const cutoffDate = new Date(Date.now() - daysToKeep * 24 * 60 * 60 * 1000)
  
  const result = await db`
    DELETE FROM logs 
    WHERE timestamp < ${cutoffDate}
  `
  
  return result.count || 0
}

