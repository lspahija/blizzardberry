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








my prompt:
i have a SaaS where users can sign up for different tiers, and they get various amounts of credits in each tier and these credits expire after a month if they haven't been used, but i also let them purchase more credits a la carte which don't expire (they must be in some tier though).

I'm using next.js typescript and postgres.

how can i make this work? like is it some sort of fifo or something? how do companies normally do this? architect this for me



o3 response:
Below is a practical, battle-tested pattern that many SaaS businesses follow when they sell a monthly expiring allowance plus evergreen (“a-la-carte”) credits.  It fits naturally in Next.js (API Routes / Route Handlers or the new Server Actions), TypeScript, and Postgres.

⸻

1. Core ideas

Concept	Why it matters
Credit Batch	Treat every grant of credits as a batch with its own metadata (source, created_at, expires_at, quantity_remaining).  You never store a single “balance” number in the user row.
Ledger / Double-entry	Record every debit/credit as an immutable row so you can audit, roll back, and reconcile.
“Soonest-to-expire first” algorithm	When spending, always draw from the batch that will expire soonest (NULL = never). This protects the customer and is easy to reason about.
Atomic DB transaction	All debits of multiple batches happen in a single SERIALIZABLE or REPEATABLE READ transaction with row-level locks to avoid race conditions.


⸻

2. Database schema (Postgres)

-- users --------------------------------------------------------------
CREATE TABLE users (
id              BIGSERIAL PRIMARY KEY,
email           CITEXT UNIQUE NOT NULL,
current_tier    TEXT NOT NULL,                -- e.g. 'starter' / 'growth'
tier_cycle_end  TIMESTAMPTZ NOT NULL          -- next renewal date
);

-- credit_batches -----------------------------------------------------
CREATE TYPE credit_source AS ENUM ('tier_allowance','alacarte_purchase','manual_adjust');

CREATE TABLE credit_batches (
id                  BIGSERIAL PRIMARY KEY,
user_id             BIGINT REFERENCES users(id) ON DELETE CASCADE,
source              credit_source NOT NULL,
quantity_initial    INT    NOT NULL CHECK (quantity_initial > 0),
quantity_remaining  INT    NOT NULL CHECK (quantity_remaining >= 0),
expires_at          TIMESTAMPTZ,               -- NULL ⇒ never expires
created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX ON credit_batches (user_id, expires_at NULLS LAST);

-- credit_ledger (append-only) ---------------------------------------
CREATE TYPE ledger_type AS ENUM ('credit','debit');

CREATE TABLE credit_ledger (
id              BIGSERIAL PRIMARY KEY,
user_id         BIGINT REFERENCES users(id),
batch_id        BIGINT REFERENCES credit_batches(id),
type            ledger_type NOT NULL,
quantity        INT NOT NULL CHECK (quantity > 0),
ref             TEXT,                          -- e.g. "invoice #123" / "API call"
created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

Why two tables?
•	credit_batches tracks the current spendable units.
•	credit_ledger gives a full audit trail (you can rebuild any user’s balance by replaying the ledger).

⸻

3. Granting credits

A. Monthly tier allowance

Run a cron (e.g. via Next.js Cron, queue, or temporal.io) every day:

for (const u of usersRenewingToday) {
await sql`
    INSERT INTO credit_batches
      (user_id, source, quantity_initial, quantity_remaining, expires_at)
    VALUES
      (${u.id}, 'tier_allowance', ${tierConfig[u.current_tier].monthlyCredits},
       ${tierConfig[u.current_tier].monthlyCredits},
       ${u.tier_cycle_end})`;
// Extend the cycle_end to next month in same tx
}

B. A-la-carte purchase

After payment web-hook succeeds:

await sql.begin(async (sql) => {
const batch = await sql`
    INSERT INTO credit_batches
      (user_id, source, quantity_initial, quantity_remaining, expires_at)
    VALUES (${userId}, 'alacarte_purchase', ${qty}, ${qty}, NULL)
    RETURNING id`;
await sql`
    INSERT INTO credit_ledger
      (user_id, batch_id, type, quantity, ref)
    VALUES (${userId}, ${batch.id}, 'credit', ${qty}, 'stripe session ${sessionId}')`;
});


⸻

4. Spending credits (the “soon-to-expire” algorithm)

/**
* Debit `amount` credits from the user, prioritising soon-to-expire batches.
* Throws InsufficientBalanceError if not enough remaining.
  */
  export async function consumeCredits(userId: number, amount: number, ref: string) {
  await sql.begin(async (sql) => {
  // 1. Lock the spendable batches in expiry-then-created order
  const batches = await sql`
      SELECT id, quantity_remaining, expires_at
      FROM credit_batches
      WHERE user_id = ${userId}
        AND quantity_remaining > 0
        AND (expires_at IS NULL OR expires_at > now())
      ORDER BY expires_at NULLS LAST, created_at
      FOR UPDATE SKIP LOCKED`;           // prevents deadlocks with parallel requests

  let need = amount;
  for (const b of batches) {
  if (need === 0) break;
  const take = Math.min(need, b.quantity_remaining);
  await sql`
        UPDATE credit_batches
        SET quantity_remaining = quantity_remaining - ${take}
        WHERE id = ${b.id}`;
  await sql`
        INSERT INTO credit_ledger
          (user_id, batch_id, type, quantity, ref)
        VALUES (${userId}, ${b.id}, 'debit', ${take}, ${ref})`;
  need -= take;
  }

  if (need > 0) throw new InsufficientBalanceError();
  });
  }

FOR UPDATE SKIP LOCKED lets concurrent calls safely dequeue different rows.

⸻

5. Expiring credits

You do not have to write a cleanup job that deletes or zeroes old batches; simply filter expires_at <= now() out of your “spendable” query. If you still want to prune, run a weekly job:

UPDATE credit_batches
SET quantity_remaining = 0
WHERE expires_at < now()
AND quantity_remaining > 0;

Log that to the ledger if you need to.

⸻

6. Reading balances fast

A materialized view keeps dashboards snappy:

CREATE MATERIALIZED VIEW user_credit_summary AS
SELECT
user_id,
SUM(quantity_remaining) FILTER (WHERE expires_at > now() OR expires_at IS NULL) AS active,
SUM(quantity_remaining) FILTER (WHERE expires_at IS NULL)                     AS evergreen,
SUM(quantity_remaining) FILTER (WHERE expires_at <= now())                    AS expired_but_unspent
FROM credit_batches
GROUP BY user_id;

Refresh on a schedule or via a trigger on credit_batches.

⸻

7. Putting it behind an API in Next.js

Route / Action	Method	Body	Notes
POST /api/credits/use	JSON { amount: number, ref: string }	Calls consumeCredits.
GET  /api/credits/me	–	Returns active, evergreen, nextTierReset.
POST /api/webhooks/stripe	Raw	On purchase:creates an evergreen batch.

Use Zod for validation, drizzle-orm or Kysely for typed SQL, and wrap each debit/credit in a sql.begin() transaction (or Prisma’s $transaction if you prefer).

⸻

8. Handling edge cases
   •	Downgrade / upgrade mid-cycle
   Keep the current month’s allowance untouched; switch current_tier so next cycle grants the new quota.
   •	Refunding a purchase
   Insert a reversing debit in the ledger and remove remaining quantity from the batch (or mark it “revoked”).
   •	Concurrency
   Always lock with FOR UPDATE inside a serializable transaction as shown above.
   •	Reporting
   Sum over credit_ledger for historical usage charts; it’s immutable, so analytics is easy.

⸻

9. Why this pattern is the norm
    1.	Predictable UX – users never lose evergreen credits and always burn the soon-expiring ones first.
    2.	Auditability – the ledger keeps Finance & Support happy.
    3.	Scalability – credit checks are single quick SQL statements; IO-heavy only when you debit.
    4.	Flexibility – supports promos (source = manual_adjust with an expires_at), roll-overs (just set expires_at months out), team pooling, etc.

⸻

TL;DR

Model every credit grant as a separate batch row with its own expiry, keep an immutable ledger, and spend from the soonest-expiring batch inside a DB transaction. That’s how most credit-based SaaS products—from OpenAI’s own API to cloud platforms—do it, and it fits perfectly with Next.js + TypeScript + Postgres.


my prompt:
ok, a few things though:

say my user wants to access an LLM i am providing them. they pay for this with the aforementioned credits. i don't know how many tokens they will use yet so i create a hold for some amount (authorization)? does that make sense? that hold amount is min(100, <amount they have left>). when i see how many tokens they've actually used, i actually subtract that amount from their balance and release the hold? does all this make sense or is there a better way to do it?

this should work with the system you've already suggested (or create a new system that meets all of my requirements)

additionally, i was thinking about doing event sourcing with a synchronous projection, where i just have like an event store table that stores all various events (credits purchased, credits spent, credits expired, subscription renewed, subscription created, etc.) is this a good idea? i don't want full event sourcing with commands and all but just a simple event store table where i store all the events and then in the same db transaction i update a project/materialized view to keep everything synchronous and simple. what do you think about this? good idea?

o3 response:

Below is a pattern that slots cleanly on top of the “credit-batch + ledger” design you already have and lets you:
•	Pre-authorise (“hold”) an estimated amount before the LLM call starts.
•	Capture or release the exact amount once you know how many tokens were used.
•	Keep every step ACID-safe inside Postgres and readable from TypeScript.

⸻

1  |  Add a tiny “holds” layer

Schema additions

-- credit_holds -------------------------------------------------------
CREATE TYPE hold_state AS ENUM ('active','captured','released','expired');

CREATE TABLE credit_holds (
id                 BIGSERIAL PRIMARY KEY,
user_id            BIGINT REFERENCES users(id) ON DELETE CASCADE,
batch_id           BIGINT REFERENCES credit_batches(id),
quantity_held      INT    NOT NULL CHECK (quantity_held > 0),
state              hold_state NOT NULL DEFAULT 'active',
created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
-- optional: expire stale holds automatically
expires_at         TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '30 minutes')
);

CREATE INDEX ON credit_holds (user_id, state);

credit_batches.quantity_remaining now represents un-held, freely spendable units.

⸻

2  |  Flow: Authorise → Capture → (Optionally) Release

2.1  Authorise (start of request)

/**
* Reserve up to `maxProbe`, starting with soon-to-expire batches.
* Returns an array of hold ids.
  */
  export async function authoriseCredits(
  userId: number,
  maxProbe: number,
  ref: string        // e.g. "chat-completion #abc"
  ) {
  const holdIds: number[] = [];

await sql.begin(async (sql) => {
const batches = await sql`
      SELECT id, quantity_remaining
      FROM credit_batches
      WHERE user_id = ${userId}
        AND quantity_remaining > 0
        AND (expires_at IS NULL OR expires_at > now())
      ORDER BY expires_at NULLS LAST, created_at
      FOR UPDATE SKIP LOCKED`;

    let need = maxProbe;
    for (const b of batches) {
      if (need === 0) break;
      const take = Math.min(need, b.quantity_remaining);

      // shrink available balance
      await sql`
        UPDATE credit_batches
        SET quantity_remaining = quantity_remaining - ${take}
        WHERE id = ${b.id}`;

      // record hold
      const [h] = await sql`
        INSERT INTO credit_holds
          (user_id, batch_id, quantity_held, state)
        VALUES (${userId}, ${b.id}, ${take}, 'active')
        RETURNING id`;
      holdIds.push(h.id);

      need -= take;
    }

    if (need > 0) throw new InsufficientBalanceError();
});

return holdIds;
}

Effect: credits move from “available” → “held”. They are invisible to other requests, so you never double-spend.

2.2  Capture (after request completes)

export async function captureCredits(
holdIds: number[],
actualUsed: number,
ref: string
) {
// We might have reserved more than used; we capture exactly the usage.
await sql.begin(async (sql) => {
// Lock holds rows
const holds = await sql`
      SELECT id, batch_id, quantity_held
      FROM credit_holds
      WHERE id = ANY(${sql.array(holdIds)})
        AND state = 'active'
      FOR UPDATE`;      // ensures exactly-once capture

    let need = actualUsed;
    for (const h of holds) {
      if (need === 0) break;

      const captureQty = Math.min(need, h.quantity_held);

      // Write permanent debit to ledger
      await sql`
        INSERT INTO credit_ledger
          (user_id, batch_id, type, quantity, ref)
        VALUES
          ((SELECT user_id FROM credit_batches WHERE id = ${h.batch_id}),
           ${h.batch_id}, 'debit', ${captureQty}, ${ref})`;

      // If we didn’t use the full hold, put the remainder back
      const remainder = h.quantity_held - captureQty;
      if (remainder > 0) {
        await sql`
          UPDATE credit_batches
          SET quantity_remaining = quantity_remaining + ${remainder}
          WHERE id = ${h.batch_id}`;
      }

      // Finalise the hold row
      await sql`
        UPDATE credit_holds
        SET state       = 'captured',
            quantity_held = ${captureQty}          -- immutable audit
        WHERE id = ${h.id}`;

      need -= captureQty;
    }

    if (need > 0) {
      /* extremely rare: used > held.
         Try to authorise more right here, or throw so caller can resolve. */
      throw new InsufficientBalanceError();
    }
});
}

2.3  Release (timeout, user abort, etc.)

-- cron every few minutes
UPDATE credit_batches b
SET quantity_remaining = quantity_remaining + h.quantity_held
FROM credit_holds h
WHERE h.state = 'active'
AND h.expires_at < now()
AND h.batch_id = b.id;

UPDATE credit_holds
SET state = 'expired'
WHERE state = 'active'
AND expires_at < now();


⸻

3  |  Why this solves the uncertainty problem
1.	Absolutely no race conditions – held units are removed from quantity_remaining immediately in a single transaction.
2.	User never loses credits – unused remainder is returned transparently.
3.	Idempotent – replaying a captureCredits with the same holdIds does nothing because the rows are no longer state='active'.
4.	No “negative balance” edge cases – a request can only start if it can be fully authorised.

If you trust your token predictor enough (e.g. “never more than 4× prompt tokens”), you can also authorise exactly that prediction instead of a flat min(100, balance).

⸻

4  Event store / synchronous projection

The minimalist approach (recommended)

Your credit_ledger already is an event stream for everything money-adjacent:

tier_allowance | credit
purchase       | credit
debit          | debit
expiry sweep   | debit
refund         | (credit or debit)

You can extend that with other business events simply by adding more event types (e.g. 'tier_changed') and an optional JSON payload column. Advantages:

	Ledger-as-event-store	Separate event_store table
One canonical audit trail	✅	❌ (two places)
Single transaction updates	✅	✅
Query ergonomics in SQL	✅ sums, filters	requires joins
Overhead / complexity	Lowest	Higher

If you still want a dedicated event_store table

CREATE TABLE domain_events (
id          BIGSERIAL PRIMARY KEY,
user_id     BIGINT,
type        TEXT NOT NULL,         -- e.g. 'subscription_created'
payload     JSONB,
created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

Pattern:

await sql.begin(async (sql) => {
// 1. write event
await sql`
    INSERT INTO domain_events (user_id, type, payload)
    VALUES (${u.id}, 'credits_purchased', ${sql.json({qty, stripeSession})})`;

// 2. update projections / credit_batches / credit_ledger
});

Because it is the same DB transaction, your “synchronous projection” is always in lock-step with the event log. That gives you:
•	Rebuildability – you can replay events into a fresh projection if schema changes.
•	Forward-compatibility – later you can stream the events into Kafka or a data warehouse.

The trade-off is simply more tables & code for little extra benefit if the ledger already captures what you need.

⸻

5  Putting it into Next.js
•	Authorise inside a Route Handler that kicks off the LLM request; return the holdIds in headers or a hidden field.
•	When the stream finishes (you know promptTokens + completionTokens) call Capture with those holdIds.
•	If the client disconnects, run the expiry cron (section 2.3) to release the hold automatically.

All DB work is tiny and single-row‐indexed, so the latency added to request start/finish is < 1 ms in practice.

⸻

TL;DR

Add a credit_holds table:
1.	Authorise → move credits from quantity_remaining to a hold row.
2.	Capture → turn hold into permanent debit, return any leftover.
3.	Release stale holds on a timer.

Treat your ledger as the primary event log; only introduce a separate event-store table if you need arbitrarily wide domain events beyond credits.


my prompt:

i was goin to replace the ledger with a generic event store table, not have both of them. what do you think about this?


o3 response:

Should you replace credit_ledger with one generic event-store table?

You can, and many teams do.  The design works well if you commit to two disciplines:
1.	Every state change is an event row (append-only).
2.	You maintain at least one projection table that is always updated in the same transaction as the event insert.

Below is what that looks like, the trade-offs, and the handful of sharp edges to watch.

⸻

1 Schema sketch

-- 1. Generic event log (only source of truth) -----------------------
CREATE TABLE domain_events (
id          BIGSERIAL PRIMARY KEY,
user_id     BIGINT NOT NULL,
type        TEXT   NOT NULL,                -- e.g. 'credit_added', 'credit_debited'
body        JSONB  NOT NULL,                -- arbitrary payload
created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX ON domain_events (user_id, created_at);

-- 2. Synchronous projection: spendable credit batches ---------------
CREATE TABLE credit_batches (
id                 BIGSERIAL PRIMARY KEY,
user_id            BIGINT NOT NULL,
expires_at         TIMESTAMPTZ,
quantity_remaining INT NOT NULL,
created_at         TIMESTAMPTZ NOT NULL
);
CREATE INDEX ON credit_batches (user_id, expires_at NULLS LAST);

-- (Optional) summary view/materialised view for dashboards ----------
CREATE MATERIALIZED VIEW user_credit_summary AS
SELECT user_id,
SUM(quantity_remaining) FILTER (WHERE expires_at IS NULL OR expires_at > now()) AS active
FROM credit_batches
GROUP BY user_id;

The rule: every mutation first inserts a row in domain_events, then mutates credit_batches (the projection) inside the same BEGIN … COMMIT.

⸻

2 How typical events map to the projection

Event type	body payload example	Projection code (inside same tx)
credit_added	{ "qty": 1_000, "expiresAt": "2025-07-04T00:00Z", "source": "tier" }	INSERT INTO credit_batches …
credit_debited	{ "qty": 450, "batchId": 123, "ref": "chat-completion #xyz" }	UPDATE credit_batches SET quantity_remaining = quantity_remaining – 450 WHERE id = 123
credit_hold_created	{ "holdId": 88, "batchId": 123, "qty": 100 }	UPDATE credit_batches SET quantity_remaining = quantity_remaining – 100 …
credit_hold_captured	{ "holdId": 88, "used": 63 }	UPDATE credit_batches … ;  UPDATE credit_batches SET quantity_remaining = quantity_remaining + 37 /*return remainder*/
subscription_tier_changed	{ "from": "starter", "to": "growth" }	projection table unaffected; maybe update a users table

Because everything happens atomically, the projection never drifts from the log.

⸻

3 Pros & cons of “event-store only + projection”

✅ Pros	❌ Cons / Mitigations
Single audit trail – finance, support, & BI all read domain_events.	Querying balances requires a projection; never compute it ad-hoc from events ⚠︎.
Easy schema evolution – add new event types without touching projection schema first.	Higher write traffic (two writes per business action). Usually negligible because both rows are tiny and in the same DB.
Replayability – if you need a new projection (e.g., daily token-usage chart) you can rebuild it by streaming events.	Discipline required – every code path must write the event first. Put that in a small library to avoid foot-guns.
Future-proof – later you can stream domain_events into Kafka without touching business code.	Index size – if you grow to tens of millions of events, partition or archive old rows; Postgres 15+ declarative partitioning makes this easy.

Most SaaS businesses that move past “side project” scale end up with exactly this pattern:
event table + N projections, each projection built synchronously in SQL or via a tiny piece of application code.

⸻

4 Implementation pattern in TypeScript

export async function addCredits(
userId: number,
qty: number,
expiresAt: Date | null,
source: 'tier' | 'purchase' | 'promo'
) {
await sql.begin(async (sql) => {
// 1. append event
await sql`
      INSERT INTO domain_events (user_id, type, body)
      VALUES (${userId}, 'credit_added',
              ${sql.json({qty, expiresAt, source})})`;

    // 2. update projection
    await sql`
      INSERT INTO credit_batches
        (user_id, quantity_remaining, expires_at, created_at)
      VALUES (${userId}, ${qty}, ${expiresAt}, now())`;
});
}

Same pattern for debit, hold, capture, release.

⸻

5 Tips to keep it smooth
1.	Wrap the insert + projection update in the same transaction – this is the whole point of “synchronous” projection.
2.	Keep events immutable – never update or delete rows in domain_events; fix mistakes with compensating events.
3.	Use JSONB columns with a strict TS Zod schema so you can validate payloads and still evolve them.
4.	Partition or time-bucket domain_events once you hit millions of rows per month; it’s a two-line DDL change in Postgres 15+.
5.	Automate projection rebuilds – store the projection DDL in code; a CLI task can TRUNCATE and replay events if you need to recover.

⸻

6 When not to do this
•	If your SaaS is tiny and you do zero analytics, a simple credit_ledger table with “credit/debit” rows is perfectly fine and 10 × simpler.
•	If you anticipate >500 writes per second to the event log, you’ll eventually want to off-load the event stream to Kafka or Redpanda; at that point, keep domain_events and publish to the stream.

⸻

Bottom line

Replacing credit_ledger with one generic, append-only domain_events table plus a synchronous credit_batches projection is a clean, production-proven pattern. It preserves auditability, lets you evolve features cheaply, and keeps real-time balance checks as fast as a single indexed SELECT. Just enforce the “insert event first, update projection in the same transaction” rule everywhere and you’re set.















this is what grok wants for stripe:

CREATE TABLE subscriptions (
id SERIAL PRIMARY KEY,
user_id UUID REFERENCES users(id),
stripe_subscription_id TEXT UNIQUE,
tier TEXT CHECK (tier IN ('hobby', 'standard', 'pro')),
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
