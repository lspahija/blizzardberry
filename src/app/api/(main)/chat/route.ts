import {callAIModel} from "@/app/api/(main)/lib/llm";

export async function POST(req: Request) {
    const { messages, metadata } = await req.json();

    return Response.json(
        await callAIModel(messages, metadata)
    );
}