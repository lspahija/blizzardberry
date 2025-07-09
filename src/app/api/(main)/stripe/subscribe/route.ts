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

interface RequestBody {
  tier: string;
}

async function activateFreeTier(
  userId: string,
  tierDetails: (typeof pricing.tiers)[string]
) {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days from now

  await addCredit(
    userId,
    tierDetails.credits,
    `${userId}_${tierDetails.name}`,
    expiresAt
  );
  await upsertSubscription(userId, null, null, tierDetails.name, null);
  return NextResponse.json({ message: 'Free tier activated.' });
}

async function createNewStripeSubscription(
  user: { id: string; email: string },
  tierDetails: (typeof pricing.tiers)[string]
) {
  const checkoutSession = await stripe.checkout.sessions.create({
    customer_email: user.email,
    payment_method_types: ['card'],
    subscription_data: {
      metadata: {
        user_id: user.id,
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

async function updateExistingStripeSubscription(
  userId: string,
  subscription: NonNullable<Awaited<ReturnType<typeof getSubscription>>>,
  tierDetails: (typeof pricing.tiers)[string]
) {
  const updatedSubscription = await stripe.subscriptions.update(
    subscription.stripeSubscriptionId,
    {
      items: [
        {
          id: subscription.stripeSubscriptionItemId,
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

  return NextResponse.json({
    updatedSubscriptionId: updatedSubscription.id,
  });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { tier } = (await req.json()) as RequestBody;
  const tierDetails = pricing.tiers[tier];

  if (!tierDetails) {
    return NextResponse.json({ error: 'Invalid tier' }, { status: 400 });
  }

  const userId = session.user.id;
  const subscription = await getSubscription(userId);

  if (subscription.stripeSubscriptionId) {
    return updateExistingStripeSubscription(userId, subscription, tierDetails);
  }

  if (tierDetails.name.toLowerCase() === 'free') {
    return activateFreeTier(userId, tierDetails);
  }
  return createNewStripeSubscription(
    { id: userId, email: session.user.email },
    tierDetails
  );
}
