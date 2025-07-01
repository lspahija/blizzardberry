    import sql from '@/app/api/lib/store/db';

    export async function getPrompts(agentId: string) {
    return sql`
        SELECT id, content, created_at
        FROM prompts
        WHERE agent_id = ${agentId}
        ORDER BY created_at DESC
    `;
    }

    export async function createPrompt(
    content: string,
    agentId: string
    ) {
    const [prompt] = await sql`
        INSERT INTO prompts (content, agent_id)
        VALUES (${content}, ${agentId})
        RETURNING id
    `;

    return prompt;
    }

    export async function deletePrompt(promptId: string) {
    await sql`
        DELETE FROM prompts
        WHERE id = ${promptId}
    `;
    }

    export async function updatePrompts(
    agentId: string,
    prompts: string[]
    ) {
    await sql`
        DELETE FROM prompts
        WHERE agent_id = ${agentId}
    `;
    const promises = prompts
        .filter(content => content && content.trim())
        .map(content => sql`
            INSERT INTO prompts (content, agent_id)
            VALUES (${content.trim()}, ${agentId})
        `);
    await Promise.all(promises);
    } 