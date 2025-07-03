-- Projection: spendable credit batches ---------------------------
CREATE TABLE credit_batches
(
    id                 BIGSERIAL PRIMARY KEY,
    user_id            UUID        NOT NULL,
    quantity_remaining INT         NOT NULL CHECK (quantity_remaining >= 0),
    expires_at         TIMESTAMPTZ,
    created_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX ON credit_batches (user_id, expires_at NULLS LAST);

-- Projection: outstanding “holds” (authorisations) --------------
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

-- (Nice-to-have) summary view for dashboards ---------------------
CREATE MATERIALIZED VIEW user_credit_summary AS
SELECT user_id,
       SUM(quantity_remaining)
       FILTER (WHERE expires_at IS NULL OR expires_at > now()) AS active_credits
FROM credit_batches
GROUP BY user_id;