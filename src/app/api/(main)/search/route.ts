import {NextResponse} from "next/server";
import {GEMINI_EMBEDDING_MODEL, googleGenAI} from "@/app/api/(main)/lib/EmbedShared";
import {supabaseClient} from "@/app/api/(main)/lib/Supabase";

export async function POST(request: Request) {
    const { query, topK = 3 } = await request.json();

    // Generate embedding for the query
    const response = await googleGenAI.models.embedContent({
        model: GEMINI_EMBEDDING_MODEL,
        contents: query,
    });

    // Extract the flat array of values from the embedding
    const queryEmbedding = response.embeddings[0].values;

    // Call the search_documents function
    const { data, error } = await supabaseClient
        .rpc("search_documents", {
            query_embedding: queryEmbedding,
            top_k: topK,
        });

    if (error) {
        console.error("Supabase search error:", error);
        return NextResponse.json(
            { error: "Failed to perform search" },
            { status: 500 }
        );
    }

    return NextResponse.json({ results: data }, { status: 200 });
}