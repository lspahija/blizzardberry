import sql from '@/app/api/lib/store/db';

export interface Conversation {
  id: string;
  agent_id: string;
  agent_owner_id: string;
  end_user_config: any;
  created_at: Date;
}

export interface Message {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  created_at: Date;
  sequence_order: number;
}

export interface ConversationWithMessageCount extends Conversation {
  message_count: number;
  last_message_at: Date | null;
  agent_name: string;
}

export async function createNewConversation(
  agentId: string,
  agentOwnerId: string,
  endUserConfig: any
): Promise<string> {
  // Always create a new conversation session
  const newConversation = await sql`
    INSERT INTO conversations (agent_id, agent_owner_id, end_user_config)
    VALUES (${agentId}, ${agentOwnerId}, ${JSON.stringify(endUserConfig)})
    RETURNING id
  `;

  return newConversation[0].id;
}

export async function findExistingConversations(
  agentId: string,
  agentOwnerId: string,
  endUserConfig: any,
  limit: number = 5
): Promise<Conversation[]> {
  const result = await sql`
    SELECT id, agent_id, agent_owner_id, end_user_config, created_at
    FROM conversations
    WHERE agent_id = ${agentId}
      AND agent_owner_id = ${agentOwnerId}
      AND end_user_config = ${JSON.stringify(endUserConfig)}
    ORDER BY created_at DESC
    LIMIT ${limit}
  `;

  return result.map((row) => ({
    id: row.id,
    agent_id: row.agent_id,
    agent_owner_id: row.agent_owner_id,
    end_user_config: row.end_user_config,
    created_at: row.created_at,
  }));
}

export async function addMessage(
  conversationId: string,
  role: 'user' | 'assistant' | 'system',
  content: string
): Promise<string> {
  const sequenceResult = await sql`
    SELECT COALESCE(MAX(sequence_order), 0) + 1 as next_sequence
    FROM messages
    WHERE conversation_id = ${conversationId}
  `;

  const nextSequence = sequenceResult[0].next_sequence;

  const result = await sql`
    INSERT INTO messages (conversation_id, role, content, sequence_order)
    VALUES (${conversationId}, ${role}, ${content}, ${nextSequence})
    RETURNING id
  `;

  return result[0].id;
}

// Get conversation history for an end user
export async function getConversationHistory(
  agentId: string,
  endUserConfig: any,
  limit: number = 50
): Promise<Message[]> {
  const result = await sql`
    SELECT m.id, m.conversation_id, m.role, m.content, m.created_at, m.sequence_order
    FROM conversations c
    JOIN messages m ON c.id = m.conversation_id
    WHERE c.agent_id = ${agentId}
      AND c.end_user_config = ${JSON.stringify(endUserConfig)}
    ORDER BY m.sequence_order DESC
    LIMIT ${limit}
  `;

  return result.map((row) => ({
    id: row.id,
    conversation_id: row.conversation_id,
    role: row.role,
    content: row.content,
    created_at: row.created_at,
    sequence_order: row.sequence_order,
  }));
}

// Get all conversations for an agent owner
export async function getConversationsForAgentOwner(
  agentOwnerId: string,
  limit: number = 100,
  offset: number = 0
): Promise<ConversationWithMessageCount[]> {
  const result = await sql`
    SELECT
      c.id,
      c.agent_id,
      c.agent_owner_id,
      c.end_user_config,
      c.created_at,
      COUNT(m.id) as message_count,
      MAX(m.created_at) as last_message_at,
      a.name as agent_name
    FROM conversations c
    LEFT JOIN messages m ON c.id = m.conversation_id
    LEFT JOIN agents a ON c.agent_id = a.id
    WHERE c.agent_owner_id = ${agentOwnerId}
    GROUP BY c.id, c.agent_id, c.agent_owner_id, c.end_user_config, c.created_at, a.name
    ORDER BY c.created_at DESC
    LIMIT ${limit} OFFSET ${offset}
  `;

  return result.map((row) => ({
    id: row.id,
    agent_id: row.agent_id,
    agent_owner_id: row.agent_owner_id,
    end_user_config: row.end_user_config,
    created_at: row.created_at,
    message_count: parseInt(row.message_count),
    last_message_at: row.last_message_at,
    agent_name: row.agent_name || 'Unknown Agent',
  }));
}

export async function getMessagesForConversation(
  conversationId: string,
  limit: number = 100,
  offset: number = 0
): Promise<Message[]> {
  const result = await sql`
    SELECT id, conversation_id, role, content, created_at, sequence_order
    FROM messages
    WHERE conversation_id = ${conversationId}
    ORDER BY sequence_order ASC
    LIMIT ${limit} OFFSET ${offset}
  `;

  return result.map((row) => ({
    id: row.id,
    conversation_id: row.conversation_id,
    role: row.role,
    content: row.content,
    created_at: row.created_at,
    sequence_order: row.sequence_order,
  }));
}

// Delete a conversation and all its messages
export async function deleteConversation(conversationId: string): Promise<void> {
  await sql`DELETE FROM conversations WHERE id = ${conversationId}`;
}

export async function deleteLastAssistantMessage(conversationId: string) {
  await sql`
    DELETE FROM messages
    WHERE id = (
      SELECT id FROM messages
      WHERE conversation_id = ${conversationId} AND role = 'assistant'
      ORDER BY sequence_order DESC
      LIMIT 1
    )
  `;
}
