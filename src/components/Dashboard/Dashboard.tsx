import { useState, useEffect } from 'react';
import { Users, Clock, DollarSign, TrendingUp, Calendar, CheckCircle, RefreshCw, FileText, Trash2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

interface DashboardProps {
  onViewChange: (view: string) => void;
}

interface Activity {
  id: string;
  type: string;
  description: string;
  created_at: string;
}

export function Dashboard({ onViewChange }: DashboardProps) {
  const { profile, user } = useAuth();
  const [stats, setStats] = useState({
    employees: 0,
    fijoTotal: 0,
    temporalTotal: 0,
    totalGeneral: 0,
    monthlyHistory: [] as Array<{ month: string; fijoTotal: number; temporalTotal: number; totalGeneral: number }>,
  });
  const [recentActivity, setRecentActivity] = useState<Activity[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      loadStats();
      loadRecentActivity();
    }

    // refresh stats and add activity when payroll is deleted
    const handlePayrollDeleted = () => {
      loadStats();
      // Agregar actividad de eliminación
      setRecentActivity(prev => [
        {
          id: `payroll-deleted-${Date.now()}`,
          type: 'payroll',
          description: 'Nómina eliminada',
          created_at: new Date().toISOString(),
        },
        ...prev,
      ].slice(0, 5)); // Mantener solo las últimas 5
    };
    window.addEventListener('payrollDeleted', handlePayrollDeleted);
    return () => {
      window.removeEventListener('payrollDeleted', handlePayrollDeleted);
    };
  }, [user]);

  // Helper to recalculate ALL payrolls for a date range and update the DB if needed
  const recalculatePayrollsForRange = async (startDate: string, endDate: string, employees: any[]) => {
    try {
      // Get all payroll records for this range
      const { data: payrolls } = await supabase
        .from('payroll_history')
        .select('id, employee_id, period_start, period_end, total_hours, base_salary, total_surcharges, transport_allowance, health_deduction, pension_deduction, total_deductions, net_salary')
        .eq('user_id', user.id)
        .gte('created_at', startDate)
        .lte('created_at', endDate);

      if (!payrolls || payrolls.length === 0) return;

      // Get surcharges and settings once
      const { data: surcharges } = await supabase
        .from('hour_surcharges')
        .select('hour_type_name, surcharge_percent')
        .eq('user_id', user.id);

      const { data: settings } = await supabase
        .from('user_settings')
        .select('health_deduction_percent, pension_deduction_percent')
        .eq('user_id', user.id)
        .maybeSingle();

      const surchargeMap = new Map<string, number>();
      (surcharges || []).forEach((s: any) => {
        surchargeMap.set(s.hour_type_name, s.surcharge_percent);
      });

      const healthPercent = settings?.health_deduction_percent || 4.0;
      const pensionPercent = settings?.pension_deduction_percent || 4.0;

      // Recalculate each payroll
      for (const payroll of payrolls) {
        const employee = employees.find((e: any) => e.id === payroll.employee_id);
        if (!employee) continue;

        const monthlySalary = Number(employee.monthly_salary);
        const hourlyRate = monthlySalary / 220;
        const isFijo = employee.contract_type === 'FIJO';

        // Get hours for this payroll period
        const { data: hourRecords } = await supabase
          .from('hour_records')
          .select('hour_type_name, hours')
          .eq('user_id', user.id)
          .eq('employee_id', payroll.employee_id)
          .gte('date', payroll.period_start)
          .lte('date', payroll.period_end);

        const hoursMap = new Map<string, number>();
        (hourRecords || []).forEach((r: any) => {
          const curr = hoursMap.get(r.hour_type_name) || 0;
          hoursMap.set(r.hour_type_name, curr + Number(r.hours));
        });

        // Compute base, surcharges
        let computedBase = 0;
        let computedSurcharges = 0;

        if (isFijo) {
          computedBase = monthlySalary / 2;
          surchargeMap.forEach((sPct, hType) => {
            if (hType !== 'Hora Ordinaria') {
              const hrs = hoursMap.get(hType) || 0;
              computedSurcharges += hourlyRate * (1 + sPct / 100) * hrs;
            }
          });
        } else {
          surchargeMap.forEach((sPct, hType) => {
            const hrs = hoursMap.get(hType) || 0;
            computedSurcharges += hourlyRate * (1 + sPct / 100) * hrs;
          });
        }

        let transportAllowance = 0;
        if (employee.receives_transport_allowance && monthlySalary < 2 * 1423500) {
          transportAllowance = 200000 / 2;
        }

        const gross = computedBase + computedSurcharges + transportAllowance;
        const healthDeduction = gross * (healthPercent / 100);
        const pensionDeduction = gross * (pensionPercent / 100);
        const totalDeductions = healthDeduction + pensionDeduction;
        const computedNet = gross - totalDeductions;

        // Check if needs update
        const needsUpdate =
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
              base_salary: computedBase,
              total_surcharges: computedSurcharges,
              transport_allowance: transportAllowance,
              health_deduction: healthDeduction,
              pension_deduction: pensionDeduction,
              total_deductions: totalDeductions,
              net_salary: computedNet,
            })
            .eq('id', payroll.id);
        }
      }
    } catch (err) {
      console.error('Error recalculating payrolls for range:', err);
    }
  };

  const loadStats = async () => {
    if (!user) return;

    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const firstDayStr = firstDayOfMonth.toISOString().split('T')[0];
    const lastDayStr = lastDayOfMonth.toISOString().split('T')[0];

    // Get employees count (active employees)
    const employeesResult = await supabase
      .from('employees')
      .select('id, contract_type, monthly_salary, receives_transport_allowance, status')
      .eq('user_id', user.id)
      .eq('status', 'active');

    const allEmployeesResult = employeesResult;

    // Auto-recalculate all payrolls for this month before summing
    if (allEmployeesResult.data) {
      await recalculatePayrollsForRange(firstDayStr, lastDayStr, allEmployeesResult.data);
    }

    // Get payroll for this month separated by contract type (now with corrected values)
    const payrollsResult = await supabase
      .from('payroll_history')
      .select('net_salary, employee_id')
      .eq('user_id', user.id)
      .gte('created_at', firstDayStr)
      .lte('created_at', lastDayStr);

    let fijoTotal = 0;
    let temporalTotal = 0;

    if (payrollsResult.data) {
      payrollsResult.data.forEach(record => {
        const employee = allEmployeesResult.data?.find(e => e.id === record.employee_id);
        const amount = Number(record.net_salary || 0);
        if (employee?.contract_type === 'FIJO') {
          fijoTotal += amount;
        } else {
          temporalTotal += amount;
        }
      });
    }

    const totalGeneral = fijoTotal + temporalTotal;

    // Calculate monthly history (last 12 months)
    const monthlyHistory = [];
    for (let i = 11; i >= 0; i--) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthFirstDay = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1).toISOString().split('T')[0];
      const monthLastDay = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0).toISOString().split('T')[0];

      // Auto-recalculate payrolls for this month before summing
      if (allEmployeesResult.data) {
        await recalculatePayrollsForRange(monthFirstDay, monthLastDay, allEmployeesResult.data);
      }

      const historicalPayroll = await supabase
        .from('payroll_history')
        .select('net_salary, employee_id')
        .eq('user_id', user.id)
        .gte('created_at', monthFirstDay)
        .lte('created_at', monthLastDay);

      let monthFijoTotal = 0;
      let monthTemporalTotal = 0;

      if (historicalPayroll.data) {
        historicalPayroll.data.forEach(record => {
          const employee = allEmployeesResult.data?.find(e => e.id === record.employee_id);
          const amount = Number(record.net_salary || 0);
          if (employee?.contract_type === 'FIJO') {
            monthFijoTotal += amount;
          } else {
            monthTemporalTotal += amount;
          }
        });
      }

      monthlyHistory.push({
        month: monthDate.toLocaleDateString('es-CO', { month: 'short', year: '2-digit' }),
        fijoTotal: monthFijoTotal,
        temporalTotal: monthTemporalTotal,
        totalGeneral: monthFijoTotal + monthTemporalTotal,
      });
    }

    setStats({
      employees: employeesResult.data?.length || 0,
      fijoTotal,
      temporalTotal,
      totalGeneral,
      monthlyHistory,
    });
  };

  const loadRecentActivity = async () => {
    if (!user) return;

    const activities: Activity[] = [];

    const [employeesResult, hoursResult, payrollsResult] = await Promise.all([
      supabase.from('employees').select('full_name, created_at').eq('user_id', user.id).order('created_at', { ascending: false }).limit(3),
      supabase.from('hour_records').select('id, created_at').eq('user_id', user.id).order('created_at', { ascending: false }).limit(3),
      supabase.from('payroll_history').select('id, created_at').eq('user_id', user.id).order('created_at', { ascending: false }).limit(3),
    ]);

    if (employeesResult.data) {
      employeesResult.data.forEach(emp => {
        activities.push({
          id: `emp-${emp.created_at}`,
          type: 'employee',
          description: `Empleado registrado: ${emp.full_name}`,
          created_at: emp.created_at,
        });
      });
    }

    if (hoursResult.data) {
      hoursResult.data.forEach(hour => {
        activities.push({
          id: `hour-${hour.id}`,
          type: 'hour',
          description: 'Registro de horas agregado',
          created_at: hour.created_at,
        });
      });
    }

    if (payrollsResult.data) {
      payrollsResult.data.forEach(payroll => {
        activities.push({
          id: `payroll-${payroll.id}`,
          type: 'payroll',
          description: 'Nómina generada',
          created_at: payroll.created_at,
        });
      });
    }

    activities.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    setRecentActivity(activities.slice(0, 5));
  };

  const handleResetMonthlyTotal = () => {
    if (confirm('¿Estás seguro de que deseas reiniciar el contador del mes? Esta acción no eliminará datos, solo reiniciará la visualización del mes actual.')) {
      setStats(prev => ({ ...prev, fijoTotal: 0, temporalTotal: 0, totalGeneral: 0 }));
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'employee':
        return Users;
      case 'hour':
        return Clock;
      case 'payroll':
        return DollarSign;
      default:
        return FileText;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'employee':
        return 'text-green-600';
      case 'hour':
        return 'text-orange-600';
      case 'payroll':
        return 'text-emerald-600';
      default:
        return 'text-blue-600';
    }
  };

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Hace un momento';
    if (diffInSeconds < 3600) return `Hace ${Math.floor(diffInSeconds / 60)} minutos`;
    if (diffInSeconds < 86400) return `Hace ${Math.floor(diffInSeconds / 3600)} horas`;
    if (diffInSeconds < 604800) return `Hace ${Math.floor(diffInSeconds / 86400)} días`;
    return date.toLocaleDateString('es-CO');
  };

  const statCards = [
    {
      name: 'Empleados Total',
      value: stats.employees.toString(),
      icon: Users,
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600'
    },
    {
      name: 'Total Nómina FIJO',
      value: formatCurrency(stats.fijoTotal),
      icon: DollarSign,
      bgColor: 'bg-green-50',
      textColor: 'text-green-600'
    },
    {
      name: 'Total Nómina TEMPORAL',
      value: formatCurrency(stats.temporalTotal),
      icon: DollarSign,
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-600'
    },
  ];

  const handleResetContract = async (contractType: string) => {
    if (!user) return;
    if (!window.confirm(`¿Confirmas reiniciar (eliminar) las nóminas de tipo ${contractType} para este mes?`)) return;
    try {
      setError('');
      setLoading(true);
      
      // Compute month range
      const now = new Date();
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

      // Get employees by contract type
      const { data: employeeIds, error: empError } = await supabase
        .from('employees')
        .select('id')
        .eq('user_id', user.id)
        .eq('contract_type', contractType);

      if (empError) throw empError;

      // Delete payrolls for these employees in the date range
      const ids = (employeeIds || []).map((e: any) => e.id);
      if (ids.length > 0) {
        const { error: delErr } = await supabase
          .from('payroll_history')
          .delete()
          .eq('user_id', user.id)
          .in('employee_id', ids)
          .gte('created_at', firstDay)
          .lte('created_at', lastDay);
        
        if (delErr) {
          console.error('Delete error:', delErr);
          throw delErr;
        }
      }

      setSuccess(`Nóminas de tipo ${contractType} eliminadas correctamente`);
      await loadStats();
      setLoading(false);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error resetting contract totals', err);
      setLoading(false);
      setError(err instanceof Error ? err.message : 'Error al reiniciar totales');
      setTimeout(() => setError(''), 5000);
    }
  };

  const handleRefreshContract = async (contractType: string) => {
    await loadStats();
  };

  const quickStartSteps = [
    { title: 'Registra tus empleados', description: 'Agrega la información de tu personal', view: 'employees', completed: stats.employees > 0 },
    { title: 'Registra las horas trabajadas', description: 'Ingresa las horas de cada tipo', view: 'hour-records', completed: stats.hoursThisMonth > 0 },
    { title: 'Genera tu primera nómina', description: 'Calcula y genera comprobantes', view: 'payroll', completed: stats.payrollsProcessed > 0 },
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="animate-fadeInDown">
        <h2 className="text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mb-2">
          Bienvenido, {profile?.full_name}
        </h2>
        <p className="text-slate-600 text-lg">Resumen general de tu sistema de nómina</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.name}
              className={`bg-white rounded-2xl shadow-lg border border-slate-100 p-6 hover:shadow-xl transition-all transform hover:scale-105 animate-fadeInUp`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`${stat.bgColor} p-3 rounded-xl shadow-md`}>
                  <Icon className={`w-6 h-6 ${stat.textColor}`} />
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-600 mb-1">{stat.name}</p>
                <p className="text-3xl font-bold text-slate-800">{stat.value}</p>
              </div>
              {/* Controls for contract stats: reset (delete) and refresh */}
              {(stat.name.includes('FIJO') || stat.name.includes('TEMPORAL')) && (
                <div className="mt-4 flex items-center space-x-2">
                  <button
                    onClick={() => handleResetContract(stat.name.includes('FIJO') ? 'FIJO' : 'TEMPORAL')}
                    className="inline-flex items-center px-3 py-1 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-all"
                    title={`Reiniciar ${stat.name}`}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    <span className="text-sm">Reiniciar</span>
                  </button>
                  <button
                    onClick={() => handleRefreshContract(stat.name.includes('FIJO') ? 'FIJO' : 'TEMPORAL')}
                    className="inline-flex items-center px-3 py-1 bg-slate-50 text-slate-700 rounded-lg hover:bg-slate-100 transition-all"
                    title={`Actualizar ${stat.name}`}
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    <span className="text-sm">Actualizar</span>
                  </button>
                </div>
              )}
            </div>
          );
        })}

        <div
          className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6 hover:shadow-xl transition-all transform hover:scale-105 animate-fadeInUp"
          style={{ animationDelay: '0.3s' }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="bg-purple-50 p-3 rounded-xl shadow-md">
              <DollarSign className="w-6 h-6 text-purple-600" />
            </div>
            <button
              onClick={handleResetMonthlyTotal}
              className="p-2 hover:bg-slate-100 rounded-lg transition-all"
              title="Limpiar total del mes"
            >
              <RefreshCw className="w-4 h-4 text-slate-400 hover:text-purple-600" />
            </button>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-600 mb-1">Total General Nómina</p>
            <p className="text-3xl font-bold text-slate-800">{formatCurrency(stats.totalGeneral)}</p>
            <p className="text-xs text-slate-500 mt-1">{new Date().toLocaleDateString('es-CO', { month: 'long', year: 'numeric' })}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6 animate-fadeInUp animation-delay-400">
          <div className="flex items-center space-x-2 mb-4">
            <Calendar className="w-5 h-5 text-slate-600" />
            <h3 className="text-xl font-bold text-slate-800">Actividad Reciente</h3>
          </div>
          <div className="space-y-3">
            {recentActivity.length > 0 ? (
              recentActivity.map((activity) => {
                const Icon = getActivityIcon(activity.type);
                const colorClass = getActivityColor(activity.type);
                return (
                  <div
                    key={activity.id}
                    className="flex items-center space-x-3 p-4 bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl border border-slate-200"
                  >
                    <div className="bg-white p-2 rounded-lg shadow-sm">
                      <Icon className={`w-5 h-5 ${colorClass}`} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-slate-800">{activity.description}</p>
                      <p className="text-xs text-slate-500">{formatRelativeTime(activity.created_at)}</p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl border border-slate-200">
                <div className="bg-white p-2 rounded-lg shadow-sm">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-800">Sistema iniciado</p>
                  <p className="text-xs text-slate-500">Comienza agregando empleados</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6 animate-fadeInUp animation-delay-600">
          <h3 className="text-xl font-bold text-slate-800 mb-4">Acciones Rápidas</h3>
          <div className="space-y-3">
            <button
              onClick={() => onViewChange('employees')}
              className="w-full text-left p-4 bg-gradient-to-r from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 rounded-xl transition-all border border-green-200 transform hover:scale-[1.02] hover:shadow-md"
            >
              <div className="flex items-center space-x-3">
                <div className="bg-white p-2 rounded-lg shadow-sm">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="font-bold text-green-900">Agregar Empleado</p>
                  <p className="text-sm text-green-600">Registra un nuevo empleado</p>
                </div>
              </div>
            </button>
            <button
              onClick={() => onViewChange('payroll')}
              className="w-full text-left p-4 bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 rounded-xl transition-all border border-blue-200 transform hover:scale-[1.02] hover:shadow-md"
            >
              <div className="flex items-center space-x-3">
                <div className="bg-white p-2 rounded-lg shadow-sm">
                  <DollarSign className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="font-bold text-blue-900">Generar Nómina</p>
                  <p className="text-sm text-blue-600">Calcula y genera recibos de nómina</p>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Monthly History Section */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6 animate-fadeInUp animation-delay-700">
        <div className="flex items-center space-x-2 mb-4">
          <Calendar className="w-5 h-5 text-slate-600" />
          <h3 className="text-xl font-bold text-slate-800">Historial Mensual de Nómina</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Mes</th>
                <th className="px-4 py-3 text-right font-semibold text-slate-700">FIJO</th>
                <th className="px-4 py-3 text-right font-semibold text-slate-700">TEMPORAL</th>
                <th className="px-4 py-3 text-right font-semibold text-slate-700">Total</th>
              </tr>
            </thead>
            <tbody>
              {stats.monthlyHistory.map((monthData, index) => (
                <tr key={index} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 text-slate-800 font-medium">{monthData.month}</td>
                  <td className="px-4 py-3 text-right text-green-600 font-semibold">{formatCurrency(monthData.fijoTotal)}</td>
                  <td className="px-4 py-3 text-right text-orange-600 font-semibold">{formatCurrency(monthData.temporalTotal)}</td>
                  <td className="px-4 py-3 text-right text-purple-600 font-semibold">{formatCurrency(monthData.totalGeneral)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 rounded-2xl shadow-2xl p-10 text-white animate-fadeInScale animation-delay-800">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h3 className="text-3xl font-bold mb-3">Guía de Inicio Rápido</h3>
            <p className="text-blue-100 mb-6 text-lg max-w-xl">
              Sigue estos pasos para comenzar a gestionar tu nómina de manera eficiente y profesional.
            </p>
            <div className="space-y-3 mb-6">
              {quickStartSteps.map((step, index) => (
                <div
                  key={index}
                  onClick={() => onViewChange(step.view)}
                  className="bg-white bg-opacity-10 backdrop-blur-sm p-4 rounded-xl border border-white border-opacity-20 hover:bg-opacity-20 transition-all cursor-pointer"
                >
                  <div className="flex items-center space-x-3">
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${step.completed ? 'bg-green-500' : 'bg-white bg-opacity-20'}`}>
                      {step.completed ? (
                        <CheckCircle className="w-5 h-5 text-white" />
                      ) : (
                        <span className="text-white font-bold">{index + 1}</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-white">{step.title}</p>
                      <p className="text-sm text-blue-100">{step.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="hidden lg:block animate-float">
            <TrendingUp className="w-32 h-32 text-blue-400 opacity-50" />
          </div>
        </div>
      </div>
    </div>
  );
}
