import { NextResponse } from 'next/server';
import { expireBatches } from '@/app/api/lib/store/creditStore';

export async function POST(request: Request) {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (!authHeader || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await expireBatches();
    return NextResponse.json(
      { message: 'Expired batches processed successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error expiring batches:', error);
    return NextResponse.json(
      { error: 'Failed to expire batches' },
      { status: 500 }
    );
  }
}
