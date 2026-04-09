import { useState } from 'react';
import { Calculator, Calendar, DollarSign, AlertCircle, CheckCircle, Trash2, FileDown, Save, User, History } from 'lucide-react';
import { calculateSettlement, SettlementInput, SettlementResult } from '../../utils/settlementCalculator';
import { generateSettlementPDF } from '../../utils/pdfGenerator';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { SettlementHistory } from './SettlementHistory';

export function Settlement() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'calculator' | 'history'>('calculator');
  const [employeeName, setEmployeeName] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [modalidad, setModalidad] = useState<'DIAS' | 'HORAS'>('DIAS');
  const [diasTrabajados, setDiasTrabajados] = useState('');
  const [horasTotales, setHorasTotales] = useState('');
  const [horasPorDia, setHorasPorDia] = useState('8');
  const [baseMode, setBaseMode] = useState<'SMMLV' | 'MANUAL'>('SMMLV');
  const [salarioBaseMensual, setSalarioBaseMensual] = useState('');
  const [aplicaAuxTransporte, setAplicaAuxTransporte] = useState(true);
  const [incluirCesantias, setIncluirCesantias] = useState(true);
  const [incluirInteresesCesantias, setIncluirInteresesCesantias] = useState(true);
  const [incluirPrima, setIncluirPrima] = useState(true);
  const [incluirVacaciones, setIncluirVacaciones] = useState(true);

  const [result, setResult] = useState<SettlementResult | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleCalculate = () => {
    const input: SettlementInput = {
      fechaInicio,
      fechaFin,
      modalidad,
      diasTrabajados: diasTrabajados ? Number(diasTrabajados) : undefined,
      horasTotales: horasTotales ? Number(horasTotales) : undefined,
      horasPorDia: horasPorDia ? Number(horasPorDia) : 8,
      baseMode,
      salarioBaseMensual: salarioBaseMensual ? Number(salarioBaseMensual) : undefined,
      aplicaAuxTransporte,
      incluirCesantias,
      incluirInteresesCesantias,
      incluirPrima,
      incluirVacaciones,
    };

    const calculationResult = calculateSettlement(input);
    setResult(calculationResult);
    setErrors(calculationResult.errors);
    setSaveSuccess(false);
  };

  const handleDownloadPDF = () => {
    if (!result || result.errors.length > 0) {
      return;
    }

    const pdfData = {
      employeeName: employeeName || 'Sin especificar',
      fechaInicio,
      fechaFin,
      modalidad,
      diasTotales: result.diasTotales,
      baseMode,
      aplicaAuxTransporte,
      breakdownPorAnio: result.breakdownPorAnio,
      totalGeneral: result.totalGeneral,
      incluirCesantias,
      incluirInteresesCesantias,
      incluirPrima,
      incluirVacaciones,
    };

    generateSettlementPDF(pdfData);
  };

  const handleSaveToHistory = async () => {
    if (!result || result.errors.length > 0 || !user) {
      return;
    }

    setSaving(true);
    setSaveSuccess(false);

    try {
      const { error } = await supabase
        .from('settlement_history')
        .insert({
          user_id: user.id,
          employee_name: employeeName || 'Sin especificar',
          fecha_inicio: fechaInicio,
          fecha_fin: fechaFin,
          modalidad,
          dias_trabajados: diasTrabajados ? Number(diasTrabajados) : null,
          horas_totales: horasTotales ? Number(horasTotales) : null,
          horas_por_dia: horasPorDia ? Number(horasPorDia) : null,
          base_mode: baseMode,
          salario_base_mensual: salarioBaseMensual ? Number(salarioBaseMensual) : 0,
          aplica_aux_transporte: aplicaAuxTransporte,
          incluir_cesantias: incluirCesantias,
          incluir_intereses_cesantias: incluirInteresesCesantias,
          incluir_prima: incluirPrima,
          incluir_vacaciones: incluirVacaciones,
          dias_totales: result.diasTotales,
          breakdown_por_anio: result.breakdownPorAnio,
          total_general: result.totalGeneral,
        });

      if (error) throw error;

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Error saving settlement:', error);
      alert('Error al guardar en el historial');
    } finally {
      setSaving(false);
    }
  };

  const handleClear = () => {
    setEmployeeName('');
    setFechaInicio('');
    setFechaFin('');
    setModalidad('DIAS');
    setDiasTrabajados('');
    setHorasTotales('');
    setHorasPorDia('8');
    setBaseMode('SMMLV');
    setSalarioBaseMensual('');
    setAplicaAuxTransporte(true);
    setIncluirCesantias(true);
    setIncluirInteresesCesantias(true);
    setIncluirPrima(true);
    setIncluirVacaciones(true);
    setResult(null);
    setErrors([]);
    setSaveSuccess(false);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const diasEquivalentes = modalidad === 'HORAS' && horasTotales && horasPorDia
    ? (Number(horasTotales) / Number(horasPorDia)).toFixed(2)
    : '0';

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-slate-800 mb-2">Liquidación (Calculadora)</h2>
        <p className="text-slate-600">Calcula la liquidación de trabajadores por días o por horas</p>
      </div>

      <div className="flex gap-4 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('calculator')}
          className={`flex items-center space-x-2 px-4 py-3 font-semibold transition-all border-b-2 ${
            activeTab === 'calculator'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-600 hover:text-slate-800'
          }`}
        >
          <Calculator className="w-5 h-5" />
          <span>Nueva Liquidación</span>
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`flex items-center space-x-2 px-4 py-3 font-semibold transition-all border-b-2 ${
            activeTab === 'history'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-600 hover:text-slate-800'
          }`}
        >
          <History className="w-5 h-5" />
          <span>Historial</span>
        </button>
      </div>

      {activeTab === 'history' ? (
        <SettlementHistory />
      ) : (
        <>
          {saveSuccess && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-green-800 font-semibold">Guardado exitosamente en el historial</p>
                </div>
              </div>
            </div>
          )}

          {errors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-red-800 font-semibold mb-2">Errores de validación:</p>
                  <ul className="list-disc list-inside space-y-1">
                    {errors.map((error, index) => (
                      <li key={index} className="text-red-700 text-sm">{error}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-4 md:p-6">
        <div className="flex items-center space-x-3 mb-6">
          <Calculator className="w-6 h-6 text-blue-600" />
          <h3 className="text-xl font-bold text-slate-800">Parámetros de Cálculo</h3>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Nombre del Trabajador
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={employeeName}
                onChange={(e) => setEmployeeName(e.target.value)}
                placeholder="Ingrese el nombre del trabajador"
                className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Fecha de Inicio *
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="date"
                  value={fechaInicio}
                  onChange={(e) => setFechaInicio(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Fecha de Fin *
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="date"
                  value={fechaFin}
                  onChange={(e) => setFechaFin(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          <div className="border-t pt-6">
            <label className="block text-sm font-semibold text-slate-700 mb-3">
              Modalidad de Cálculo *
            </label>
            <div className="flex gap-4">
              <button
                onClick={() => setModalidad('DIAS')}
                className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all ${
                  modalidad === 'DIAS'
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Por DÍAS
              </button>
              <button
                onClick={() => setModalidad('HORAS')}
                className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all ${
                  modalidad === 'HORAS'
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Por HORAS
              </button>
            </div>
          </div>

          {modalidad === 'DIAS' && (
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Días Trabajados (opcional)
              </label>
              <p className="text-xs text-slate-500 mb-2">
                Si no se especifica, se calculará por diferencia de fechas (inclusive)
              </p>
              <input
                type="number"
                value={diasTrabajados}
                onChange={(e) => setDiasTrabajados(e.target.value)}
                placeholder="Dejar vacío para calcular automáticamente"
                min="0"
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          )}

          {modalidad === 'HORAS' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Horas Totales *
                </label>
                <input
                  type="number"
                  value={horasTotales}
                  onChange={(e) => setHorasTotales(e.target.value)}
                  min="0"
                  step="0.1"
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Horas por Día *
                </label>
                <input
                  type="number"
                  value={horasPorDia}
                  onChange={(e) => setHorasPorDia(e.target.value)}
                  min="1"
                  step="0.5"
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {horasTotales && horasPorDia && (
                <div className="md:col-span-2">
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <p className="text-sm text-blue-800">
                      <span className="font-semibold">Días Equivalentes:</span> {diasEquivalentes} días
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="border-t pt-6">
            <label className="block text-sm font-semibold text-slate-700 mb-3">
              Base Salarial *
            </label>
            <div className="flex gap-4 mb-4">
              <button
                onClick={() => setBaseMode('SMMLV')}
                className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all ${
                  baseMode === 'SMMLV'
                    ? 'bg-green-600 text-white shadow-lg'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                SMMLV
              </button>
              <button
                onClick={() => setBaseMode('MANUAL')}
                className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all ${
                  baseMode === 'MANUAL'
                    ? 'bg-green-600 text-white shadow-lg'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Manual
              </button>
            </div>

            {baseMode === 'MANUAL' && (
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Salario Base Mensual *
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="number"
                    value={salarioBaseMensual}
                    onChange={(e) => setSalarioBaseMensual(e.target.value)}
                    min="0"
                    placeholder="Ingrese el salario mensual"
                    className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="border-t pt-6">
            <label className="block text-sm font-semibold text-slate-700 mb-3">
              Opciones Adicionales
            </label>
            <div className="space-y-3">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={aplicaAuxTransporte}
                  onChange={(e) => setAplicaAuxTransporte(e.target.checked)}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-slate-700 font-medium">Aplicar Auxilio de Transporte</span>
              </label>
            </div>
          </div>

          <div className="border-t pt-6">
            <label className="block text-sm font-semibold text-slate-700 mb-3">
              Conceptos a Incluir
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={incluirCesantias}
                  onChange={(e) => setIncluirCesantias(e.target.checked)}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-slate-700 font-medium">Cesantías</span>
              </label>

              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={incluirInteresesCesantias}
                  onChange={(e) => setIncluirInteresesCesantias(e.target.checked)}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-slate-700 font-medium">Intereses sobre Cesantías</span>
              </label>

              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={incluirPrima}
                  onChange={(e) => setIncluirPrima(e.target.checked)}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-slate-700 font-medium">Prima de Servicios</span>
              </label>

              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={incluirVacaciones}
                  onChange={(e) => setIncluirVacaciones(e.target.checked)}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-slate-700 font-medium">Vacaciones</span>
              </label>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-6">
            <button
              onClick={handleCalculate}
              className="flex-1 flex items-center justify-center space-x-2 bg-blue-600 text-white py-3 px-6 rounded-xl font-semibold hover:bg-blue-700 transition-all shadow-lg"
            >
              <Calculator className="w-5 h-5" />
              <span>Calcular Liquidación</span>
            </button>

            <button
              onClick={handleClear}
              className="flex items-center justify-center space-x-2 bg-slate-100 text-slate-700 py-3 px-6 rounded-xl font-semibold hover:bg-slate-200 transition-all"
            >
              <Trash2 className="w-5 h-5" />
              <span>Limpiar</span>
            </button>
          </div>
        </div>
      </div>

      {result && result.errors.length === 0 && (
        <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-4 md:p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <h3 className="text-xl font-bold text-slate-800">Resultado de Liquidación</h3>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleDownloadPDF}
                className="flex items-center space-x-2 bg-green-600 text-white py-2 px-4 rounded-xl font-semibold hover:bg-green-700 transition-all shadow-lg"
              >
                <FileDown className="w-5 h-5" />
                <span className="hidden sm:inline">Descargar PDF</span>
              </button>
              <button
                onClick={handleSaveToHistory}
                disabled={saving}
                className="flex items-center space-x-2 bg-blue-600 text-white py-2 px-4 rounded-xl font-semibold hover:bg-blue-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-5 h-5" />
                <span className="hidden sm:inline">{saving ? 'Guardando...' : 'Guardar en Historial'}</span>
              </button>
            </div>
          </div>

          <div className="mb-6">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <p className="text-sm text-blue-800">
                <span className="font-semibold">Total de Días:</span> {result.diasTotales} días
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-100">
                  <th className="px-4 py-3 text-left text-sm font-bold text-slate-700 border-b-2 border-slate-300">Año</th>
                  <th className="px-4 py-3 text-right text-sm font-bold text-slate-700 border-b-2 border-slate-300">Días</th>
                  <th className="px-4 py-3 text-right text-sm font-bold text-slate-700 border-b-2 border-slate-300">Salario Base</th>
                  <th className="px-4 py-3 text-right text-sm font-bold text-slate-700 border-b-2 border-slate-300">Aux. Transp.</th>
                  <th className="px-4 py-3 text-right text-sm font-bold text-slate-700 border-b-2 border-slate-300">S. Prest.</th>
                  {incluirCesantias && (
                    <th className="px-4 py-3 text-right text-sm font-bold text-slate-700 border-b-2 border-slate-300">Cesantías</th>
                  )}
                  {incluirInteresesCesantias && (
                    <th className="px-4 py-3 text-right text-sm font-bold text-slate-700 border-b-2 border-slate-300">Int. Ces.</th>
                  )}
                  {incluirPrima && (
                    <th className="px-4 py-3 text-right text-sm font-bold text-slate-700 border-b-2 border-slate-300">Prima</th>
                  )}
                  {incluirVacaciones && (
                    <th className="px-4 py-3 text-right text-sm font-bold text-slate-700 border-b-2 border-slate-300">Vacaciones</th>
                  )}
                  <th className="px-4 py-3 text-right text-sm font-bold text-slate-700 border-b-2 border-slate-300">Total Año</th>
                </tr>
              </thead>
              <tbody>
                {result.breakdownPorAnio.map((year, index) => (
                  <tr key={index} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 text-left font-semibold text-slate-800 border-b border-slate-200">{year.anio}</td>
                    <td className="px-4 py-3 text-right text-slate-700 border-b border-slate-200">{year.dias}</td>
                    <td className="px-4 py-3 text-right text-slate-700 border-b border-slate-200">{formatCurrency(year.salarioBase)}</td>
                    <td className="px-4 py-3 text-right text-slate-700 border-b border-slate-200">{formatCurrency(year.auxTransporte)}</td>
                    <td className="px-4 py-3 text-right text-slate-700 border-b border-slate-200">{formatCurrency(year.sPrest)}</td>
                    {incluirCesantias && (
                      <td className="px-4 py-3 text-right text-green-700 font-semibold border-b border-slate-200">{formatCurrency(year.cesantias)}</td>
                    )}
                    {incluirInteresesCesantias && (
                      <td className="px-4 py-3 text-right text-green-700 font-semibold border-b border-slate-200">{formatCurrency(year.interesesCesantias)}</td>
                    )}
                    {incluirPrima && (
                      <td className="px-4 py-3 text-right text-green-700 font-semibold border-b border-slate-200">{formatCurrency(year.prima)}</td>
                    )}
                    {incluirVacaciones && (
                      <td className="px-4 py-3 text-right text-green-700 font-semibold border-b border-slate-200">{formatCurrency(year.vacaciones)}</td>
                    )}
                    <td className="px-4 py-3 text-right font-bold text-blue-700 border-b border-slate-200">{formatCurrency(year.totalAnio)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-blue-600 text-white">
                  <td colSpan={incluirCesantias && incluirInteresesCesantias && incluirPrima && incluirVacaciones ? 9 : 5} className="px-4 py-4 text-right font-bold text-lg">
                    TOTAL GENERAL
                  </td>
                  <td className="px-4 py-4 text-right font-bold text-xl">
                    {formatCurrency(result.totalGeneral)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}
        </>
      )}
    </div>
  );
}
