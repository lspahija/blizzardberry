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

-- Index for email lookups (already handled by UNIQUE constraint)

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

-- Index for session token lookups (already handled by UNIQUE constraint)
-- Index for user-based session queries
CREATE INDEX IF NOT EXISTS sessions_userId_idx ON next_auth.sessions ("userId");
-- Index for cleanup of expired sessions
CREATE INDEX IF NOT EXISTS sessions_expires_idx ON next_auth.sessions (expires);

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

-- Index for provider+account lookups (already handled by UNIQUE constraint)
-- Index for user-based account queries
CREATE INDEX IF NOT EXISTS accounts_userId_idx ON next_auth.accounts ("userId");

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

-- Index for cleanup of expired tokens
CREATE INDEX IF NOT EXISTS verification_tokens_expires_idx ON next_auth.verification_tokens (expires);

GRANT ALL ON TABLE next_auth.verification_tokens TO postgres;
GRANT ALL ON TABLE next_auth.verification_tokens TO service_role;

-- API Keys for programmatic access
CREATE TABLE IF NOT EXISTS public.api_keys
(
    id            UUID                     NOT NULL DEFAULT gen_random_uuid(),
    user_id       UUID                     NOT NULL,
    key_hash      TEXT                     NOT NULL,
    key_suffix    TEXT                     NOT NULL,
    name          TEXT,
    last_used_at  TIMESTAMP WITH TIME ZONE,
    expires_at    TIMESTAMP WITH TIME ZONE,
    created_at    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    CONSTRAINT api_keys_pkey PRIMARY KEY (id),
    CONSTRAINT key_hash_unique UNIQUE (key_hash),
    CONSTRAINT api_keys_user_id_fkey FOREIGN KEY (user_id)
        REFERENCES next_auth.users (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE CASCADE
);

-- Index for user-based API key queries
CREATE INDEX IF NOT EXISTS api_keys_user_id_idx ON public.api_keys (user_id);
-- Index for fast authentication lookups
CREATE INDEX IF NOT EXISTS api_keys_key_hash_idx ON public.api_keys (key_hash);
-- Index for cleanup of expired keys
CREATE INDEX IF NOT EXISTS api_keys_expires_at_idx ON public.api_keys (expires_at);

GRANT ALL ON TABLE public.api_keys TO postgres;
GRANT ALL ON TABLE public.api_keys TO service_role;

-- Row Level Security for API keys
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own API keys" ON public.api_keys
    FOR SELECT
    USING (next_auth.uid() = user_id);

CREATE POLICY "Users can insert their own API keys" ON public.api_keys
    FOR INSERT
    WITH CHECK (next_auth.uid() = user_id);

CREATE POLICY "Users can delete their own API keys" ON public.api_keys
    FOR DELETE
    USING (next_auth.uid() = user_id);

CREATE POLICY "Users can update their own API keys" ON public.api_keys
    FOR UPDATE
    USING (next_auth.uid() = user_id);