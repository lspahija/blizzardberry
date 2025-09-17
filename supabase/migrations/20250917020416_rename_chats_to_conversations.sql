-- Rename chats table to conversations and update all related objects
-- This migration maintains data integrity while renaming the domain objects

-- Step 1: Rename the chats table to conversations
ALTER TABLE chats RENAME TO conversations;

-- Step 2: Rename the chat_id column in messages table to conversation_id
ALTER TABLE messages RENAME COLUMN chat_id TO conversation_id;

-- Step 3: Drop old indexes
DROP INDEX IF EXISTS chats_agent_id_idx;
DROP INDEX IF EXISTS chats_agent_owner_id_idx;
DROP INDEX IF EXISTS chats_agent_owner_created_at_idx;
DROP INDEX IF EXISTS chats_end_user_config_idx;
DROP INDEX IF EXISTS messages_chat_id_idx;
DROP INDEX IF EXISTS messages_chat_id_sequence_idx;
DROP INDEX IF EXISTS messages_chat_id_role_sequence_idx;

-- Step 4: Create new indexes with updated names
CREATE INDEX conversations_agent_id_idx ON conversations (agent_id);
CREATE INDEX conversations_agent_owner_id_idx ON conversations (agent_owner_id);
CREATE INDEX conversations_agent_owner_created_at_idx ON conversations (agent_id, agent_owner_id, created_at DESC);
CREATE INDEX conversations_end_user_config_idx ON conversations USING GIN (end_user_config);

-- Step 5: Create new message indexes with updated column name
CREATE INDEX messages_conversation_id_idx ON messages (conversation_id);
CREATE INDEX messages_conversation_id_sequence_idx ON messages (conversation_id, sequence_order);
CREATE INDEX messages_conversation_id_role_sequence_idx ON messages (conversation_id, role, sequence_order);