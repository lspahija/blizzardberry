import { NextResponse } from 'next/server';
import parse from '@bany/curl-to-json';

// In-memory storage for parsed cURL commands
let parsedCurlStorage: any[] = [];

export async function POST(req: Request) {
    try {
        // Extract the cURL command from the request body
        const { curlCommand } = await req.json();

        if (!curlCommand || typeof curlCommand !== 'string') {
            return NextResponse.json(
                { error: 'Invalid or missing curlCommand in payload' },
                { status: 400 }
            );
        }

        // Parse the cURL command using @bany/curl-to-json
        const parsedCurl = parse(curlCommand);

        // Validate parsed output
        if (!parsedCurl || typeof parsedCurl !== 'object') {
            return NextResponse.json(
                { error: 'Failed to parse cURL command into valid JSON' },
                { status: 400 }
            );
        }

        // Store the parsed result in memory
        parsedCurlStorage.push(parsedCurl);

        // Return the parsed JSON
        return NextResponse.json({
            message: 'cURL command parsed and stored successfully',
            parsedCurl,
            storedCount: parsedCurlStorage.length,
        });
    } catch (error) {
        console.error('Error parsing cURL command:', error);
        return NextResponse.json(
            { error: 'Failed to parse cURL command' },
            { status: 500 }
        );
    }
}

// Optional: GET endpoint to retrieve stored parsed commands (for testing)
export async function GET() {
    return NextResponse.json({
        storedCurls: parsedCurlStorage,
        storedCount: parsedCurlStorage.length,
    });
}