import { createClient } from '@supabase/supabase-js';
import { HttpModel } from "@/app/api/lib/dataModel";
import { Tool, tool } from "ai";
import { z } from "zod";

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface Action {
    name: string;
    description: string;
    httpModel: HttpModel;
}

const createTool = (action: Action): Tool => tool({
    description: action.description,
    parameters: z.object({}),
    execute: async () => action.httpModel,
});

export const getActions = async (): Promise<Record<string, Tool>> => {
    const { data, error } = await supabase
        .from('actions')
        .select('name, description, http_model');

    if (error) {
        throw new Error(`Failed to fetch actions: ${error.message}`);
    }

    const actions: Record<string, Tool> = {};
    for (const action of data) {
        actions[action.name] = createTool({
            name: action.name,
            description: action.description,
            httpModel: action.http_model as HttpModel,
        });
    }
    return actions;
};

export const getAction = async (actionName: string): Promise<Tool> => {
    const { data, error } = await supabase
        .from('actions')
        .select('name, description, http_model')
        .eq('name', actionName)
        .single();

    if (error || !data) {
        throw new Error(`Action ${actionName} not found`);
    }

    return createTool({
        name: data.name,
        description: data.description,
        httpModel: data.http_model as HttpModel,
    });
};

export const createAction = async (actionName: string, httpModel: HttpModel, description: string): Promise<void> => {
    const { error } = await supabase
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