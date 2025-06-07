import Stripe from 'stripe';
import { NextResponse } from 'next/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// ──────────────────────────────────────────────────────────────────────────────
// Helper – stub out your own persistence layer here
// ──────────────────────────────────────────────────────────────────────────────
async function addCreditsToUser(
  userId: string,
  credits: number,
  renewAt?: Date | null
) {
  /* TODO: upsert credits, tier, renewal date in your DB */
}

// ──────────────────────────────────────────────────────────────────────────────
// Webhook route
// ──────────────────────────────────────────────────────────────────────────────
export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature') as string;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    return NextResponse.json(
      { error: `Webhook Error: ${(err as Error).message}` },
      { status: 400 }
    );
  }

  switch (event.type) {
    // ────────────────────────────────────────────────────────────────────
    // 1) New subscription or plan change  ───────────────────────────────
    // ────────────────────────────────────────────────────────────────────
    case 'customer.subscription.created':
    case 'customer.subscription.updated': {
      const sub = event.data.object as Stripe.Subscription;

      const userId = sub.metadata.user_id; // from /subscribe route
      const tier = sub.items.data[0].price.metadata.tier;
      const credits = parseInt(sub.items.data[0].price.metadata.credits);
      const renewAt = new Date(sub.current_period_end * 1000); // exact renewal datetime

      await addCreditsToUser(userId, credits, renewAt);
      break;
    }

    // ────────────────────────────────────────────────────────────────────
    // 2) Monthly renewal (recurring invoice)  ───────────────────────────
    // ────────────────────────────────────────────────────────────────────
    case 'invoice.payment_succeeded': {
      const invoice = event.data.object as Stripe.Invoice;

      if (invoice.billing_reason === 'subscription_cycle') {
        const sub = await stripe.subscriptions.retrieve(
          invoice.subscription as string,
          { expand: ['items.data.price'] }
        );

        const userId = sub.metadata.user_id;
        const credits = parseInt(sub.items.data[0].price.metadata.credits);
        const renewAt = new Date(sub.current_period_end * 1000);

        await addCreditsToUser(userId, credits, renewAt);
      }
      break;
    }

    // ────────────────────────────────────────────────────────────────────
    // 3) One-time “buy credits” checkout  ────────────────────────────────
    // ────────────────────────────────────────────────────────────────────
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;

      // Only care about one-time payments (mode === 'payment')
      if (session.mode === 'payment') {
        const userId = session.metadata.user_id;
        const credits = parseInt(session.metadata.credits); // “1000” from buy-credits route

        await addCreditsToUser(userId, credits, null);
      }
      break;
    }

    // (optional) handle cleanup on subscription.deleted, payment_failed, etc.
  }

  return NextResponse.json({ received: true });
}
