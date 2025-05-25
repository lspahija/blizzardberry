-- TODO: we should have db migrations (Supabase Migrations/Flyway/Liquibase, etc): https://grok.com/share/bGVnYWN5_028f4133-6951-47e9-803e-da4e87a5ddae

-- chatbots

create table chatbots
(
    id             uuid                     default gen_random_uuid() primary key,
    name           text not null,
    website_domain text not null,
    created_by     uuid not null references next_auth.users (id) on delete cascade,
    created_at     timestamp with time zone default now()
);

-- actions

CREATE TYPE execution_context AS ENUM ('CLIENT', 'SERVER');

create table actions
(
    id                uuid                     default gen_random_uuid() primary key,
    name              text              not null,
    description       text              not null,
    execution_context execution_context not null,
    execution_model   jsonb             not null,
    chatbot_id        uuid              not null references chatbots (id) on delete cascade,
    created_at        timestamp with time zone default now()
);


-- RAG

CREATE TABLE documents
(
    id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_document_id UUID, -- Links chunks to parent document
    content            TEXT NOT NULL,
    metadata           JSONB,
    embedding          HALFVEC(3072)
    -- chatbot_id         uuid not null references chatbots (id) on delete cascade TODO: add something like this for multitenancy
);

CREATE INDEX documents_embedding_idx ON documents USING hnsw (embedding halfvec_cosine_ops);
CREATE INDEX documents_parent_id_idx ON documents (parent_document_id);

CREATE OR REPLACE FUNCTION search_documents(filter JSONB, match_count INTEGER, query_embedding HALFVEC(3072))
    RETURNS TABLE
            (
                id                 UUID,
                parent_document_id UUID,
                content            TEXT,
                metadata           JSONB,
                similarity         FLOAT
            )
AS
$$
BEGIN
    RETURN QUERY
        SELECT d.id,
               d.parent_document_id,
               d.content,
               d.metadata,
               (1 - (d.embedding <-> query_embedding)) AS similarity
        FROM documents d
        WHERE (filter IS NULL OR d.metadata @> filter)
        ORDER BY d.embedding <-> query_embedding
        LIMIT match_count;
END;
$$ LANGUAGE plpgsql;


-- Auth.js Supabase adapter required schema

CREATE SCHEMA next_auth;

GRANT USAGE ON SCHEMA next_auth TO service_role;
GRANT ALL ON SCHEMA next_auth TO postgres;

CREATE TABLE IF NOT EXISTS next_auth.users
(
    id              uuid NOT NULL DEFAULT gen_random_uuid(),
    name            text,
    email           text,
    "emailVerified" timestamp with time zone,
    image           text,
    CONSTRAINT users_pkey PRIMARY KEY (id),
    CONSTRAINT email_unique UNIQUE (email)
);

GRANT ALL ON TABLE next_auth.users TO postgres;
GRANT ALL ON TABLE next_auth.users TO service_role;

--- uid() function to be used in RLS policies
CREATE FUNCTION next_auth.uid() RETURNS uuid
    LANGUAGE sql
    STABLE
AS
$$
select coalesce(
               nullif(current_setting('request.jwt.claim.sub', true), ''),
               (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub')
       )::uuid
$$;

CREATE TABLE IF NOT EXISTS next_auth.sessions
(
    id             uuid                     NOT NULL DEFAULT gen_random_uuid(),
    expires        timestamp with time zone NOT NULL,
    "sessionToken" text                     NOT NULL,
    "userId"       uuid,
    CONSTRAINT sessions_pkey PRIMARY KEY (id),
    CONSTRAINT sessionToken_unique UNIQUE ("sessionToken"),
    CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId")
        REFERENCES next_auth.users (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE
);

GRANT ALL ON TABLE next_auth.sessions TO postgres;
GRANT ALL ON TABLE next_auth.sessions TO service_role;

CREATE TABLE IF NOT EXISTS next_auth.accounts
(
    id                  uuid NOT NULL DEFAULT gen_random_uuid(),
    type                text NOT NULL,
    provider            text NOT NULL,
    "providerAccountId" text NOT NULL,
    refresh_token       text,
    access_token        text,
    expires_at          bigint,
    token_type          text,
    scope               text,
    id_token            text,
    session_state       text,
    oauth_token_secret  text,
    oauth_token         text,
    "userId"            uuid,
    CONSTRAINT accounts_pkey PRIMARY KEY (id),
    CONSTRAINT provider_unique UNIQUE (provider, "providerAccountId"),
    CONSTRAINT "accounts_userId_fkey" FOREIGN KEY ("userId")
        REFERENCES next_auth.users (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE
);

GRANT ALL ON TABLE next_auth.accounts TO postgres;
GRANT ALL ON TABLE next_auth.accounts TO service_role;

CREATE TABLE IF NOT EXISTS next_auth.verification_tokens
(
    identifier text,
    token      text,
    expires    timestamp with time zone NOT NULL,
    CONSTRAINT verification_tokens_pkey PRIMARY KEY (token),
    CONSTRAINT token_unique UNIQUE (token),
    CONSTRAINT token_identifier_unique UNIQUE (token, identifier)
);

GRANT ALL ON TABLE next_auth.verification_tokens TO postgres;
GRANT ALL ON TABLE next_auth.verification_tokens TO service_role;