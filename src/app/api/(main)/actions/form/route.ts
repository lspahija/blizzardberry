import {tool, Tool} from 'ai';
import {NextResponse} from 'next/server';
import {z} from 'zod';
import {
    BackendAction,
    Parameter,
    ParameterType,
    RequestBody,
    RequestModel
} from '@/app/api/(main)/actions/form/newDataModel';

// Helper function to create a zod schema from parameters
function createParameterSchema(parameters: Parameter[]): z.ZodObject<any> {
    const schemaFields: Record<string, z.ZodTypeAny> = {};

    for (const param of parameters) {
        let baseSchema: z.ZodTypeAny;

        // Map ParameterType to zod schema
        switch (param.type) {
            case ParameterType.String:
                baseSchema = z.string();
                break;
            case ParameterType.Number:
                baseSchema = z.number();
                break;
            case ParameterType.Boolean:
                baseSchema = z.boolean();
                break;
            default:
                baseSchema = z.any(); // Fallback for unrecognized types
        }

        // Handle arrays if isArray is true
        const finalSchema = param.isArray ? z.array(baseSchema) : baseSchema;

        schemaFields[param.name] = finalSchema.optional(); // Parameters are optional
    }

    return z.object(schemaFields);
}

// Helper function to substitute placeholders in a string
function substitutePlaceholders(
    input: string,
    params: Record<string, any>
): string {
    let result = input;
    for (const [key, value] of Object.entries(params)) {
        const placeholder = `{{${key}}}`;
        const replacement = Array.isArray(value) ? value.join(',') : value.toString();
        result = result.replace(new RegExp(placeholder, 'g'), replacement);
    }
    return result;
}

// Helper function to substitute placeholders in RequestModel
function substituteRequestModel(
    request: RequestModel,
    params: Record<string, any>
): RequestModel {
    const { url, method, headers, body } = request;

    // Substitute placeholders in URL
    const substitutedUrl = substitutePlaceholders(url, params);

    // Substitute placeholders in headers
    const substitutedHeaders = headers
        ? Object.fromEntries(
            Object.entries(headers).map(([key, value]) => [
                key,
                substitutePlaceholders(value, params),
            ])
        )
        : undefined;

    // Substitute placeholders in body
    let substitutedBody: RequestBody | undefined;
    if (body) {
        substitutedBody = {};
        for (const [key, value] of Object.entries(body)) {
            if (typeof value === 'string') {
                substitutedBody[key] = substitutePlaceholders(value, params);
            } else if (Array.isArray(value)) {
                substitutedBody[key] = value.map((item) =>
                    typeof item === 'string'
                        ? substitutePlaceholders(item, params)
                        : item
                );
            } else {
                substitutedBody[key] = value; // Numbers or booleans are copied as-is
            }
        }
    }

    return {
        url: substitutedUrl,
        method,
        headers: substitutedHeaders,
        body: substitutedBody,
    };
}

export async function POST(req: Request) {
    try {
        const action: BackendAction = await req.json();

        // Log the received action
        console.log('Received action:', JSON.stringify(action, null, 2));

        // Create dynamic zod schema from httpModel.parameters
        const parameterSchema = createParameterSchema(action.httpModel.parameters);

        // Define the tool with parameterized schema and execute
        const actionName = `ACTION_${action.name}`;
        const tools: Record<string, Tool> = {
            [actionName]: tool({
                description: action.description,
                parameters: parameterSchema,
                execute: async (params: Record<string, any>) => {
                    // Return the httpModel.request with placeholders substituted
                    return substituteRequestModel(action.httpModel.request, params);
                },
            }),
        };

        const executionResult = await tools[actionName].execute({
            foo: "somevalueforfoo",
            bar: "somevalueforbar",
            baz: "somevalueforbaz",
        }, undefined)


        console.log('Execution result:', JSON.stringify(executionResult, null, 2));
        // Return a simple JSON response (matching original)
        return NextResponse.json({ actionName: action.name }, { status: 201 });
    } catch (error) {
        console.error('Error processing request:', error);
        return NextResponse.json(
            { error: 'Failed to process action' },
            { status: 500 }
        );
    }
}