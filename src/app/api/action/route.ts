import { NextResponse } from 'next/server';
import parse from '@bany/curl-to-json';
import { tool } from 'ai';
import { z } from 'zod';
import { tools } from "@/app/api/tools";

export async function POST(req: Request) {
    try {
        const { curlCommand, actionName, description } = await req.json();

        if (!curlCommand || typeof curlCommand !== 'string' || !actionName || !description) {
            return NextResponse.json(
                { error: 'Missing curlCommand, actionName, or description in payload' },
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

        // Create a new tool that returns the parsed cURL
        tools[actionName] = tool({
            description,
            parameters: z.object({
                data: z.any().optional().describe('Optional data for the request body'),
            }),
            execute: async ({ data } = {}) => ({
                httpModel: parsedCurl
            })
        });

        return NextResponse.json({
            message: 'cURL command parsed and saved as action successfully',
            actionName,
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