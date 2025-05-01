import {NextResponse} from "next/server";
import {similaritySearch} from "@/app/api/(main)/lib/embedding";

export async function POST(request: Request) {
    try {
        const { query, topK = 3 } = await request.json();

        const groupedResults = await similaritySearch(query, topK)

        return NextResponse.json({ results: groupedResults }, { status: 200 });
    } catch (error) {
        console.error("Search error:", error);
        return NextResponse.json({ error: "Failed to perform search" }, { status: 500 });
    }
}