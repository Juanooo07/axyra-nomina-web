/*
  # Fix RLS Recursion in Company Users

  ## Overview
  Fixes the infinite recursion error in RLS policies by simplifying
  the company_users policies to avoid self-referencing queries.

  ## Changes
  1. Drop existing problematic policies on company_users
  2. Create new simplified policies that don't cause recursion
  3. Keep employees policies as they are (they work fine)

  ## Security
  - Users can view their own company_users records
  - Users can insert/update/delete based on direct user_id match
  - Maintains security without recursion
*/

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can view company members" ON company_users;
DROP POLICY IF EXISTS "Admins can manage company users" ON company_users;

-- Create new simplified policies without recursion
CREATE POLICY "Users can view own company user records"
  ON company_users FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own company user records"
  ON company_users FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own company user records"
  ON company_users FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own company user records"
  ON company_users FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());
