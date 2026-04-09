/*
  # Add Deduction Fields to Employees Table

  ## Overview
  Adds boolean fields to track which deductions apply to each employee.
  These deductions only apply to employees with FIJO (permanent) contracts.

  ## Changes
  1. Add deduction fields to employees table:
    - `deduct_health` (boolean) - Whether to deduct health insurance (EPS)
    - `deduct_pension` (boolean) - Whether to deduct pension (AFP)
    - `deduct_transport` (boolean) - Whether to deduct transportation allowance

  ## Notes
  - These fields default to false
  - Only applicable for employees with contract_type = 'FIJO'
  - For TEMPORAL employees, these should remain false
*/

-- Add deduction fields to employees table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'employees' AND column_name = 'deduct_health'
  ) THEN
    ALTER TABLE employees ADD COLUMN deduct_health boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'employees' AND column_name = 'deduct_pension'
  ) THEN
    ALTER TABLE employees ADD COLUMN deduct_pension boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'employees' AND column_name = 'deduct_transport'
  ) THEN
    ALTER TABLE employees ADD COLUMN deduct_transport boolean DEFAULT false;
  END IF;
END $$;
