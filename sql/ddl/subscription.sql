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
    id                     UUID                 DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id                UUID        NOT NULL UNIQUE REFERENCES next_auth.users (id) ON DELETE CASCADE,
    stripe_subscription_id TEXT,
    tier                   TEXT        NOT NULL,
    created_at             TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at             TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX subscriptions_user_id_idx ON subscriptions (user_id);