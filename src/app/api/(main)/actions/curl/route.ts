import { NextResponse } from 'next/server';
import parse from '@bany/curl-to-json';

export async function POST(req: Request) {
  const { content, actionName, description } = await req.json();

  const resultJSON = parse(content);

  // TODO: add the rest of this (check git history for previous code)

  return NextResponse.json({ actionName }, { status: 201 });
}
