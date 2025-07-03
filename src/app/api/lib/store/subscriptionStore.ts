import sql from '@/app/api/lib/store/db';
import { handle } from '@/app/api/lib/store/eventProcessor';

export type SubscriptionStatus =
  | 'active'
  | 'past_due'
  | 'unpaid'
  | 'canceled'
  | 'incomplete'
  | 'incomplete_expired'
  | 'trialing'
  | 'ended';

export const insertSubscription = async (
  userId: string,
  stripeSubscriptionId: string,
  status: SubscriptionStatus,
  tier: string,
  currentPeriodStart: Date,
  currentPeriodEnd: Date,
  idempotencyKey: string
) => {
  const eventType = 'SUBSCRIPTION_CREATED';
  let eventId: number;
  const idempotencyKeyWithType = `${idempotencyKey}_${eventType}`;

  await sql.begin(async (sql) => {
    const [event] = await sql`
      INSERT INTO domain_events (user_id, idempotency_key, type, event_data)
      VALUES (${userId}, ${idempotencyKeyWithType}, ${eventType},
              ${sql.json({
                stripeSubscriptionId,
                status,
                tier,
                currentPeriodStart,
                currentPeriodEnd,
              })})
      ON CONFLICT (idempotency_key) DO NOTHING
      RETURNING id`;

    if (!event) return;
    eventId = event.id;

    await sql`
      INSERT INTO subscriptions (user_id, stripe_subscription_id, status, tier, current_period_start, current_period_end)
      VALUES (${userId}, ${stripeSubscriptionId}, ${status}, ${tier}, ${currentPeriodStart.toISOString()}, ${currentPeriodEnd.toISOString()})
    `;
  });
};

export const updateSubscription = async (
  stripeSubscriptionId: string,
  status: SubscriptionStatus,
  cancelAtPeriodEnd: boolean,
  currentPeriodStart: Date,
  currentPeriodEnd: Date,
  endedAt: Date | null,
  cancelAt: Date | null,
  canceledAt: Date | null,
  idempotencyKey: string
) => {
  const eventType = 'SUBSCRIPTION_UPDATED';
  let eventId: number;
  const idempotencyKeyWithType = `${idempotencyKey}_${eventType}`;

  await sql.begin(async (sql) => {
    const [event] = await sql`
      INSERT INTO domain_events (idempotency_key, type, event_data)
      VALUES (${idempotencyKeyWithType}, ${eventType},
              ${sql.json({
                stripeSubscriptionId,
                status,
                cancelAtPeriodEnd,
                currentPeriodStart,
                currentPeriodEnd,
                endedAt,
                cancelAt,
                canceledAt,
              })})
      ON CONFLICT (idempotency_key) DO NOTHING
      RETURNING id`;

    if (!event) return;
    eventId = event.id;

    await sql`
      UPDATE subscriptions
      SET
        status = ${status},
        cancel_at_period_end = ${cancelAtPeriodEnd},
        current_period_start = ${currentPeriodStart.toISOString()},
        current_period_end = ${currentPeriodEnd.toISOString()},
        ended_at = ${endedAt?.toISOString()},
        cancel_at = ${cancelAt?.toISOString()},
        canceled_at = ${canceledAt?.toISOString()},
        updated_at = now()
      WHERE stripe_subscription_id = ${stripeSubscriptionId}
    `;
  });
};
