import { useEffect, useState } from 'react';
import { History, FileDown, Trash2, Calendar, User, DollarSign } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { generateSettlementPDF } from '../../utils/pdfGenerator';

interface HistoryRecord {
  id: string;
  employee_name: string;
  fecha_inicio: string;
  fecha_fin: string;
  modalidad: string;
  base_mode: string;
  dias_totales: number;
  total_general: number;
  breakdown_por_anio: any;
  aplica_aux_transporte: boolean;
  incluir_cesantias: boolean;
  incluir_intereses_cesantias: boolean;
  incluir_prima: boolean;
  incluir_vacaciones: boolean;
  created_at: string;
}

export function SettlementHistory() {
  const { user } = useAuth();
  const [history, setHistory] = useState<HistoryRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('settlement_history')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setHistory(data || []);
    } catch (error) {
      console.error('Error loading history:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = (record: HistoryRecord) => {
    const pdfData = {
      employeeName: record.employee_name,
      fechaInicio: record.fecha_inicio,
      fechaFin: record.fecha_fin,
      modalidad: record.modalidad as 'DIAS' | 'HORAS',
      diasTotales: record.dias_totales,
      baseMode: record.base_mode,
      aplicaAuxTransporte: record.aplica_aux_transporte,
      breakdownPorAnio: record.breakdown_por_anio,
      totalGeneral: record.total_general,
      incluirCesantias: record.incluir_cesantias,
      incluirInteresesCesantias: record.incluir_intereses_cesantias,
      incluirPrima: record.incluir_prima,
      incluirVacaciones: record.incluir_vacaciones,
    };

    generateSettlementPDF(pdfData);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Está seguro de eliminar este registro del historial?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('settlement_history')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setHistory(history.filter(record => record.id !== id));
    } catch (error) {
      console.error('Error deleting record:', error);
      alert('Error al eliminar el registro');
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-4 md:p-6">
      <div className="flex items-center space-x-3 mb-6">
        <History className="w-6 h-6 text-blue-600" />
        <h3 className="text-xl font-bold text-slate-800">Historial de Liquidaciones</h3>
      </div>

      {history.length === 0 ? (
        <div className="text-center py-12">
          <History className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-600">No hay liquidaciones guardadas en el historial</p>
          <p className="text-slate-500 text-sm mt-2">
            Las liquidaciones que guardes aparecerán aquí
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {history.map((record) => (
            <div
              key={record.id}
              className="border border-slate-200 rounded-xl p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4 text-blue-600" />
                    <span className="font-semibold text-slate-800">{record.employee_name}</span>
                    <span className="inline-flex items-center px-2 py-1 rounded-md bg-blue-100 text-blue-700 text-xs font-medium">
                      {record.modalidad}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-sm">
                    <div className="flex items-center space-x-2 text-slate-600">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(record.fecha_inicio)} - {formatDate(record.fecha_fin)}</span>
                    </div>

                    <div className="flex items-center space-x-2 text-slate-600">
                      <span className="font-medium">Días:</span>
                      <span>{record.dias_totales}</span>
                    </div>

                    <div className="flex items-center space-x-2 text-slate-600">
                      <DollarSign className="w-4 h-4" />
                      <span className="font-semibold text-green-700">{formatCurrency(record.total_general)}</span>
                    </div>

                    <div className="text-slate-500 text-xs">
                      Guardado: {formatDateTime(record.created_at)}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 text-xs">
                    <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded-md">
                      Base: {record.base_mode}
                    </span>
                    {record.aplica_aux_transporte && (
                      <span className="px-2 py-1 bg-green-100 text-green-700 rounded-md">
                        Aux. Transporte
                      </span>
                    )}
                    {record.incluir_cesantias && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-md">
                        Cesantías
                      </span>
                    )}
                    {record.incluir_prima && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-md">
                        Prima
                      </span>
                    )}
                    {record.incluir_vacaciones && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-md">
                        Vacaciones
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleDownloadPDF(record)}
                    className="flex items-center space-x-2 bg-green-600 text-white py-2 px-4 rounded-xl font-semibold hover:bg-green-700 transition-all shadow-md text-sm"
                  >
                    <FileDown className="w-4 h-4" />
                    <span>PDF</span>
                  </button>

                  <button
                    onClick={() => handleDelete(record.id)}
                    className="flex items-center space-x-2 bg-red-100 text-red-700 py-2 px-4 rounded-xl font-semibold hover:bg-red-200 transition-all text-sm"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
