import yaml from 'js-yaml';
import {OpenAPIObject} from "openapi3-ts/oas30";
import {NextResponse} from "next/server";

export async function POST(req: Request) {
    const {content} = await req.json();

    handleOpenAPI(content);

    return new NextResponse(null, {status: 201});

    // TODO: need to add validation in case actionName or description cannot be derived from spec
    function handleOpenAPI(content: any) {
        const openAPIObject = yaml.load(content) as OpenAPIObject;

        // TODO: add the rest of this (check git history for previous code)
    }
}