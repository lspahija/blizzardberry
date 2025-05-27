import { supabaseClient } from '@/app/api/lib/supabase';
import {
  Action,
  ExecutionContext,
  ExecutionModel,
} from '@/app/api/lib/model/action/baseAction';

export const getActions = async (chatbotId: string): Promise<Action[]> => {
  const { data, error } = await supabaseClient
    .from('actions')
    .select(
      'id, name, description, execution_context, execution_model, chatbot_id'
    )
    .eq('chatbot_id', chatbotId);

  if (error) {
    throw new Error(`Failed to fetch actions: ${error.message}`);
  }

  return data.map((d) => ({
    id: d.id,
    name: d.name,
    description: d.description,
    executionContext: d.execution_context,
    executionModel: d.execution_model,
    chatbotId: d.chatbot_id,
  }));
};

export const getAction = async (actionName: string): Promise<Action | null> => {
  const { data, error } = await supabaseClient
    .from('actions')
    .select(
      'id, name, description, execution_context, execution_model, chatbot_id'
    )
    .eq('name', actionName)
    .single();

  if (error && error.code !== 'PGRST116') {
    // Throw for errors other than "no rows returned" (PGRST116 is Supabase's code for no results)
    throw new Error(`Failed to fetch action: ${error.message}`);
  }

  if (!data) return null;

  return {
    id: data.id,
    name: data.name,
    description: data.description,
    executionContext: data.execution_context,
    executionModel: data.execution_model,
    chatbotId: data.chatbot_id,
  };
};

export const createAction = async (
  actionName: string,
  description: string,
  executionContext: ExecutionContext,
  executionModel: ExecutionModel,
  chatbotId: string
) =>
  supabaseClient.from('actions').insert({
    name: actionName,
    description,
    execution_context: executionContext,
    execution_model: executionModel,
    chatbot_id: chatbotId,
  });

export const deleteAction = async (id: string): Promise<void> => {
  const { error } = await supabaseClient.from('actions').delete().eq('id', id);

  if (error) {
    throw new Error(`Failed to delete action: ${error.message}`);
  }
};
