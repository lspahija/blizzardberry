import { streamText } from 'ai';
import { getActions } from '@/app/api/lib/ActionStore';
import {getModelProvider} from "@/app/api/lib/modelProvider";

// TODO: write ai sdk middleware to map any mention of tool to action

export async function POST(req: Request) {
    const { messages } = await req.json();

    // Get the model from the provider
    const model = getModelProvider();

    // https://sdk.vercel.ai/docs/ai-sdk-core/tools-and-tool-calling
    const result = streamText({
        model,
        messages,
        system: 'return only the tool invocation response',
        tools: getActions(),
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