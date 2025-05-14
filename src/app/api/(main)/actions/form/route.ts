import { createAction } from "@/app/api/(main)/lib/actionStore";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const action = await req.json();

    console.log(JSON.stringify(action));

    // await createAction(name, httpModel, description, location, frontendModel);

    return NextResponse.json({ actionName: "name" }, { status: 201 });
}