import Stripe from 'stripe';
import { NextResponse } from 'next/server';
import { addCredit } from '@/app/api/lib/store/creditStore';

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

  console.log(JSON.stringify(event));

  /**
   * TODO: log all of these events and see what is useful
   * 'customer.subscription.created', 'customer.subscription.updated', 'customer.subscription.deleted', 'invoice.payment_succeeded', 'checkout.session.completed'
   *  Upsert subscriptions table when user subscribes to new tier
   *  just increase user's credits and modify their subscription expiration to be a month from now
   *  Expire or delete subscriptions table record when subscription expires e.g. if it's deleted or not renewed
   *  How do we normally renew it?
   *  how does Chatbase's screen look for switching to a higher subscription tier?
   */

  if (event.type === 'invoice.payment_succeeded') {
    const invoice = event.data.object as Stripe.Invoice;
    if (
      invoice.billing_reason === 'subscription_create' ||
      invoice.billing_reason === 'subscription_cycle'
    ) {
      const sub = await stripe.subscriptions.retrieve(
        invoice.lines.data[0].parent?.subscription_item_details?.subscription,
        { expand: ['items.data.price'] }
      );
      const userId = sub.metadata.user_id;
      const credits = parseInt(sub.metadata.credits);
      const tierName = sub.metadata.pricingName;
      const renewAt = new Date(sub.items.data[0]?.current_period_end * 1000);

      console.log(
        `subscription created or cycled: userId: ${userId}, tierName: ${tierName}, credits: ${credits}, renewAt: ${renewAt}`
      );

      await addCredit(userId, credits, invoice.id, renewAt);
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

      await addCredit(userId, credits, checkoutSession.id, null);
    }
  }

  return NextResponse.json({ received: true });
}
