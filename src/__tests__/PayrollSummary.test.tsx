import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PayrollSummary } from '../components/Payroll/components/PayrollSummary';
import { PayrollCalculation } from '../components/Payroll/types';

// Mock formatCurrency and formatDate
vi.mock('../components/Payroll/utils', () => ({
  formatCurrency: vi.fn((amount) => `$${amount.toLocaleString()}`),
  formatDate: vi.fn((date) => new Date(date).toLocaleDateString('es-CO'))
}));

describe('PayrollSummary', () => {
  const mockCalculation: PayrollCalculation = {
    employee_id: '1',
    employee_name: 'Juan Pérez',
    employee_cedula: '123456789',
    period_start: '2024-01-01',
    period_end: '2024-01-15',
    total_hours: 80,
    base_salary: 2000000,
    hour_breakdowns: [
      {
        hour_type: 'Ordinarias',
        hours: 80,
        surcharge_percent: 0,
        hourly_rate: 25000,
        total: 2000000
      }
    ],
    total_surcharges: 0,
    transport_allowance: 200000,
    health_deduction: 80000,
    pension_deduction: 80000,
    total_deductions: 160000,
    net_salary: 2040000
  };

  const mockUserSettings = {
    company_name: 'Empresa ABC',
    company_nit: '901234567',
    company_address: 'Calle 123 #45-67'
  };

  it('should render calculation summary when calculation exists', () => {
    render(
      <PayrollSummary
        calculation={mockCalculation}
        userSettings={mockUserSettings}
      />
    );

    expect(screen.getByText('Resumen de Nómina')).toBeInTheDocument();
    expect(screen.getByText('Juan Pérez')).toBeInTheDocument();
    expect(screen.getByText('123456789')).toBeInTheDocument();
  });

  it('should render empty state when no calculation exists', () => {
    render(
      <PayrollSummary
        calculation={null}
        userSettings={mockUserSettings}
      />
    );

    expect(screen.getByText('Sin cálculo')).toBeInTheDocument();
    expect(screen.getByText('Realice un cálculo de nómina para ver el resumen aquí.')).toBeInTheDocument();
  });

  it('should display salary breakdown correctly', () => {
    render(
      <PayrollSummary
        calculation={mockCalculation}
        userSettings={mockUserSettings}
      />
    );

    expect(screen.getByText('$2.000.000')).toBeInTheDocument(); // Base salary
    expect(screen.getByText('$200.000')).toBeInTheDocument(); // Transport allowance
    expect(screen.getByText('$80.000')).toBeInTheDocument(); // Health deduction
    expect(screen.getByText('$80.000')).toBeInTheDocument(); // Pension deduction
    expect(screen.getByText('$160.000')).toBeInTheDocument(); // Total deductions
    expect(screen.getByText('$2.040.000')).toBeInTheDocument(); // Net salary
  });
});