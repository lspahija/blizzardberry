import {tool} from "ai";
import {z} from "zod";

export const tools = {
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
    sendHttpRequest: tool({
        description: 'Send an HTTP GET request to a specified URL',
        parameters: z.object({
            url: z.string().url().describe('The URL to send the HTTP GET request to'),
        }),
        execute: async ({ url }) => {
            try {
                const response = await fetch(url);
                const data = await response.json();
                return {
                    status: response.status,
                    data,
                };
            } catch (error: unknown) {
                const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
                return {
                    error: 'Failed to send HTTP request',
                    details: errorMessage,
                };
            }
        },
    }),
}