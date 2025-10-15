-- Add unique constraint on (name, agent_id) in actions table
-- This ensures each agent can only have one action with a given name

ALTER TABLE actions
ADD CONSTRAINT actions_name_agent_id_key UNIQUE (name, agent_id);
