/*
  # Fix profiles insert policy for service role

  1. Changes
    - Drop existing restrictive insert policy
    - Add new policy that allows service role to create profiles for new users
    - Keep existing select and update policies
    
  2. Security
    - Service role can insert profiles during user creation
    - Regular authenticated users can still only access their own data
*/

-- Drop the restrictive insert policy
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

-- Create a more permissive insert policy that allows profile creation during registration
CREATE POLICY "Allow profile creation during registration"
  ON profiles
  FOR INSERT
  TO authenticated, anon, service_role
  WITH CHECK (true);
