import yaml from 'js-yaml';
import {OpenAPIObject, OperationObject} from "openapi3-ts/oas30";
import {NextResponse} from "next/server";
import {HttpModel, Method} from "@/app/api/(main)/lib/dataModel";
import {createAction} from "@/app/api/(main)/lib/actionStore";

export async function POST(req: Request) {
    const {content} = await req.json();

    handleOpenAPI(content);

    return new NextResponse(null, {status: 201});

// TODO: need to add validation in case actionName or description cannot be derived from spec
    function handleOpenAPI(content: any) {
        const openAPIObject = yaml.load(content) as OpenAPIObject;

        // Iterate through paths
        Object.entries(openAPIObject.paths).forEach(([path, pathItem]) => {
            if (!pathItem) return;

            // Handle each operation in the path
            const operations: [string, OperationObject | undefined][] = [
                ['get', pathItem.get],
                ['post', pathItem.post],
                ['put', pathItem.put],
                ['delete', pathItem.delete],
                ['patch', pathItem.patch],
                ['options', pathItem.options],
                ['head', pathItem.head],
                ['trace', pathItem.trace],
            ];

            operations.forEach(([method, operation]) => {
                if (!operation) return;

                // Construct the HttpModel
                const httpModel: HttpModel = {
                    url: resolveUrl(openAPIObject, path),
                    method: method.toUpperCase() as Method,
                    headers: extractHeaders(operation),
                    queryParams: extractQueryParams(operation),
                    body: extractRequestBody(operation),
                    description: operation.description || operation.summary,
                };

                // Generate a unique action name for the tool
                const operationActionName = operation.operationId
                    ? operation.operationId
                    : `${method}_${path.replace(/[\W_]+/g, '_')}`;

                createAction(operationActionName, httpModel, operation.description!);
            });
        });
    }

    function resolveUrl(openAPIObject: OpenAPIObject, path: string): string {
        // Use the first server's URL or fallback to empty string
        const serverUrl = openAPIObject.servers?.[0]?.url || '';
        // Combine server URL with path, ensuring no double slashes
        return `${serverUrl.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
    }

    function extractHeaders(operation: OperationObject): Record<string, string> | undefined {
        const headers: Record<string, string> = {};

        // Extract headers from parameters
        operation.parameters?.forEach((param) => {
            if ('$ref' in param) return; // Skip references
            if (param.in === 'header' && param.name) {
                // Safely access example from param or schema
                const exampleValue = param.example || ('$ref' in param.schema ? undefined : param.schema?.example);
                headers[param.name] = exampleValue ? String(exampleValue) : '';
            }
        });

        // Extract headers from requestBody content (e.g., Content-Type)
        if (operation.requestBody && !('$ref' in operation.requestBody)) {
            const content = operation.requestBody.content;
            const mediaType = Object.keys(content)[0]; // Take first media type
            if (mediaType) {
                headers['Content-Type'] = mediaType;
            }
        }

        return Object.keys(headers).length > 0 ? headers : undefined;
    }

    function extractQueryParams(operation: OperationObject): Record<string, string> | undefined {
        const queryParams: Record<string, string> = {};

        operation.parameters?.forEach((param) => {
            if ('$ref' in param) return; // Skip references
            if (param.in === 'query' && param.name) {
                // Safely access example from param or schema
                const exampleValue = param.example || ('$ref' in param.schema ? undefined : param.schema?.example);
                queryParams[param.name] = exampleValue ? String(exampleValue) : '';
            }
        });

        return Object.keys(queryParams).length > 0 ? queryParams : undefined;
    }

    function extractRequestBody(operation: OperationObject): any | undefined {
        if (!operation.requestBody || '$ref' in operation.requestBody) return undefined;

        const content = operation.requestBody.content;
        const mediaType = Object.keys(content)[0]; // Take first media type
        if (!mediaType) return undefined;

        const mediaTypeObject = content[mediaType];
        // Safely access example from mediaTypeObject or schema
        return mediaTypeObject.example || ('$ref' in mediaTypeObject.schema ? undefined : mediaTypeObject.schema?.example);
    }
}