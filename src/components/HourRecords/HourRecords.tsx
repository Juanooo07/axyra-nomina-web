import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Save, Calendar, User, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { generateReceiptFromData } from '../../utils/pdfGenerator';

interface Employee {
  id: string;
  full_name: string;
  cedula: string;
  monthly_salary: number;
  contract_type: 'FIJO' | 'TEMPORAL';
  receives_transport_allowance: boolean;
  deduct_health: boolean;
  deduct_pension: boolean;
}

const HOUR_TYPES = [
  'Hora Ordinaria',
  'Hora Extra Diurna',
  'Hora Nocturna',
  'Hora Extra Nocturna',
  'Hora Diurna Dominical',
  'Hora Extra Diurna Dominical',
  'Hora Nocturna Dominical',
  'Hora Extra Nocturna Dominical',
];

export function HourRecords() {
  const { user } = useAuth();

  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [recordDate, setRecordDate] = useState(new Date().toISOString().split('T')[0]);
  const [period, setPeriod] = useState(new Date().toISOString().slice(0, 7));

  const [hourEntries, setHourEntries] = useState<Record<string, number>>({});

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (user) {
      loadEmployees();
    }
  }, [user]);

  const loadEmployees = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('employees')
      .select('id, full_name, cedula, monthly_salary, contract_type, receives_transport_allowance, deduct_health, deduct_pension')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .order('full_name');

    if (error) {
      console.error('Error loading employees:', error);
      return;
    }

    setEmployees(data || []);
  };

  const handleHourChange = (hourType: string, value: string) => {
    const numValue = parseFloat(value) || 0;
    setHourEntries(prev => ({
      ...prev,
      [hourType]: numValue
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!selectedEmployee) {
      setError('Por favor selecciona un empleado');
      return;
    }

    if (!recordDate || !period) {
      setError('Por favor completa la fecha y el período');
      return;
    }

    const hasAnyHours = Object.values(hourEntries).some(h => h > 0);
    if (!hasAnyHours) {
      setError('Por favor ingresa al menos una hora');
      return;
    }

    setLoading(true);

    try {
      const recordsToInsert = Object.entries(hourEntries)
        .filter(([, hours]) => hours > 0)
        .map(([hourType, hours]) => ({
          user_id: user?.id,
          employee_id: selectedEmployee,
          hour_type_name: hourType,
          date: recordDate,
          period: period,
          hours: hours,
        }));

      const { error: insertError } = await supabase
        .from('hour_records')
        .insert(recordsToInsert);

      if (insertError) {
        setError('Error al guardar los registros: ' + insertError.message);
        setLoading(false);
        return;
      }

      const selectedEmp = employees.find(e => e.id === selectedEmployee);
      if (!selectedEmp) {
        setError('Empleado no encontrado');
        setLoading(false);
        return;
      }

      const { data: surcharges, error: surchargesError } = await supabase
        .from('hour_surcharges')
        .select('hour_type_name, surcharge_percent')
        .eq('user_id', user?.id);

      if (surchargesError) {
        console.error('Error loading surcharges:', surchargesError);
      }

      const { data: settings, error: settingsError } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (settingsError) {
        console.error('Error loading settings:', settingsError);
      }

      const monthlySalary = Number(selectedEmp.monthly_salary);
      const hourlyRate = monthlySalary / 220;
      const isFijo = selectedEmp.contract_type === 'FIJO';

      const transportAllowance = settings?.transport_allowance || 0;
      const minimumSalary = settings?.minimum_salary || 0;

      let baseSalary = 0;
      let totalSurcharges = 0;
      let netSalary = 0;
      let totalHours = 0;
      let transportAmount = 0;

      if (isFijo) {
        baseSalary = monthlySalary / 2;
        const ordinaryHours = hourEntries['Hora Ordinaria'] || 0;
        totalHours = 88;

        Object.entries(hourEntries).forEach(([hourType, hours]) => {
          if (hours > 0 && hourType !== 'Hora Ordinaria') {
            const surcharge = surcharges?.find(s => s.hour_type_name === hourType);
            const surchargePercent = surcharge?.surcharge_percent || 0;
            const earnings = hourlyRate * (surchargePercent / 100) * hours;
            totalSurcharges += earnings;
            totalHours += hours;
          }
        });

        netSalary = baseSalary + totalSurcharges;

        if (selectedEmp.receives_transport_allowance && monthlySalary < (2 * minimumSalary)) {
          transportAmount = transportAllowance / 2;
          netSalary += transportAmount;
        }
      } else {
        baseSalary = 0;

        Object.entries(hourEntries).forEach(([hourType, hours]) => {
          if (hours > 0) {
            const surcharge = surcharges?.find(s => s.hour_type_name === hourType);
            const surchargePercent = surcharge?.surcharge_percent || 0;
            const earnings = hourlyRate * (1 + surchargePercent / 100) * hours;
            totalSurcharges += earnings;
            totalHours += hours;
          }
        });

        netSalary = totalSurcharges;

        if (selectedEmp.receives_transport_allowance && monthlySalary < (2 * minimumSalary)) {
          transportAmount = transportAllowance;
          netSalary += transportAmount;
        }
      }

      const healthDeduction = selectedEmp.deduct_health ? netSalary * 0.04 : 0;
      const pensionDeduction = selectedEmp.deduct_pension ? netSalary * 0.04 : 0;
      const totalDeductions = healthDeduction + pensionDeduction;
      const finalNetSalary = netSalary - totalDeductions;

      const [year, month] = period.split('-');
      const periodStart = `${year}-${month}-01`;
      const lastDay = new Date(parseInt(year), parseInt(month), 0).getDate();
      const periodEnd = `${year}-${month}-${lastDay.toString().padStart(2, '0')}`;

      const { error: payrollError } = await supabase
        .from('payroll_history')
        .insert({
          user_id: user?.id,
          employee_id: selectedEmployee,
          period_start: periodStart,
          period_end: periodEnd,
          total_hours: totalHours,
          base_salary: baseSalary,
          total_surcharges: totalSurcharges,
          transport_allowance: transportAmount,
          health_deduction: healthDeduction,
          pension_deduction: pensionDeduction,
          total_deductions: totalDeductions,
          net_salary: finalNetSalary,
        });

      if (payrollError) {
        console.error('Error saving payroll:', payrollError);
        setError('Error al guardar nómina: ' + payrollError.message);
        setLoading(false);
        return;
      }

      if (settings && surcharges) {
        const companyData = {
          company_name: settings.company_name || '',
          company_nit: settings.company_nit || '',
          company_address: settings.company_address || '',
          minimum_salary: settings.minimum_salary || 0,
        };

        const employeeData = {
          full_name: selectedEmp.full_name,
          cedula: selectedEmp.cedula,
          contract_type: selectedEmp.contract_type,
          monthly_salary: monthlySalary,
        };

        const hourRecordsData = Object.entries(hourEntries)
          .filter(([, hours]) => hours > 0)
          .map(([hourType, hours]) => ({
            hour_type_name: hourType,
            hours: hours,
          }));

        try {
          await generateReceiptFromData(
            companyData,
            employeeData,
            hourRecordsData,
            surcharges,
            settings?.minimum_salary
          );
        } catch (pdfError) {
          console.error('Error generating PDF:', pdfError);
        }
      }

      setSuccess('Registro guardado y comprobante generado exitosamente');
      setHourEntries({});
      setLoading(false);

      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Error inesperado al guardar');
      setLoading(false);
    }
  };

  const handleClear = () => {
    setHourEntries({});
    setError('');
    setSuccess('');
  };

  const getTotalHours = () => {
    return Object.values(hourEntries).reduce((sum, hours) => sum + hours, 0);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-slate-800 mb-2">Registro de Horas</h2>
        <p className="text-slate-600">Registra las horas trabajadas por los empleados</p>
      </div>
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center space-x-3">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center space-x-3">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <p className="text-green-800">{success}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6">
        <div className="flex items-center space-x-3 mb-6">
          <Clock className="w-6 h-6 text-blue-600" />
          <h3 className="text-xl font-bold text-slate-800">Nuevo Registro</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div>
            <label className="flex text-sm font-semibold text-slate-700 mb-2 items-center space-x-2">
              <User className="w-4 h-4" />
              <span>Empleado *</span>
            </label>
            <select
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value)}
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">Seleccione un empleado</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.full_name} - {emp.cedula}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="flex text-sm font-semibold text-slate-700 mb-2 items-center space-x-2">
              <Calendar className="w-4 h-4" />
              <span>Fecha *</span>
            </label>
            <input
              type="date"
              value={recordDate}
              onChange={(e) => setRecordDate(e.target.value)}
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="flex text-sm font-semibold text-slate-700 mb-2 items-center space-x-2">
              <Calendar className="w-4 h-4" />
              <span>Período (Año-Mes) *</span>
            </label>
            <input
              type="month"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
        </div>

        <div className="bg-slate-50 rounded-xl p-6 mb-6">
          <h4 className="text-lg font-bold text-slate-800 mb-4">Horas por Tipo</h4>
          <p className="text-sm text-slate-600 mb-4">Ingresa las horas trabajadas en cada categoría</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {HOUR_TYPES.map((hourType, index) => (
              <div key={hourType} className="bg-white rounded-lg p-4 border border-slate-200">
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  {index + 1}. {hourType}
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  value={hourEntries[hourType] || ''}
                  onChange={(e) => handleHourChange(hourType, e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0"
                />
              </div>
            ))}
          </div>

          <div className="mt-6 pt-6 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <span className="text-lg font-bold text-slate-800">Total de Horas:</span>
              <span className="text-2xl font-bold text-blue-600">{getTotalHours().toFixed(1)} hrs</span>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={handleClear}
            className="px-6 py-3 border border-slate-300 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition-all"
          >
            Limpiar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-all disabled:opacity-50"
          >
            <Save className="w-5 h-5" />
            <span>{loading ? 'Guardando...' : 'Guardar Registro'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
