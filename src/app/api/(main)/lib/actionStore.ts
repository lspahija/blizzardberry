import {HttpModel} from "@/app/api/(main)/lib/dataModel";
import {supabaseClient} from "@/app/api/(main)/lib/Supabase";

interface Action {
    name: string;
    description: string;
    httpModel: HttpModel;
}

export const getActions = async (): Promise<Action[]> => {
    const {data, error} = await supabaseClient
        .from('actions')
        .select('name, description, http_model');

    if (error) {
        throw new Error(`Failed to fetch actions: ${error.message}`);
    }

    return data.map(d => ({
        name: d.name,
        description: d.description,
        httpModel: d.http_model as HttpModel,
    }));
};

export const getAction = async (actionName: string): Promise<Action | null> => {
    const {data, error} = await supabaseClient
        .from('actions')
        .select('name, description, http_model')
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
        httpModel: data.http_model as HttpModel,
    };
};

export const createAction = async (actionName: string, httpModel: HttpModel, description: string): Promise<void> => {
    const {error} = await supabaseClient
        .from('actions')
        .insert({
            name: actionName,
            description,
            http_model: httpModel,
        });

    if (error) {
        throw new Error(`Failed to create action: ${error.message}`);
    }
};