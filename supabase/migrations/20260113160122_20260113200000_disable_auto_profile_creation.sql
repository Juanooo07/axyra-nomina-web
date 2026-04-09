/*
  # Disable automatic profile creation trigger

  ## Summary
  Disables the automatic profile creation trigger because it conflicts with RLS policies.
  The application will handle profile creation manually after user signup.

  ## Changes
  1. Drop the trigger on auth.users
  2. Keep the function in case we need it later

  ## Reason
  The trigger runs with SECURITY DEFINER but RLS policies still apply, causing
  conflicts when trying to insert profiles. Manual creation from the app works better
  because it happens after the user is authenticated.
*/

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
