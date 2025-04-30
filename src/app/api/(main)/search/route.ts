import {NextRequest, NextResponse} from 'next/server';
import {SupabaseVectorStore} from '@llamaindex/supabase';
import {createPartFromText, GoogleGenAI} from '@google/genai';
import {supabaseClient} from "@/app/api/(main)/lib/Supabase";
import {TextNode} from '@llamaindex/core/schema';
import {VectorStoreQueryMode} from "@llamaindex/core/vector-store";

// Define request body interface
interface SearchRequest {
    query: string;
    topK?: number;
}

// Define response interface
interface SearchResult {
    text: string;
    metadata: Record<string, any>;
    similarity: number;
}

// Initialize Google GenAI client
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

// Custom embedding function for Gemini
async function getGeminiEmbedding(text: string): Promise<number[]> {
    const response = await ai.models.embedContent({
        model: 'gemini-embedding-exp-03-07',
        contents: createPartFromText(text),
    });
    return response.embeddings?.[0]?.values || []; // Handle Gemini API response
}

// Initialize Supabase vector store
const vectorStore = new SupabaseVectorStore({
    client: supabaseClient,
    table: 'documents',
});

// POST /api/search
export async function POST(req: NextRequest) {
    try {
        const body: SearchRequest = await req.json();
        if (!body.query) {
            return NextResponse.json({ error: 'Query text is required' }, { status: 400 });
        }

        // Generate embedding for the query
        const queryEmbedding = await getGeminiEmbedding(body.query);
        if (!queryEmbedding.length) {
            throw new Error('Failed to generate query embedding');
        }

        // Perform similarity search
        const queryResult = await vectorStore.query({
            queryEmbedding,
            similarityTopK: body.topK || 5,
            mode: VectorStoreQueryMode.DEFAULT
        });

        // Format results, explicitly typing nodes as TextNode
        const formattedResults: SearchResult[] = queryResult.nodes.map((node: TextNode, index) => ({
            text: node.text, // Use text property from TextNode
            metadata: node.metadata,
            similarity: queryResult.similarities[index] || 0,
        }));

        return NextResponse.json({ results: formattedResults }, { status: 200 });
    } catch (error) {
        console.error('Search error:', error);
        return NextResponse.json({ error: 'Failed to search' }, { status: 500 });
    }
}