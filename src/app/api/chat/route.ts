import {createOpenAICompatible} from '@ai-sdk/openai-compatible';
import {streamText} from 'ai';
import {getActions} from "@/app/api/lib/ActionStore";

// TODO: write ai sdk middleware to map any mention of tool to action
const lmstudio = createOpenAICompatible({
    name: 'lmstudio',
    baseURL: process.env.LMSTUDIO_BASE_URL!,
});

export async function POST(req: Request) {
    const { messages } = await req.json();

    // TODO: optimize using info from these docs: https://sdk.vercel.ai/docs/ai-sdk-core/tools-and-tool-calling
    const result = streamText({
        model: lmstudio('gemma-3-12b-it-qat'),
        messages,
        system: "return only the tool invocation response",
        tools: getActions(),
        maxSteps: 1,
    });

    return result.toDataStreamResponse();
}