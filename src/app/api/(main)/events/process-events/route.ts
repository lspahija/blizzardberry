import { processPending } from '@/app/api/lib/store/eventProcessor';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (!authHeader || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const batchSize = 30;
  let handled: number;
  do {
    handled = await processPending(batchSize);
  } while (handled === batchSize); // keep going while we “filled the bucket”

  return new Response('ok');
}
