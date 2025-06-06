import Stripe from 'stripe';
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(_: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const checkoutSession = await stripe.checkout.sessions.create({
    customer_email: session.user.email,
    payment_method_types: ['card'],
    line_items: [
      {
        price: process.env.THOUSAND_CREDITS_PRICE_ID,
        quantity: 1,
      },
    ],
    metadata: { user_id: session.user.id, credits: '1000' },
    mode: 'payment',
    ui_mode: 'embedded',
    return_url: `${process.env.NEXT_PUBLIC_URL}/return?session_id={CHECKOUT_SESSION_ID}`,
  });

  return NextResponse.json({
    clientSecret: checkoutSession.client_secret,
    checkoutSessionId: checkoutSession.id,
  });
}
