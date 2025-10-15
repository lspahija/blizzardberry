-- Add unique constraint on (name, created_by) in agents table
-- This ensures each user can only have one agent with a given name

ALTER TABLE agents
ADD CONSTRAINT agents_name_created_by_key UNIQUE (name, created_by);
