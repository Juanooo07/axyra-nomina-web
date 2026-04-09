/*
  # Fix Employees Table - Make company_id Nullable

  ## Overview
  Makes the company_id column nullable in the employees table since
  each user is now their own company and employees are linked via user_id.

  ## Changes
  1. Make company_id nullable in employees table
  2. This allows employees to be created with just user_id

  ## Security
  - No changes to RLS policies
  - Users can still only access their own employees via user_id
*/

-- Make company_id nullable
ALTER TABLE employees ALTER COLUMN company_id DROP NOT NULL;
