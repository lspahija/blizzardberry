-- TODO: review indexes for all sql tables


CREATE TABLE agents
(
    id             UUID                     DEFAULT gen_random_uuid() PRIMARY KEY,
    name           TEXT NOT NULL,
    website_domain TEXT NOT NULL,
    model          TEXT NOT NULL,
    created_by     UUID NOT NULL REFERENCES next_auth.users (id) ON DELETE CASCADE,
    created_at     TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Essential indexes for agent queries
CREATE INDEX agents_created_by_idx ON agents (created_by);
-- Index for domain-based lookups (if needed for agent discovery)
CREATE INDEX agents_website_domain_idx ON agents (website_domain);
-- Composite index for user's agents ordered by creation time
CREATE INDEX agents_created_by_created_at_idx ON agents (created_by, created_at DESC);


CREATE TYPE execution_context AS ENUM ('CLIENT', 'SERVER');

CREATE TABLE actions
(
    id                UUID                     DEFAULT gen_random_uuid() PRIMARY KEY,
    name              TEXT              NOT NULL,
    description       TEXT              NOT NULL,
    execution_context execution_context NOT NULL,
    execution_model   JSONB             NOT NULL,
    agent_id          UUID              NOT NULL REFERENCES agents (id) ON DELETE CASCADE,
    created_at        TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Essential indexes for action queries
CREATE INDEX actions_agent_id_idx ON actions (agent_id);
-- Composite index for agent actions with ID+agent_id queries
CREATE INDEX actions_agent_id_id_idx ON actions (agent_id, id);
-- Index for execution context filtering (if needed)
CREATE INDEX actions_execution_context_idx ON actions (execution_context);
