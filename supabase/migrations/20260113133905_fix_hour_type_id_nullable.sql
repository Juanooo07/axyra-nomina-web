/*
  # Fix Hour Records - Make hour_type_id Nullable

  ## Overview
  Makes the hour_type_id column nullable in the hour_records table since
  we are now using hour_type_name instead of hour_type_id.

  ## Changes
  1. Make hour_type_id nullable in hour_records table

  ## Security
  - No changes to RLS policies
*/

-- Make hour_type_id nullable
ALTER TABLE hour_records ALTER COLUMN hour_type_id DROP NOT NULL;
