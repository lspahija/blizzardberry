import {NextResponse} from "next/server";
import {tools} from "@/app/api/tools";

export async function GET(req: Request, { params }: { params: { actionName: string } }) {
    try {
        const { actionName } = params;

        if (!actionName) {
            return NextResponse.json(
                { error: 'Tool name is required' },
                { status: 400 }
            );
        }

        const tool = tools[actionName];

        if (!tool) {
            return NextResponse.json(
                { error: `Action '${actionName}' not found` },
                { status: 404 }
            );
        }

        return NextResponse.json({
            actionName,
            result: tool.execute(),
        });
    } catch (error) {
        console.error('Error retrieving action:', error);
        return NextResponse.json(
            { error: 'Failed to retrieve action information' },
            { status: 500 }
        );
    }
}