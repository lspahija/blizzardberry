import { auth } from '@/lib/auth/auth';
import { NextResponse } from 'next/server';
import { getSubscription } from '@/app/api/lib/store/subscriptionStore';

export async function GET(_: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const subscription = await getSubscription(session.user.id);

    return NextResponse.json({ subscription }, { status: 200 });
  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}
