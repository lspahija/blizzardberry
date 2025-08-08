CREATE TABLE chats (
    id             UUID                     DEFAULT gen_random_uuid() PRIMARY KEY,
    agent_id       UUID                     NOT NULL REFERENCES agents (id) ON DELETE CASCADE,
    agent_owner_id UUID                     NOT NULL REFERENCES next_auth.users (id) ON DELETE CASCADE,
    end_user_config JSONB DEFAULT '{}',
    created_at     TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Essential indexes for chat queries
CREATE INDEX chats_agent_id_idx ON chats (agent_id);
CREATE INDEX chats_agent_owner_id_idx ON chats (agent_owner_id);
-- Composite index for finding existing chats by agent+owner ordered by creation time
CREATE INDEX chats_agent_owner_created_at_idx ON chats (agent_id, agent_owner_id, created_at DESC);
-- GIN index for JSONB config queries (keep existing)
CREATE INDEX chats_end_user_config_idx ON chats USING GIN (end_user_config);


CREATE TABLE messages (
    id             UUID                     DEFAULT gen_random_uuid() PRIMARY KEY,
    chat_id        UUID                     NOT NULL REFERENCES chats (id) ON DELETE CASCADE,
    role           TEXT                     NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content        TEXT                     NOT NULL, 
    created_at     TIMESTAMP WITH TIME ZONE DEFAULT now(),
    sequence_order INTEGER                  NOT NULL 
);

-- Essential indexes for message queries
CREATE INDEX messages_chat_id_idx ON messages (chat_id);
-- Composite index for chat messages ordered by sequence (most important)
CREATE INDEX messages_chat_id_sequence_idx ON messages (chat_id, sequence_order);
-- Index for role-based filtering (keep if needed for analytics)
CREATE INDEX messages_role_idx ON messages (role);
-- Composite index for chat messages by role and sequence
CREATE INDEX messages_chat_id_role_sequence_idx ON messages (chat_id, role, sequence_order);
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
