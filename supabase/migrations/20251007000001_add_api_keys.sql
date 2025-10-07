-- Create API keys table
CREATE TABLE IF NOT EXISTS "public"."api_keys" (
    "id" uuid DEFAULT extensions.uuid_generate_v4() NOT NULL PRIMARY KEY,
    "user_id" uuid NOT NULL REFERENCES next_auth.users(id) ON DELETE CASCADE,
    "key_hash" text NOT NULL UNIQUE,
    "key_suffix" text NOT NULL,
    "name" text,
    "last_used_at" timestamp with time zone,
    "expires_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

-- Create index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS "idx_api_keys_user_id" ON "public"."api_keys"("user_id");

-- Create index on key_hash for faster authentication
CREATE INDEX IF NOT EXISTS "idx_api_keys_key_hash" ON "public"."api_keys"("key_hash");

-- Set owner
ALTER TABLE "public"."api_keys" OWNER TO "postgres";

-- Enable RLS
ALTER TABLE "public"."api_keys" ENABLE ROW LEVEL SECURITY;

-- Create policy for users to manage their own API keys
CREATE POLICY "Users can view their own API keys" ON "public"."api_keys"
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own API keys" ON "public"."api_keys"
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own API keys" ON "public"."api_keys"
    FOR DELETE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own API keys" ON "public"."api_keys"
    FOR UPDATE
    USING (auth.uid() = user_id);
