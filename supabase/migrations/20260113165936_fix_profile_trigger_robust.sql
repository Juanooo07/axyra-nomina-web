/*
  # Fix profile creation trigger with robust error handling

  1. Changes
    - Drop and recreate the trigger function with better error handling
    - Use ON CONFLICT to handle duplicate profile creation attempts
    - Add proper error logging
    
  2. Security
    - Function runs with SECURITY DEFINER to bypass RLS
    - Profiles still protected by RLS for normal operations
*/

-- Drop existing trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create improved function with ON CONFLICT handling
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.profiles (
    id, 
    full_name, 
    phone, 
    company_name, 
    position
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', NULL),
    COALESCE(NEW.raw_user_meta_data->>'company_name', NULL),
    COALESCE(NEW.raw_user_meta_data->>'position', NULL)
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG 'Error creating profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;

-- Create trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
