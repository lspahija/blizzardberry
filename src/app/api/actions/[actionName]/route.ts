import {NextResponse} from "next/server";
import {getAction} from "@/app/api/lib/ActionStore";

export async function GET(_: Request, { params }: { params: Promise<{ actionName: string }> }) {
    const { actionName } = await params;

    const action = await getAction(actionName);

    if (!action) {
        return NextResponse.json(
            { error: `Action '${actionName}' not found` },
            { status: 404 }
        );
    }

    return NextResponse.json({
        actionName,
        result: await action.execute(),
    });
}