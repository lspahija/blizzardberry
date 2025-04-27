import {streamText, tool, Tool} from 'ai';
import {getActions} from '@/app/api/lib/ActionStore';
import {getModelProvider} from "@/app/api/lib/modelProvider";
import {z} from "zod";
import {CHATBOT_SYSTEM_MESSAGE} from "@/app/api/lib/constants";

// TODO: write ai sdk middleware to map any mention of tool to action

export async function POST(req: Request) {
    const {messages} = await req.json();

    // Get the model from the provider
    const model = getModelProvider();

    // https://sdk.vercel.ai/docs/ai-sdk-core/tools-and-tool-calling
    const result = streamText({
        model,
        messages,
        system: CHATBOT_SYSTEM_MESSAGE,
        tools: await getToolsFromActions(),
        maxSteps: 1,
    });

    let text = '';
    const toolCalls = [];
    const toolResults = [];

    for await (const part of result.fullStream) {
        switch (part.type) {
            case 'text-delta':
                text += part.textDelta;
                break;
            case 'tool-call':
                toolCalls.push({
                    toolCallId: part.toolCallId,
                    toolName: part.toolName,
                    args: part.args,
                });
                break;
            case 'tool-result':
                toolResults.push({
                    toolCallId: part.toolCallId,
                    toolName: part.toolName,
                    args: part.args,
                    result: part.result,
                });
                break;
        }
    }

    return Response.json({
        text,
        toolCalls,
        toolResults,
    });
}

async function getToolsFromActions() {
    const actions = await getActions()

    const tools: Record<string, Tool> = {};
    for (const action of actions) {
        tools[action.name] = tool({
            description: action.description,
            parameters: z.object({}),
            execute: async () => action.httpModel,
        });
    }
    return tools;
}