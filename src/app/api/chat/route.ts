import {streamText, tool, Tool} from 'ai';
import {getActions} from '@/app/api/lib/ActionStore';
import {getLanguageModel} from "@/app/api/lib/modelProvider";
import {z} from "zod";
import {CHATBOT_SYSTEM_MESSAGE} from "@/app/api/lib/constants";

// TODO: write ai sdk middleware to map any mention of tool to action

export async function POST(req: Request) {
    // https://sdk.vercel.ai/docs/ai-sdk-core/tools-and-tool-calling
    const result = streamText({
        model: getLanguageModel(),
        messages: (await req.json()).messages,
        system: CHATBOT_SYSTEM_MESSAGE,
        tools: await getToolsFromActions(),
        maxSteps: 1,
    });

    return Response.json(await processStream(result));
}

async function processStream(result) {
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

    return {
        text,
        toolCalls,
        toolResults,
    };
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