-- TODO: after launch, we should add db migrations (Supabase Migrations/Flyway/Liquibase, etc): https://grok.com/share/bGVnYWN5_028f4133-6951-47e9-803e-da4e87a5ddae

-- agents

CREATE TABLE agents
(
    id             UUID                     DEFAULT gen_random_uuid() PRIMARY KEY,
    name           TEXT NOT NULL,
    website_domain TEXT NOT NULL,
    model          TEXT NOT NULL,
    created_by     UUID NOT NULL REFERENCES next_auth.users (id) ON DELETE CASCADE,
    created_at     TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX agents_created_by_idx ON agents (created_by);

-- actions

CREATE TYPE execution_context AS ENUM ('CLIENT', 'SERVER');

CREATE TABLE actions
(
    id                UUID                     DEFAULT gen_random_uuid() PRIMARY KEY,
    name              TEXT              NOT NULL,
    description       TEXT              NOT NULL,
    execution_context execution_context NOT NULL,
    execution_model   JSONB             NOT NULL,
    agent_id        UUID              NOT NULL REFERENCES agents (id) ON DELETE CASCADE,
    created_at        TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX actions_agent_id_idx ON actions (agent_id);

CREATE TABLE prompts
(
    id          UUID              DEFAULT gen_random_uuid() PRIMARY KEY,
    content     TEXT              NOT NULL,
    agent_id    UUID              NOT NULL REFERENCES agents (id) ON DELETE CASCADE,
    created_at  TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX prompts_agent_id_idx ON prompts (agent_id);

-- TODO: create required indexes for the following tables
-- 1. Generic event store -------------------------------------------
CREATE TYPE event_status AS ENUM ('PENDING', 'PROCESSING', 'PROCESSED', 'FAILED', 'CANCELLED');

CREATE TABLE domain_events
(
    id              BIGSERIAL PRIMARY KEY,
    user_id         UUID         NOT NULL,
    idempotency_key TEXT         NOT NULL UNIQUE,
    type            TEXT         NOT NULL,
    event_data      JSONB        NOT NULL,
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT now(),
    status          event_status NOT NULL DEFAULT 'PENDING',
    retry_count     INT          NOT NULL DEFAULT 0,
    last_error      TEXT
    -- if we need to perform validations that depend on a user's current state (hydrated state), this table should also include a version number to allow for optimistic concurrency control
);
CREATE INDEX ON domain_events (user_id, created_at);

----------------------------------------------------------------------
-- 2. Projection: spendable credit batches ---------------------------
CREATE TABLE credit_batches
(
    id                 BIGSERIAL PRIMARY KEY,
    user_id            UUID        NOT NULL,
    quantity_remaining INT         NOT NULL CHECK (quantity_remaining >= 0),
    expires_at         TIMESTAMPTZ,
    created_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX ON credit_batches (user_id, expires_at NULLS LAST);

----------------------------------------------------------------------
-- 3. Projection: outstanding “holds” (authorisations) --------------
CREATE TYPE hold_state AS ENUM ('ACTIVE','CAPTURED','RELEASED','EXPIRED');

CREATE TABLE credit_holds
(
    id            BIGSERIAL PRIMARY KEY,
    user_id       UUID        NOT NULL,
    batch_id      BIGINT      NOT NULL REFERENCES credit_batches (id) ON DELETE CASCADE,
    quantity_held INT         NOT NULL CHECK (quantity_held > 0),
    state         hold_state  NOT NULL DEFAULT 'ACTIVE',
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    expires_at    TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '30 minutes') -- configurable
);
CREATE INDEX ON credit_holds (user_id, state);

----------------------------------------------------------------------
-- 4. (Nice-to-have) summary view for dashboards ---------------------
CREATE MATERIALIZED VIEW user_credit_summary AS
SELECT user_id,
       SUM(quantity_remaining)
       FILTER (WHERE expires_at IS NULL OR expires_at > now()) AS active_credits
FROM credit_batches
GROUP BY user_id;