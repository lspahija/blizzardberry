import {createOpenAICompatible} from '@ai-sdk/openai-compatible';
import {streamText} from 'ai';
import {inMemoryToolStore} from "@/app/api/lib/inMemoryToolStore";

const lmstudio = createOpenAICompatible({
    name: 'lmstudio',
    baseURL: process.env.LMSTUDIO_BASE_URL!,
});

export async function POST(req: Request) {
    const { messages } = await req.json();

    // https://sdk.vercel.ai/docs/ai-sdk-core/tools-and-tool-calling
    const result = streamText({
        model: lmstudio('gemma-3-12b-it-qat'),
        messages,
        system: "return only the tool invocation response",
        tools: inMemoryToolStore,
        maxSteps: 1,
    });

    return result.toDataStreamResponse();
}