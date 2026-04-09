import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { PayrollSelector } from './components/PayrollSelector';
import { PayrollCalculator } from './components/PayrollCalculator';
import { PayrollSummary } from './components/PayrollSummary';
import { PayrollHistoryComponent } from './components/PayrollHistory';
import { Employee, PayrollCalculation, PayrollHistory, UserSettings } from './types';
import { useEmployeeSelection } from './hooks/useEmployeeSelection';

interface PayrollProps {
  selectedEmployeeId?: string;
  onEmployeeChange?: (employeeId: string | null) => void;
}

export function Payroll({ selectedEmployeeId, onEmployeeChange }: PayrollProps) {
  const { user } = useAuth();

  // Selection state
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Use custom hook for employee selection
  const {
    employees,
    selectedEmployee,
    loadEmployees,
    handleEmployeeChange: handleEmployeeSelection
  } = useEmployeeSelection(selectedEmployeeId);

  // Data state
  const [payrollHistory, setPayrollHistory] = useState<PayrollHistory[]>([]);
  const [calculation, setCalculation] = useState<PayrollCalculation | null>(null);
  const [userSettings, setUserSettings] = useState<UserSettings>({});

  // Load employees and user settings when user changes
  useEffect(() => {
    if (user) {
      loadEmployees();
      loadUserSettings();
    }
  }, [user]);

  // Load payroll history when employee changes
  useEffect(() => {
    if (user && selectedEmployee) {
      loadPayrollHistory();
    } else {
      setPayrollHistory([]);
    }
  }, [user, selectedEmployee]);

  const loadUserSettings = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_settings')
        .select('company_name, company_nit, company_address')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      if (data) {
        setUserSettings(data);
      }
    } catch (err) {
      console.error('Error loading user settings:', err);
    }
  };

  const loadPayrollHistory = async () => {
    if (!user || !selectedEmployee) return;

    try {
      const { data, error } = await supabase
        .from('payrolls')
        .select(
          id,
          employee_id,
          period_start,
          period_end,
          total_hours,
          base_salary,
          total_surcharges,
          transport_allowance,
          health_deduction,
          pension_deduction,
          total_deductions,
          net_salary,
          created_at,
          employees (
            full_name,
            cedula
          )
        )
        .eq('user_id', user.id)
        .eq('employee_id', selectedEmployee)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedData = data?.map(payroll => ({
        ...payroll,
        employee_name: payroll.employees?.full_name,
        employee_cedula: payroll.employees?.cedula
      })) || [];

      setPayrollHistory(formattedData);
    } catch (err) {
      console.error('Error loading payroll history:', err);
    }
  };

  const handleEmployeeChange = (employeeId: string) => {
    handleEmployeeSelection(employeeId);
    setCalculation(null);
    if (onEmployeeChange) {
      onEmployeeChange(employeeId);
    }
  };

  const handleCalculationComplete = (newCalculation: PayrollCalculation) => {
    setCalculation(newCalculation);
  };

  const handleViewPayroll = (payroll: PayrollHistory) => {
    // Convert payroll history to calculation format for viewing
    const viewingCalculation: PayrollCalculation = {
      employee_id: payroll.employee_id,
      employee_name: payroll.employee_name || '',
      employee_cedula: payroll.employee_cedula || '',
      period_start: payroll.period_start,
      period_end: payroll.period_end,
      total_hours: payroll.total_hours,
      base_salary: payroll.base_salary,
      hour_breakdowns: [], // Would need to fetch detailed hour data
      total_surcharges: payroll.total_surcharges,
      transport_allowance: payroll.transport_allowance,
      health_deduction: payroll.health_deduction,
      pension_deduction: payroll.pension_deduction,
      total_deductions: payroll.total_deductions,
      net_salary: payroll.net_salary
    };
    setCalculation(viewingCalculation);
  };

  return (
    <div className="space-y-6">
      <PayrollSelector
        selectedEmployee={selectedEmployee}
        startDate={startDate}
        endDate={endDate}
        employees={employees}
        onEmployeeChange={handleEmployeeChange}
        onStartDateChange={setStartDate}
        onEndDateChange={setEndDate}
        onEmployeeSelect={onEmployeeChange}
      />

      <PayrollCalculator
        selectedEmployee={selectedEmployee}
        startDate={startDate}
        endDate={endDate}
        employees={employees}
        onCalculationComplete={handleCalculationComplete}
      />

      <PayrollSummary
        calculation={calculation}
        userSettings={userSettings}
      />

      <PayrollHistoryComponent
        payrollHistory={payrollHistory}
        onViewPayroll={handleViewPayroll}
        onRefresh={loadPayrollHistory}
      />
    </div>
  );
}
