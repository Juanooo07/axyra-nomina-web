/*
  # Fix Hour Records - Make company_id Nullable

  ## Overview
  Makes the company_id column nullable in the hour_records table since
  records are now linked via user_id instead of company_id.

  ## Changes
  1. Make company_id nullable in hour_records table

  ## Security
  - No changes to RLS policies
*/

-- Make company_id nullable
ALTER TABLE hour_records ALTER COLUMN company_id DROP NOT NULL;
