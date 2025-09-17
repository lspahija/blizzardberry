-- Create logs table for application error tracking and monitoring
CREATE TABLE IF NOT EXISTS logs (
  id SERIAL PRIMARY KEY,
  level VARCHAR(10) NOT NULL CHECK (level IN ('error', 'warn', 'info', 'debug')),
  message TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL,
  source VARCHAR(10) NOT NULL DEFAULT 'server' CHECK (source IN ('client', 'server')),
  url TEXT,
  user_agent TEXT,
  user_id VARCHAR(255),
  session_id VARCHAR(255),
  stack_trace TEXT,
  component VARCHAR(255),
  action VARCHAR(255),
  error_type VARCHAR(255),
  error_message TEXT,
  context JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_logs_level ON logs(level);
CREATE INDEX IF NOT EXISTS idx_logs_timestamp ON logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_logs_user_id ON logs(user_id);
CREATE INDEX IF NOT EXISTS idx_logs_session_id ON logs(session_id);
CREATE INDEX IF NOT EXISTS idx_logs_source ON logs(source);
CREATE INDEX IF NOT EXISTS idx_logs_created_at ON logs(created_at);

-- Create a composite index for common queries
CREATE INDEX IF NOT EXISTS idx_logs_level_timestamp ON logs(level, timestamp DESC);

-- Add comment to table
COMMENT ON TABLE logs IS 'Application logs for error tracking and monitoring';
COMMENT ON COLUMN logs.level IS 'Log level: error, warn, info, debug';
COMMENT ON COLUMN logs.source IS 'Source of the log: client or server';
COMMENT ON COLUMN logs.context IS 'Additional context data in JSON format';