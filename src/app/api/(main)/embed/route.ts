import {NextResponse} from "next/server";
import {GEMINI_EMBEDDING_MODEL, googleGenAI} from "@/app/api/(main)/lib/EmbedShared";
import {supabaseClient} from "@/app/api/(main)/lib/Supabase";

export async function POST(request: Request) {
    const {text, metadata} = await request.json();

    // Generate embedding
    const response = await googleGenAI.models.embedContent({
        model: GEMINI_EMBEDDING_MODEL,
        contents: text,
    });

    // Extract the flat array of values from the embedding
    const embedding = response.embeddings[0].values;

    // Store in Supabase
    const {data, error} = await supabaseClient
        .from("documents")
        .insert({
            content: text,
            metadata,
            embedding,
        })
        .select();

    if (error) {
        console.error("Supabase insert error:", error);
        return NextResponse.json(
            {error: "Failed to store document"},
            {status: 500}
        );
    }

    return NextResponse.json({document: data[0]}, {status: 201});
}