CREATE TABLE conversations (
    id             UUID                     DEFAULT gen_random_uuid() PRIMARY KEY,
    agent_id       UUID                     NOT NULL REFERENCES agents (id) ON DELETE CASCADE,
    agent_owner_id UUID                     NOT NULL REFERENCES next_auth.users (id) ON DELETE CASCADE,
    end_user_config JSONB DEFAULT '{}',
    created_at     TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Essential indexes for conversation queries
CREATE INDEX conversations_agent_id_idx ON conversations (agent_id);
CREATE INDEX conversations_agent_owner_id_idx ON conversations (agent_owner_id);
-- Composite index for finding existing conversations by agent+owner ordered by creation time
CREATE INDEX conversations_agent_owner_created_at_idx ON conversations (agent_id, agent_owner_id, created_at DESC);
-- GIN index for JSONB config queries (keep existing)
CREATE INDEX conversations_end_user_config_idx ON conversations USING GIN (end_user_config);


CREATE TABLE messages (
    id             UUID                     DEFAULT gen_random_uuid() PRIMARY KEY,
    conversation_id UUID                     NOT NULL REFERENCES conversations (id) ON DELETE CASCADE,
    role           TEXT                     NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content        TEXT                     NOT NULL, 
    created_at     TIMESTAMP WITH TIME ZONE DEFAULT now(),
    sequence_order INTEGER                  NOT NULL 
);

-- Essential indexes for message queries
CREATE INDEX messages_conversation_id_idx ON messages (conversation_id);
-- Composite index for conversation messages ordered by sequence (most important)
CREATE INDEX messages_conversation_id_sequence_idx ON messages (conversation_id, sequence_order);
-- Index for role-based filtering (keep if needed for analytics)
CREATE INDEX messages_role_idx ON messages (role);
-- Composite index for conversation messages by role and sequence
CREATE INDEX messages_conversation_id_role_sequence_idx ON messages (conversation_id, role, sequence_order);
-- Remove standalone created_at index as it's rarely used alone
-- Remove standalone sequence_order index as composite index covers it


CREATE TABLE prompts
(
    id          UUID              DEFAULT gen_random_uuid() PRIMARY KEY,
    content     TEXT              NOT NULL,
    agent_id    UUID              NOT NULL REFERENCES agents (id) ON DELETE CASCADE,
    created_at  TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Essential indexes for prompt queries
CREATE INDEX prompts_agent_id_idx ON prompts (agent_id);
-- Composite index for agent prompts ordered by creation time
CREATE INDEX prompts_agent_id_created_at_idx ON prompts (agent_id, created_at DESC);
