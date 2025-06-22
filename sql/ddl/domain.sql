-- TODO: after launch, we should add db migrations (Supabase Migrations/Flyway/Liquibase, etc): https://grok.com/share/bGVnYWN5_028f4133-6951-47e9-803e-da4e87a5ddae

-- teams

CREATE TABLE teams
(
    id          UUID                     DEFAULT gen_random_uuid() PRIMARY KEY,
    name        TEXT NOT NULL UNIQUE,
    slug        TEXT NOT NULL UNIQUE,
    created_by  UUID NOT NULL REFERENCES next_auth.users (id) ON DELETE CASCADE,
    created_at  TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX teams_created_by_idx ON teams (created_by);
CREATE INDEX teams_slug_idx ON teams (slug);

-- Function to generate unique team slug from user name
CREATE OR REPLACE FUNCTION generate_team_slug(user_name TEXT)
RETURNS TEXT AS $$
DECLARE
    base_slug TEXT;
    final_slug TEXT;
    counter INTEGER := 0;
BEGIN
    -- Convert name to slug format (lowercase, replace spaces with hyphens, remove special chars)
    base_slug := lower(regexp_replace(regexp_replace(user_name, '[^a-zA-Z0-9\s]', '', 'g'), '\s+', '-', 'g'));
    
    -- Remove leading/trailing hyphens
    base_slug := trim(both '-' from base_slug);
    
    -- Ensure slug is not empty
    IF base_slug = '' THEN
        base_slug := 'team';
    END IF;
    
    -- Add '-team' suffix
    base_slug := base_slug || '-team';
    
    -- Check if slug exists and find next available number
    final_slug := base_slug;
    WHILE EXISTS (SELECT 1 FROM teams WHERE slug = final_slug) LOOP
        counter := counter + 1;
        final_slug := base_slug || '_' || counter;
    END LOOP;
    
    RETURN final_slug;
END;
$$ LANGUAGE plpgsql;

-- Function to create default team for new user
CREATE OR REPLACE FUNCTION create_default_team_for_user()
RETURNS TRIGGER AS $$
DECLARE
    team_id UUID;
    team_slug TEXT;
    team_name TEXT;
BEGIN
    -- Only create default team if user has a name
    IF NEW.name IS NOT NULL AND NEW.name != '' THEN
        -- Generate team slug from user name
        team_slug := generate_team_slug(NEW.name);
        team_name := NEW.name || '''s Team';
        
        -- Create the team
        INSERT INTO teams (name, slug, created_by)
        VALUES (team_name, team_slug, NEW.id)
        RETURNING id INTO team_id;
        
        -- Add user as admin of their own team
        INSERT INTO team_members (team_id, user_id, role)
        VALUES (team_id, NEW.id, 'ADMIN');
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to create default team when user is created
CREATE TRIGGER create_default_team_trigger
    AFTER INSERT ON next_auth.users
    FOR EACH ROW
    EXECUTE FUNCTION create_default_team_for_user();

-- team members with roles

CREATE TYPE team_role AS ENUM ('ADMIN', 'USER');

CREATE TABLE team_members
(
    id         UUID                     DEFAULT gen_random_uuid() PRIMARY KEY,
    team_id    UUID NOT NULL REFERENCES teams (id) ON DELETE CASCADE,
    user_id    UUID NOT NULL REFERENCES next_auth.users (id) ON DELETE CASCADE,
    role       team_role NOT NULL DEFAULT 'USER',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(team_id, user_id)
);

CREATE INDEX team_members_team_id_idx ON team_members (team_id);
CREATE INDEX team_members_user_id_idx ON team_members (user_id);

-- agents (updated to reference teams instead of users)

CREATE TABLE agents
(
    id             UUID                     DEFAULT gen_random_uuid() PRIMARY KEY,
    name           TEXT NOT NULL,
    website_domain TEXT NOT NULL,
    model          TEXT NOT NULL,
    team_id        UUID NOT NULL REFERENCES teams (id) ON DELETE CASCADE,
    created_by     UUID NOT NULL REFERENCES next_auth.users (id) ON DELETE CASCADE,
    created_at     TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX agents_team_id_idx ON agents (team_id);
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
-- 3. Projection: outstanding "holds" (authorisations) --------------
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

-- Helper functions for team management

-- Function to get user's teams with their roles
CREATE OR REPLACE FUNCTION get_user_teams(user_uuid UUID)
RETURNS TABLE (
    team_id UUID,
    team_name TEXT,
    team_slug TEXT,
    user_role team_role,
    is_admin BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        t.id,
        t.name,
        t.slug,
        tm.role,
        tm.role = 'ADMIN'::team_role
    FROM teams t
    JOIN team_members tm ON t.id = tm.team_id
    WHERE tm.user_id = user_uuid
    ORDER BY t.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to check if user has access to team
CREATE OR REPLACE FUNCTION user_has_team_access(user_uuid UUID, team_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 
        FROM team_members 
        WHERE user_id = user_uuid AND team_id = team_uuid
    );
END;
$$ LANGUAGE plpgsql;

-- Function to check if user is team admin
CREATE OR REPLACE FUNCTION user_is_team_admin(user_uuid UUID, team_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 
        FROM team_members 
        WHERE user_id = user_uuid AND team_id = team_uuid AND role = 'ADMIN'
    );
END;
$$ LANGUAGE plpgsql;

-- View for team members with user details
CREATE VIEW team_members_with_details AS
SELECT 
    tm.id,
    tm.team_id,
    tm.user_id,
    tm.role,
    tm.created_at,
    t.name as team_name,
    t.slug as team_slug,
    u.name as user_name,
    u.email as user_email
FROM team_members tm
JOIN teams t ON tm.team_id = t.id
JOIN next_auth.users u ON tm.user_id = u.id;

-- 4. (Nice-to-have) summary view for dashboards ---------------------
CREATE MATERIALIZED VIEW user_credit_summary AS
SELECT user_id,
       SUM(quantity_remaining)
       FILTER (WHERE expires_at IS NULL OR expires_at > now()) AS active_credits
FROM credit_batches
GROUP BY user_id;

-- Team invitations table
CREATE TABLE IF NOT EXISTS team_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  role team_role NOT NULL DEFAULT 'USER',
  invited_by UUID NOT NULL REFERENCES next_auth.users(id) ON DELETE CASCADE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(team_id, email)
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_team_invitations_email ON team_invitations(email);
CREATE INDEX IF NOT EXISTS idx_team_invitations_team_id ON team_invitations(team_id);
CREATE INDEX IF NOT EXISTS idx_team_invitations_expires_at ON team_invitations(expires_at);