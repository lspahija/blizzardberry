import sql from '@/app/api/lib/store/db';

export async function getChatbot(chatbotId: string) {
  const [chatbot] = await sql`
    SELECT id, created_by, model
    FROM chatbots
    WHERE id = ${chatbotId}
    LIMIT 1
  `;

  return chatbot || null;
}

export async function getChatbotByUserId(chatbotId: string, userId: string) {
  const [chatbot] = await sql`
    SELECT id, name, website_domain, model, xxscreated_by, created_at
    FROM chatbots
    WHERE id = ${chatbotId} AND created_by = ${userId}
    LIMIT 1
  `;

  return chatbot || null;
}

export async function getChatbots(userId: string) {
  return sql`
    SELECT id, name, website_domain, model, created_by, created_at
    FROM chatbots
    WHERE created_by = ${userId}
  `;
}

export async function createChatbot(
  name: string,
  websiteDomain: string,
  userId: string,
  model: string
) {
  const [chatbot] = await sql`
    INSERT INTO chatbots (name, website_domain, created_by, model)
    VALUES (${name}, ${websiteDomain}, ${userId}, ${model})
    RETURNING id
  `;

  return chatbot;
}

export async function deleteChatbot(chatbotId: string) {
  await sql`
    DELETE FROM chatbots
    WHERE id = ${chatbotId}
  `;
}
