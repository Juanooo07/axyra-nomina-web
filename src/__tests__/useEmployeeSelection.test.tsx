import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useEmployeeSelection } from '../components/Payroll/hooks/useEmployeeSelection';

// Mock Supabase
vi.mock('../lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          eq: vi.fn(() => ({
            order: vi.fn(() => ({
              data: [
                {
                  id: '1',
                  full_name: 'Juan Pérez',
                  cedula: '123456789',
                  contract_type: 'FIJO',
                  monthly_salary: 2000000,
                  receives_transport_allowance: true,
                  deduct_health: true,
                  deduct_pension: true
                }
              ],
              error: null
            }))
          }))
        }))
      }))
    }))
  }
}));

// Mock useAuth
vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'user-123' }
  })
}));

describe('useEmployeeSelection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with empty state', () => {
    const { result } = renderHook(() => useEmployeeSelection());

    expect(result.current.employees).toEqual([]);
    expect(result.current.selectedEmployee).toBe('');
    expect(result.current.loading).toBe(false);
  });

  it('should load employees on mount when user exists', async () => {
    const { result } = renderHook(() => useEmployeeSelection());

    await waitFor(() => {
      expect(result.current.employees).toHaveLength(1);
      expect(result.current.employees[0].full_name).toBe('Juan Pérez');
    });
  });

  it('should handle employee selection', () => {
    const { result } = renderHook(() => useEmployeeSelection());

    result.current.handleEmployeeChange('employee-1');

    expect(result.current.selectedEmployee).toBe('employee-1');
  });

  it('should handle external employee selection', () => {
    const { result } = renderHook(() => useEmployeeSelection('external-employee'));

    // Simulate employees loading
    result.current.employees = [{
      id: 'external-employee',
      full_name: 'External Employee',
      cedula: '987654321',
      contract_type: 'FIJO',
      monthly_salary: 1500000,
      receives_transport_allowance: false,
      deduct_health: true,
      deduct_pension: true
    }];

    expect(result.current.selectedEmployee).toBe('external-employee');
  });
});