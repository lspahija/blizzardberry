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