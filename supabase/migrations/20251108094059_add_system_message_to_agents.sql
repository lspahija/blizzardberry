-- Add system_message column to agents table
ALTER TABLE "public"."agents"
ADD COLUMN "system_message" text;

-- Add a comment to describe the column
COMMENT ON COLUMN "public"."agents"."system_message" IS 'Custom instructions/system message for the agent behavior';
