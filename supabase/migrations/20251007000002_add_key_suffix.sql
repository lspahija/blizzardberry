-- Add key_suffix column to store last 4 characters of the actual key
-- Existing keys will show '????' since we can't recover the original key
ALTER TABLE public.api_keys
ADD COLUMN IF NOT EXISTS key_suffix text NOT NULL DEFAULT '????';

-- Remove default for future inserts (we want to require it)
ALTER TABLE public.api_keys
ALTER COLUMN key_suffix DROP DEFAULT;
