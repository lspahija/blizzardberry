import yaml from 'js-yaml';
import { OpenAPIObject, PathItemObject, OperationObject, ParameterObject, SchemaObject, ResponseObject, RequestBodyObject } from "openapi3-ts/oas30";
import { streamText, tool, Tool } from "ai";
import { z } from "zod";
import { getLanguageModel } from "@/app/api/(main)/lib/modelProvider";
import { CHATBOT_SYSTEM_MESSAGE } from "@/app/api/(main)/lib/constants";

// HTTP Model interface
interface HttpModel {
    url: string;
    method: string; // Using string instead of Method enum for clarity
    headers?: Record<string, string>;
    queryParams?: Record<string, string>;
    body?: any;
    description?: string;
}

// Global OpenAPI object for reference resolution
let globalOpenAPIObject: OpenAPIObject;

// Function to resolve schema references
function resolveSchemaRef(schema: any): SchemaObject {
    console.log(`[resolveSchemaRef] Checking schema for refs`);

    if (!schema) return {} as SchemaObject;

    if (schema.$ref) {
        console.log(`[resolveSchemaRef] Found reference: ${schema.$ref}`);

        // Extract the reference path
        const refPath = schema.$ref.substring(schema.$ref.indexOf('#/') + 2).split('/');
        console.log(`[resolveSchemaRef] Reference path: ${refPath.join('.')}`);

        // Navigate the OpenAPI object to find the referenced schema
        let resolvedSchema = globalOpenAPIObject;
        for (const path of refPath) {
            if (resolvedSchema[path]) {
                resolvedSchema = resolvedSchema[path];
            } else {
                console.log(`[resolveSchemaRef] Failed to resolve path segment: ${path}`);
                return {} as SchemaObject;
            }
        }

        console.log(`[resolveSchemaRef] Resolved schema type: ${(resolvedSchema as any).type || 'unknown'}`);
        return resolvedSchema as SchemaObject;
    }

    return schema as SchemaObject;
}

// Helper function to convert OpenAPI schema to Zod schema
function schemaToZod(schema: any, name: string = '', isRequired: boolean = true): z.ZodTypeAny {
    console.log(`[schemaToZod] Processing schema for "${name}", required: ${isRequired}`);

    if (!schema) {
        console.log(`[schemaToZod] No schema provided for "${name}", returning any`);
        return z.any().describe(`${name} parameter`);
    }

    // Resolve references
    if (schema.$ref) {
        console.log(`[schemaToZod] Schema for "${name}" is a reference, resolving...`);
        schema = resolveSchemaRef(schema);
    }

    console.log(`[schemaToZod] Schema type for "${name}": ${schema.type || 'object'}`);

    // Handle schema type
    switch (schema.type) {
        case 'string':
            console.log(`[schemaToZod] Creating string schema for "${name}", format: ${schema.format}, enum: ${schema.enum ? 'yes' : 'no'}`);

            let stringSchema = z.string().describe(`${name} parameter`);

            if (schema.format === 'date-time') {
                stringSchema = stringSchema.describe(`${name} parameter (date-time format)`);
            } else if (schema.format === 'date') {
                stringSchema = stringSchema.describe(`${name} parameter (date format)`);
            } else if (schema.format === 'email') {
                stringSchema = stringSchema.describe(`${name} parameter (email format)`);
            }

            if (schema.enum) {
                console.log(`[schemaToZod] Enum values for "${name}": ${schema.enum.join(', ')}`);
                return z.enum(schema.enum as [string, ...string[]]).describe(`${name} parameter (enum: ${schema.enum.join(', ')})`);
            }

            return isRequired ? stringSchema : stringSchema.optional();

        case 'number':
        case 'integer':
            console.log(`[schemaToZod] Creating number schema for "${name}"`);
            const numberSchema = z.number().describe(`${name} parameter`);
            return isRequired ? numberSchema : numberSchema.optional();

        case 'boolean':
            console.log(`[schemaToZod] Creating boolean schema for "${name}"`);
            const boolSchema = z.boolean().describe(`${name} parameter`);
            return isRequired ? boolSchema : boolSchema.optional();

        case 'array':
            console.log(`[schemaToZod] Creating array schema for "${name}"`);
            if (schema.items) {
                let itemSchema: z.ZodTypeAny;
                if (schema.items.$ref) {
                    const resolvedItemSchema = resolveSchemaRef(schema.items);
                    itemSchema = schemaToZod(resolvedItemSchema, `${name} item`, true);
                } else {
                    itemSchema = schemaToZod(schema.items, `${name} item`, true);
                }
                const arraySchema = z.array(itemSchema).describe(`${name} array parameter`);
                return isRequired ? arraySchema : arraySchema.optional();
            }
            return z.array(z.any()).describe(`${name} array parameter`);

        case 'object':
        default:
            // Default to object if type is missing
            console.log(`[schemaToZod] Creating object schema for "${name}", properties: ${schema.properties ? Object.keys(schema.properties).length : 0}`);
            if (schema.properties) {
                const shape: Record<string, z.ZodTypeAny> = {};
                const requiredProps = schema.required || [];

                console.log(`[schemaToZod] Required properties for "${name}": ${requiredProps.join(', ') || 'none'}`);

                for (const [propName, propSchema] of Object.entries(schema.properties)) {
                    const isReq = requiredProps.includes(propName);
                    console.log(`[schemaToZod] Processing property "${propName}" of "${name}", required: ${isReq}`);

                    // Handle property that might be a reference
                    if (propSchema.$ref) {
                        const resolvedPropSchema = resolveSchemaRef(propSchema);
                        shape[propName] = schemaToZod(resolvedPropSchema, propName, isReq);
                    } else {
                        shape[propName] = schemaToZod(propSchema, propName, isReq);
                    }
                }

                const objectSchema = z.object(shape).describe(`${name} object parameter`);
                return isRequired ? objectSchema : objectSchema.optional();
            }
            return z.record(z.any()).describe(`${name} object parameter`);
    }
}

// Function to process parameters from OpenAPI spec
function processParameters(parameters: ParameterObject[] = []): {
    pathParams: Record<string, z.ZodTypeAny>;
    queryParams: Record<string, z.ZodTypeAny>;
    headerParams: Record<string, z.ZodTypeAny>;
    requiredPathParams: string[];
    requiredQueryParams: string[];
    requiredHeaderParams: string[];
} {
    console.log(`[processParameters] Processing ${parameters.length} parameters`);

    const pathParams: Record<string, z.ZodTypeAny> = {};
    const queryParams: Record<string, z.ZodTypeAny> = {};
    const headerParams: Record<string, z.ZodTypeAny> = {};
    const requiredPathParams: string[] = [];
    const requiredQueryParams: string[] = [];
    const requiredHeaderParams: string[] = [];

    parameters.forEach(param => {
        const paramName = param.name;
        const isRequired = param.required === true;
        let schema = param.schema;

        console.log(`[processParameters] Parameter "${paramName}", in: ${param.in}, required: ${isRequired}`);

        // Handle schema references
        if (schema && schema.$ref) {
            schema = resolveSchemaRef(schema);
        }

        const zodSchema = schemaToZod(schema, paramName, isRequired);

        switch (param.in) {
            case 'path':
                pathParams[paramName] = zodSchema;
                if (isRequired) requiredPathParams.push(paramName);
                break;
            case 'query':
                queryParams[paramName] = zodSchema;
                if (isRequired) requiredQueryParams.push(paramName);
                break;
            case 'header':
                headerParams[paramName] = zodSchema;
                if (isRequired) requiredHeaderParams.push(paramName);
                break;
        }
    });

    console.log(`[processParameters] Results: 
        - Path parameters: ${Object.keys(pathParams).length} (${requiredPathParams.length} required)
        - Query parameters: ${Object.keys(queryParams).length} (${requiredQueryParams.length} required)
        - Header parameters: ${Object.keys(headerParams).length} (${requiredHeaderParams.length} required)
    `);

    return {
        pathParams,
        queryParams,
        headerParams,
        requiredPathParams,
        requiredQueryParams,
        requiredHeaderParams
    };
}

// Function to process request body
function processRequestBody(requestBody?: RequestBodyObject): {
    bodySchema: z.ZodTypeAny | null;
    isBodyRequired: boolean;
} {
    console.log(`[processRequestBody] Processing request body: ${requestBody ? 'present' : 'absent'}`);

    if (!requestBody) {
        return { bodySchema: null, isBodyRequired: false };
    }

    const isBodyRequired = requestBody.required === true;
    console.log(`[processRequestBody] Body required: ${isBodyRequired}`);

    let bodySchema: z.ZodTypeAny | null = null;

    // Check for JSON content type
    const contentTypes = requestBody.content ? Object.keys(requestBody.content) : [];
    console.log(`[processRequestBody] Content types: ${contentTypes.join(', ') || 'none'}`);

    const jsonContent = requestBody.content && (
        requestBody.content['application/json'] ||
        requestBody.content['application/ld+json']
    );

    if (jsonContent && jsonContent.schema) {
        console.log(`[processRequestBody] JSON content schema found, processing...`);

        // Process schema, which might be a reference
        bodySchema = schemaToZod(jsonContent.schema, 'requestBody', isBodyRequired);
    } else {
        console.log(`[processRequestBody] No JSON content schema found`);
    }

    return { bodySchema, isBodyRequired };
}

export async function POST(req: Request) {
    console.log(`[POST] Request received`);

    const { content } = await req.json();
    console.log(`[POST] Content received, parsing as YAML`);

    try {
        const openAPIObject = yaml.load(content) as OpenAPIObject;
        // Set global variable for reference resolution
        globalOpenAPIObject = openAPIObject;

        console.log(`[POST] OpenAPI parsed successfully. API title: ${openAPIObject.info?.title}`);
        console.log(`[POST] OpenAPI version: ${openAPIObject.openapi}`);

        if (openAPIObject.servers && openAPIObject.servers.length > 0) {
            console.log(`[POST] Servers: ${openAPIObject.servers.map(s => s.url).join(', ')}`);
        } else {
            console.log(`[POST] No servers defined in the OpenAPI spec`);
        }

        const pathCount = openAPIObject.paths ? Object.keys(openAPIObject.paths).length : 0;
        console.log(`[POST] Paths found: ${pathCount}`);

        // Debug components schemas
        if (openAPIObject.components && openAPIObject.components.schemas) {
            const schemaCount = Object.keys(openAPIObject.components.schemas).length;
            console.log(`[POST] Component schemas found: ${schemaCount}`);
            console.log(`[POST] Schema names: ${Object.keys(openAPIObject.components.schemas).join(', ')}`);
        }

        const tools: Record<string, Tool> = {};

        // Base URL from the OpenAPI spec
        const baseUrl = openAPIObject.servers && openAPIObject.servers[0]?.url || '';
        console.log(`[POST] Using base URL: "${baseUrl}"`);

        // Iterate through all paths and operations
        for (const [path, pathItem] of Object.entries(openAPIObject.paths || {})) {
            console.log(`[POST] Processing path: ${path}`);
            const pathItemObj = pathItem as PathItemObject;

            // Process each HTTP method (operation)
            for (const method of ['get', 'post', 'put', 'delete', 'patch'] as const) {
                const operation = pathItemObj[method] as OperationObject | undefined;

                if (!operation) continue;

                console.log(`[POST] Processing operation: ${method.toUpperCase()} ${path}`);

                const operationId = operation.operationId || `${method}${path.replace(/[^a-zA-Z0-9]/g, '')}`;
                const description = operation.summary || operation.description || `${method.toUpperCase()} ${path}`;

                console.log(`[POST] OperationId: ${operationId}`);
                console.log(`[POST] Description: ${description}`);

                // Combine parameters from path item and operation
                const pathItemParams = pathItemObj.parameters || [];
                const operationParams = operation.parameters || [];
                console.log(`[POST] Path item parameters: ${pathItemParams.length}`);
                console.log(`[POST] Operation parameters: ${operationParams.length}`);

                const allParameters = [
                    ...pathItemParams,
                    ...operationParams
                ] as ParameterObject[];

                // Process parameters
                console.log(`[POST] Processing all parameters for ${method.toUpperCase()} ${path}`);
                const {
                    pathParams,
                    queryParams,
                    headerParams,
                    requiredPathParams,
                    requiredQueryParams,
                    requiredHeaderParams
                } = processParameters(allParameters);

                // Process request body
                console.log(`[POST] Processing request body for ${method.toUpperCase()} ${path}`);
                const { bodySchema, isBodyRequired } = processRequestBody(operation.requestBody);

                // Build Zod schema for tool parameters
                const paramsShape: Record<string, z.ZodTypeAny> = {};

                // Add path parameters
                console.log(`[POST] Adding ${Object.keys(pathParams).length} path parameters to tool schema`);
                Object.entries(pathParams).forEach(([paramName, schema]) => {
                    paramsShape[paramName] = schema;
                });

                // Add query parameters
                console.log(`[POST] Adding ${Object.keys(queryParams).length} query parameters to tool schema`);
                Object.entries(queryParams).forEach(([paramName, schema]) => {
                    paramsShape[paramName] = schema;
                });

                // Add header parameters
                console.log(`[POST] Adding ${Object.keys(headerParams).length} header parameters to tool schema`);
                Object.entries(headerParams).forEach(([paramName, schema]) => {
                    paramsShape[paramName] = schema;
                });

                // Add body parameter if needed
                if (bodySchema) {
                    console.log(`[POST] Adding body parameter to tool schema`);
                    paramsShape.body = bodySchema;
                }

                const toolName = `ACTION: ${operationId}`;
                console.log(`[POST] Creating tool: ${toolName}`);

                // Create the tool
                tools[toolName] = {
                    description: description,
                    parameters: z.object(paramsShape),
                    execute: async (params) => {
                        console.log(`[execute] Executing tool: ${toolName}`);
                        console.log(`[execute] Parameters:`, params);

                        // Initialize HttpModel
                        const httpModel: HttpModel = {
                            url: baseUrl + path,
                            method: method.toUpperCase(),
                            description: description
                        };

                        console.log(`[execute] Initial URL: ${httpModel.url}`);

                        // Replace path parameters
                        for (const pathParam of requiredPathParams) {
                            if (params[pathParam]) {
                                const oldUrl = httpModel.url;
                                httpModel.url = httpModel.url.replace(`{${pathParam}}`, encodeURIComponent(String(params[pathParam])));
                                console.log(`[execute] Replaced path param ${pathParam}: ${oldUrl} -> ${httpModel.url}`);
                            } else {
                                console.log(`[execute] WARNING: Required path param ${pathParam} not provided`);
                            }
                        }

                        // Add query parameters
                        if (requiredQueryParams.length > 0 || Object.keys(queryParams).length > 0) {
                            httpModel.queryParams = {};
                            console.log(`[execute] Adding query parameters`);

                            for (const [paramName, _] of Object.entries(queryParams)) {
                                if (params[paramName] !== undefined) {
                                    httpModel.queryParams[paramName] = String(params[paramName]);
                                    console.log(`[execute] Added query param ${paramName}: ${httpModel.queryParams[paramName]}`);
                                } else if (requiredQueryParams.includes(paramName)) {
                                    console.log(`[execute] WARNING: Required query param ${paramName} not provided`);
                                }
                            }
                        }

                        // Add headers
                        if (requiredHeaderParams.length > 0 || Object.keys(headerParams).length > 0) {
                            httpModel.headers = {};
                            console.log(`[execute] Adding headers`);

                            for (const [paramName, _] of Object.entries(headerParams)) {
                                if (params[paramName] !== undefined) {
                                    httpModel.headers[paramName] = String(params[paramName]);
                                    console.log(`[execute] Added header ${paramName}: ${httpModel.headers[paramName]}`);
                                } else if (requiredHeaderParams.includes(paramName)) {
                                    console.log(`[execute] WARNING: Required header ${paramName} not provided`);
                                }
                            }
                        }

                        // Add body if needed
                        if (bodySchema && params.body !== undefined) {
                            httpModel.body = params.body;
                            console.log(`[execute] Added request body:`, JSON.stringify(params.body).substring(0, 100) + (JSON.stringify(params.body).length > 100 ? '...' : ''));
                        } else if (isBodyRequired && params.body === undefined) {
                            console.log(`[execute] WARNING: Required body not provided`);
                        }

                        console.log(`[execute] Final HttpModel:`, JSON.stringify(httpModel, null, 2));
                        return httpModel;
                    },
                };
            }
        }

        console.log(`[POST] Created ${Object.keys(tools).length} tools`);
        console.log(`[POST] Tool names: ${Object.keys(tools).join(', ')}`);

        return Response.json(tools);
    } catch (error) {
        console.error(`[POST] Error processing OpenAPI:`, error);
        return Response.json({ error: `Failed to process OpenAPI: ${error.message}` }, { status: 500 });
    }
}


// import yaml from 'js-yaml';
// import {OpenAPIObject} from "openapi3-ts/oas30";
// import {streamText, tool, Tool} from "ai";
// import {z} from "zod";
// import {getLanguageModel} from "@/app/api/(main)/lib/modelProvider";
// import {CHATBOT_SYSTEM_MESSAGE} from "@/app/api/(main)/lib/constants";
//
//
// export async function POST(req: Request) {
//     const {content} = await req.json();
//
//     const openAPIObject = yaml.load(content) as OpenAPIObject;
//
//     const tools: Record<string, Tool> = {};
//     for (const action of [something]) {
//         tools[`ACTION: ${action.name}`] = tool({
//             description: action.description,
//             parameters: [zod should be used to create parameters here],
//             execute: async ([there should be parameters here corresponding to those defined in 'parameters' above]) => {
//                 [this should return an HttpModel]
//             },
//         });
//     }
//
//     const result = streamText({
//         model: getLanguageModel(),
//         messages: [{role: 'user', content: 'test'}],
//         system: CHATBOT_SYSTEM_MESSAGE,
//         tools: tools,
//         maxSteps: 5,
//     });
//
//     return result.toDataStreamResponse()
//
//
//
//
//     I want to iterate over all paths and operations and create a parameterized tool for each
//         For parts of the http request that aren't known from the openapi spec, i want them to be parameters i.e. they need to be passed in as arguments to the lambda when the tool is being executed
//     For example, if the request body requires a paymentId, the paymentId should be passed in as an argument (parameter)
//     this applies to headers, query params and body
//     ultimately each tool execution should return an HTTP request represented by the following model interface:
//
//     interface HttpModel {
//         url: string;
//         method: Method;
//         headers?: Record<string, string>;
//         queryParams?: Record<string, string>;
//         body?: any;
//         description?: string;
//     }
// }