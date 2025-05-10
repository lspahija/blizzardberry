import {NextResponse} from "next/server";
import {getActions} from "@/app/api/(main)/lib/actionStore";

export async function GET(_: Request) {
    return NextResponse.json(await getActions());
}