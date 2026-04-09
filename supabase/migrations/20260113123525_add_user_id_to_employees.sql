/*
  # Add user_id to employees table

  ## Overview
  Adds user_id column to employees table to link employees directly to users.

  ## Changes
  1. Add user_id column to employees table
  2. Drop old RLS policies that use company_users

  ## Notes
  - This prepares for the new user-centric approach
  - Old policies removed to avoid conflicts
*/

-- Add user_id to employees table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'employees' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE employees ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Drop old policies
DROP POLICY IF EXISTS "Users can view own employees" ON employees;
DROP POLICY IF EXISTS "Users can manage own employees" ON employees;
DROP POLICY IF EXISTS "Users can view company employees" ON employees;
DROP POLICY IF EXISTS "Admins and operators can manage employees" ON employees;
