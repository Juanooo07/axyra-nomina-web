import { useState } from 'react';
import { Calculator, DollarSign, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { supabase } from '../../../lib/supabase';

interface Employee {
  id: string;
  full_name: string;
  cedula: string;
  contract_type: 'FIJO' | 'TEMPORAL';
  monthly_salary: number;
  receives_transport_allowance: boolean;
  deduct_health: boolean;
  deduct_pension: boolean;
}

interface HourBreakdown {
  hour_type: string;
  hours: number;
  surcharge_percent: number;
  hourly_rate: number;
  total: number;
}

interface PayrollCalculation {
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

interface PayrollCalculatorProps {
  selectedEmployee: string;
  startDate: string;
  endDate: string;
  employees: Employee[];
  onCalculationComplete: (calculation: PayrollCalculation) => void;
}

export function PayrollCalculator({
  selectedEmployee,
  startDate,
  endDate,
  employees,
  onCalculationComplete
}: PayrollCalculatorProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const calculatePayroll = async () => {
    if (!selectedEmployee || !startDate || !endDate || !user) {
      setError('Por favor complete todos los campos');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const employee = employees.find(emp => emp.id === selectedEmployee);
      if (!employee) {
        throw new Error('Empleado no encontrado');
      }

      // Get user settings for minimum salary and deductions
      const { data: settings, error: settingsError } = await supabase
        .from('user_settings')
        .select('minimum_salary, transport_allowance, health_deduction_percent, pension_deduction_percent')
        .eq('user_id', user.id)
        .maybeSingle();

      if (settingsError) throw settingsError;

      const minimumSalary = settings?.minimum_salary || 1160000;
      const transportAllowance = settings?.transport_allowance || 140606;
      const healthDeductionPercent = settings?.health_deduction_percent || 4;
      const pensionDeductionPercent = settings?.pension_deduction_percent || 4;

      // Get hour records for the period
      const { data: hourRecords, error: hoursError } = await supabase
        .from('hour_records')
        .select(`
          hours,
          hour_type_id,
          hour_types (
            name,
            percentage
          )
        `)
        .eq('employee_id', selectedEmployee)
        .eq('user_id', user.id)
        .gte('period', startDate)
        .lte('period', endDate);

      if (hoursError) throw hoursError;

      // Calculate base salary (30 days equivalent)
      const baseSalary = employee.monthly_salary;

      // Calculate hour value (base salary / 240 hours per month)
      const hourValue = baseSalary / 240;

      // Process hour records
      const hourBreakdowns: HourBreakdown[] = [];
      let totalSurcharges = 0;

      if (hourRecords && hourRecords.length > 0) {
        const groupedHours = hourRecords.reduce((acc, record) => {
          const hourTypeName = record.hour_types?.name || 'Normal';
          const surchargePercent = record.hour_types?.percentage || 0;

          if (!acc[hourTypeName]) {
            acc[hourTypeName] = { hours: 0, surchargePercent };
          }
          acc[hourTypeName].hours += record.hours;
          return acc;
        }, {} as Record<string, { hours: number; surchargePercent: number }>);

        for (const [hourType, data] of Object.entries(groupedHours)) {
          const hourlyRate = hourValue * (1 + data.surchargePercent / 100);
          const total = hourlyRate * data.hours;

          hourBreakdowns.push({
            hour_type: hourType,
            hours: data.hours,
            surcharge_percent: data.surchargePercent,
            hourly_rate: hourlyRate,
            total: total
          });

          totalSurcharges += total;
        }
      }

      // Calculate transport allowance (if applicable)
      const transportAllowanceAmount = employee.receives_transport_allowance && baseSalary <= (minimumSalary * 2)
        ? transportAllowance
        : 0;

      // Calculate deductions
      const healthDeduction = employee.deduct_health ? (baseSalary * healthDeductionPercent / 100) : 0;
      const pensionDeduction = employee.deduct_pension ? (baseSalary * pensionDeductionPercent / 100) : 0;
      const totalDeductions = healthDeduction + pensionDeduction;

      // Calculate net salary
      const netSalary = baseSalary + totalSurcharges + transportAllowanceAmount - totalDeductions;

      const calculation: PayrollCalculation = {
        employee_id: employee.id,
        employee_name: employee.full_name,
        employee_cedula: employee.cedula,
        period_start: startDate,
        period_end: endDate,
        total_hours: hourBreakdowns.reduce((sum, breakdown) => sum + breakdown.hours, 0),
        base_salary: baseSalary,
        hour_breakdowns: hourBreakdowns,
        total_surcharges: totalSurcharges,
        transport_allowance: transportAllowanceAmount,
        health_deduction: healthDeduction,
        pension_deduction: pensionDeduction,
        total_deductions: totalDeductions,
        net_salary: netSalary
      };

      onCalculationComplete(calculation);
      setSuccess('Cálculo completado exitosamente');

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al calcular la nómina';
      setError(message);
      console.error('Payroll calculation error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Cálculo de Nómina</h3>
        <button
          onClick={calculatePayroll}
          disabled={loading || !selectedEmployee || !startDate || !endDate}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center"
        >
          <Calculator className="mr-2" size={16} />
          {loading ? 'Calculando...' : 'Calcular Nómina'}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-4">
          <div className="flex">
            <CheckCircle className="h-5 w-5 text-green-400" />
            <div className="ml-3">
              <p className="text-sm text-green-700">{success}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}