import { useState, useEffect } from 'react';
import {
  Calculator,
  Calendar,
  User,
  DollarSign,
  FileText,
  Printer,
  Save,
  AlertCircle,
  CheckCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  Eye,
  Plus,
  Upload
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { ExportToDrive } from '../HourRecords/ExportToDrive';

// Interfaces
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

interface UserSettings {
  minimum_salary: number;
  transport_allowance: number;
  health_deduction_percent: number;
  pension_deduction_percent: number;
}

interface HourSurcharge {
  hour_type_name: string;
  surcharge_percent: number;
}

interface HourRecord {
  hour_type_name: string;
  hours: number;
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

interface PayrollHistory {
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

interface PayrollProps {
  selectedEmployeeId?: string;
  onEmployeeChange?: (employeeId: string | null) => void;
}

export function Payroll({ selectedEmployeeId, onEmployeeChange }: PayrollProps) {
  const { user } = useAuth();

  // Selection state
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Data state
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [payrollHistory, setPayrollHistory] = useState<PayrollHistory[]>([]);
  const [calculation, setCalculation] = useState<PayrollCalculation | null>(null);
  const [viewingPayroll, setViewingPayroll] = useState<PayrollHistory | null>(null);
  const [viewingCalculation, setViewingCalculation] = useState<PayrollCalculation | null>(null);
  const [userSettings, setUserSettings] = useState<{
    company_name?: string;
    company_nit?: string;
    company_address?: string;
  }>({});

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showCalculation, setShowCalculation] = useState(false);

  // Initialize dates to current fortnight (1st to 15th or 16th to end of month)
  useEffect(() => {
    const today = new Date();
    const day = today.getDate();
    const year = today.getFullYear();
    const month = today.getMonth() + 1;

    if (day <= 15) {
      setStartDate(`${year}-${String(month).padStart(2, '0')}-01`);
      setEndDate(`${year}-${String(month).padStart(2, '0')}-15`);
    } else {
      const lastDay = new Date(year, month, 0).getDate();
      setStartDate(`${year}-${String(month).padStart(2, '0')}-16`);
      setEndDate(`${year}-${String(month).padStart(2, '0')}-${lastDay}`);
    }
  }, []);

  // Load employees when user changes
  useEffect(() => {
    if (user) {
      loadEmployees();
      loadUserSettings();
    }
  }, [user]);

  useEffect(() => {
    if (selectedEmployeeId && employees.length > 0 && selectedEmployeeId !== selectedEmployee) {
      const exists = employees.some(emp => emp.id === selectedEmployeeId);
      if (exists) {
        setSelectedEmployee(selectedEmployeeId);
      }
    }
  }, [selectedEmployeeId, employees]);

  // Load payroll history when employee changes
  useEffect(() => {
    if (user && selectedEmployee) {
      loadPayrollHistory();
    } else {
      setPayrollHistory([]);
    }
  }, [user, selectedEmployee]);

  const loadEmployees = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('employees')
        .select('id, full_name, cedula, contract_type, monthly_salary, receives_transport_allowance, deduct_health, deduct_pension')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('full_name');

      if (error) throw error;
      setEmployees(data || []);
    } catch (err) {
      console.error('Error loading employees:', err);
      setError('Error al cargar los empleados');
    }
  };

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

  // helper used to recalculate a single payroll and update the database
  const recalcAndUpdate = async (payroll: PayrollHistory) => {
    try {
      // fetch employee and related settings required for a complete recomputation
      const employee = employees.find(e => e.id === payroll.employee_id);
      if (!employee) return null;

      const { data: hourRecords } = await supabase
        .from('hour_records')
        .select('hour_type_name, hours')
        .eq('user_id', user!.id)
        .eq('employee_id', payroll.employee_id)
        .gte('date', payroll.period_start)
        .lte('date', payroll.period_end);

      const { data: surcharges } = await supabase
        .from('hour_surcharges')
        .select('hour_type_name, surcharge_percent')
        .eq('user_id', user!.id);

      const { data: settings } = await supabase
        .from('user_settings')
        .select('minimum_salary, transport_allowance, health_deduction_percent, pension_deduction_percent')
        .eq('user_id', user!.id)
        .maybeSingle();

      const surchargeMap = new Map<string, number>();
      (surcharges || []).forEach((s: HourSurcharge) => {
        surchargeMap.set(s.hour_type_name, s.surcharge_percent);
      });

      const userSettings: UserSettings =
        settings || {
          minimum_salary: 1423500,
          transport_allowance: 200000,
          health_deduction_percent: 4.0,
          pension_deduction_percent: 4.0,
        };

      const monthlySalary = Number(employee.monthly_salary);
      const hourlyRate = monthlySalary / 220;
      const isFijo = employee.contract_type === 'FIJO';

      const hoursMap = new Map<string, number>();
      (hourRecords || []).forEach((r: HourRecord) => {
        const curr = hoursMap.get(r.hour_type_name) || 0;
        hoursMap.set(r.hour_type_name, curr + Number(r.hours));
      });

      const hourBreakdowns: HourBreakdown[] = [];
      let computedBase = 0;

      if (isFijo) {
        computedBase = monthlySalary / 2;
        hourBreakdowns.push({
          hour_type: 'Hora Ordinaria',
          hours: 84,
          surcharge_percent: 0,
          hourly_rate: hourlyRate,
          total: computedBase,
        });
        (surchargeMap as any).forEach((sPct: number, hType: string) => {
          if (hType !== 'Hora Ordinaria') {
            const hrs = hoursMap.get(hType) || 0;
            const earn = hourlyRate * (1 + sPct / 100) * hrs;
            hourBreakdowns.push({
              hour_type: hType,
              hours: hrs,
              surcharge_percent: sPct,
              hourly_rate: hourlyRate * (1 + sPct / 100),
              total: earn,
            });
          }
        });
      } else {
        (surchargeMap as any).forEach((sPct: number, hType: string) => {
          const hrs = hoursMap.get(hType) || 0;
          const earn = hourlyRate * (1 + sPct / 100) * hrs;
          hourBreakdowns.push({
            hour_type: hType,
            hours: hrs,
            surcharge_percent: sPct,
            hourly_rate: hourlyRate * (1 + sPct / 100),
            total: earn,
          });
        });
      }

      const computedTotalHours = hourBreakdowns.reduce((sum, b) => sum + b.hours, 0);
      const computedSurcharges = hourBreakdowns.reduce((sum, b) => sum + b.total, 0) - computedBase;
      let transportAllowance = 0;
      if (
        employee.receives_transport_allowance &&
        monthlySalary < 2 * userSettings.minimum_salary
      ) {
        transportAllowance = userSettings.transport_allowance / 2;
      }
      const gross = computedBase + computedSurcharges + transportAllowance;
      const healthDeduction = gross * ((userSettings.health_deduction_percent || 0) / 100);
      const pensionDeduction = gross * ((userSettings.pension_deduction_percent || 0) / 100);
      const totalDeductions = healthDeduction + pensionDeduction;
      const computedNet = gross - totalDeductions;

      const needsUpdate =
        payroll.total_hours !== computedTotalHours ||
        payroll.base_salary !== computedBase ||
        payroll.total_surcharges !== computedSurcharges ||
        payroll.transport_allowance !== transportAllowance ||
        payroll.health_deduction !== healthDeduction ||
        payroll.pension_deduction !== pensionDeduction ||
        payroll.total_deductions !== totalDeductions ||
        payroll.net_salary !== computedNet;

      if (needsUpdate) {
        await supabase
          .from('payroll_history')
          .update({
            total_hours: computedTotalHours,
            base_salary: computedBase,
            total_surcharges: computedSurcharges,
            transport_allowance: transportAllowance,
            health_deduction: healthDeduction,
            pension_deduction: pensionDeduction,
            total_deductions: totalDeductions,
            net_salary: computedNet,
          })
          .eq('id', payroll.id);

        return {
          total_hours: computedTotalHours,
          base_salary: computedBase,
          total_surcharges: computedSurcharges,
          transport_allowance: transportAllowance,
          health_deduction: healthDeduction,
          pension_deduction: pensionDeduction,
          total_deductions: totalDeductions,
          net_salary: computedNet,
        };
      }
      return null;
    } catch (err) {
      console.error('Error recalculating payroll', err);
      return null;
    }
  };

  const loadPayrollHistory = async () => {
    if (!user || !selectedEmployee) return;

    try {
      const { data, error } = await supabase
        .from('payroll_history')
        .select(`
          *,
          employees!inner(full_name, cedula)
        `)
        .eq('user_id', user.id)
        .eq('employee_id', selectedEmployee)
        .order('period_start', { ascending: false });

      if (error) throw error;

      const formattedData = (data || []).map((item: any) => ({
        ...item,
        employee_name: item.employees.full_name,
        employee_cedula: item.employees.cedula,
      }));

      setPayrollHistory(formattedData);

      // automatically fix any existing payrolls with old numbers
      formattedData.forEach(async (pay) => {
        const update = await recalcAndUpdate(pay);
        if (update) {
          setPayrollHistory((prev) =>
            prev.map((p) => (p.id === pay.id ? { ...p, ...update } : p))
          );
        }
      });
    } catch (err) {
      console.error('Error loading payroll history:', err);
      setError('Error al cargar el historial de nóminas');
    }
  };

  const handleGeneratePayroll = async () => {
    if (!selectedEmployee || !startDate || !endDate) {
      setError('Por favor seleccione un empleado y el rango de fechas');
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      setError('La fecha de inicio debe ser menor o igual a la fecha de fin');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');
    setCalculation(null);
    setShowCalculation(false);

    try {
      // Get employee details
      const employee = employees.find(e => e.id === selectedEmployee);
      if (!employee) {
        setError('Empleado no encontrado');
        setLoading(false);
        return;
      }

      // Use the selected dates directly
      const periodStartStr = startDate;
      const periodEndStr = endDate;

      // Get hour records for the date range
      const { data: hourRecords, error: hourError } = await supabase
        .from('hour_records')
        .select('hour_type_name, hours')
        .eq('user_id', user!.id)
        .eq('employee_id', selectedEmployee)
        .gte('date', periodStartStr)
        .lte('date', periodEndStr);

      if (hourError) throw hourError;

      if (!hourRecords || hourRecords.length === 0) {
        setError('No hay registros de horas para este empleado en el período seleccionado');
        setLoading(false);
        return;
      }

      // Get user settings
      const { data: settings, error: settingsError } = await supabase
        .from('user_settings')
        .select('minimum_salary, transport_allowance')
        .eq('user_id', user!.id)
        .maybeSingle();

      if (settingsError) throw settingsError;

      const userSettings: UserSettings = settings || {
        minimum_salary: 1423500,
        transport_allowance: 200000,
        health_deduction_percent: 4.0,
        pension_deduction_percent: 4.0,
      };

      // Get hour surcharges
      const { data: surcharges, error: surchargesError } = await supabase
        .from('hour_surcharges')
        .select('hour_type_name, surcharge_percent')
        .eq('user_id', user!.id);

      if (surchargesError) throw surchargesError;

      const surchargeMap = new Map<string, number>();
      (surcharges || []).forEach((s: HourSurcharge) => {
        surchargeMap.set(s.hour_type_name, s.surcharge_percent);
      });

      // Calculate payroll based on contract type
      const monthlySalary = Number(employee.monthly_salary);
      const hourlyRate = monthlySalary / 220;
      const isFijo = employee.contract_type === 'FIJO';

      let baseSalary = 0;
      let totalHours = 0;
      let totalSurcharges = 0;
      let transportAllowance = 0;
      const hourBreakdowns: HourBreakdown[] = [];

      // Group hours by type
      const hoursMap = new Map<string, number>();
      hourRecords.forEach((record: HourRecord) => {
        const current = hoursMap.get(record.hour_type_name) || 0;
        hoursMap.set(record.hour_type_name, current + Number(record.hours));
      });

      // Validation for FIJO: Hora Ordinaria cannot exceed 84 hours
      if (isFijo) {
        const ordinaryHoursRecorded = hoursMap.get('Hora Ordinaria') || 0;
        if (ordinaryHoursRecorded > 84) {
          setError('Error: Las horas ordinarias no pueden exceder 84 horas quincenales para empleados FIJO');
          setLoading(false);
          return;
        }
      }

      if (isFijo) {
        // FIJO employee calculation
        // Para FIJO: SIEMPRE 84 horas ordinarias, sin importar las registradas
        // Las horas ordinarias registradas se ignoran y se usan 84 fijas
        const ordinarySalary = monthlySalary / 2;
        const ordinaryHourValue = ordinarySalary / 84;
        baseSalary = ordinarySalary;
        totalHours = 84; // Always 84 hours for ordinary hours

        // Calculate surcharges for extra hours (all types except Hora Ordinaria)
        hoursMap.forEach((hours, hourType) => {
          const surchargePercent = surchargeMap.get(hourType) || 0;

          if (hourType !== 'Hora Ordinaria') {
            // For extra hours: hourlyRate * (1 + surchargePercent / 100) * hours (base + surcharge)
            const earnings = hourlyRate * (1 + surchargePercent / 100) * hours;
            totalSurcharges += earnings;
            totalHours += hours;

            hourBreakdowns.push({
              hour_type: hourType,
              hours,
              surcharge_percent: surchargePercent,
              hourly_rate: hourlyRate * (1 + surchargePercent / 100),
              total: earnings,
            });
          }
        });

        // Add Hora Ordinaria to breakdown (always 84 hours with employee's ordinaria salary)
        // Ignore whatever was registered, use fixed 84 hours
        hourBreakdowns.unshift({
          hour_type: 'Hora Ordinaria',
          hours: 84,
          surcharge_percent: 0,
          hourly_rate: hourlyRate,
          total: ordinarySalary,
        });

        // Transport allowance for FIJO (half)
        if (employee.receives_transport_allowance && monthlySalary < (2 * userSettings.minimum_salary)) {
          transportAllowance = userSettings.transport_allowance / 2;
        }
      } else {
        // TEMPORAL employee calculation
        baseSalary = 0;
        totalHours = 0;

        // Calculate all hours including ordinarias
        hoursMap.forEach((hours, hourType) => {
          const surchargePercent = surchargeMap.get(hourType) || 0;

          // For all hours: hourlyRate * (1 + surchargePercent / 100) * hours
          const earnings = hourlyRate * (1 + surchargePercent / 100) * hours;
          totalSurcharges += earnings;
          totalHours += hours;

          hourBreakdowns.push({
            hour_type: hourType,
            hours,
            surcharge_percent: surchargePercent,
            hourly_rate: hourlyRate * (1 + surchargePercent / 100),
            total: earnings,
          });
        });

        // Transport allowance for TEMPORAL (full)
        if (employee.receives_transport_allowance && monthlySalary < (2 * userSettings.minimum_salary)) {
          transportAllowance = userSettings.transport_allowance;
        }
      }

      // Calculate net salary before deductions
      let netSalary = baseSalary + totalSurcharges + transportAllowance;

      // Calculate deductions
      const healthDeduction = employee.deduct_health ? netSalary * 0.04 : 0;
      const pensionDeduction = employee.deduct_pension ? netSalary * 0.04 : 0;
      const totalDeductions = healthDeduction + pensionDeduction;

      // Final net salary after deductions
      netSalary = netSalary - totalDeductions;

      const calculatedPayroll: PayrollCalculation = {
        employee_id: employee.id,
        employee_name: employee.full_name,
        employee_cedula: employee.cedula,
        period_start: periodStartStr,
        period_end: periodEndStr,
        total_hours: totalHours,
        base_salary: baseSalary,
        hour_breakdowns: hourBreakdowns,
        total_surcharges: totalSurcharges,
        transport_allowance: transportAllowance,
        health_deduction: healthDeduction,
        pension_deduction: pensionDeduction,
        total_deductions: totalDeductions,
        net_salary: netSalary,
      };

      setCalculation(calculatedPayroll);
      setShowCalculation(true);
      setSuccess('Nómina calculada exitosamente');
    } catch (err: any) {
      console.error('Error generating payroll:', err);
      setError('Error al generar la nómina: ' + (err.message || 'Error desconocido'));
    } finally {
      setLoading(false);
    }
  };

  const handleSavePayroll = async () => {
    if (!calculation) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const { error: insertError } = await supabase
        .from('payroll_history')
        .insert({
          user_id: user!.id,
          employee_id: calculation.employee_id,
          period_start: calculation.period_start,
          period_end: calculation.period_end,
          total_hours: calculation.total_hours,
          base_salary: calculation.base_salary,
          total_surcharges: calculation.total_surcharges,
          transport_allowance: calculation.transport_allowance,
          health_deduction: calculation.health_deduction,
          pension_deduction: calculation.pension_deduction,
          total_deductions: calculation.total_deductions,
          net_salary: calculation.net_salary,
        });

      if (insertError) throw insertError;

      setSuccess('Nómina guardada exitosamente');
      setShowCalculation(false);
      setCalculation(null);

      // Reload history
      await loadPayrollHistory();

      // Clear success after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      console.error('Error saving payroll:', err);
      setError('Error al guardar la nómina: ' + (err.message || 'Error desconocido'));
    } finally {
      setLoading(false);
    }
  };

  const handleViewPayroll = async (payroll: PayrollHistory) => {
    setViewingPayroll(payroll);

    // Reconstruct calculation details from stored payroll
    // We need to get the hour records to show the breakdown
    try {
      // Get employee details
      const employee = employees.find(e => e.id === payroll.employee_id);
      if (!employee) {
        setError('Empleado no encontrado');
        return;
      }

      // Get hour records for the date range
      const { data: hourRecords, error: hourError } = await supabase
        .from('hour_records')
        .select('hour_type_name, hours')
        .eq('user_id', user!.id)
        .eq('employee_id', payroll.employee_id)
        .gte('date', payroll.period_start)
        .lte('date', payroll.period_end);

      if (hourError) throw hourError;

      // Get hour surcharges
      const { data: surcharges, error: surchargesError } = await supabase
        .from('hour_surcharges')
        .select('hour_type_name, surcharge_percent')
        .eq('user_id', user!.id);

      if (surchargesError) throw surchargesError;

      const surchargeMap = new Map<string, number>();
      (surcharges || []).forEach((s: HourSurcharge) => {
        surchargeMap.set(s.hour_type_name, s.surcharge_percent);
      });

      // Get user settings (including deduction percents needed to recompute)
      const { data: settings } = await supabase
        .from('user_settings')
        .select('minimum_salary, transport_allowance, health_deduction_percent, pension_deduction_percent')
        .eq('user_id', user!.id)
        .maybeSingle();

      const userSettings = settings || {
        minimum_salary: 1423500,
        transport_allowance: 200000,
        health_deduction_percent: 4.0,
        pension_deduction_percent: 4.0,
      };

      // Reconstruct hour breakdowns using the same logic
      const monthlySalary = Number(employee.monthly_salary);
      const hourlyRate = monthlySalary / 220;
      const isFijo = employee.contract_type === 'FIJO';

      const hoursMap = new Map<string, number>();
      (hourRecords || []).forEach((record: HourRecord) => {
        const current = hoursMap.get(record.hour_type_name) || 0;
        hoursMap.set(record.hour_type_name, current + Number(record.hours));
      });

      const hourBreakdowns: HourBreakdown[] = [];
      let computedBase = 0;
      let computedTotalHours = 0;

      if (isFijo) {
        // FIJO employee - reconstruct breakdowns showing ALL hour types
        // Base salary is always half the monthly salary
        computedBase = monthlySalary / 2;
        hourBreakdowns.push({
          hour_type: 'Hora Ordinaria',
          hours: 84,
          surcharge_percent: 0,
          hourly_rate: hourlyRate,
          total: computedBase,
        });

        // Then add all other hour types (even if 0 hours, to match PDF)
        (surchargeMap as any).forEach((surchargePercent: number, hourType: string) => {
          if (hourType !== 'Hora Ordinaria') {
            const hours = hoursMap.get(hourType) || 0;
            const earnings = hourlyRate * (1 + surchargePercent / 100) * hours;
            hourBreakdowns.push({
              hour_type: hourType,
              hours,
              surcharge_percent: surchargePercent,
              hourly_rate: hourlyRate * (1 + surchargePercent / 100),
              total: earnings,
            });
          }
        });
      } else {
        // TEMPORAL employee - all hours calculated the same way
        hoursMap.forEach((hours, hourType) => {
          const surchargePercent = surchargeMap.get(hourType) || 0;
          const earnings = hourlyRate * (1 + surchargePercent / 100) * hours;

          hourBreakdowns.push({
            hour_type: hourType,
            hours,
            surcharge_percent: surchargePercent,
            hourly_rate: hourlyRate * (1 + surchargePercent / 100),
            total: earnings,
          });
        });
      }

      // compute totals from breakdown
      computedTotalHours = hourBreakdowns.reduce((sum, b) => sum + b.hours, 0);
      const computedSurcharges = hourBreakdowns.reduce((sum, b) => sum + b.total, 0) - computedBase; // base included in first line for fijo

      let transportAllowance = 0;
      if (employee.receives_transport_allowance && monthlySalary < (2 * userSettings.minimum_salary)) {
        transportAllowance = userSettings.transport_allowance / 2;
      }

      const grossBeforeDeductions = computedBase + computedSurcharges + transportAllowance;
      const healthDeduction = grossBeforeDeductions * ((userSettings.health_deduction_percent || 0) / 100);
      const pensionDeduction = grossBeforeDeductions * ((userSettings.pension_deduction_percent || 0) / 100);
      const totalDeductions = healthDeduction + pensionDeduction;
      const computedNet = grossBeforeDeductions - totalDeductions;

      const viewCalc: PayrollCalculation = {
        employee_id: payroll.employee_id,
        employee_name: payroll.employee_name || '',
        employee_cedula: payroll.employee_cedula || '',
        period_start: payroll.period_start,
        period_end: payroll.period_end,
        total_hours: computedTotalHours,
        base_salary: computedBase,
        hour_breakdowns: hourBreakdowns,
        total_surcharges: computedSurcharges,
        transport_allowance: transportAllowance,
        health_deduction: healthDeduction,
        pension_deduction: pensionDeduction,
        total_deductions: totalDeductions,
        net_salary: computedNet,
      };

      // if stored values differ, update the database so history reflects corrected numbers
      const needsUpdate =
        payroll.total_hours !== computedTotalHours ||
        payroll.base_salary !== computedBase ||
        payroll.total_surcharges !== computedSurcharges ||
        payroll.transport_allowance !== transportAllowance ||
        payroll.health_deduction !== healthDeduction ||
        payroll.pension_deduction !== pensionDeduction ||
        payroll.total_deductions !== totalDeductions ||
        payroll.net_salary !== computedNet;

      if (needsUpdate) {
        await supabase
          .from('payroll_history')
          .update({
            total_hours: computedTotalHours,
            base_salary: computedBase,
            total_surcharges: computedSurcharges,
            transport_allowance: transportAllowance,
            health_deduction: healthDeduction,
            pension_deduction: pensionDeduction,
            total_deductions: totalDeductions,
            net_salary: computedNet,
          })
          .eq('id', payroll.id);

        // also refresh list in memory in case older view persists
        loadPayrollHistory();
      }

      setViewingCalculation(viewCalc);
    } catch (err) {
      console.error('Error loading payroll details:', err);
      setError('Error al cargar los detalles de la nómina');
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatPeriod = (startDate: string, endDate: string) => {
    return `${formatDate(startDate)} - ${formatDate(endDate)}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-slate-800 mb-2">Cálculo de Nómina</h2>
        <p className="text-slate-600">Genera y gestiona las nóminas de tus empleados</p>
      </div>

      {/* Error and Success Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center space-x-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center space-x-3">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
          <p className="text-green-800">{success}</p>
        </div>
      )}

      {/* Selection Section */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-4 md:p-6">
        <div className="flex items-center space-x-3 mb-4 md:mb-6">
          <User className="w-5 h-5 md:w-6 md:h-6 text-blue-600 flex-shrink-0" />
          <h3 className="text-lg md:text-xl font-bold text-slate-800">Selección de Empleado y Rango de Fechas</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6">
          <div className="md:col-span-1">
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Empleado *
            </label>
            <select
              value={selectedEmployee}
              onChange={(e) => {
                const value = e.target.value;
                setSelectedEmployee(value);
                onEmployeeChange?.(value || null);
                setViewingPayroll(null);
                setViewingCalculation(null);
                setShowCalculation(false);
                setCalculation(null);
              }}
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
            >
              <option value="">Seleccione un empleado</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.full_name} - {emp.cedula}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-1">
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Fecha Desde *
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setShowCalculation(false);
                setCalculation(null);
              }}
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
            />
          </div>

          <div className="md:col-span-1">
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Fecha Hasta *
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setShowCalculation(false);
                setCalculation(null);
              }}
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
            />
          </div>

          <div className="md:col-span-1 flex items-end">
            <button
              onClick={handleGeneratePayroll}
              disabled={loading || !selectedEmployee || !startDate || !endDate}
              className="w-full flex items-center justify-center space-x-2 bg-blue-600 text-white px-4 md:px-6 py-3 md:py-3 rounded-xl font-semibold hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation min-h-[48px]"
            >
              {loading ? (
                <span className="flex items-center space-x-2">
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span className="text-sm md:text-base">Calculando...</span>
                </span>
              ) : (
                <>
                  <Calculator className="w-5 h-5 flex-shrink-0" />
                  <span className="text-sm md:text-base">Generar Nueva Nómina</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Calculation Preview */}
      {showCalculation && calculation && (
        <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-4 md:p-6 animate-fadeIn">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4 md:mb-6">
            <div className="flex items-center space-x-3">
              <FileText className="w-5 h-5 md:w-6 md:h-6 text-green-600 flex-shrink-0" />
              <h3 className="text-lg md:text-xl font-bold text-slate-800">Vista Previa de Nómina</h3>
            </div>
            <button
              onClick={handleSavePayroll}
              disabled={loading}
              className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-green-600 text-white px-4 md:px-6 py-3 rounded-xl font-semibold hover:bg-green-700 transition-all disabled:opacity-50 touch-manipulation min-h-[48px]"
            >
              <Save className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm md:text-base">Guardar Nómina</span>
            </button>
          </div>

          {/* Employee Info */}
          <div className="bg-slate-50 rounded-xl p-4 mb-4 md:mb-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
              <div>
                <p className="text-xs md:text-sm text-slate-600 mb-1">Empleado</p>
                <p className="text-base md:text-lg font-bold text-slate-800 break-words">{calculation.employee_name}</p>
              </div>
              <div>
                <p className="text-xs md:text-sm text-slate-600 mb-1">Cédula</p>
                <p className="text-base md:text-lg font-bold text-slate-800 break-words">{calculation.employee_cedula}</p>
              </div>
              <div className="sm:col-span-2 lg:col-span-1">
                <p className="text-xs md:text-sm text-slate-600 mb-1">Rango de Fechas</p>
                <p className="text-base md:text-lg font-bold text-slate-800 break-words">
                  {formatPeriod(calculation.period_start, calculation.period_end)}
                </p>
              </div>
            </div>
          </div>

          {/* Earnings Section */}
          <div className="mb-4 md:mb-6">
            <div className="flex items-center space-x-2 mb-3 md:mb-4">
              <TrendingUp className="w-4 h-4 md:w-5 md:h-5 text-green-600 flex-shrink-0" />
              <h4 className="text-base md:text-lg font-bold text-slate-800">Devengos</h4>
            </div>

            <div className="space-y-3 md:space-y-4">
              {/* Base Salary */}
              <div className="bg-green-50 rounded-lg p-3 md:p-4 border border-green-200">
                <div className="flex justify-between items-center gap-3">
                  <span className="font-semibold text-slate-700 text-sm md:text-base">Salario Base</span>
                  <span className="text-base md:text-lg font-bold text-green-800 break-words text-right">
                    {formatCurrency(calculation.base_salary)}
                  </span>
                </div>
              </div>

              {/* Hour Breakdowns */}
              {calculation.hour_breakdowns.length > 0 && (
                <div className="bg-green-50 rounded-lg p-3 md:p-4 border border-green-200">
                  <p className="font-semibold text-slate-700 mb-3 text-sm md:text-base">Recargos por Horas</p>
                  <div className="space-y-2 md:space-y-3">
                    {calculation.hour_breakdowns.map((breakdown, index) => (
                      <div key={index} className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 text-xs md:text-sm">
                        <div className="flex items-start sm:items-center space-x-2 flex-1 min-w-0">
                          <Clock className="w-3 h-3 md:w-4 md:h-4 text-slate-500 flex-shrink-0 mt-0.5 sm:mt-0" />
                          <span className="text-slate-700 break-words">
                            {breakdown.hour_type} ({breakdown.hours.toFixed(1)} h × {formatCurrency(breakdown.hourly_rate)}/h)
                          </span>
                        </div>
                        <span className="font-semibold text-green-800 break-words text-right sm:ml-2 pl-6 sm:pl-0">
                          {formatCurrency(breakdown.total)}
                        </span>
                      </div>
                    ))}
                    <div className="pt-2 border-t border-green-300 flex justify-between items-center gap-3">
                      <span className="font-semibold text-slate-700 text-sm md:text-base">Total Recargos</span>
                      <span className="font-bold text-green-800 break-words text-right">
                        {formatCurrency(calculation.total_surcharges)}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Transport Allowance */}
              {calculation.transport_allowance > 0 && (
                <div className="bg-green-50 rounded-lg p-3 md:p-4 border border-green-200">
                  <div className="flex justify-between items-center gap-3">
                    <span className="font-semibold text-slate-700 text-sm md:text-base">Auxilio de Transporte</span>
                    <span className="text-base md:text-lg font-bold text-green-800 break-words text-right">
                      {formatCurrency(calculation.transport_allowance)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Deductions Section */}
          <div className="mb-4 md:mb-6">
            <div className="flex items-center space-x-2 mb-3 md:mb-4">
              <TrendingDown className="w-4 h-4 md:w-5 md:h-5 text-red-600 flex-shrink-0" />
              <h4 className="text-base md:text-lg font-bold text-slate-800">Deducciones</h4>
            </div>

            <div className="space-y-3 md:space-y-4">
              <div className="bg-red-50 rounded-lg p-3 md:p-4 border border-red-200">
                <div className="space-y-2 md:space-y-3">
                  <div className="flex justify-between items-center gap-3 text-xs md:text-sm">
                    <span className="text-slate-700">Salud (EPS)</span>
                    <span className="font-semibold text-red-800 break-words text-right">
                      {formatCurrency(calculation.health_deduction)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center gap-3 text-xs md:text-sm">
                    <span className="text-slate-700">Pensión (AFP)</span>
                    <span className="font-semibold text-red-800 break-words text-right">
                      {formatCurrency(calculation.pension_deduction)}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-red-300 flex justify-between items-center gap-3">
                    <span className="font-semibold text-slate-700 text-sm md:text-base">Total Deducciones</span>
                    <span className="font-bold text-red-800 break-words text-right">
                      {formatCurrency(calculation.total_deductions)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Net Salary */}
          <div className="bg-blue-600 rounded-xl p-4 md:p-6 text-white">
            <div className="flex justify-between items-center gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-blue-100 text-xs md:text-sm mb-1">Total Neto a Pagar</p>
                <p className="text-2xl md:text-4xl font-bold break-words">{formatCurrency(calculation.net_salary)}</p>
              </div>
              <DollarSign className="w-12 h-12 md:w-16 md:h-16 text-blue-400 flex-shrink-0" />
            </div>
          </div>
        </div>
      )}

      {/* Payroll History */}
      {selectedEmployee && !showCalculation && (
        <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-4 md:p-6">
          <div className="flex items-center space-x-3 mb-4 md:mb-6">
            <Calendar className="w-5 h-5 md:w-6 md:h-6 text-blue-600 flex-shrink-0" />
            <h3 className="text-lg md:text-xl font-bold text-slate-800">Historial de Nóminas</h3>
          </div>

          {payrollHistory.length === 0 ? (
            <div className="text-center py-8 md:py-12">
              <FileText className="w-12 h-12 md:w-16 md:h-16 text-slate-300 mx-auto mb-3 md:mb-4" />
              <p className="text-slate-500 text-base md:text-lg">No hay nóminas registradas para este empleado</p>
              <p className="text-slate-400 text-sm mt-2">Genera una nueva nómina para comenzar</p>
            </div>
          ) : (
            <div className="space-y-3 md:space-y-4">
              {payrollHistory.map((payroll) => (
                <div
                  key={payroll.id}
                  className="border border-slate-200 rounded-xl p-3 md:p-4 hover:shadow-md transition-all cursor-pointer"
                  onClick={() => handleViewPayroll(payroll)}
                >
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-2">
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-3 h-3 md:w-4 md:h-4 text-slate-500 flex-shrink-0" />
                          <span className="font-semibold text-slate-800 text-sm md:text-base break-words">
                            {formatPeriod(payroll.period_start, payroll.period_end)}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock className="w-3 h-3 md:w-4 md:h-4 text-slate-500 flex-shrink-0" />
                          <span className="text-xs md:text-sm text-slate-600">
                            {payroll.total_hours.toFixed(1)} horas
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4 text-xs md:text-sm text-slate-600">
                        <span>Generado: {formatDate(payroll.created_at.split('T')[0])}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end gap-3">
                      <div className="text-left sm:text-right">
                        <p className="text-xs md:text-sm text-slate-600 mb-1">Neto</p>
                        <p className="text-lg md:text-2xl font-bold text-blue-600 break-words">
                          {formatCurrency(payroll.net_salary)}
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewPayroll(payroll);
                        }}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all touch-manipulation flex-shrink-0"
                        title="Ver detalles"
                        aria-label="Ver detalles"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Viewing Payroll Details */}
      {viewingPayroll && viewingCalculation && (
        <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-4 md:p-6">
          <div className="flex flex-col gap-4 mb-4 md:mb-6">
            <div className="flex items-center space-x-3">
              <FileText className="w-5 h-5 md:w-6 md:h-6 text-blue-600 flex-shrink-0" />
              <h3 className="text-lg md:text-xl font-bold text-slate-800">Detalles de Nómina</h3>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <button
                onClick={() => window.print()}
                className="w-full sm:flex-1 flex items-center justify-center space-x-2 bg-slate-600 text-white px-4 py-3 rounded-xl font-semibold hover:bg-slate-700 transition-all touch-manipulation min-h-[48px]"
                title="Abre el diálogo de impresión para guardar como PDF o imprimir"
              >
                <Printer className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm md:text-base">Imprimir / PDF</span>
              </button>
              <div className="w-full sm:flex-1">
                <ExportToDrive
                  periodName={`${viewingCalculation.period_start} a ${viewingCalculation.period_end}`}
                  periodData={{
                    period: `${viewingCalculation.period_start} a ${viewingCalculation.period_end}`,
                    employee: viewingCalculation.employee_name,
                    cedula: viewingCalculation.employee_cedula,
                    base_salary: viewingCalculation.base_salary,
                    hour_breakdowns: viewingCalculation.hour_breakdowns,
                    total_surcharges: viewingCalculation.total_surcharges,
                    transport_allowance: viewingCalculation.transport_allowance,
                    health_deduction: viewingCalculation.health_deduction,
                    pension_deduction: viewingCalculation.pension_deduction,
                    total_deductions: viewingCalculation.total_deductions,
                    net_salary: viewingCalculation.net_salary,
                    total_hours: viewingCalculation.total_hours,
                    timestamp: new Date().toISOString(),
                  }}
                  employeeInfo={{
                    full_name: viewingCalculation.employee_name,
                    cedula: viewingCalculation.employee_cedula,
                    contract_type: employees.find(e => e.id === viewingPayroll?.employee_id)?.contract_type || 'FIJO',
                    monthly_salary: employees.find(e => e.id === viewingPayroll?.employee_id)?.monthly_salary || 0,
                  }}
                  companyInfo={{
                    company_name: userSettings.company_name || 'Mi Empresa',
                    company_nit: userSettings.company_nit || '',
                    company_address: userSettings.company_address || '',
                  }}
                  onExportSuccess={() => {
                    alert('Nómina exportada exitosamente a Google Drive');
                  }}
                />
              </div>
              <button
                onClick={() => {
                  setViewingPayroll(null);
                  setViewingCalculation(null);
                }}
                className="w-full sm:flex-1 px-4 py-3 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-all font-semibold touch-manipulation min-h-[48px] text-sm md:text-base"
              >
                Cerrar
              </button>
            </div>
          </div>

          {/* Employee Info */}
          <div className="bg-slate-50 rounded-xl p-4 mb-4 md:mb-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
              <div>
                <p className="text-xs md:text-sm text-slate-600 mb-1">Empleado</p>
                <p className="text-base md:text-lg font-bold text-slate-800 break-words">{viewingCalculation.employee_name}</p>
              </div>
              <div>
                <p className="text-xs md:text-sm text-slate-600 mb-1">Cédula</p>
                <p className="text-base md:text-lg font-bold text-slate-800 break-words">{viewingCalculation.employee_cedula}</p>
              </div>
              <div className="sm:col-span-2 lg:col-span-1">
                <p className="text-xs md:text-sm text-slate-600 mb-1">Rango de Fechas</p>
                <p className="text-base md:text-lg font-bold text-slate-800 break-words">
                  {formatPeriod(viewingCalculation.period_start, viewingCalculation.period_end)}
                </p>
              </div>
            </div>
          </div>

          {/* Earnings Section */}
          <div className="mb-4 md:mb-6">
            <div className="flex items-center space-x-2 mb-3 md:mb-4">
              <TrendingUp className="w-4 h-4 md:w-5 md:h-5 text-green-600 flex-shrink-0" />
              <h4 className="text-base md:text-lg font-bold text-slate-800">Devengos</h4>
            </div>

            <div className="space-y-3 md:space-y-4">
              <div className="bg-green-50 rounded-lg p-3 md:p-4 border border-green-200">
                <div className="flex justify-between items-center gap-3">
                  <span className="font-semibold text-slate-700 text-sm md:text-base">Salario Base</span>
                  <span className="text-base md:text-lg font-bold text-green-800 break-words text-right">
                    {formatCurrency(viewingCalculation.base_salary)}
                  </span>
                </div>
              </div>

              {viewingCalculation.hour_breakdowns.length > 0 && (
                <div className="bg-green-50 rounded-lg p-3 md:p-4 border border-green-200">
                  <p className="font-semibold text-slate-700 mb-3 text-sm md:text-base">Recargos por Horas</p>
                  <div className="space-y-2 md:space-y-3">
                    {viewingCalculation.hour_breakdowns.map((breakdown, index) => (
                      <div key={index} className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 text-xs md:text-sm">
                        <div className="flex items-start sm:items-center space-x-2 flex-1 min-w-0">
                          <Clock className="w-3 h-3 md:w-4 md:h-4 text-slate-500 flex-shrink-0 mt-0.5 sm:mt-0" />
                          <span className="text-slate-700 break-words">
                            {breakdown.hour_type} ({breakdown.hours.toFixed(1)} h × {formatCurrency(breakdown.hourly_rate)}/h)
                          </span>
                        </div>
                        <span className="font-semibold text-green-800 break-words text-right sm:ml-2 pl-6 sm:pl-0">
                          {formatCurrency(breakdown.total)}
                        </span>
                      </div>
                    ))}
                    <div className="pt-2 border-t border-green-300 flex justify-between items-center gap-3">
                      <span className="font-semibold text-slate-700 text-sm md:text-base">Total Recargos</span>
                      <span className="font-bold text-green-800 break-words text-right">
                        {formatCurrency(viewingCalculation.total_surcharges)}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {viewingCalculation.transport_allowance > 0 && (
                <div className="bg-green-50 rounded-lg p-3 md:p-4 border border-green-200">
                  <div className="flex justify-between items-center gap-3">
                    <span className="font-semibold text-slate-700 text-sm md:text-base">Auxilio de Transporte</span>
                    <span className="text-base md:text-lg font-bold text-green-800 break-words text-right">
                      {formatCurrency(viewingCalculation.transport_allowance)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Deductions Section */}
          <div className="mb-4 md:mb-6">
            <div className="flex items-center space-x-2 mb-3 md:mb-4">
              <TrendingDown className="w-4 h-4 md:w-5 md:h-5 text-red-600 flex-shrink-0" />
              <h4 className="text-base md:text-lg font-bold text-slate-800">Deducciones</h4>
            </div>

            <div className="space-y-3 md:space-y-4">
              <div className="bg-red-50 rounded-lg p-3 md:p-4 border border-red-200">
                <div className="space-y-2 md:space-y-3">
                  <div className="flex justify-between items-center gap-3 text-xs md:text-sm">
                    <span className="text-slate-700">Salud (EPS)</span>
                    <span className="font-semibold text-red-800 break-words text-right">
                      {formatCurrency(viewingCalculation.health_deduction)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center gap-3 text-xs md:text-sm">
                    <span className="text-slate-700">Pensión (AFP)</span>
                    <span className="font-semibold text-red-800 break-words text-right">
                      {formatCurrency(viewingCalculation.pension_deduction)}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-red-300 flex justify-between items-center gap-3">
                    <span className="font-semibold text-slate-700 text-sm md:text-base">Total Deducciones</span>
                    <span className="font-bold text-red-800 break-words text-right">
                      {formatCurrency(viewingCalculation.total_deductions)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Net Salary */}
          <div className="bg-blue-600 rounded-xl p-4 md:p-6 text-white">
            <div className="flex justify-between items-center gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-blue-100 text-xs md:text-sm mb-1">Total Neto a Pagar</p>
                <p className="text-2xl md:text-4xl font-bold break-words">{formatCurrency(viewingCalculation.net_salary)}</p>
              </div>
              <DollarSign className="w-12 h-12 md:w-16 md:h-16 text-blue-400 flex-shrink-0" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
