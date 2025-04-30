import { NextRequest, NextResponse } from 'next/server';
import { Document, TextNode } from 'llamaindex'; // Import TextNode for type safety
import { SupabaseVectorStore } from '@llamaindex/supabase';
import { SentenceSplitter } from '@llamaindex/core/node-parser';
import { createPartFromText, GoogleGenAI } from '@google/genai';
import { supabaseClient } from "@/app/api/(main)/lib/Supabase";

// Define request body interface
interface EmbedRequest {
    text: string;
    metadata?: Record<string, any>;
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

const vectorStore = new SupabaseVectorStore({
    client: supabaseClient,
    table: 'documents',
});

// POST /api/embed
export async function POST(req: NextRequest) {
    try {
        const body: EmbedRequest = await req.json();
        if (!body.text) {
            return NextResponse.json({ error: 'Text is required' }, { status: 400 });
        }

        // Create LlamaIndex document
        const document = new Document({
            text: body.text,
            metadata: body.metadata || {},
        });

        // Split the document using SentenceSplitter
        const splitter = new SentenceSplitter({
            chunkSize: 512,
            chunkOverlap: 20,
            separator: ' ',
            paragraphSeparator: '\n\n',
            secondaryChunkingRegex: '[.!?]',
        });
        const nodes = splitter.getNodesFromDocuments([document]) as TextNode[];

        // Generate embeddings and store in Supabase
        for (const node of nodes) {
            const embedding = await getGeminiEmbedding(node.text!);
            if (!embedding.length) {
                throw new Error('Failed to generate embedding for node');
            }

            // Attach embedding to the node and pass the original node
            node.embedding = embedding; // Add embedding to the TextNode
            await vectorStore.add([node]); // Pass the original TextNode
        }

        return NextResponse.json({ message: 'Text embedded and stored successfully' }, { status: 200 });
    } catch (error) {
        console.error('Embedding error:', error);
        return NextResponse.json({ error: 'Failed to process text' }, { status: 500 });
    }
}