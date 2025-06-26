import sql from '@/app/api/lib/store/db';

export interface Chat {
  id: string;
  agent_id: string;
  agent_owner_id: string;
  end_user_config: any;
  title: string | null;
  created_at: Date;
}

export interface Message {
  id: string;
  chat_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  created_at: Date;
  sequence_order: number;
}

export interface ChatWithMessageCount extends Chat {
  message_count: number;
  last_message_at: Date | null;
}

// Create a new chat session for each conversation
export async function createNewChat(
  agentId: string,
  agentOwnerId: string,
  endUserConfig: any
): Promise<string> {
  // Always create a new chat session
  const newChat = await sql`
    INSERT INTO chats (agent_id, agent_owner_id, end_user_config)
    VALUES (${agentId}, ${agentOwnerId}, ${JSON.stringify(endUserConfig)})
    RETURNING id
  `;

  return newChat[0].id;
}

// Find existing chat sessions for a user (for potential conversation resumption)
export async function findExistingChats(
  agentId: string,
  agentOwnerId: string,
  endUserConfig: any,
  limit: number = 5
): Promise<Chat[]> {
  const result = await sql`
    SELECT id, agent_id, agent_owner_id, end_user_config, title, created_at
    FROM chats 
    WHERE agent_id = ${agentId}
      AND agent_owner_id = ${agentOwnerId}
      AND end_user_config = ${JSON.stringify(endUserConfig)}
    ORDER BY created_at DESC 
    LIMIT ${limit}
  `;

  return result.map(row => ({
    id: row.id,
    agent_id: row.agent_id,
    agent_owner_id: row.agent_owner_id,
    end_user_config: row.end_user_config,
    title: row.title,
    created_at: row.created_at
  }));
}

// Add a message to a chat
export async function addMessage(
  chatId: string,
  role: 'user' | 'assistant' | 'system',
  content: string
): Promise<string> {
  // Get the next sequence order
  const sequenceResult = await sql`
    SELECT COALESCE(MAX(sequence_order), 0) + 1 as next_sequence
    FROM messages 
    WHERE chat_id = ${chatId}
  `;

  const nextSequence = sequenceResult[0].next_sequence;

  // Insert the message
  const result = await sql`
    INSERT INTO messages (chat_id, role, content, sequence_order)
    VALUES (${chatId}, ${role}, ${content}, ${nextSequence})
    RETURNING id
  `;

  return result[0].id;
}

// Get chat history for an end user
export async function getChatHistory(
  agentId: string,
  endUserConfig: any,
  limit: number = 50
): Promise<Message[]> {
  const result = await sql`
    SELECT m.id, m.chat_id, m.role, m.content, m.created_at, m.sequence_order
    FROM chats c
    JOIN messages m ON c.id = m.chat_id
    WHERE c.agent_id = ${agentId}
      AND c.end_user_config = ${JSON.stringify(endUserConfig)}
    ORDER BY m.sequence_order DESC
    LIMIT ${limit}
  `;

  return result.map(row => ({
    id: row.id,
    chat_id: row.chat_id,
    role: row.role,
    content: row.content,
    created_at: row.created_at,
    sequence_order: row.sequence_order
  }));
}

// Get all chats for an agent owner
export async function getChatsForAgentOwner(
  agentOwnerId: string,
  limit: number = 100,
  offset: number = 0
): Promise<ChatWithMessageCount[]> {
  const result = await sql`
    SELECT 
      c.id,
      c.agent_id,
      c.agent_owner_id,
      c.end_user_config,
      c.title,
      c.created_at,
      COUNT(m.id) as message_count,
      MAX(m.created_at) as last_message_at
    FROM chats c
    LEFT JOIN messages m ON c.id = m.chat_id
    WHERE c.agent_owner_id = ${agentOwnerId}
    GROUP BY c.id, c.agent_id, c.agent_owner_id, c.end_user_config, c.title, c.created_at
    ORDER BY c.created_at DESC
    LIMIT ${limit} OFFSET ${offset}
  `;

  return result.map(row => ({
    id: row.id,
    agent_id: row.agent_id,
    agent_owner_id: row.agent_owner_id,
    end_user_config: row.end_user_config,
    title: row.title,
    created_at: row.created_at,
    message_count: parseInt(row.message_count),
    last_message_at: row.last_message_at
  }));
}

// Get messages for a specific chat
export async function getMessagesForChat(
  chatId: string,
  limit: number = 100,
  offset: number = 0
): Promise<Message[]> {
  const result = await sql`
    SELECT id, chat_id, role, content, created_at, sequence_order
    FROM messages
    WHERE chat_id = ${chatId}
    ORDER BY sequence_order ASC
    LIMIT ${limit} OFFSET ${offset}
  `;

  return result.map(row => ({
    id: row.id,
    chat_id: row.chat_id,
    role: row.role,
    content: row.content,
    created_at: row.created_at,
    sequence_order: row.sequence_order
  }));
}

// Update chat title
export async function updateChatTitle(
  chatId: string,
  title: string
): Promise<void> {
  await sql`
    UPDATE chats SET title = ${title} WHERE id = ${chatId}
  `;
}

// Delete a chat and all its messages
export async function deleteChat(chatId: string): Promise<void> {
  await sql`DELETE FROM chats WHERE id = ${chatId}`;
}
