import sql from '@/app/api/lib/store/db';

export async function getAgent(agentId: string) {
  const [agent] = await sql`
    SELECT id, created_by, model
    FROM agents
    WHERE id = ${agentId}
    LIMIT 1
  `;

  return agent || null;
}

export async function getAgentByUserId(agentId: string, userId: string) {
  const [agent] = await sql`
    SELECT id, name, website_domain, model, created_by, created_at
    FROM agents
    WHERE id = ${agentId} AND created_by = ${userId}
    LIMIT 1
  `;

  return agent || null;
}

export async function getAgents(userId: string) {
  return sql`
    SELECT id, name, website_domain, model, created_by, created_at
    FROM agents
    WHERE created_by = ${userId}
  `;
}

export async function createAgent(
  name: string,
  websiteDomain: string,
  userId: string,
  model: string
) {
  const [agent] = await sql`
    INSERT INTO agents (name, website_domain, created_by, model)
    VALUES (${name}, ${websiteDomain}, ${userId}, ${model})
    RETURNING id
  `;

  return agent;
}

export async function deleteAgent(agentId: string) {
  await sql`
    DELETE FROM agents
    WHERE id = ${agentId}
  `;
}

export async function updateAgent(
  agentId: string,
  data: Partial<{
    name: string;
    website_domain: string;
    model: string;
  }>
) {
  const updateData: any = {};
  if (data.name !== undefined) updateData.name = data.name;
  if (data.website_domain !== undefined) updateData.website_domain = data.website_domain;
  if (data.model !== undefined) updateData.model = data.model;

  if (Object.keys(updateData).length === 0) {
    return null;
  }

  const result = await sql`
    UPDATE agents
    SET ${sql(updateData)}
    WHERE id = ${agentId}
    RETURNING *
  `;
  return result[0];
}
