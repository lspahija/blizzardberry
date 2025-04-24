import { NextResponse } from "next/server";
import { inMemoryToolStore } from "@/app/api/lib/inMemoryToolStore";

export async function GET(req: Request, { params }: { params: Promise<{ actionName: string }> }) {
    const { actionName } = await params; // Await the params Promise

    const tool = inMemoryToolStore[actionName];

    if (!tool) {
        return NextResponse.json(
            { error: `Action '${actionName}' not found` },
            { status: 404 }
        );
    }

    return NextResponse.json({
        actionName,
        result: await tool.execute(),
    });
}