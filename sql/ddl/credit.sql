-- Projection: spendable credit batches ---------------------------
CREATE TABLE credit_batches
(
    id                 BIGSERIAL PRIMARY KEY,
    user_id            UUID        NOT NULL,
    quantity_remaining INT         NOT NULL CHECK (quantity_remaining >= 0),
    expires_at         TIMESTAMPTZ,
    created_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);
-- Essential indexes for credit batch queries
CREATE INDEX credit_batches_user_id_idx ON credit_batches (user_id);
-- Composite index matching exact query pattern for available credits
CREATE INDEX credit_batches_available_idx ON credit_batches (user_id, expires_at NULLS LAST, created_at) WHERE quantity_remaining > 0;
-- Index for expiry cleanup
CREATE INDEX credit_batches_expires_at_idx ON credit_batches (expires_at) WHERE expires_at IS NOT NULL AND quantity_remaining > 0;

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
-- Essential indexes for credit hold queries
CREATE INDEX credit_holds_user_id_state_idx ON credit_holds (user_id, state);
-- Index for active holds by IDs (for capture/release operations)
CREATE INDEX credit_holds_id_state_idx ON credit_holds (id, state) WHERE state = 'ACTIVE';
-- Index for expired hold cleanup
CREATE INDEX credit_holds_expires_at_state_idx ON credit_holds (expires_at, state) WHERE state = 'ACTIVE';

-- (Nice-to-have) summary view for dashboards ---------------------
CREATE VIEW user_credit_summary AS
SELECT user_id,
       SUM(quantity_remaining)
       FILTER (WHERE expires_at IS NULL OR expires_at > now()) AS active_credits
FROM credit_batches
GROUP BY user_id;