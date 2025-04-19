import { createOpenAICompatible } from '@ai-sdk/openai-compatible';
import { streamText, tool } from 'ai';
import { z } from 'zod';

const lmstudio = createOpenAICompatible({
    name: 'lmstudio',
    baseURL: process.env.LMSTUDIO_BASE_URL!,
});

export async function POST(req: Request) {
    const { messages } = await req.json();

    const result = streamText({
        model: lmstudio('gemma-3-4b-it-qat'),
        messages,
        tools: {
            weather: tool({
                description: 'Get the weather in a location (fahrenheit)',
                parameters: z.object({
                    location: z.string().describe('The location to get the weather for'),
                }),
                execute: async ({ location }) => {
                    const temperature = Math.round(Math.random() * (90 - 32) + 32);
                    return {
                        location,
                        temperature,
                    };
                },
            }),
            convertFahrenheitToCelsius: tool({
                description: 'Convert a temperature in fahrenheit to celsius',
                parameters: z.object({
                    temperature: z
                        .number()
                        .describe('The temperature in fahrenheit to convert'),
                }),
                execute: async ({ temperature }) => {
                    const celsius = Math.round((temperature - 32) * (5 / 9));
                    return {
                        celsius,
                    };
                },
            }),
        },
    });

    return result.toDataStreamResponse();
}