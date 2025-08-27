import sql from '@/app/api/lib/store/db';
import {
  Action,
  ExecutionContext,
  ExecutionModel,
} from '@/app/api/lib/model/action/baseAction';

export const getActions = async (agentId: string): Promise<Action[]> => {
  const actions = await sql`
    SELECT id, name, description, execution_context, execution_model, agent_id
    FROM actions
    WHERE agent_id = ${agentId}
  `;

  return actions.map((d: any) => ({
    id: d.id,
    name: d.name,
    description: d.description,
    executionContext: d.execution_context,
    executionModel: JSON.parse(d.execution_model),
    agentId: d.agent_id,
  }));
};

export const getAction = async (
  id: string,
  agentId: string
): Promise<Action | null> => {
  const [action] = await sql`
    SELECT id, name, description, execution_context, execution_model, agent_id
    FROM actions
    WHERE id = ${id} AND agent_id = ${agentId}
    LIMIT 1
  `;

  if (!action) return null;

  return {
    id: action.id,
    name: action.name,
    description: action.description,
    executionContext: action.execution_context,
    executionModel: JSON.parse(action.execution_model),
    agentId: action.agent_id,
  };
};

export const createAction = async (
  actionName: string,
  description: string,
  executionContext: ExecutionContext,
  executionModel: ExecutionModel,
  agentId: string
): Promise<void> => {
  await sql`
    INSERT INTO actions (name, description, execution_context, execution_model, agent_id)
    VALUES (${actionName}, ${description}, ${executionContext}, ${JSON.stringify(executionModel)}::jsonb, ${agentId})
  `;
};

export const deleteAction = async (
  id: string,
  agentId: string
): Promise<void> => {
  await sql`
    DELETE FROM actions
    WHERE id = ${id} AND agent_id = ${agentId}
  `;
};

export const updateAction = async (
  id: string,
  agentId: string,
  data: Partial<{
    name: string;
    description: string;
    execution_context: ExecutionContext;
    execution_model: ExecutionModel;
  }>
): Promise<void> => {
  const updateData: Record<string, any> = {};

  if (data.name !== undefined) updateData.name = data.name;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.execution_context !== undefined)
    updateData.execution_context = data.execution_context;
  if (data.execution_model !== undefined)
    updateData.execution_model = JSON.stringify(data.execution_model);

  if (Object.keys(updateData).length === 0) {
    return;
  }

  await sql`
    UPDATE actions
    SET ${sql(updateData)}
    WHERE id = ${id} AND agent_id = ${agentId}
  `;
};
