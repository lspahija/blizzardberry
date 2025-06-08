import { NextResponse } from 'next/server';
import { releaseExpiredHolds } from '@/app/api/lib/store/creditStore';

export async function POST(request: Request) {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (!authHeader || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await releaseExpiredHolds();
    return NextResponse.json(
      { message: 'Expired holds released successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error releasing expired holds:', error);
    return NextResponse.json(
      { error: 'Failed to release expired holds' },
      { status: 500 }
    );
  }
}
