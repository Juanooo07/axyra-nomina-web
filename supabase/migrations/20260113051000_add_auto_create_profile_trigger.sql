/*
  # Add auto-create profile trigger

  1. Changes
    - Creates a function to automatically create a profile when a new user signs up
    - Creates a trigger on auth.users that calls this function
    - Uses the full_name from auth.users metadata
  
  2. Security
    - Function runs with SECURITY DEFINER to bypass RLS
    - Only creates profile if it doesn't already exist
*/

-- Function to automatically create profile for new users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, created_at, updated_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Trigger to call the function when a new user is created
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
