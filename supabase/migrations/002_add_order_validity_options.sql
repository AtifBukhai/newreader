-- Kitabo Database Migration: Add Validity Options to Orders
-- This migration adds support for two validity types:
-- 1. Upon Activation: Access duration starts when code is redeemed
-- 2. Valid Until Date: All codes expire on a specific date

-- Add new columns to orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS validity_type TEXT NOT NULL DEFAULT 'upon_activation';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS validity_duration INTEGER;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS validity_duration_unit TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS valid_until_date TIMESTAMPTZ;

-- Add check constraint to ensure validity_type is valid
ALTER TABLE orders ADD CONSTRAINT chk_validity_type 
  CHECK (validity_type IN ('upon_activation', 'valid_until_date'));

-- Add check constraint for duration unit
ALTER TABLE orders ADD CONSTRAINT chk_validity_duration_unit 
  CHECK (validity_duration_unit IS NULL OR validity_duration_unit IN ('days', 'months', 'years'));

-- Add check constraint to ensure proper validity configuration
ALTER TABLE orders ADD CONSTRAINT chk_validity_config
  CHECK (
    (validity_type = 'upon_activation' AND validity_duration IS NOT NULL AND validity_duration_unit IS NOT NULL AND valid_until_date IS NULL)
    OR
    (validity_type = 'valid_until_date' AND valid_until_date IS NOT NULL AND validity_duration IS NULL AND validity_duration_unit IS NULL)
  );

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_orders_validity_type ON orders(validity_type);

-- Update existing orders to have default validity type
UPDATE orders SET validity_type = 'upon_activation' WHERE validity_type IS NULL;

-- For existing orders, calculate validity_duration from validity_days
UPDATE orders 
SET validity_duration = validity_days, 
    validity_duration_unit = 'days'
WHERE validity_type = 'upon_activation' 
  AND validity_duration IS NULL;

-- Add comment to document the validity types
COMMENT ON COLUMN orders.validity_type IS 'Type of validity: upon_activation (starts when redeemed) or valid_until_date (fixed expiry date)';
COMMENT ON COLUMN orders.validity_duration IS 'Duration value for upon_activation type (e.g., 90)';
COMMENT ON COLUMN orders.validity_duration_unit IS 'Duration unit for upon_activation type: days, months, or years';
COMMENT ON COLUMN orders.valid_until_date IS 'Fixed expiry date for valid_until_date type';
