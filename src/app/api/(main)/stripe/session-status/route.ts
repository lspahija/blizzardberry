import Stripe from 'stripe';
import { NextResponse } from 'next/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get('session_id');
  if (!sessionId)
    return NextResponse.json({ error: 'Missing session_id' }, { status: 400 });

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    return NextResponse.json({
      status: session.status,
      customer_email: session.customer_details?.email,
    });
  } catch (err) {
    return NextResponse.json(
      { error: `Failed to retrieve session: ${(err as Error).message}` },
      { status: 500 }
    );
  }
}
