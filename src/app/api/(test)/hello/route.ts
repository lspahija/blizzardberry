import { NextResponse } from 'next/server';
import sql from '@/app/api/lib/store/db';

export async function GET(req: Request) {
  console.log(req);

  const actions = await sql`
    select * from actions
  `;

  console.log(actions);

  return NextResponse.json({ message: 'Hello World' }, { status: 200 });
}
