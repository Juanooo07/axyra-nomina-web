/*
  # Recreate profiles table with correct RLS policies

  1. Changes
    - Drop all existing policies
    - Create simple, working policies for registration and user access
    
  2. Security
    - Anyone can insert profiles (needed for registration via service role)
    - Users can only view and update their own profiles
*/

-- Drop all existing policies
DROP POLICY IF EXISTS "Allow profile creation during registration" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Service role can insert profiles" ON profiles;

-- Create new simplified policies
CREATE POLICY "Anyone can insert profiles"
  ON profiles
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can view own profile"
  ON profiles
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);
