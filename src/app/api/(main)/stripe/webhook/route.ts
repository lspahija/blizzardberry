import Stripe from 'stripe';
import { NextResponse } from 'next/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

/* ────────────────────────────────────────────────────────────────────────── */
/* Stubs – replace with your DB logic & idempotency checks                    */
/* ────────────────────────────────────────────────────────────────────────── */
async function addCredits(
  userId: string,
  credits: number,
  renewAt: Date | null,
  stripeId: string
) {
  /* 1. ensure stripeId (event / invoice / session) hasn’t been processed
     2. update user’s credit balance
     3. store renewAt if not null
  */
}

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
      invoice.billing_reason === 'subscription_create' ||
      invoice.billing_reason === 'subscription_cycle'
    ) {
      const subscriptionId =
        invoice.lines.data[0].parent?.subscription_item_details?.subscription;
      const sub = await stripe.subscriptions.retrieve(subscriptionId, {
        expand: ['items.data.price'],
      });

      const userId = sub.metadata.user_id;
      const credits = parseInt(sub.metadata.credits);
      const tierName = sub.metadata.pricingName;
      const renewAt = new Date(sub.items.data[0]?.current_period_end * 1000);

      console.log(
        `subscription created or cycled: userId: ${userId}, tierName: ${tierName} credits: ${credits}, renewAt: ${renewAt}`
      );

      await addCredits(userId, credits, renewAt, invoice.id);
    }
  }

  if (event.type === 'checkout.session.completed') {
    const checkoutSession = event.data.object as Stripe.Checkout.Session;

    if (
      checkoutSession.mode === 'payment' &&
      checkoutSession.payment_status === 'paid'
    ) {
      const userId = checkoutSession.metadata.user_id;
      const pricingName = checkoutSession.metadata.pricingName;
      const credits = parseInt(checkoutSession.metadata.credits);

      console.log(
        `one time credit purchase paid: userId: ${userId}, pricingName: ${pricingName}, credits: ${credits}`
      );

      await addCredits(userId, credits, null, checkoutSession.id);
    }
  }

  return NextResponse.json({ received: true });
}
