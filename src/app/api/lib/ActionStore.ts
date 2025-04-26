import {HttpModel} from "@/app/api/lib/dataModel";
import {Tool, tool} from "ai";
import {z} from "zod";

interface Action {
    name: string;
    description: string;
    httpModel: HttpModel;
}

const inMemoryActionStore: Record<string, Action> = {};

const createTool = (action: Action): Tool => tool({
    description: action.description,
    parameters: z.object({}),
    execute: async () => action.httpModel,
});

export const getActions = (): Record<string, Tool> => {
    const actions: Record<string, Tool> = {};
    for (const [key, action] of Object.entries(inMemoryActionStore)) {
        actions[key] = createTool(action);
    }
    return actions;
};

export const getAction = (actionName: string): Tool => {
    const action = inMemoryActionStore[actionName];
    if (!action) {
        throw new Error(`Action ${actionName} not found`);
    }
    return createTool(action);
};

export const createAction = (actionName: string, httpModel: HttpModel, description: string) => {
    inMemoryActionStore[actionName] = {
        name: actionName,
        description,
        httpModel,
    };
};