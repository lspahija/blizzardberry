import Stripe from 'stripe';
import { NextResponse } from 'next/server';
import { addCredit } from '@/app/api/lib/store/creditStore';
import { upsertSubscription } from '@/app/api/lib/store/subscriptionStore';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  const rawBody = await req.text();
  const sig = req.headers.get('stripe-signature') as string;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    return NextResponse.json(
      { error: `Webhook Error: ${(err as Error).message}` },
      { status: 400 }
    );
  }

  if (event.type === 'invoice.payment_succeeded') {
    const invoice = event.data.object as Stripe.Invoice;
    if (
      ['subscription_create', 'subscription_cycle'].includes(
        invoice.billing_reason
      )
    ) {
      const sub = await stripe.subscriptions.retrieve(
        invoice.lines.data[0].parent?.subscription_item_details?.subscription,
        { expand: ['items.data.price'] }
      );
      const userId = sub.metadata.user_id;
      const credits = parseInt(sub.metadata.credits);
      const tierName = sub.metadata.pricingName;
      const renewAt = new Date(sub.items.data[0]?.current_period_end * 1000);
      const subscriptionItemId = sub.items.data[0].id;

      console.log(
        `handling ${event.type} with billing reason ${invoice.billing_reason} for userId: ${userId}, tierName: ${tierName}, credits: ${credits}, renewAt: ${renewAt}`
      );

      await addCredit(userId, credits, event.id, renewAt);
      await upsertSubscription(
        userId,
        sub.id,
        subscriptionItemId,
        tierName,
        renewAt
      );
    }
  }

  if (event.type === 'customer.subscription.updated') {
    const sub = event.data.object as Stripe.Subscription;
    const userId = sub.metadata.user_id;
    const credits = parseInt(sub.metadata.credits);
    const tierName = sub.metadata.pricingName;
    const renewAt = new Date(sub.items.data[0]?.current_period_end * 1000);
    const subscriptionItemId = sub.items.data[0].id;

    console.log(
      `handling ${event.type} for userId: ${userId}, tierName: ${tierName}, credits: ${credits}, renewAt: ${renewAt}`
    );

    await addCredit(userId, credits, event.id, renewAt);
    await upsertSubscription(
      userId,
      sub.id,
      subscriptionItemId,
      tierName,
      renewAt
    );
  }

  if (event.type === 'checkout.session.completed') {
    const checkoutSession = event.data.object as Stripe.Checkout.Session;

    if (
      checkoutSession.mode === 'payment' &&
      checkoutSession.payment_status === 'paid'
    ) {
      const metadata = checkoutSession.metadata;
      const userId = metadata.user_id;
      const pricingName = metadata.pricingName;
      const credits = parseInt(metadata.credits);

      console.log(
        `one time credit purchase paid: userId: ${userId}, pricingName: ${pricingName}, credits: ${credits}`
      );

      await addCredit(userId, credits, checkoutSession.id, null);
    }
  }

  return NextResponse.json({ received: true });
}
