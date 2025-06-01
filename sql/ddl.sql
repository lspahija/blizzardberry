-- we should have db migrations (Supabase Migrations/Flyway/Liquibase, etc): https://grok.com/share/bGVnYWN5_028f4133-6951-47e9-803e-da4e87a5ddae

-- chatbots

CREATE TABLE chatbots
(
    id             UUID                     DEFAULT gen_random_uuid() PRIMARY KEY,
    name           TEXT NOT NULL,
    website_domain TEXT NOT NULL,
    created_by     UUID NOT NULL REFERENCES next_auth.users (id) ON DELETE CASCADE,
    created_at     TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX chatbots_created_by_idx ON chatbots (created_by);

-- actions

CREATE TYPE execution_context AS ENUM ('CLIENT', 'SERVER');

CREATE TABLE actions
(
    id                UUID                     DEFAULT gen_random_uuid() PRIMARY KEY,
    name              TEXT              NOT NULL,
    description       TEXT              NOT NULL,
    execution_context execution_context NOT NULL,
    execution_model   JSONB             NOT NULL,
    chatbot_id        UUID              NOT NULL REFERENCES chatbots (id) ON DELETE CASCADE,
    created_at        TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX actions_chatbot_id_idx ON actions (chatbot_id);

-- RAG

CREATE TABLE documents
(
    id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content   TEXT NOT NULL,
    metadata  JSONB,
    embedding HALFVEC(3072),
    parent_document_id UUID NOT NULL,
    chatbot_id UUID NOT NULL REFERENCES chatbots (id) ON DELETE CASCADE
);

CREATE INDEX documents_embedding_idx ON documents USING hnsw (embedding halfvec_cosine_ops);
CREATE INDEX documents_chatbot_id_idx ON documents (chatbot_id);
CREATE INDEX documents_parent_document_id_idx ON documents (parent_document_id);

CREATE OR REPLACE FUNCTION search_documents(p_chatbot_id UUID, match_count INTEGER, query_embedding HALFVEC(3072), filter JSONB DEFAULT NULL)
    RETURNS TABLE
            (
                id         UUID,
                content    TEXT,
                metadata   JSONB,
                similarity FLOAT
            )
AS
$$
BEGIN
    RETURN QUERY
        SELECT d.id,
               d.content,
               d.metadata,
               (1 - (d.embedding <-> query_embedding)) AS similarity
        FROM documents d
        WHERE (chatbot_id IS NULL OR d.chatbot_id = p_chatbot_id)
          AND (filter IS NULL OR d.metadata @> filter)
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
    id              UUID NOT NULL DEFAULT gen_random_uuid(),
    name            TEXT,
    email           TEXT,
    "emailVerified" TIMESTAMP WITH TIME ZONE,
    image           TEXT,
    CONSTRAINT users_pkey PRIMARY KEY (id),
    CONSTRAINT email_unique UNIQUE (email)
);

GRANT ALL ON TABLE next_auth.users TO postgres;
GRANT ALL ON TABLE next_auth.users TO service_role;

--- uid() function to be used in RLS policies
CREATE FUNCTION next_auth.uid() RETURNS UUID
    LANGUAGE SQL
    STABLE
AS
$$
SELECT COALESCE(
               NULLIF(current_setting('request.jwt.claim.sub', TRUE), ''),
               (NULLIF(current_setting('request.jwt.claims', TRUE), '')::JSONB ->> 'sub')
       )::UUID
$$;

CREATE TABLE IF NOT EXISTS next_auth.sessions
(
    id             UUID                     NOT NULL DEFAULT gen_random_uuid(),
    expires        TIMESTAMP WITH TIME ZONE NOT NULL,
    "sessionToken" TEXT                     NOT NULL,
    "userId"       UUID,
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
    id                  UUID NOT NULL DEFAULT gen_random_uuid(),
    type                TEXT NOT NULL,
    provider            TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    refresh_token       TEXT,
    access_token        TEXT,
    expires_at          BIGINT,
    token_type          TEXT,
    scope               TEXT,
    id_token            TEXT,
    session_state       TEXT,
    oauth_token_secret  TEXT,
    oauth_token         TEXT,
    "userId"            UUID,
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
    identifier TEXT,
    token      TEXT,
    expires    TIMESTAMP WITH TIME ZONE NOT NULL,
    CONSTRAINT verification_tokens_pkey PRIMARY KEY (token),
    CONSTRAINT token_unique UNIQUE (token),
    CONSTRAINT token_identifier_unique UNIQUE (token, identifier)
);

GRANT ALL ON TABLE next_auth.verification_tokens TO postgres;
GRANT ALL ON TABLE next_auth.verification_tokens TO service_role;