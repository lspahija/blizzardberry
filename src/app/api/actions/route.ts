import {NextResponse} from 'next/server';
import {createAction, getActions} from "@/app/api/lib/ActionStore";
import {map} from "@/app/api/lib/mapper";

export async function POST(req: Request) {
    const {content, actionName, description} = await req.json();

    let httpModel = map(content);
    createAction(actionName, httpModel, description);

    return NextResponse.json(
        {actionName},
        {status: 201}
    );
}

export async function GET(_: Request) {
    const actions = await Promise.all(
        Object.entries(getActions()).map(async ([key, action]) => ({
            key,
            result: await action.execute()
        }))
    );

    return NextResponse.json({actions});
}