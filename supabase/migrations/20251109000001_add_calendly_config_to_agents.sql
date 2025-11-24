-- Add calendly_config column to agents table
-- This stores Calendly integration settings for each agent
-- Using JSONB so we can store different config fields without changing the schema
ALTER TABLE "public"."agents"
ADD COLUMN "calendly_config" JSONB DEFAULT NULL;

-- Add comment explaining what data goes in this column
-- This helps when someone looks at the database schema later
COMMENT ON COLUMN "public"."agents"."calendly_config" IS 'Calendly integration settings per agent. Stores: enabled (bool), access_token (string), user_uri (string), default_event_type_uri (string). Example: {"enabled": true, "access_token": "token_here", "user_uri": "https://api.calendly.com/users/ABC123", "default_event_type_uri": "https://api.calendly.com/event_types/XYZ789"}';


