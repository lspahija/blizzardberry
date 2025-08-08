CREATE TYPE subscription_status AS ENUM (
    'active',
    'past_due',
    'unpaid',
    'canceled',
    'incomplete',
    'incomplete_expired',
    'trialing',
    'ended'
    );

CREATE TABLE subscriptions
(
    id                          UUID                 DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id                     UUID        NOT NULL UNIQUE REFERENCES next_auth.users (id) ON DELETE CASCADE,
    stripe_subscription_id      TEXT,
    stripe_subscription_item_id TEXT,
    tier                        TEXT        NOT NULL,
    expires_at                  TIMESTAMPTZ,
    created_at                  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at                  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Essential indexes for subscription queries  
-- User ID index (already defined, but user_id is unique so this is redundant)
-- The UNIQUE constraint on user_id already provides the index we need
-- CREATE INDEX subscriptions_user_id_idx ON subscriptions (user_id); -- REMOVE: redundant with UNIQUE constraint

-- Index for Stripe subscription management
CREATE INDEX subscriptions_stripe_subscription_id_idx ON subscriptions (stripe_subscription_id);
-- Index for subscription expiry management
CREATE INDEX subscriptions_expires_at_idx ON subscriptions (expires_at) WHERE expires_at IS NOT NULL;