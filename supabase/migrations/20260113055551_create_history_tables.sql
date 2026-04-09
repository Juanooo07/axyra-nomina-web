/*
  # Create History Tables for Payroll System

  ## Overview
  Creates tables to store historical records of worked hours and payroll payments per employee.
  This allows tracking of all hours worked and payments made over time, organized by period (month).

  ## New Tables
  
  ### 1. `hour_records_history`
  Stores the complete history of all hours worked by employees
  - `id` (uuid, primary key)
  - `employee_id` (uuid, FK to employees)
  - `hour_type_id` (uuid, FK to hour_types)
  - `record_date` (date) - Date when the hours were worked
  - `hours` (numeric) - Number of hours worked
  - `unit_value` (numeric) - Rate per hour
  - `total_value` (numeric) - Total amount (hours * unit_value)
  - `period` (text) - Period identifier (e.g., "2026-01" for January 2026)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 2. `payroll_payments`
  Stores the history of payroll payments made to employees
  - `id` (uuid, primary key)
  - `employee_id` (uuid, FK to employees)
  - `payment_date` (timestamptz) - When the payment was made
  - `period` (text) - Period identifier (e.g., "2026-01")
  - `total_hours` (numeric) - Total hours paid in this payment
  - `total_amount` (numeric) - Total amount paid
  - `notes` (text, optional)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ## Security
  - Enable RLS on both tables
  - Add policies for authenticated users to manage their company's data
*/

-- Create hour_records_history table
CREATE TABLE IF NOT EXISTS hour_records_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  hour_type_id uuid NOT NULL REFERENCES hour_types(id) ON DELETE RESTRICT,
  record_date date NOT NULL DEFAULT CURRENT_DATE,
  hours numeric(10, 2) NOT NULL CHECK (hours > 0),
  unit_value numeric(12, 2) NOT NULL CHECK (unit_value >= 0),
  total_value numeric(12, 2) NOT NULL CHECK (total_value >= 0),
  period text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create payroll_payments table
CREATE TABLE IF NOT EXISTS payroll_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  payment_date timestamptz NOT NULL DEFAULT now(),
  period text NOT NULL,
  total_hours numeric(10, 2) NOT NULL CHECK (total_hours >= 0),
  total_amount numeric(12, 2) NOT NULL CHECK (total_amount >= 0),
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_hour_records_history_employee ON hour_records_history(employee_id);
CREATE INDEX IF NOT EXISTS idx_hour_records_history_period ON hour_records_history(period);
CREATE INDEX IF NOT EXISTS idx_hour_records_history_date ON hour_records_history(record_date);
CREATE INDEX IF NOT EXISTS idx_payroll_payments_employee ON payroll_payments(employee_id);
CREATE INDEX IF NOT EXISTS idx_payroll_payments_period ON payroll_payments(period);

-- Enable RLS
ALTER TABLE hour_records_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroll_payments ENABLE ROW LEVEL SECURITY;

-- Policies for hour_records_history
CREATE POLICY "Users can view hour records history of their company employees"
  ON hour_records_history FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM employees e
      JOIN company_users cu ON e.company_id = cu.company_id
      WHERE e.id = hour_records_history.employee_id
      AND cu.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert hour records history for their company employees"
  ON hour_records_history FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM employees e
      JOIN company_users cu ON e.company_id = cu.company_id
      WHERE e.id = hour_records_history.employee_id
      AND cu.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update hour records history for their company employees"
  ON hour_records_history FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM employees e
      JOIN company_users cu ON e.company_id = cu.company_id
      WHERE e.id = hour_records_history.employee_id
      AND cu.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM employees e
      JOIN company_users cu ON e.company_id = cu.company_id
      WHERE e.id = hour_records_history.employee_id
      AND cu.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete hour records history for their company employees"
  ON hour_records_history FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM employees e
      JOIN company_users cu ON e.company_id = cu.company_id
      WHERE e.id = hour_records_history.employee_id
      AND cu.user_id = auth.uid()
    )
  );

-- Policies for payroll_payments
CREATE POLICY "Users can view payroll payments of their company employees"
  ON payroll_payments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM employees e
      JOIN company_users cu ON e.company_id = cu.company_id
      WHERE e.id = payroll_payments.employee_id
      AND cu.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert payroll payments for their company employees"
  ON payroll_payments FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM employees e
      JOIN company_users cu ON e.company_id = cu.company_id
      WHERE e.id = payroll_payments.employee_id
      AND cu.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update payroll payments for their company employees"
  ON payroll_payments FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM employees e
      JOIN company_users cu ON e.company_id = cu.company_id
      WHERE e.id = payroll_payments.employee_id
      AND cu.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM employees e
      JOIN company_users cu ON e.company_id = cu.company_id
      WHERE e.id = payroll_payments.employee_id
      AND cu.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete payroll payments for their company employees"
  ON payroll_payments FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM employees e
      JOIN company_users cu ON e.company_id = cu.company_id
      WHERE e.id = payroll_payments.employee_id
      AND cu.user_id = auth.uid()
    )
  );
