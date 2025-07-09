import Stripe from 'stripe';
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { pricing } from '@/app/api/(main)/stripe/pricingModel';
import {
  getSubscription,
  upsertSubscription,
} from '@/app/api/lib/store/subscriptionStore';
import { addCredit } from '@/app/api/lib/store/creditStore';

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

  const userId = session.user.id;

  const subscription = await getSubscription(userId);

  if (!subscription) {
    if (tierDetails.name === 'free') {
      await addCredit(
        userId,
        tierDetails.credits,
        `${userId}_${tierDetails.name}`,
        null
      );
      await upsertSubscription(userId, null, tierDetails.name, null);
      return NextResponse.json({ message: 'Free tier activated.' });
    }
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
      line_items: [{ price: tierDetails.priceId, quantity: 1 }],
      mode: 'subscription',
      ui_mode: 'embedded',
      return_url: `${process.env.NEXT_PUBLIC_URL}/return?session_id={CHECKOUT_SESSION_ID}`,
    });

    return NextResponse.json({
      clientSecret: checkoutSession.client_secret,
      checkoutSessionId: checkoutSession.id,
    });
  }

  const updatedSubscription = await stripe.subscriptions.update(
    subscription.id,
    {
      items: [
        {
          id: subscription.stripeSubscriptionId,
          price: tierDetails.priceId,
        },
      ],
      proration_behavior: 'none',
      metadata: {
        user_id: userId,
        pricingName: tierDetails.name,
        credits: tierDetails.credits,
      },
    }
  );

  const expiresAt = new Date(
    updatedSubscription.items.data[0]?.current_period_end * 1000
  );

  await upsertSubscription(
    userId,
    subscription.id,
    tierDetails.name,
    expiresAt
  );

  return NextResponse.json({
    updatedSubscriptionId: updatedSubscription.id,
  });
}
