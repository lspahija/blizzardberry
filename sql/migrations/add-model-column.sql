-- Add model column to chatbots table
ALTER TABLE chatbots ADD COLUMN IF NOT EXISTS model TEXT NOT NULL DEFAULT 'google/gemini-2.0-flash-001'; 