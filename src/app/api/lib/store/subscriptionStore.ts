import sql from '@/app/api/lib/store/db';
import { handle } from '@/app/api/lib/store/eventProcessor';

export const insertSubscription = async (
  userId: string,
  stripeSubscriptionId: string,
  tier: string,
  idempotencyKey: string
) => {
  const eventType = 'SUBSCRIPTION_CREATED';
  const idempotencyKeyWithType = `${idempotencyKey}_${eventType}`;
  let eventId: number;
  const data = {
    stripeSubscriptionId,
    tier,
  };

  await sql.begin(async (sql) => {
    const [event] = await sql`
      INSERT INTO domain_events (user_id, idempotency_key, type, event_data)
      VALUES (${userId}, ${idempotencyKeyWithType}, ${eventType},
              ${sql.json(data)})
      ON CONFLICT (idempotency_key) DO NOTHING
      RETURNING id`;
    eventId = event.id;

    if (!event) return;

    await sql`
      INSERT INTO subscriptions (user_id, stripe_subscription_id, tier)
      VALUES (${userId}, ${stripeSubscriptionId}, ${tier})
      ON CONFLICT (stripe_subscription_id) DO NOTHING
    `;
  });

  await handle({
    id: eventId,
    type: eventType,
    user_id: userId,
    event_data: data,
  });
};

export const updateSubscription = async (
  stripeSubscriptionId: string,
  tier: string,
  idempotencyKey: string
) => {
  const eventType = 'SUBSCRIPTION_UPDATED';
  const idempotencyKeyWithType = `${idempotencyKey}_${eventType}`;
  const data = {
    stripeSubscriptionId,
    tier,
  };
  let eventId: number;
  let userId: string;

  await sql.begin(async (sql) => {
    const existing = await sql`
      SELECT user_id FROM subscriptions WHERE stripe_subscription_id = ${stripeSubscriptionId}
    `;
    if (existing.length === 0) {
      console.error(
        `Subscription with stripe subscription id ${stripeSubscriptionId} not found.`
      );
      return;
    }
    userId = existing[0].user_id;

    const [event] = await sql`
      INSERT INTO domain_events (user_id, idempotency_key, type, event_data)
      VALUES (${userId}, ${idempotencyKeyWithType}, ${eventType},
              ${sql.json(data)})
      ON CONFLICT (idempotency_key) DO NOTHING
      RETURNING id`;

    eventId = event.id;
    if (!event) return;

    await sql`
      UPDATE subscriptions
      SET
        tier = ${tier},
        updated_at = now()
      WHERE stripe_subscription_id = ${stripeSubscriptionId}
    `;
  });

  await handle({
    id: eventId,
    type: eventType,
    user_id: userId,
    event_data: data,
  });
};
