import {HttpModel} from "@/app/api/lib/dataModel";
import {Tool, tool} from "ai";
import {z} from "zod";

export const inMemoryActionStore: Record<string, Tool> = {};

export const getActions = () => inMemoryActionStore

export const getAction = (actionName: string): Tool => inMemoryActionStore[actionName];

export function createAction(actionName: string, httpModel: HttpModel, description: string) {
    inMemoryActionStore[actionName] = tool({
        description,
        parameters: z.object({
            data: z.any().optional().describe('Optional data for the request body'),
        }),
        execute: async ({data} = {}) => ({...httpModel}),
    });
}