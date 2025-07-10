import sql from '@/app/api/lib/store/db';
import { handle } from '@/app/api/lib/store/eventProcessor';
import { Subscription } from '@/app/api/lib/model/subscription/subscription';

export const upsertSubscription = async (
  userId: string,
  stripeCustomerId: string,
  stripeSubscriptionId: string,
  stripeSubscriptionItemId: string,
  tier: string,
  expiresAt: Date
) => {
  const eventType = 'SUBSCRIPTION_MODIFIED';
  const idempotencyKeyWithType = `${userId}_${tier}_${Date.now()}`;
  let eventId: number;
  const data = {
    stripeCustomerId,
    stripeSubscriptionId,
    stripeSubscriptionItemId,
    tier,
  };

  await sql.begin(async (sql) => {
    const [event] = await sql`
      INSERT INTO domain_events (user_id, idempotency_key, type, event_data)
      VALUES (${userId}, ${idempotencyKeyWithType}, ${eventType},
              ${sql.json(data)})
      ON CONFLICT (idempotency_key) DO NOTHING
      RETURNING id`;
    eventId = event?.id;

    if (!event) return;

    await sql`
      INSERT INTO subscriptions (user_id, stripe_customer_id, stripe_subscription_id,
                                 stripe_subscription_item_id, tier, expires_at)
      VALUES (${userId}, ${stripeCustomerId}, ${stripeSubscriptionId},
              ${stripeSubscriptionItemId}, ${tier}, ${expiresAt})
      ON CONFLICT (user_id) DO UPDATE
        SET stripe_customer_id          = EXCLUDED.stripe_customer_id,
            stripe_subscription_id      = EXCLUDED.stripe_subscription_id,
            stripe_subscription_item_id = EXCLUDED.stripe_subscription_item_id,
            tier                        = EXCLUDED.tier,
            updated_at                  = now(),
            expires_at                  = EXCLUDED.expires_at
    `;
  });

  await handle({
    id: eventId,
    type: eventType,
    user_id: userId,
    event_data: data,
  });
};

export const getSubscription = async (
  userId: string
): Promise<Subscription | null> => {
  const [subscription] = await sql`
    SELECT id,
           user_id,
           stripe_customer_id,
           stripe_subscription_id,
           stripe_subscription_item_id,
           tier,
           created_at,
           updated_at
    FROM subscriptions
    WHERE user_id = ${userId}
    LIMIT 1
  `;

  if (!subscription) return null;

  return {
    id: subscription.id,
    userId: subscription.user_id,
    stripeCustomerId: subscription.stripe_customer_id,
    stripeSubscriptionId: subscription.stripe_subscription_id,
    stripeSubscriptionItemId: subscription.stripe_subscription_item_id,
    tier: subscription.tier,
    expiresAt: subscription.expires_at,
    createdAt: subscription.created_at,
    updatedAt: subscription.updated_at,
  };
};
