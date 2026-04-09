/*
  # Add Transport Allowance Field to Employees

  ## Overview
  Adds a boolean field to track whether an employee receives transport allowance.
  This is used to determine if the transport allowance should be included in payroll calculations.

  ## Changes
  1. Add `receives_transport_allowance` column to employees table
     - Defaults to false
     - Not nullable

  ## Security
  - No changes to RLS policies
*/

-- Add receives_transport_allowance column to employees
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'employees' AND column_name = 'receives_transport_allowance'
  ) THEN
    ALTER TABLE employees ADD COLUMN receives_transport_allowance boolean DEFAULT false NOT NULL;
  END IF;
END $$;
