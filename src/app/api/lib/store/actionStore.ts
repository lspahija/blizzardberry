import sql from '@/app/api/lib/store/db';
import {
  Action,
  ExecutionContext,
  ExecutionModel,
} from '@/app/api/lib/model/action/baseAction';

export const getActions = async (chatbotId: string): Promise<Action[]> => {
  const actions = await sql`
    SELECT id, name, description, execution_context, execution_model, chatbot_id
    FROM actions
    WHERE chatbot_id = ${chatbotId}
  `;

  return actions.map((d: any) => {
    const executionModel = typeof d.execution_model === 'string' 
      ? JSON.parse(d.execution_model) 
      : d.execution_model;

    return {
      id: d.id,
      name: d.name,
      description: d.description,
      executionContext: d.execution_context,
      executionModel,
      chatbotId: d.chatbot_id,
    };
  });
};

export const getAction = async (
  id: string,
  chatbotId: string
): Promise<Action | null> => {
  const [action] = await sql`
    SELECT id, name, description, execution_context, execution_model, chatbot_id
    FROM actions
    WHERE id = ${id} AND chatbot_id = ${chatbotId}
    LIMIT 1
  `;

  if (!action) return null;

  const executionModel = typeof action.execution_model === 'string'
    ? JSON.parse(action.execution_model)
    : action.execution_model;

  return {
    id: action.id,
    name: action.name,
    description: action.description,
    executionContext: action.execution_context,
    executionModel,
    chatbotId: action.chatbot_id,
  };
};

export const createAction = async (
  actionName: string,
  description: string,
  executionContext: ExecutionContext,
  executionModel: ExecutionModel,
  chatbotId: string
): Promise<void> => {
  await sql`
    INSERT INTO actions (name, description, execution_context, execution_model, chatbot_id)
    VALUES (${actionName}, ${description}, ${executionContext}, ${JSON.stringify(executionModel)}::jsonb, ${chatbotId})
  `;
};

export const deleteAction = async (
  id: string,
  chatbotId: string
): Promise<void> => {
  await sql`
    DELETE FROM actions
    WHERE id = ${id} AND chatbot_id = ${chatbotId}
  `;
};
