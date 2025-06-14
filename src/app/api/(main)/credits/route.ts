import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import sql from '@/app/api/lib/store/db';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = session.user.id;
  const [row] = await sql`
    SELECT active_credits FROM user_credit_summary WHERE user_id = ${userId}
  `;
  return NextResponse.json({ credits: row?.active_credits ?? 0 });
} 