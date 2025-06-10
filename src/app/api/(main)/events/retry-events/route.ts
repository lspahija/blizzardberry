import {
  processPending,
  retryStuckEvents,
} from '@/app/api/lib/store/eventProcessor';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (!authHeader || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await retryStuckEvents();

  return new Response('ok');
}
