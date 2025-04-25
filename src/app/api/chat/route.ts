import { createOpenAICompatible } from '@ai-sdk/openai-compatible';
import { streamText } from 'ai';
import { getActions } from "@/app/api/lib/ActionStore";

const lmstudio = createOpenAICompatible({
    name: 'lmstudio',
    baseURL: process.env.LMSTUDIO_BASE_URL!,
});

export async function POST(req: Request) {
    const { messages } = await req.json();

    const result = streamText({
        model: lmstudio('gemma-3-12b-it-qat'),
        messages,
        system: "return only the tool invocation response",
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