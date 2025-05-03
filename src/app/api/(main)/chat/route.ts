import {streamText, tool, Tool} from 'ai';
import {z} from "zod";
import {CHATBOT_SYSTEM_MESSAGE} from '../lib/constants';
import {getLanguageModel} from '../lib/modelProvider';
import {getActions} from "@/app/api/(main)/lib/ActionStore";
import {similaritySearch} from "@/app/api/(main)/lib/embedding";

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

    return Response.json(await processStream(result));
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
        tools[`ACTION: ${action.name}`] = tool({
            description: action.description,
            parameters: z.object({}),
            execute: async () => action.httpModel,
        });
    }
    return tools;
}