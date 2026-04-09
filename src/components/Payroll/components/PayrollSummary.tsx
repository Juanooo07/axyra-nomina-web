import { DollarSign, TrendingUp, TrendingDown, FileText } from 'lucide-react';

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

interface PayrollSummaryProps {
  calculation: PayrollCalculation | null;
  userSettings: {
    company_name?: string;
    company_nit?: string;
    company_address?: string;
  };
}

export function PayrollSummary({ calculation, userSettings }: PayrollSummaryProps) {
  if (!calculation) {
    return (
      <div className="bg-gray-50 rounded-lg p-8 text-center">
        <FileText className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Sin cálculo</h3>
        <p className="mt-1 text-sm text-gray-500">
          Realice un cálculo de nómina para ver el resumen aquí.
        </p>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CO');
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Resumen de Nómina</h3>
          <p className="text-sm text-gray-600">
            Período: {formatDate(calculation.period_start)} - {formatDate(calculation.period_end)}
          </p>
        </div>
        {userSettings.company_name && (
          <div className="text-right text-sm text-gray-600">
            <p className="font-medium">{userSettings.company_name}</p>
            {userSettings.company_nit && <p>NIT: {userSettings.company_nit}</p>}
          </div>
        )}
      </div>

      {/* Employee Info */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <h4 className="font-medium text-gray-900 mb-2">Información del Empleado</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Nombre:</span>
            <span className="ml-2 font-medium">{calculation.employee_name}</span>
          </div>
          <div>
            <span className="text-gray-600">Cédula:</span>
            <span className="ml-2 font-medium">{calculation.employee_cedula}</span>
          </div>
        </div>
      </div>

      {/* Salary Breakdown */}
      <div className="space-y-4">
        <h4 className="font-medium text-gray-900">Desglose de Salario</h4>

        {/* Base Salary */}
        <div className="flex justify-between items-center py-2 border-b">
          <span className="text-gray-700">Salario Base</span>
          <span className="font-medium">{formatCurrency(calculation.base_salary)}</span>
        </div>

        {/* Hour Breakdowns */}
        {calculation.hour_breakdowns.length > 0 && (
          <div className="space-y-2">
            <h5 className="text-sm font-medium text-gray-700">Horas Extras / Recargos</h5>
            {calculation.hour_breakdowns.map((breakdown, index) => (
              <div key={index} className="flex justify-between items-center py-1 pl-4 text-sm">
                <span className="text-gray-600">
                  {breakdown.hour_type} ({breakdown.hours}h × {formatCurrency(breakdown.hourly_rate)})
                </span>
                <span className="font-medium text-green-600">
                  +{formatCurrency(breakdown.total)}
                </span>
              </div>
            ))}
            <div className="flex justify-between items-center py-2 border-t font-medium">
              <span className="text-gray-700">Total Recargos</span>
              <span className="text-green-600">{formatCurrency(calculation.total_surcharges)}</span>
            </div>
          </div>
        )}

        {/* Transport Allowance */}
        {calculation.transport_allowance > 0 && (
          <div className="flex justify-between items-center py-2">
            <span className="text-gray-700">Auxilio de Transporte</span>
            <span className="font-medium text-green-600">
              +{formatCurrency(calculation.transport_allowance)}
            </span>
          </div>
        )}

        {/* Deductions */}
        {(calculation.health_deduction > 0 || calculation.pension_deduction > 0) && (
          <div className="space-y-2">
            <h5 className="text-sm font-medium text-gray-700">Deducciones</h5>
            {calculation.health_deduction > 0 && (
              <div className="flex justify-between items-center py-1 pl-4 text-sm">
                <span className="text-gray-600">Seguridad Social (Salud)</span>
                <span className="font-medium text-red-600">
                  -{formatCurrency(calculation.health_deduction)}
                </span>
              </div>
            )}
            {calculation.pension_deduction > 0 && (
              <div className="flex justify-between items-center py-1 pl-4 text-sm">
                <span className="text-gray-600">Seguridad Social (Pensión)</span>
                <span className="font-medium text-red-600">
                  -{formatCurrency(calculation.pension_deduction)}
                </span>
              </div>
            )}
            <div className="flex justify-between items-center py-2 border-t font-medium">
              <span className="text-gray-700">Total Deducciones</span>
              <span className="text-red-600">-{formatCurrency(calculation.total_deductions)}</span>
            </div>
          </div>
        )}

        {/* Net Salary */}
        <div className="flex justify-between items-center py-4 border-t-2 border-gray-300 text-lg font-bold bg-gray-50 -mx-6 px-6 rounded-b-lg">
          <span className="text-gray-900">Salario Neto a Pagar</span>
          <span className="text-blue-600">{formatCurrency(calculation.net_salary)}</span>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">{calculation.total_hours}</div>
          <div className="text-sm text-gray-600">Horas Totales</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">
            {formatCurrency(calculation.base_salary + calculation.total_surcharges + calculation.transport_allowance)}
          </div>
          <div className="text-sm text-gray-600">Devengado</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-red-600">
            {formatCurrency(calculation.total_deductions)}
          </div>
          <div className="text-sm text-gray-600">Deducido</div>
        </div>
      </div>
    </div>
  );
}