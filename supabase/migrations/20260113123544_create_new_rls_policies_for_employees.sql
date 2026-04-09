/*
  # Create New RLS Policies for Employees

  ## Overview
  Creates simple RLS policies for employees using user_id directly.

  ## Changes
  1. Create RLS policies that use user_id
  2. Allow users to manage their own employees

  ## Security
  - Users can only access their own employees
  - All operations restricted to authenticated users
*/

-- Create new simple policies
CREATE POLICY "Users can view own employees"
  ON employees FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own employees"
  ON employees FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own employees"
  ON employees FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own employees"
  ON employees FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());
