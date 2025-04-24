import { NextResponse } from 'next/server';
import parse from '@bany/curl-to-json';
import { tool } from 'ai';
import { z } from 'zod';
import { inMemoryToolStore } from "@/app/api/lib/inMemoryToolStore";

export async function POST(req: Request) {
    const { curlCommand, actionName, description } = await req.json();

    const parsedCurl = parse(curlCommand);

    // Create a new tool that returns the parsed cURL
    inMemoryToolStore[actionName] = tool({
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
}