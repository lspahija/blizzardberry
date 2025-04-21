import { NextResponse } from 'next/server';
import parse from '@bany/curl-to-json';
import { tool } from 'ai';
import { z } from 'zod';
import {tools} from "@/app/api/tools";

export async function POST(req: Request) {
    try {
        const { curlCommand, toolName, description } = await req.json();

        if (!curlCommand || typeof curlCommand !== 'string' || !toolName || !description) {
            return NextResponse.json(
                { error: 'Missing curlCommand, toolName, or description in payload' },
                { status: 400 }
            );
        }

        // Parse the cURL command
        const parsedCurl = parse(curlCommand);

        if (!parsedCurl || typeof parsedCurl !== 'object') {
            return NextResponse.json(
                { error: 'Failed to parse cURL command into valid JSON' },
                { status: 400 }
            );
        }

        // Create a new tool from the parsed cURL
        tools[toolName] = tool({
            description,
            parameters: z.object({
                data: z.any().optional().describe('Optional data for the request body'),
            }),
            execute: async ({ data }) => {
                // TODO: this should probably be moved to the frontend chatbot widget because it will have the required cookies etc.
                try {
                    const response = await fetch(parsedCurl.url, {
                        method: parsedCurl.method || 'GET',
                        headers: parsedCurl.header || {},
                        body: data ? JSON.stringify(data) : parsedCurl.data || undefined,
                    });
                    const result = await response.json();
                    return {
                        status: response.status,
                        data: result,
                    };
                } catch (error: unknown) {
                    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
                    return {
                        error: `Failed to execute ${toolName} request`,
                        details: errorMessage,
                    };
                }
            },
        });

        return NextResponse.json({
            message: 'cURL command parsed and saved as tool successfully',
            toolName,
            parsedCurl,
        });
    } catch (error) {
        console.error('Error parsing cURL command:', error);
        return NextResponse.json(
            { error: 'Failed to parse cURL command' },
            { status: 500 }
        );
    }
}