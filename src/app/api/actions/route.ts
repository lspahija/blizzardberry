import {NextResponse} from 'next/server';
import {createAction, getActions} from "@/app/api/lib/ActionStore";
import parse from "@bany/curl-to-json";
import {Method} from "@/app/api/lib/model";

export async function POST(req: Request) {
    const {content, actionName, description} = await req.json();

    const resultJSON = parse(content);

    const httpModel = {
        url: resultJSON.url,
        method: resultJSON.method ? (resultJSON.method.toUpperCase() as Method) : ('GET' as Method),
        headers: resultJSON.header || undefined,
        queryParams: resultJSON.params || undefined,
        body: resultJSON.data || undefined,
    };

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