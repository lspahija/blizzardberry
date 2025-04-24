import {NextResponse} from 'next/server';
import {tool} from 'ai';
import {z} from 'zod';
import {inMemoryToolStore} from "@/app/api/lib/inMemoryToolStore";
import yaml from 'js-yaml';
import {OpenAPIObject} from "openapi3-ts/oas30";
import {map} from "@/app/api/lib/mapper";
import {HttpModel} from "@/app/api/lib/model";

enum ContentType {
    CURL = 'curl',
    OPENAPI = 'openapi',
}

export async function POST(req: Request) {
    const {type, content, actionName, description} = await req.json();

    switch (type) {
        case ContentType.CURL:
            handleCurl(content);
            break;
        case ContentType.OPENAPI:
            handleOpenAPI(content)
            break;
        default:
            return NextResponse.json({error: 'Invalid content type'}, {status: 400});
    }

    return NextResponse.json({actionName});

    function handleCurl(curl: string) {
        createTool(actionName, map(curl));
    }

    function handleOpenAPI(content: any) {
        const parsed = yaml.load(content) as OpenAPIObject;

    }

    function createTool(actionName: string, httpModel: HttpModel) {
        inMemoryToolStore[actionName] = tool({
            description,
            parameters: z.object({
                data: z.any().optional().describe('Optional data for the request body'),
            }),
            execute: async ({data} = {}) => ({httpModel})
        });
    }
}