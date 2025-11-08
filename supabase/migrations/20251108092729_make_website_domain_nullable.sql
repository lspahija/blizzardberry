-- Make website_domain column nullable in agents table
ALTER TABLE "public"."agents"
ALTER COLUMN "website_domain" DROP NOT NULL;
