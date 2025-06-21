import sql from '@/app/api/lib/store/db';

export async function getAgent(agentId: string) {
  const [agent] = await sql`
    SELECT id, team_id, created_by, model
    FROM agents
    WHERE id = ${agentId}
    LIMIT 1
  `;

  return agent || null;
}

export async function getAgentByTeamAccess(agentId: string, userId: string) {
  const [agent] = await sql`
    SELECT a.id, a.name, a.website_domain, a.model, a.team_id, a.created_by, a.created_at
    FROM agents a
    JOIN team_members tm ON a.team_id = tm.team_id
    WHERE a.id = ${agentId} AND tm.user_id = ${userId}
    LIMIT 1
  `;

  return agent || null;
}

export async function getAgentsByTeam(teamId: string) {
  return sql`
    SELECT id, name, website_domain, model, team_id, created_by, created_at
    FROM agents
    WHERE team_id = ${teamId}
    ORDER BY created_at DESC
  `;
}

export async function getUserAgents(userId: string) {
  return sql`
    SELECT DISTINCT a.id, a.name, a.website_domain, a.model, a.team_id, a.created_by, a.created_at
    FROM agents a
    JOIN team_members tm ON a.team_id = tm.team_id
    WHERE tm.user_id = ${userId}
    ORDER BY a.created_at DESC
  `;
}

export async function createAgent(
  name: string,
  websiteDomain: string,
  teamId: string,
  userId: string,
  model: string
) {
  const [agent] = await sql`
    INSERT INTO agents (name, website_domain, team_id, created_by, model)
    VALUES (${name}, ${websiteDomain}, ${teamId}, ${userId}, ${model})
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
  data: {
    name: string;
    website_domain: string;
    model: string;
  }
) {
  const { name, website_domain, model } = data;
  const result = await sql`
    UPDATE agents
    SET name = ${name},
        website_domain = ${website_domain},
        model = ${model}
    WHERE id = ${agentId}
    RETURNING *
  `;
  return result[0];
}
