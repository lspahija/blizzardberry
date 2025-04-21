import {createOpenAICompatible} from '@ai-sdk/openai-compatible';
import {streamText} from 'ai';
import {tools} from "@/app/api/chat/tools";

const lmstudio = createOpenAICompatible({
    name: 'lmstudio',
    baseURL: process.env.LMSTUDIO_BASE_URL!,
});

export async function POST(req: Request) {
    const { messages } = await req.json();

    const result = streamText({
        model: lmstudio('gemma-3-12b-it-qat'),
        messages,
        tools: tools,
    });

    return result.toDataStreamResponse();
}