import Stripe from 'stripe';
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { pricing } from '@/app/api/(main)/stripe/pricingModel';
import {
  getSubscription,
  upsertSubscription,
} from '@/app/api/lib/store/subscriptionStore';

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
