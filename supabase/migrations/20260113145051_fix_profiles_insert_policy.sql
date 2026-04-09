/*
  # Fix profiles INSERT policy

  ## Summary
  Fixes the INSERT policy for profiles table to properly use WITH CHECK clause
  instead of USING clause, which is the correct approach for INSERT operations.

  ## Changes
  1. Drop existing INSERT policy
  2. Create new INSERT policy with proper WITH CHECK clause

  ## Security
  - Users can only insert their own profile (id must match auth.uid())
  - This prevents users from creating profiles for other users
*/

DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (id = auth.uid());
