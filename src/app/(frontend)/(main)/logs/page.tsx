'use client'

import { useState, useEffect } from 'react'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Badge } from '../../components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select'
import { Input } from '../../components/ui/input'

interface LogEntry {
  id: number
  level: 'error' | 'warn' | 'info' | 'debug'
  message: string
  timestamp: string
  source: 'client' | 'server'
  url?: string
  user_agent?: string
  user_id?: string
  session_id?: string
  stack_trace?: string
  component?: string
  action?: string
  error_type?: string
  error_message?: string
  context?: string
}

interface LogStats {
  total: number
  errors: number
  warnings: number
  info: number
  debug: number
  last24Hours: number
}

export default function LogsPage() {
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [stats, setStats] = useState<LogStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState({
    level: '',
    userId: '',
    sessionId: '',
    limit: 100,
    offset: 0,
  })
  const [expandedLog, setExpandedLog] = useState<number | null>(null)

  const fetchLogs = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filter.level) params.append('level', filter.level)
      if (filter.userId) params.append('userId', filter.userId)
      if (filter.sessionId) params.append('sessionId', filter.sessionId)
      params.append('limit', filter.limit.toString())
      params.append('offset', filter.offset.toString())

      const response = await fetch(`/api/logs?${params}`)
      const data = await response.json()
      setLogs(data.logs)
    } catch (error) {
      console.error('Failed to fetch logs:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/logs/stats')
      const data = await response.json()
      setStats(data.stats)
    } catch (error) {
      console.error('Failed to fetch log stats:', error)
    }
  }

  useEffect(() => {
    fetchLogs()
    fetchStats()
  }, [filter])

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'error':
        return 'bg-red-100 text-red-800'
      case 'warn':
        return 'bg-yellow-100 text-yellow-800'
      case 'info':
        return 'bg-blue-100 text-blue-800'
      case 'debug':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString()
  }

  const parseContext = (context: string | null) => {
    if (!context) return null
    try {
      return JSON.parse(context)
    } catch {
      return context
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Application Logs</h1>
        <Button onClick={fetchLogs} disabled={loading}>
          {loading ? 'Loading...' : 'Refresh'}
        </Button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-red-600">Errors</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.errors}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-yellow-600">Warnings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.warnings}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-blue-600">Info</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.info}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Debug</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-600">{stats.debug}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Last 24h</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.last24Hours}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Select value={filter.level} onValueChange={(value) => setFilter(prev => ({ ...prev, level: value, offset: 0 }))}>
              <SelectTrigger>
                <SelectValue placeholder="All levels" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All levels</SelectItem>
                <SelectItem value="error">Error</SelectItem>
                <SelectItem value="warn">Warning</SelectItem>
                <SelectItem value="info">Info</SelectItem>
                <SelectItem value="debug">Debug</SelectItem>
              </SelectContent>
            </Select>
            <Input
              placeholder="User ID"
              value={filter.userId}
              onChange={(e) => setFilter(prev => ({ ...prev, userId: e.target.value, offset: 0 }))}
            />
            <Input
              placeholder="Session ID"
              value={filter.sessionId}
              onChange={(e) => setFilter(prev => ({ ...prev, sessionId: e.target.value, offset: 0 }))}
            />
            <Select value={filter.limit.toString()} onValueChange={(value) => setFilter(prev => ({ ...prev, limit: parseInt(value), offset: 0 }))}>
              <SelectTrigger>
                <SelectValue placeholder="Limit" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="50">50 entries</SelectItem>
                <SelectItem value="100">100 entries</SelectItem>
                <SelectItem value="250">250 entries</SelectItem>
                <SelectItem value="500">500 entries</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Logs List */}
      <div className="space-y-2">
        {logs.map((log) => (
          <Card key={log.id} className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader 
              className="pb-2"
              onClick={() => setExpandedLog(expandedLog === log.id ? null : log.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Badge className={getLevelColor(log.level)}>
                    {log.level.toUpperCase()}
                  </Badge>
                  <Badge variant="outline">{log.source}</Badge>
                  {log.component && (
                    <Badge variant="secondary">{log.component}</Badge>
                  )}
                  <span className="text-sm text-gray-500">
                    {formatTimestamp(log.timestamp)}
                  </span>
                </div>
                <div className="text-sm text-gray-500">
                  #{log.id}
                </div>
              </div>
              <CardTitle className="text-base">{log.message}</CardTitle>
              {log.error_message && (
                <CardDescription className="text-red-600">
                  {log.error_type}: {log.error_message}
                </CardDescription>
              )}
            </CardHeader>
            
            {expandedLog === log.id && (
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  {log.url && (
                    <div>
                      <strong>URL:</strong> {log.url}
                    </div>
                  )}
                  {log.user_id && (
                    <div>
                      <strong>User ID:</strong> {log.user_id}
                    </div>
                  )}
                  {log.session_id && (
                    <div>
                      <strong>Session ID:</strong> {log.session_id}
                    </div>
                  )}
                  {log.action && (
                    <div>
                      <strong>Action:</strong> {log.action}
                    </div>
                  )}
                </div>
                
                {log.stack_trace && (
                  <div>
                    <strong>Stack Trace:</strong>
                    <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                      {log.stack_trace}
                    </pre>
                  </div>
                )}
                
                {log.context && (
                  <div>
                    <strong>Context:</strong>
                    <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                      {JSON.stringify(parseContext(log.context), null, 2)}
                    </pre>
                  </div>
                )}
                
                {log.user_agent && (
                  <div className="text-xs text-gray-500">
                    <strong>User Agent:</strong> {log.user_agent}
                  </div>
                )}
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center">
        <Button
          variant="outline"
          disabled={filter.offset === 0}
          onClick={() => setFilter(prev => ({ ...prev, offset: Math.max(0, prev.offset - prev.limit) }))}
        >
          Previous
        </Button>
        <span className="text-sm text-gray-500">
          Showing {filter.offset + 1} - {Math.min(filter.offset + filter.limit, filter.offset + logs.length)}
        </span>
        <Button
          variant="outline"
          disabled={logs.length < filter.limit}
          onClick={() => setFilter(prev => ({ ...prev, offset: prev.offset + prev.limit }))}
        >
          Next
        </Button>
      </div>
    </div>
  )
}