-- Migration: Update credit columns to use DECIMAL instead of INT
-- This allows for fractional credits which are needed for accurate token usage calculations

-- Update credit_batches table
ALTER TABLE credit_batches 
ALTER COLUMN quantity_remaining TYPE DECIMAL(10,4) USING quantity_remaining::DECIMAL(10,4);

-- Update credit_holds table  
ALTER TABLE credit_holds 
ALTER COLUMN quantity_held TYPE DECIMAL(10,4) USING quantity_held::DECIMAL(10,4);

-- Update the materialized view to handle DECIMAL
DROP MATERIALIZED VIEW IF EXISTS user_credit_summary;

CREATE MATERIALIZED VIEW user_credit_summary AS
SELECT user_id,
       SUM(quantity_remaining)
       FILTER (WHERE expires_at IS NULL OR expires_at > now()) AS active_credits
FROM credit_batches
GROUP BY user_id; 