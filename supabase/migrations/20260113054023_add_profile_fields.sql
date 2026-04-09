/*
  # Add additional profile fields

  1. Changes
    - Add `phone` field to store user's phone number
    - Add `company_name` field to store the company they work for
    - Add `position` field to store their job position
    - Add `updated_at` field to track profile updates
  
  2. Notes
    - All new fields are optional (nullable)
    - Uses IF NOT EXISTS pattern to avoid conflicts
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'phone'
  ) THEN
    ALTER TABLE profiles ADD COLUMN phone text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'company_name'
  ) THEN
    ALTER TABLE profiles ADD COLUMN company_name text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'position'
  ) THEN
    ALTER TABLE profiles ADD COLUMN position text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE profiles ADD COLUMN updated_at timestamptz DEFAULT now();
  END IF;
END $$;
