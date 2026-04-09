import { useState } from 'react';
import { History, Eye, Download, Trash2, AlertTriangle } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { PayrollHistory } from '../types';
}

interface PayrollHistoryProps {
  payrollHistory: PayrollHistory[];
  onViewPayroll: (payroll: PayrollHistory) => void;
  onRefresh: () => void;
}

export function PayrollHistoryComponent({ payrollHistory, onViewPayroll, onRefresh }: PayrollHistoryProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

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

  const handleDeletePayroll = async (payrollId: string) => {
    setDeletingId(payrollId);
    try {
      // First, delete related hour records
      const { error: hourError } = await supabase
        .from('hour_records')
        .delete()
        .eq('payroll_id', payrollId);

      if (hourError) throw hourError;

      // Then delete the payroll
      const { error: payrollError } = await supabase
        .from('payrolls')
        .delete()
        .eq('id', payrollId);

      if (payrollError) throw payrollError;

      onRefresh();
      setShowDeleteConfirm(null);
    } catch (err) {
      console.error('Error deleting payroll:', err);
      alert('Error al eliminar la nómina');
    } finally {
      setDeletingId(null);
    }
  };

  if (payrollHistory.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center py-8">
          <History className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Sin historial</h3>
          <p className="mt-1 text-sm text-gray-500">
            No hay nóminas calculadas para este empleado.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center">
        <History className="mr-2" />
        Historial de Nóminas
      </h3>

      <div className="space-y-4">
        {payrollHistory.map((payroll) => (
          <div key={payroll.id} className="border border-gray-200 rounded-lg p-4">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h4 className="font-medium text-gray-900">
                  {payroll.employee_name} - {payroll.employee_cedula}
                </h4>
                <p className="text-sm text-gray-600">
                  Período: {formatDate(payroll.period_start)} - {formatDate(payroll.period_end)}
                </p>
                <p className="text-xs text-gray-500">
                  Calculado: {formatDate(payroll.created_at)}
                </p>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-blue-600">
                  {formatCurrency(payroll.net_salary)}
                </div>
                <div className="text-sm text-gray-600">
                  {payroll.total_hours}h trabajadas
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-3 text-sm">
              <div>
                <span className="text-gray-600">Base:</span>
                <span className="ml-1 font-medium">{formatCurrency(payroll.base_salary)}</span>
              </div>
              <div>
                <span className="text-gray-600">Recargos:</span>
                <span className="ml-1 font-medium text-green-600">
                  +{formatCurrency(payroll.total_surcharges)}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Deducciones:</span>
                <span className="ml-1 font-medium text-red-600">
                  -{formatCurrency(payroll.total_deductions)}
                </span>
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <button
                onClick={() => onViewPayroll(payroll)}
                className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 flex items-center"
              >
                <Eye className="mr-1" size={14} />
                Ver
              </button>
              <button
                onClick={() => setShowDeleteConfirm(payroll.id)}
                disabled={deletingId === payroll.id}
                className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 disabled:bg-gray-400 flex items-center"
              >
                <Trash2 className="mr-1" size={14} />
                {deletingId === payroll.id ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <AlertTriangle className="h-6 w-6 text-red-500 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">
                Confirmar Eliminación
              </h3>
            </div>
            <p className="text-gray-600 mb-6">
              ¿Estás seguro de que deseas eliminar esta nómina? Esta acción no se puede deshacer.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDeletePayroll(showDeleteConfirm)}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}