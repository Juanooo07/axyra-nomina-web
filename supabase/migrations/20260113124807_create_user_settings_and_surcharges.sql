/*
  # Create User Settings and Hour Surcharges Tables

  ## Overview
  Creates tables for user-specific settings and hour surcharge configurations.
  Each user (company) has their own settings and custom hour surcharges.

  ## Changes
  1. Create user_settings table for company configuration
  2. Create hour_surcharges table for customizable hour types
  3. Add trigger to create default settings for new users
  4. Seed default data

  ## Security
  - RLS enabled on all tables
  - Users can only access their own data
*/

-- Create user_settings table
CREATE TABLE IF NOT EXISTS user_settings (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  company_name text NOT NULL DEFAULT 'Mi Empresa',
  company_nit text DEFAULT '',
  company_address text DEFAULT '',
  minimum_salary numeric DEFAULT 1423500,
  transport_allowance numeric DEFAULT 200000,
  health_deduction_percent numeric DEFAULT 4.0,
  pension_deduction_percent numeric DEFAULT 4.0,
  weekly_work_hours numeric DEFAULT 48,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own settings"
  ON user_settings FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own settings"
  ON user_settings FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own settings"
  ON user_settings FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Create hour_surcharges table
CREATE TABLE IF NOT EXISTS hour_surcharges (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  hour_type_name text NOT NULL,
  surcharge_percent numeric NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, hour_type_name)
);

ALTER TABLE hour_surcharges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own surcharges"
  ON hour_surcharges FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own surcharges"
  ON hour_surcharges FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own surcharges"
  ON hour_surcharges FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own surcharges"
  ON hour_surcharges FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Function to create default settings for new users
CREATE OR REPLACE FUNCTION create_default_user_settings()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_settings (user_id, company_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', 'Mi Empresa'))
  ON CONFLICT (user_id) DO NOTHING;
  
  INSERT INTO hour_surcharges (user_id, hour_type_name, surcharge_percent) VALUES
    (NEW.id, 'Hora Ordinaria', 0),
    (NEW.id, 'Recargo Nocturno', 35),
    (NEW.id, 'Recargo Diurno Dominical', 75),
    (NEW.id, 'Recargo Nocturno Dominical', 110),
    (NEW.id, 'Hora Extra Diurna', 25),
    (NEW.id, 'Hora Extra Nocturna', 75),
    (NEW.id, 'Hora Diurna Dominical', 80),
    (NEW.id, 'Hora Extra Diurna Dominical', 105),
    (NEW.id, 'Hora Nocturna Dominical', 110),
    (NEW.id, 'Hora Extra Nocturna Dominical', 185)
  ON CONFLICT (user_id, hour_type_name) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created_settings ON auth.users;
CREATE TRIGGER on_auth_user_created_settings
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_default_user_settings();

-- Create settings for existing users
INSERT INTO user_settings (user_id, company_name)
SELECT 
  id,
  COALESCE(raw_user_meta_data->>'full_name', 'Mi Empresa')
FROM auth.users
WHERE NOT EXISTS (SELECT 1 FROM user_settings WHERE user_settings.user_id = auth.users.id)
ON CONFLICT (user_id) DO NOTHING;

-- Create default surcharges for existing users
INSERT INTO hour_surcharges (user_id, hour_type_name, surcharge_percent)
SELECT u.id, ht.hour_type_name, ht.surcharge_percent
FROM auth.users u
CROSS JOIN (VALUES
  ('Hora Ordinaria', 0),
  ('Recargo Nocturno', 35),
  ('Recargo Diurno Dominical', 75),
  ('Recargo Nocturno Dominical', 110),
  ('Hora Extra Diurna', 25),
  ('Hora Extra Nocturna', 75),
  ('Hora Diurna Dominical', 80),
  ('Hora Extra Diurna Dominical', 105),
  ('Hora Nocturna Dominical', 110),
  ('Hora Extra Nocturna Dominical', 185)
) AS ht(hour_type_name, surcharge_percent)
WHERE NOT EXISTS (
  SELECT 1 FROM hour_surcharges 
  WHERE hour_surcharges.user_id = u.id 
    AND hour_surcharges.hour_type_name = ht.hour_type_name
)
ON CONFLICT (user_id, hour_type_name) DO NOTHING;
