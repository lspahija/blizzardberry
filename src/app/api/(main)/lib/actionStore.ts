import {supabaseClient} from "@/app/api/(main)/lib/supabase";
import {Action, ExecutionContext, ExecutionModel, HttpModel} from "@/app/api/(main)/lib/dataModel";

export const getActions = async (): Promise<Action[]> => {
    const {data, error} = await supabaseClient
        .from('actions')
        .select('name, description, execution_context, execution_model');

    if (error) {
        throw new Error(`Failed to fetch actions: ${error.message}`);
    }

    return data.map(d => ({
        name: d.name,
        description: d.description,
        executionContext: d.execution_context,
        executionModel: d.execution_model,
    }));
};

export const getAction = async (actionName: string): Promise<Action | null> => {
    const {data, error} = await supabaseClient
        .from('actions')
        .select('name, description, execution_context, execution_model')
        .eq('name', actionName)
        .single();

    if (error && error.code !== 'PGRST116') {
        // Throw for errors other than "no rows returned" (PGRST116 is Supabase's code for no results)
        throw new Error(`Failed to fetch action: ${error.message}`);
    }

    if (!data) return null;

    return {
        name: data.name,
        description: data.description,
        executionContext: data.execution_context,
        executionModel: data.execution_model,
    };
};

export const createAction =
    async (actionName: string, description: string,
           executionContext: ExecutionContext, executionModel: ExecutionModel): Promise<void> => {
        const {error} = await supabaseClient
            .from('actions')
            .insert({
                name: actionName,
                description,
                execution_context: executionContext,
                execution_model: executionModel,
            });

        if (error) {
            throw new Error(`Failed to create action: ${error.message}`);
        }
    };