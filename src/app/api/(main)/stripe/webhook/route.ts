import Stripe from 'stripe';
import { NextResponse } from 'next/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

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

  console.log(event);

  switch (event.type) {
    case 'customer.subscription.created':
    case 'customer.subscription.updated':
      const subscription = event.data.object as Stripe.Subscription;
      const tier = subscription.items.data[0].price.metadata.tier;
      const credits = parseInt(
        subscription.items.data[0].price.metadata.credits
      );
      const actions_limit = parseInt(
        subscription.items.data[0].price.metadata.actions_limit
      );

      console.log('subscription created or updated');

      break;

    case 'invoice.payment_succeeded':
      console.log('invoice payment succeeded');

      const invoice = event.data.object as Stripe.Invoice;
      if (invoice.billing_reason === 'subscription_cycle') {
        const sub = await stripe.subscriptions.retrieve(
          invoice.subscription as string
        );
        const credits = parseInt(sub.items.data[0].price.metadata.credits);
      }
      break;

    case 'checkout.session.completed':
      console.log('checkout session completed');

      const session = event.data.object as Stripe.Checkout.Session;
      if (session.mode === 'payment') {
        const credits = parseInt(session.metadata.credits);
      }
      break;
  }

  return NextResponse.json({ received: true });
}
