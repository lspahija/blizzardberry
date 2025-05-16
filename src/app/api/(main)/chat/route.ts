import {streamText, tool, Tool} from 'ai';
import {z} from "zod";
import {CHATBOT_SYSTEM_MESSAGE} from '../lib/constants';
import {getLanguageModel} from '../lib/modelProvider';
import {getActions} from "@/app/api/(main)/lib/actionStore";
import {similaritySearch} from "@/app/api/(main)/lib/embedding";
import {
    BackendAction,
    Parameter,
    ParameterType,
    RequestBody,
    RequestModel
} from '@/app/api/(main)/lib/dataModel';

export async function POST(req: Request) {
    const {messages} = await req.json();

    const allTools = {
        ...await getToolsFromActions(),
        search_knowledge_base: createSearchKnowledgeBaseTool()
    };

    const result = streamText({
        model: getLanguageModel(),
        messages: messages,
        system: CHATBOT_SYSTEM_MESSAGE,
        tools: allTools,
        maxSteps: 5,
    });

    const data = await processStream(result);
    console.log('Processed stream:', JSON.stringify(data));
    return Response.json(data);
}

async function processStream(result) {
    let text = '';
    const toolCalls = [];
    const toolResults = [];

    for await (const part of result.fullStream) {
        switch (part.type) {
            case 'text-delta':
                text += part.textDelta;
                break;
            case 'tool-call':
                toolCalls.push({
                    toolCallId: part.toolCallId,
                    toolName: part.toolName,
                    args: part.args,
                });
                break;
            case 'tool-result':
                toolResults.push({
                    toolCallId: part.toolCallId,
                    toolName: part.toolName,
                    args: part.args,
                    result: part.result,
                });
                break;
        }
    }

    return {
        text,
        toolCalls,
        toolResults,
    };
}

function createSearchKnowledgeBaseTool(): Tool {
    return tool({
        description: "Search the knowledge base for information to answer user questions about the application",
        parameters: z.object({
            query: z.string().describe("The search query to find relevant information")
        }),
        execute: async ({query}) => {
            try {
                const groupedResults = await similaritySearch(query, 5)

                if (Object.keys(groupedResults).length === 0) {
                    return {message: "No relevant information found in the knowledge base."};
                }

                return {
                    results: groupedResults,
                    message: `Found ${Object.keys(groupedResults).length} relevant document groups that may help answer the query.`
                };
            } catch (error) {
                console.error("Error searching knowledge base:", error);
                return {
                    error: "Failed to search knowledge base",
                    message: "There was an error retrieving information from the knowledge base."
                };
            }
        }
    });
}

async function getToolsFromActions() {
    const actions = await getActions();

    const tools: Record<string, Tool> = {};
    for (const action of actions) {
        // Create dynamic zod schema from httpModel.parameters
        const parameterSchema = createParameterSchema(action.executionModel.parameters);

        tools[`ACTION: ${action.name}`] = tool({
            description: action.description,
            parameters: parameterSchema,
            execute: async (params: Record<string, any>) =>
                substituteRequestModel((action as BackendAction).executionModel.request, params), // TODO: support frontend actions
        })
    }
    return tools;
}

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