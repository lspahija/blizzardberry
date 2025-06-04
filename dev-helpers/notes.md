immediate todo:

- onboard Stripe - I set up Stripe for Brothers of Ostia in November 2024 and it was a pain. [Here's the repo](https://github.com/lucidity-labs/ostians). Maybe the Stripe docs have improved in the meantime though.
    - have credits? Different models cost different amounts of credits per token.
    - have three tiers of subscriptions with each giving the user a certain amount of credits per month (we want this so we make money even if nobody uses the user's app). these credits don't roll over to the next month i.e. they expire 30 days after purchase. offer a fourth enterprise tier where they contact us
    - allow the user to buy more credits if they run out but these don't expire i.e. they roll over to the next month
    - each tier contains a limited number of actions
- [finish onboarding](#posthog) PostHog for analytics



mapping of credits per token for each model
make credits have an expiration date that can be null if they don't expire





Q: wait so say my user wants to access an LLM i am providing them. they pay for this with credits. i don't know how many tokens they will use yet so i create a hold for some amount? does that make sense? that hold amount is min(100, <amount they have left>). when i see how many tokens they've actually used, i actually subtract that amount from their balance and release the hold? does all this make sense or is there a better way to do it?

o3 A:

Yes — thinking in terms of holds (sometimes called “authorisations” or “pre-authorisations”, like with a credit-card) is the right mental model for usage you can’t price up-front, such as an LLM request whose token count is unknown until it finishes streaming.

Below is a pattern that works well in practice and keeps every constraint in the database so you never over-draw a user’s balance.

⸻

1. Schema recap

CREATE TABLE user_credit (
user_id  bigint PRIMARY KEY,
balance  numeric NOT NULL CHECK (balance >= 0)
);

CREATE TABLE credit_hold (
hold_id  bigserial PRIMARY KEY,
user_id  bigint REFERENCES user_credit(user_id),
amount   numeric NOT NULL CHECK (amount > 0),
reserved_at timestamptz DEFAULT now(),
status   text NOT NULL CHECK (status IN ('pending','used','canceled'))
);
CREATE INDEX credit_hold_pending_idx
ON credit_hold(user_id)
WHERE status = 'pending';

balance is the fully settled “real” amount the user owns.
credit_hold rows are already committed reservations, so every session sees them.

⸻

2. Start of the LLM call – place a hold

BEGIN;

-- 1) Lock the balance row so concurrent holds serialise cleanly
SELECT 1 FROM user_credit
WHERE user_id = :uid
FOR UPDATE;

-- 2) Compute available = balance – Σ(pending holds)
WITH pending AS (
SELECT COALESCE(SUM(amount),0) AS held
FROM credit_hold
WHERE user_id = :uid AND status = 'pending'
)
INSERT INTO credit_hold (user_id, amount, status)
SELECT :uid,
LEAST(100, (SELECT balance FROM user_credit WHERE user_id = :uid) - (SELECT held FROM pending)),
'pending'
WHERE (SELECT balance FROM user_credit WHERE user_id = :uid) - (SELECT held FROM pending) > 0
RETURNING hold_id, amount;          -- you’ll need the hold_id later

-- If no row inserted ⇒ user had zero available credits
COMMIT;

Why this is safe
•	The row-level lock guarantees no two holds are created from the same starting balance.
•	The LEAST(100, available) logic enforces your “max 100 tokens per request” rule while still taking whatever is left if they have <100 credits.
•	The hold is now visible to all other transactions, so a second concurrent request would see a lower available figure immediately.

⸻

3. Streaming / counting tokens

You stream tokens to the user and keep a running actual_tokens counter in application memory (or write progress into a job table if you need durability). Nothing has to hit the database during the stream.

⸻

4. End of the call – settle the hold

Assume actual_tokens = 63 (costing 63 credits) and the hold row reserved 100:

BEGIN;

-- a) Mark the hold *used* and remember how much we actually needed
UPDATE credit_hold
SET status = 'used',
amount = :actual_tokens        -- shrink the held amount to the real cost
WHERE hold_id = :hold_id
AND status = 'pending';

-- b) Deduct the real cost from the balance
UPDATE user_credit
SET balance = balance - :actual_tokens
WHERE user_id = :uid;

COMMIT;

If actual_tokens ends up higher than the held amount (e.g. 120 > 100) you have two choices:
1.	Re-authorise: run the “place a hold” logic again to reserve the extra 20 before streaming further.
2.	Post-charge: at the end try to deduct the difference; if it would over-draw, abort the transaction and treat it as “payment required”.

Most shops pick (1) because it never lets the user run negative.

⸻

5. Cancelled / failed calls

If the request is aborted midway:

UPDATE credit_hold
SET status = 'canceled'
WHERE hold_id = :hold_id
AND status = 'pending';

Because cancelled holds are excluded by the partial index they immediately disappear from the “held” total and the credits become available for other calls.

⸻

6. Performance & concurrency notes
   •	Lock duration is tiny (only the single “create hold” statement). The expensive LLM generation happens after the transaction has committed, so you’re not holding rows or connections open while the model runs.
   •	If you prefer optimistic concurrency, you can drop the FOR UPDATE, run under SERIALIZABLE, and simply retry the transaction on a 40001 serialization failure instead of blocking.
   •	All business-critical invariants (“balance never < 0”, “tokens can’t be double-spent”) live inside the database where they are safest.

⸻

Is there a “better” way?

For usage-priced services this hold → settle flow is the industry standard; it’s exactly how payment gateways authorise a card before they know the final bill. The two places you might improve it are:
•	Granularity of the hold – 100 tokens is arbitrary; you could hold the entire balance to guarantee one uninterrupted request.
•	Auto-top-up – if a post-charge would over-draw, automatically purchase more credits via the user’s saved payment method, then settle.

But the basic pattern is sound, scalable, and fully ACID-safe.





this is what grok wants for stripe:

CREATE TABLE subscriptions (
id SERIAL PRIMARY KEY,
user_id UUID REFERENCES users(id),
stripe_subscription_id TEXT UNIQUE,
tier TEXT CHECK (tier IN ('basic', 'pro', 'premium')),
credits INTEGER NOT NULL,
actions_limit INTEGER NOT NULL,
created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
expires_at TIMESTAMP WITH TIME ZONE,
active BOOLEAN DEFAULT TRUE
);

CREATE TABLE credit_transactions (
id SERIAL PRIMARY KEY,
user_id UUID REFERENCES users(id),
credits INTEGER NOT NULL,
type TEXT CHECK (type IN ('subscription', 'purchase')),
stripe_payment_id TEXT,
created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
expires_at TIMESTAMP WITH TIME ZONE
);



import Stripe from 'stripe';
import { NextResponse } from 'next/server';
import { supabaseClient } from '@/app/api/lib/store/supabase';

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
      const { error } = await supabaseClient.from('subscriptions').upsert({
        user_id: subscription.metadata.user_id,
        stripe_subscription_id: subscription.id,
        tier,
        credits,
        actions_limit,
        expires_at: new Date(
          Date.now() + 30 * 24 * 60 * 60 * 1000
        ).toISOString(),
        active: subscription.status === 'active',
      });
      if (error) throw error;

      await supabaseClient.from('credit_transactions').insert({
        user_id: subscription.metadata.user_id,
        credits,
        type: 'subscription',
        stripe_payment_id: subscription.id,
        expires_at: new Date(
          Date.now() + 30 * 24 * 60 * 60 * 1000
        ).toISOString(),
      });
      break;

    case 'invoice.payment_succeeded':
      console.log('invoice payment succeeded');

      const invoice = event.data.object as Stripe.Invoice;
      if (invoice.billing_reason === 'subscription_cycle') {
        const sub = await stripe.subscriptions.retrieve(
          invoice.subscription as string
        );
        const credits = parseInt(sub.items.data[0].price.metadata.credits);
        await supabaseClient.from('credit_transactions').insert({
          user_id: sub.metadata.user_id,
          credits,
          type: 'subscription',
          stripe_payment_id: invoice.id,
          expires_at: new Date(
            Date.now() + 30 * 24 * 60 * 60 * 1000
          ).toISOString(),
        });
      }
      break;

    case 'checkout.session.completed':
      console.log('checokut session completed');

      const session = event.data.object as Stripe.Checkout.Session;
      if (session.mode === 'payment') {
        const credits = parseInt(session.metadata.credits);
        await supabaseClient.from('credit_transactions').insert({
          user_id: session.metadata.user_id,
          credits,
          type: 'purchase',
          stripe_payment_id: session.payment_intent as string,
        });
      }
      break;
}

return NextResponse.json({ received: true });
}
