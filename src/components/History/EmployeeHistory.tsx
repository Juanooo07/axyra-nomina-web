import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import {
  Calendar,
  Clock,
  DollarSign,
  User,
  FileText,
  Download,
  AlertCircle,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Filter
} from 'lucide-react';
import { generateReceiptFromData } from '../../utils/pdfGenerator';

interface Employee {
  id: string;
  full_name: string;
  cedula: string;
  contract_type: string;
  monthly_salary: number;
}

interface HourRecord {
  id: string;
  date: string;
  hour_type_name: string;
  hours: number;
  period: string;
  created_at: string;
}

interface HourSurcharge {
  hour_type_name: string;
  surcharge_percent: number;
}

interface PayrollHistory {
  id: string;
  period_start: string;
  period_end: string;
  total_hours: number;
  net_salary: number;
  base_salary: number;
  total_surcharges: number;
  transport_allowance: number;
  total_deductions: number;
  created_at: string;
}

type SortField = 'date' | 'hours' | 'period' | 'net_salary' | 'total_hours';
type SortDirection = 'asc' | 'desc';

export function EmployeeHistory() {
  const { user } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');
  const [selectedEmployeeData, setSelectedEmployeeData] = useState<Employee | null>(null);
  const [hourRecords, setHourRecords] = useState<HourRecord[]>([]);
  const [payrollHistory, setPayrollHistory] = useState<PayrollHistory[]>([]);
  const [hourSurcharges, setHourSurcharges] = useState<HourSurcharge[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [downloadingPayrollPdf, setDownloadingPayrollPdf] = useState<string | null>(null);

  // Date filters
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  // Sorting state
  const [hoursSortField, setHoursSortField] = useState<SortField>('date');
  const [hoursSortDirection, setHoursSortDirection] = useState<SortDirection>('desc');
  const [payrollSortField, setPayrollSortField] = useState<SortField>('period_start');
  const [payrollSortDirection, setPayrollSortDirection] = useState<SortDirection>('desc');

  useEffect(() => {
    if (user) {
      loadEmployees();
    }
  }, [user]);

  useEffect(() => {
    if (selectedEmployee) {
      loadEmployeeData();
      loadHistoricalData();
    }
  }, [selectedEmployee, fromDate, toDate]);

  const loadEmployees = async () => {
    if (!user) return;

    setError('');
    const { data, error: fetchError } = await supabase
      .from('employees')
      .select('id, full_name, cedula, contract_type, monthly_salary')
      .eq('user_id', user.id)
      .order('full_name');

    if (fetchError) {
      setError('Error al cargar empleados: ' + fetchError.message);
      return;
    }

    setEmployees(data || []);
  };

  const loadEmployeeData = async () => {
    if (!selectedEmployee) return;

    const { data, error: fetchError } = await supabase
      .from('employees')
      .select('id, full_name, cedula, contract_type, monthly_salary')
      .eq('id', selectedEmployee)
      .single();

    if (fetchError) {
      setError('Error al cargar datos del empleado: ' + fetchError.message);
      return;
    }

    setSelectedEmployeeData(data);
  };

  const loadHistoricalData = async () => {
    if (!selectedEmployee || !user) return;

    setLoading(true);
    setError('');

    try {
      // Load hour records
      let hourQuery = supabase
        .from('hour_records')
        .select('id, date, hour_type_name, hours, period, created_at')
        .eq('employee_id', selectedEmployee);

      if (fromDate) {
        hourQuery = hourQuery.gte('date', fromDate);
      }
      if (toDate) {
        hourQuery = hourQuery.lte('date', toDate);
      }

      const { data: hoursData, error: hoursError } = await hourQuery.order('date', { ascending: false });

      if (hoursError) {
        setError('Error al cargar registros de horas: ' + hoursError.message);
        setLoading(false);
        return;
      }

      setHourRecords(hoursData || []);

      // Load hour surcharges
      const { data: surchargesData, error: surchargesError } = await supabase
        .from('hour_surcharges')
        .select('hour_type_name, surcharge_percent')
        .eq('user_id', user.id);

      if (surchargesError) {
        setError('Error al cargar recargos de horas: ' + surchargesError.message);
        setLoading(false);
        return;
      }

      setHourSurcharges(surchargesData || []);

      // Load payroll history
      let payrollQuery = supabase
        .from('payroll_history')
        .select('*')
        .eq('employee_id', selectedEmployee);

      if (fromDate) {
        payrollQuery = payrollQuery.gte('period_start', fromDate);
      }
      if (toDate) {
        payrollQuery = payrollQuery.lte('period_end', toDate);
      }

      const { data: payrollData, error: payrollError } = await payrollQuery.order('created_at', { ascending: false });

      if (payrollError) {
        setError('Error al cargar historial de nómina: ' + payrollError.message);
        setLoading(false);
        return;
      }

      setPayrollHistory(payrollData || []);
    } catch (err) {
      setError('Error inesperado al cargar datos históricos');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Sorting functions
  const sortData = <T,>(data: T[], field: keyof T, direction: SortDirection): T[] => {
    return [...data].sort((a, b) => {
      const aVal = a[field];
      const bVal = b[field];

      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;

      if (aVal < bVal) return direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return direction === 'asc' ? 1 : -1;
      return 0;
    });
  };

  const handleSort = (
    field: SortField,
    currentField: SortField,
    currentDirection: SortDirection,
    setField: (field: SortField) => void,
    setDirection: (direction: SortDirection) => void
  ) => {
    if (field === currentField) {
      setDirection(currentDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setField(field);
      setDirection('desc');
    }
  };

  const SortIcon = ({ field, currentField, currentDirection }: {
    field: SortField;
    currentField: SortField;
    currentDirection: SortDirection;
  }) => {
    if (field !== currentField) {
      return <ArrowUpDown className="w-4 h-4 text-slate-400" />;
    }
    return currentDirection === 'asc' ?
      <ArrowUp className="w-4 h-4 text-blue-600" /> :
      <ArrowDown className="w-4 h-4 text-blue-600" />;
  };

  // Sorted data
  const sortedHourRecords = useMemo(() => {
    return sortData(hourRecords, hoursSortField as keyof HourRecord, hoursSortDirection);
  }, [hourRecords, hoursSortField, hoursSortDirection]);

  const sortedPayrollHistory = useMemo(() => {
    return sortData(payrollHistory, payrollSortField as keyof PayrollHistory, payrollSortDirection);
  }, [payrollHistory, payrollSortField, payrollSortDirection]);

  // Calculate total earnings from hour records
  const calculateTotalEarnings = () => {
    if (!selectedEmployeeData || hourRecords.length === 0 || hourSurcharges.length === 0) {
      return 0;
    }

    const monthlySalary = Number(selectedEmployeeData.monthly_salary);
    const hourlyRate = monthlySalary / 220;
    const isFijo = selectedEmployeeData.contract_type === 'FIJO';

    if (isFijo) {
      const baseSalary = monthlySalary / 2;

      const extraHoursTotal = hourRecords.reduce((total, record) => {
        if (record.hour_type_name === 'Hora Ordinaria') {
          return total;
        }

        const surcharge = hourSurcharges.find(
          (s) => s.hour_type_name === record.hour_type_name
        );

        if (!surcharge) {
          return total;
        }

        const surchargePercent = Number(surcharge.surcharge_percent);
        const hours = Number(record.hours || 0);
        const earnings = hourlyRate * (surchargePercent / 100) * hours;

        return total + earnings;
      }, 0);

      return baseSalary + extraHoursTotal;
    } else {
      return hourRecords.reduce((total, record) => {
        const surcharge = hourSurcharges.find(
          (s) => s.hour_type_name === record.hour_type_name
        );

        if (!surcharge) {
          return total;
        }

        const surchargePercent = Number(surcharge.surcharge_percent);
        const hours = Number(record.hours || 0);
        const earnings = hourlyRate * (1 + surchargePercent / 100) * hours;

        return total + earnings;
      }, 0);
    }
  };

  // Calculate totals
  const totalHours = hourRecords.reduce((sum, record) => sum + Number(record.hours || 0), 0);
  const totalPayrolls = payrollHistory.length;
  const totalEarnings = calculateTotalEarnings();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('es-CO');
  };

  const formatDateTime = (dateString: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('es-CO');
  };

  const handleExport = () => {
    if (sortedHourRecords.length === 0) {
      setError('No hay datos para exportar');
      return;
    }

    // Create CSV content
    const headers = ['Fecha', 'Tipo de Hora', 'Horas', 'Periodo'];
    const csvRows = [headers.join(',')];

    sortedHourRecords.forEach(record => {
      const row = [
        formatDate(record.date),
        `"${record.hour_type_name || 'N/A'}"`,
        Number(record.hours || 0).toFixed(1),
        `"${record.period || '-'}"`
      ];
      csvRows.push(row.join(','));
    });

    const csvContent = csvRows.join('\n');

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    const fileName = `horas_${selectedEmployeeData?.full_name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`;

    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const clearFilters = () => {
    setFromDate('');
    setToDate('');
  };

  const handleDownloadPayrollPdf = async (payrollId: string) => {
    if (!user || !selectedEmployeeData) {
      setError('No se pudo cargar la información del empleado');
      return;
    }

    setDownloadingPayrollPdf(payrollId);
    setError('');

    try {
      // Find the payroll record
      const payroll = payrollHistory.find(p => p.id === payrollId);
      if (!payroll) {
        throw new Error('No se encontró el registro de nómina');
      }

      // Fetch hour records for this specific payroll period
      const { data: periodHourRecords, error: hoursError } = await supabase
        .from('hour_records')
        .select('id, date, hour_type_name, hours, period, created_at')
        .eq('employee_id', selectedEmployee)
        .gte('date', payroll.period_start)
        .lte('date', payroll.period_end);

      if (hoursError) {
        throw new Error('Error al cargar registros de horas: ' + hoursError.message);
      }

      if (!periodHourRecords || periodHourRecords.length === 0) {
        throw new Error('No se encontraron registros de horas para este periodo');
      }

      // Fetch company settings
      const { data: companySettings, error: companyError } = await supabase
        .from('user_settings')
        .select('company_name, company_nit, company_address, minimum_salary')
        .eq('user_id', user.id)
        .single();

      if (companyError || !companySettings) {
        throw new Error('Error al cargar configuración de la empresa');
      }

      // Fetch hour surcharges
      const { data: surcharges, error: surchargesError } = await supabase
        .from('hour_surcharges')
        .select('hour_type_name, surcharge_percent')
        .eq('user_id', user.id);

      if (surchargesError) {
        throw new Error('Error al cargar recargos de horas: ' + surchargesError.message);
      }

      // Prepare hour records data
      const hourRecordsData = periodHourRecords.map(record => ({
        hour_type_name: record.hour_type_name,
        hours: record.hours
      }));

      // Generate PDF
      await generateReceiptFromData(
        companySettings,
        selectedEmployeeData,
        hourRecordsData,
        surcharges || []
      );

    } catch (err) {
      console.error('Error generating payroll PDF:', err);
      setError(err instanceof Error ? err.message : 'Error al generar el PDF de la nómina');
    } finally {
      setDownloadingPayrollPdf(null);
    }
  };

  const handleDeletePayroll = async (payrollId: string) => {
    if (!user) {
      setError('Usuario no autenticado');
      return;
    }

    const confirmed = window.confirm(
      '¿Estás seguro de que deseas eliminar esta nómina? Esta acción no se puede deshacer.'
    );

    if (!confirmed) {
      return;
    }

    try {
      setError('');

      const { error } = await supabase
        .from('payroll_history')
        .delete()
        .eq('id', payrollId)
        .eq('user_id', user.id);

      if (error) {
        throw new Error('Error al eliminar la nómina: ' + error.message);
      }

      // Remover directamente del estado para actualización inmediata
      setPayrollHistory(prevHistory => prevHistory.filter(p => p.id !== payrollId));
      
      setSuccess('Nómina eliminada correctamente');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error deleting payroll:', err);
      setError(err instanceof Error ? err.message : 'Error al eliminar la nómina');
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="animate-fadeInDown">
        <h2 className="text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mb-2">
          Historial del Empleado
        </h2>
        <p className="text-slate-600 text-lg">Consulta el historial completo de horas y nóminas por empleado</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center space-x-3 animate-fadeIn">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex items-center space-x-3 animate-fadeIn">
          <div className="w-5 h-5 text-green-600 flex-shrink-0">✓</div>
          <p className="text-green-800">{success}</p>
        </div>
      )}

      {/* Employee Selection */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6 animate-fadeInUp">
        <div className="flex items-center space-x-3 mb-4">
          <User className="w-6 h-6 text-blue-600" />
          <h3 className="text-xl font-bold text-slate-800">Seleccionar Empleado</h3>
        </div>

        <select
          value={selectedEmployee}
          onChange={(e) => setSelectedEmployee(e.target.value)}
          className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-slate-800"
        >
          <option value="">Seleccione un empleado</option>
          {employees.map((emp) => (
            <option key={emp.id} value={emp.id}>
              {emp.full_name} - {emp.cedula}
            </option>
          ))}
        </select>
      </div>

      {selectedEmployee && selectedEmployeeData && (
        <>
          {/* Employee Information */}
          <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6 animate-fadeInUp">
            <div className="flex items-center space-x-3 mb-6">
              <FileText className="w-6 h-6 text-blue-600" />
              <h3 className="text-xl font-bold text-slate-800">Información del Empleado</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              <div className="bg-slate-50 rounded-xl p-4">
                <p className="text-sm font-semibold text-slate-600 mb-1">Nombre Completo</p>
                <p className="text-lg font-bold text-slate-900">{selectedEmployeeData.full_name}</p>
              </div>

              <div className="bg-slate-50 rounded-xl p-4">
                <p className="text-sm font-semibold text-slate-600 mb-1">Cédula</p>
                <p className="text-lg font-bold text-slate-900">{selectedEmployeeData.cedula}</p>
              </div>

              <div className="bg-slate-50 rounded-xl p-4">
                <p className="text-sm font-semibold text-slate-600 mb-1">Tipo de Contrato</p>
                <p className="text-lg font-bold text-slate-900">{selectedEmployeeData.contract_type}</p>
              </div>

              <div className="bg-slate-50 rounded-xl p-4">
                <p className="text-sm font-semibold text-slate-600 mb-1">Salario Mensual</p>
                <p className="text-lg font-bold text-slate-900">{formatCurrency(Number(selectedEmployeeData.monthly_salary))}</p>
              </div>

              <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl p-4 border-2 border-emerald-200">
                <p className="text-sm font-semibold text-emerald-700 mb-1">Total Ganado</p>
                <p className="text-lg font-bold text-emerald-900">{formatCurrency(totalEarnings)}</p>
              </div>
            </div>
          </div>

          {/* Date Range Filter */}
          <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6 animate-fadeInUp">
            <div className="flex items-center space-x-3 mb-4">
              <Filter className="w-6 h-6 text-blue-600" />
              <h3 className="text-xl font-bold text-slate-800">Filtros de Fecha</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Desde
                </label>
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Hasta
                </label>
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
              </div>

              <div className="flex items-end">
                <button
                  onClick={clearFilters}
                  className="w-full px-4 py-3 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200 transition-all"
                >
                  Limpiar Filtros
                </button>
              </div>
            </div>
          </div>

          {/* Totals Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fadeInUp">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg p-6 text-white">
              <div className="flex items-center space-x-3 mb-2">
                <Clock className="w-8 h-8" />
                <h3 className="text-xl font-bold">Total Horas Trabajadas</h3>
              </div>
              <p className="text-4xl font-bold">{totalHours.toFixed(1)}</p>
              <p className="text-blue-100 mt-2">Horas totales registradas</p>
            </div>

            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-lg p-6 text-white">
              <div className="flex items-center space-x-3 mb-2">
                <DollarSign className="w-8 h-8" />
                <h3 className="text-xl font-bold">Total Nóminas</h3>
              </div>
              <p className="text-4xl font-bold">{totalPayrolls}</p>
              <p className="text-green-100 mt-2">Nóminas generadas</p>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <svg className="animate-spin h-12 w-12 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          ) : selectedEmployee ? (
            <>
              {/* Hour Records History */}
              <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6 animate-fadeInUp">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <Clock className="w-6 h-6 text-blue-600" />
                    <h3 className="text-xl font-bold text-slate-800">Historial de Horas Trabajadas</h3>
                  </div>
                  <button
                    onClick={handleExport}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all"
                  >
                    <Download className="w-5 h-5" />
                    <span>Exportar</span>
                  </button>
                </div>

                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50 border-b-2 border-slate-200">
                      <tr>
                        <th
                          onClick={() => handleSort('date' as SortField, hoursSortField, hoursSortDirection, setHoursSortField, setHoursSortDirection)}
                          className="px-4 py-3 text-left text-sm font-bold text-slate-700 cursor-pointer hover:bg-slate-100 transition-colors"
                        >
                          <div className="flex items-center space-x-2">
                            <span>Fecha</span>
                            <SortIcon field="date" currentField={hoursSortField} currentDirection={hoursSortDirection} />
                          </div>
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-bold text-slate-700">
                          Tipo de Hora
                        </th>
                        <th
                          onClick={() => handleSort('hours' as SortField, hoursSortField, hoursSortDirection, setHoursSortField, setHoursSortDirection)}
                          className="px-4 py-3 text-right text-sm font-bold text-slate-700 cursor-pointer hover:bg-slate-100 transition-colors"
                        >
                          <div className="flex items-center justify-end space-x-2">
                            <span>Horas</span>
                            <SortIcon field="hours" currentField={hoursSortField} currentDirection={hoursSortDirection} />
                          </div>
                        </th>
                        <th
                          onClick={() => handleSort('period' as SortField, hoursSortField, hoursSortDirection, setHoursSortField, setHoursSortDirection)}
                          className="px-4 py-3 text-left text-sm font-bold text-slate-700 cursor-pointer hover:bg-slate-100 transition-colors"
                        >
                          <div className="flex items-center space-x-2">
                            <span>Periodo</span>
                            <SortIcon field="period" currentField={hoursSortField} currentDirection={hoursSortDirection} />
                          </div>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {sortedHourRecords.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="px-4 py-8 text-center text-slate-500">
                            No hay registros de horas para este empleado en el rango seleccionado
                          </td>
                        </tr>
                      ) : (
                        sortedHourRecords.map((record) => (
                          <tr key={record.id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-4 py-3 text-sm text-slate-800">{formatDate(record.date)}</td>
                            <td className="px-4 py-3 text-sm text-slate-800">
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                                {record.hour_type_name || 'N/A'}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm font-semibold text-slate-900 text-right">{Number(record.hours || 0).toFixed(1)}</td>
                            <td className="px-4 py-3 text-sm text-slate-800">{record.period || '-'}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Card View */}
                <div className="block md:hidden space-y-4">
                  {sortedHourRecords.length === 0 ? (
                    <div className="text-center py-8 text-slate-500">
                      No hay registros de horas para este empleado en el rango seleccionado
                    </div>
                  ) : (
                    sortedHourRecords.map((record) => (
                      <div key={record.id} className="bg-white rounded-xl shadow-md p-4 space-y-2 border border-slate-200">
                        <div className="text-lg font-bold text-slate-900 mb-2">
                          {formatDate(record.date)}
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-semibold text-slate-600">Tipo de Hora:</span>
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                              {record.hour_type_name || 'N/A'}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-semibold text-slate-600">Horas:</span>
                            <span className="text-sm font-bold text-slate-900">{Number(record.hours || 0).toFixed(1)}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-semibold text-slate-600">Periodo:</span>
                            <span className="text-sm text-slate-800">{record.period || '-'}</span>
                          </div>
                          <div className="pt-2 border-t border-slate-200">
                            <span className="text-xs text-slate-500">Fecha de Creación: {formatDateTime(record.created_at)}</span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {sortedHourRecords.length > 0 && (
                  <div className="mt-4 bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-bold text-blue-900">TOTAL DE HORAS:</span>
                      <span className="text-lg font-bold text-blue-900">{totalHours.toFixed(1)} horas</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Payroll History */}
              <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6 animate-fadeInUp">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <DollarSign className="w-6 h-6 text-green-600" />
                    <h3 className="text-xl font-bold text-slate-800">Historial de Nóminas</h3>
                  </div>
                  <button
                    onClick={handleExport}
                    className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-all"
                  >
                    <Download className="w-5 h-5" />
                    <span>Exportar</span>
                  </button>
                </div>

                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50 border-b-2 border-slate-200">
                      <tr>
                        <th
                          onClick={() => handleSort('period_start' as SortField, payrollSortField, payrollSortDirection, setPayrollSortField, setPayrollSortDirection)}
                          className="px-4 py-3 text-left text-sm font-bold text-slate-700 cursor-pointer hover:bg-slate-100 transition-colors"
                        >
                          <div className="flex items-center space-x-2">
                            <span>Periodo</span>
                            <SortIcon field="period_start" currentField={payrollSortField} currentDirection={payrollSortDirection} />
                          </div>
                        </th>
                        <th
                          onClick={() => handleSort('total_hours' as SortField, payrollSortField, payrollSortDirection, setPayrollSortField, setPayrollSortDirection)}
                          className="px-4 py-3 text-right text-sm font-bold text-slate-700 cursor-pointer hover:bg-slate-100 transition-colors"
                        >
                          <div className="flex items-center justify-end space-x-2">
                            <span>Total Horas</span>
                            <SortIcon field="total_hours" currentField={payrollSortField} currentDirection={payrollSortDirection} />
                          </div>
                        </th>
                        <th
                          onClick={() => handleSort('net_salary' as SortField, payrollSortField, payrollSortDirection, setPayrollSortField, setPayrollSortDirection)}
                          className="px-4 py-3 text-right text-sm font-bold text-slate-700 cursor-pointer hover:bg-slate-100 transition-colors"
                        >
                          <div className="flex items-center justify-end space-x-2">
                            <span>Salario Neto</span>
                            <SortIcon field="net_salary" currentField={payrollSortField} currentDirection={payrollSortDirection} />
                          </div>
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-bold text-slate-700">
                          Fecha Generación
                        </th>
                        <th className="px-4 py-3 text-center text-sm font-bold text-slate-700">
                          PDF
                        </th>
                        <th className="px-4 py-3 text-center text-sm font-bold text-slate-700">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {sortedPayrollHistory.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                            No hay registros de nómina para este empleado en el rango seleccionado
                          </td>
                        </tr>
                      ) : (
                        sortedPayrollHistory.map((payroll) => (
                          <tr key={payroll.id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-4 py-3 text-sm text-slate-800">
                              <div className="flex flex-col">
                                <span className="font-semibold">{formatDate(payroll.period_start)} - {formatDate(payroll.period_end)}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-sm font-semibold text-slate-900 text-right">{Number(payroll.total_hours || 0).toFixed(1)}</td>
                            <td className="px-4 py-3 text-sm font-bold text-green-700 text-right">{formatCurrency(Number(payroll.net_salary || 0))}</td>
                            <td className="px-4 py-3 text-sm text-slate-600">{formatDateTime(payroll.created_at)}</td>
                            <td className="px-4 py-3 text-center">
                              <button
                                onClick={() => handleDownloadPayrollPdf(payroll.id)}
                                disabled={downloadingPayrollPdf === payroll.id}
                                className="inline-flex items-center justify-center p-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Descargar PDF de esta nómina"
                              >
                                {downloadingPayrollPdf === payroll.id ? (
                                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                  </svg>
                                ) : (
                                  <FileText className="w-5 h-5" />
                                )}
                              </button>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <button
                                onClick={() => handleDeletePayroll(payroll.id)}
                                className="inline-flex items-center justify-center p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Eliminar esta nómina"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Card View */}
                <div className="block md:hidden space-y-4">
                  {sortedPayrollHistory.length === 0 ? (
                    <div className="text-center py-8 text-slate-500">
                      No hay registros de nómina para este empleado en el rango seleccionado
                    </div>
                  ) : (
                    sortedPayrollHistory.map((payroll) => (
                      <div key={payroll.id} className="bg-white rounded-xl shadow-md p-4 space-y-3 border border-slate-200">
                        <div className="text-lg font-bold text-slate-900 mb-2">
                          {formatDate(payroll.period_start)} - {formatDate(payroll.period_end)}
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-semibold text-slate-600">Horas Totales:</span>
                            <span className="text-sm font-bold text-slate-900">{Number(payroll.total_hours || 0).toFixed(1)}</span>
                          </div>
                          <div className="flex justify-between items-center bg-green-50 -mx-4 px-4 py-2">
                            <span className="text-sm font-semibold text-green-700">Salario Neto:</span>
                            <span className="text-lg font-bold text-green-700">{formatCurrency(Number(payroll.net_salary || 0))}</span>
                          </div>
                          <div className="pt-2 border-t border-slate-200">
                            <span className="text-xs text-slate-500">Fecha de Creación: {formatDateTime(payroll.created_at)}</span>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDownloadPayrollPdf(payroll.id)}
                          disabled={downloadingPayrollPdf === payroll.id}
                          className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {downloadingPayrollPdf === payroll.id ? (
                            <>
                              <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              <span>Generando...</span>
                            </>
                          ) : (
                            <>
                              <FileText className="w-5 h-5" />
                              <span>Ver Nómina</span>
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => handleDeletePayroll(payroll.id)}
                          className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg font-semibold transition-all mt-2"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          <span>Eliminar</span>
                        </button>
                      </div>
                    ))
                  )}
                </div>

                {sortedPayrollHistory.length > 0 && (
                  <div className="mt-4 bg-green-50 border border-green-200 rounded-xl p-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-bold text-green-900">TOTAL DE NÓMINAS:</span>
                      <span className="text-lg font-bold text-green-900">{totalPayrolls} nóminas generadas</span>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-12 text-center animate-fadeInUp">
              <Calendar className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-slate-600 mb-2">Selecciona un empleado</h3>
              <p className="text-slate-500">Elige un empleado del menú superior para ver su historial completo</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
