/*
  # Update Hour Records and Create Payroll Tables

  ## Overview
  Updates hour_records to work with user_id and creates payroll_history table.

  ## Changes
  1. Add user_id to hour_records if not exists
  2. Create payroll_history table for storing generated payrolls
  3. Update RLS policies

  ## Security
  - RLS enabled on all tables
  - Users can only access their own data
*/

-- Add user_id to hour_records
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'hour_records' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE hour_records ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Drop old RLS policies
DROP POLICY IF EXISTS "Users can view own records" ON hour_records;
DROP POLICY IF EXISTS "Users can manage own records" ON hour_records;
DROP POLICY IF EXISTS "Users can view company hour records" ON hour_records;
DROP POLICY IF EXISTS "Users can manage company hour records" ON hour_records;

-- Create new RLS policies for hour_records
CREATE POLICY "Users can view own hour records"
  ON hour_records FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own hour records"
  ON hour_records FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own hour records"
  ON hour_records FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own hour records"
  ON hour_records FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Create payroll_history table
CREATE TABLE IF NOT EXISTS payroll_history (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  employee_id uuid REFERENCES employees(id) ON DELETE CASCADE NOT NULL,
  period_start date NOT NULL,
  period_end date NOT NULL,
  total_hours numeric DEFAULT 0,
  base_salary numeric DEFAULT 0,
  total_surcharges numeric DEFAULT 0,
  transport_allowance numeric DEFAULT 0,
  health_deduction numeric DEFAULT 0,
  pension_deduction numeric DEFAULT 0,
  total_deductions numeric DEFAULT 0,
  net_salary numeric DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE payroll_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own payroll history"
  ON payroll_history FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own payroll history"
  ON payroll_history FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own payroll history"
  ON payroll_history FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own payroll history"
  ON payroll_history FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());
