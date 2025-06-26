CREATE TABLE chats (
    id             UUID                     DEFAULT gen_random_uuid() PRIMARY KEY,
    agent_id       UUID                     NOT NULL REFERENCES agents (id) ON DELETE CASCADE,
    agent_owner_id UUID                     NOT NULL REFERENCES next_auth.users (id) ON DELETE CASCADE, -- The user who owns the agent
    end_user_config JSONB DEFAULT '{}',
    created_at     TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX chats_agent_id_idx ON chats (agent_id);
CREATE INDEX chats_agent_owner_id_idx ON chats (agent_owner_id);
CREATE INDEX chats_end_user_config_idx ON chats USING GIN (end_user_config);
CREATE INDEX chats_created_at_idx ON chats (created_at);

CREATE TABLE messages (
    id             UUID                     DEFAULT gen_random_uuid() PRIMARY KEY,
    chat_id        UUID                     NOT NULL REFERENCES chats (id) ON DELETE CASCADE,
    role           TEXT                     NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content        TEXT                     NOT NULL, 
    created_at     TIMESTAMP WITH TIME ZONE DEFAULT now(),
    sequence_order INTEGER                  NOT NULL 
);

CREATE INDEX messages_chat_id_idx ON messages (chat_id);
CREATE INDEX messages_role_idx ON messages (role);
CREATE INDEX messages_created_at_idx ON messages (created_at);
CREATE INDEX messages_sequence_order_idx ON messages (chat_id, sequence_order); 