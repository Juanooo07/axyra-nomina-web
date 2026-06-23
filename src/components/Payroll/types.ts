// Shared types for Payroll components
export interface Employee {
  id: string;
  full_name: string;
  cedula: string;
  contract_type: 'FIJO' | 'TEMPORAL';
  monthly_salary: number;
  receives_transport_allowance: boolean;
  deduct_health: boolean;
  deduct_pension: boolean;
}

export interface HourBreakdown {
  hour_type: string;
  hours: number;
  surcharge_percent: number;
  hourly_rate: number;
  total: number;
}

export interface PayrollCalculation {
  employee_id: string;
  employee_name: string;
  employee_cedula: string;
  period_start: string;
  period_end: string;
  total_hours: number;
  base_salary: number;
  hour_breakdowns: HourBreakdown[];
  total_surcharges: number;
  transport_allowance: number;
  health_deduction: number;
  pension_deduction: number;
  total_deductions: number;
  net_salary: number;
}

export interface PayrollHistory {
  id: string;
  employee_id: string;
  period_start: string;
  period_end: string;
  total_hours: number;
  base_salary: number;
  total_surcharges: number;
  transport_allowance: number;
  health_deduction: number;
  pension_deduction: number;
  total_deductions: number;
  net_salary: number;
  created_at: string;
  employee_name?: string;
  employee_cedula?: string;
}

export interface UserSettings {
  company_name?: string;
  company_nit?: string;
  company_address?: string;
}