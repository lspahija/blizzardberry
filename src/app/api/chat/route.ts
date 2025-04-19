import { createOpenAICompatible } from '@ai-sdk/openai-compatible';
import { streamText } from 'ai';

export const maxDuration = 30;
const lmstudio = createOpenAICompatible({
    name: 'lmstudio',
    baseURL: process.env.LMSTUDIO_BASE_URL!,
});

export async function POST(req: Request) {
    const { messages } = await req.json();

    const result = streamText({
        model: lmstudio('gemma-3-4b-it-qat'),
        messages,
    });

    return result.toDataStreamResponse();
}