-- Add model column to chatbots table
ALTER TABLE chatbots ADD COLUMN IF NOT EXISTS model TEXT NOT NULL;