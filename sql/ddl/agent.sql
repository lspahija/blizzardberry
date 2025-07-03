-- TODO: after launch, we should add db migrations (Supabase Migrations/Flyway/Liquibase, etc): https://grok.com/share/bGVnYWN5_028f4133-6951-47e9-803e-da4e87a5ddae
-- TODO: create required indexes for all sql tables


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
