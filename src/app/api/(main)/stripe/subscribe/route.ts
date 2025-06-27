import Stripe from 'stripe';
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { pricing } from '@/app/api/(main)/stripe/pricingModel';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { tier } = (await req.json()) as { tier: string };

  const tierDetails = pricing.tiers[tier];

  if (!tierDetails)
    return NextResponse.json({ error: 'Invalid tier' }, { status: 400 });

  const checkoutSession = await stripe.checkout.sessions.create({
    customer_email: session.user.email,
    payment_method_types: ['card'],
    subscription_data: {
      metadata: {
        user_id: session.user.id,
        pricingName: tierDetails.name,
        credits: tierDetails.credits,
      },
    },
    line_items: [
      {
        price: tierDetails.priceId,
        quantity: 1,
      },
    ],
    mode: 'subscription',
    ui_mode: 'embedded',
    return_url: `${process.env.NEXT_PUBLIC_URL}/return?session_id={CHECKOUT_SESSION_ID}`,
  });

  return NextResponse.json({
    clientSecret: checkoutSession.client_secret,
    checkoutSessionId: checkoutSession.id,
  });
}
