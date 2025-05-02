import {streamText, tool, Tool} from 'ai';
import {z} from "zod";
import {getLanguageModel} from "@/app/api/(main)/lib/modelProvider";

export async function POST(req: Request) {
    const {messages} = await req.json();

    const allTools = {
        generate_personalized_recommendation: createPersonalizedRecommendationTool()
    };

    const result = streamText({
        model: getLanguageModel(),
        messages: messages,
        system: "You are a helpful assistant. When a tool requires specific parameters (like userId or preferences), check if you have the necessary information. If any parameters are missing, ask the user to provide them clearly before proceeding with the tool. Do not guess or assume values.",
        tools: allTools,
        maxSteps: 5,
    });

    return result.toDataStreamResponse()
}

function createPersonalizedRecommendationTool(): Tool {
    return tool({
        description: "Generate a personalized recommendation. Requires a valid user ID and explicit user preferences provided by the user. Ask the user for these if not provided.",
        parameters: z.object({
            userId: z.string().describe("The unique identifier of the user"),
            preferences: z.array(z.string()).describe("List of user preferences (e.g., genres, categories, or interests)")
        }),
        execute: async ({userId, preferences}) => {
            try {
                if (!userId || preferences.length === 0) {
                    return {
                        error: "Missing required parameters",
                        message: "I need your user ID and preferences to generate a recommendation. Please provide them."
                    };
                }

                // Mock recommendation result
                const recommendation = {
                    userId,
                    recommendedItems: preferences.map(pref => `Item related to ${pref}`),
                    message: `Generated recommendations for user ${userId} based on preferences: ${preferences.join(", ")}`
                };

                return recommendation;
            } catch (error) {
                console.error("Error generating recommendation:", error);
                return {
                    error: "Failed to generate recommendation",
                    message: "There was an error processing the recommendation request."
                };
            }
        }
    });
}
