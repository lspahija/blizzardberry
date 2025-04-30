import {NextResponse} from "next/server";
import {vectorStore} from "@/app/api/(main)/lib/embedding";

export async function POST(request: Request) {
    try {
        const { query, topK = 3 } = await request.json();

        // Perform similarity search with score
        const resultsWithScore = await vectorStore.similaritySearchWithScore(query, topK);

        // Group results by parent_document_id
        const groupedResults = resultsWithScore.reduce((acc: Record<string, any[]>, [doc, score]) => {
            const parentId = doc.metadata.parent_document_id || "no_parent";
            if (!acc[parentId]) {
                acc[parentId] = [];
            }
            acc[parentId].push({
                id: doc.metadata.id || doc.metadata.document_id || "unknown", // Fallback ID
                parent_document_id: doc.metadata.parent_document_id,
                content: doc.pageContent,
                metadata: doc.metadata,
                similarity: score, // Use score from similaritySearchWithScore
            });
            return acc;
        }, {});

        return NextResponse.json({ results: groupedResults }, { status: 200 });
    } catch (error) {
        console.error("Search error:", error);
        return NextResponse.json({ error: "Failed to perform search" }, { status: 500 });
    }
}