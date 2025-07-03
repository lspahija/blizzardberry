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
