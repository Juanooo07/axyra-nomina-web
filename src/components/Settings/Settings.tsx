import { useState, useEffect } from 'react';
import { Building2, Save, AlertCircle, CheckCircle, Percent } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

interface UserSettings {
  company_name: string;
  company_nit: string;
  company_address: string;
  minimum_salary: number;
  transport_allowance: number;
  health_deduction_percent: number;
  pension_deduction_percent: number;
  weekly_work_hours: number;
}

interface HourSurcharge {
  id: string;
  hour_type_name: string;
  surcharge_percent: number;
}

export function Settings() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const [settings, setSettings] = useState<UserSettings>({
    company_name: 'Mi Empresa',
    company_nit: '',
    company_address: '',
    minimum_salary: 1423500,
    transport_allowance: 200000,
    health_deduction_percent: 4.0,
    pension_deduction_percent: 4.0,
    weekly_work_hours: 48,
  });

  const [surcharges, setSurcharges] = useState<HourSurcharge[]>([]);

  useEffect(() => {
    if (user) {
      loadSettings();
      loadSurcharges();
    }
  }, [user]);

  const loadSettings = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) {
      console.error('Error loading settings:', error);
      return;
    }

    if (data) {
      setSettings({
        company_name: data.company_name || 'Mi Empresa',
        company_nit: data.company_nit || '',
        company_address: data.company_address || '',
        minimum_salary: Number(data.minimum_salary) || 1423500,
        transport_allowance: Number(data.transport_allowance) || 200000,
        health_deduction_percent: Number(data.health_deduction_percent) || 4.0,
        pension_deduction_percent: Number(data.pension_deduction_percent) || 4.0,
        weekly_work_hours: Number(data.weekly_work_hours) || 48,
      });
    }
  };

  const loadSurcharges = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('hour_surcharges')
      .select('*')
      .eq('user_id', user.id)
      .order('hour_type_name');

    if (error) {
      console.error('Error loading surcharges:', error);
      return;
    }

    setSurcharges(data || []);
  };

  const handleSaveSettings = async () => {
    if (!user) return;

    setLoading(true);
    setError('');
    setSuccess('');

    const { error: upsertError } = await supabase
      .from('user_settings')
      .upsert({
        user_id: user.id,
        ...settings,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id'
      });

    if (upsertError) {
      setError('Error al guardar la configuración: ' + upsertError.message);
      setLoading(false);
      return;
    }

    setSuccess('Configuración guardada exitosamente');
    setLoading(false);

    setTimeout(() => setSuccess(''), 3000);
  };

  const handleSaveSurcharges = async () => {
    if (!user) return;

    setLoading(true);
    setError('');
    setSuccess('');

    const updates = surcharges.map(s => ({
      id: s.id,
      user_id: user.id,
      hour_type_name: s.hour_type_name,
      surcharge_percent: s.surcharge_percent,
      updated_at: new Date().toISOString(),
    }));

    const { error: updateError } = await supabase
      .from('hour_surcharges')
      .upsert(updates);

    if (updateError) {
      setError('Error al guardar los recargos: ' + updateError.message);
      setLoading(false);
      return;
    }

    setSuccess('Recargos guardados exitosamente');
    setLoading(false);

    setTimeout(() => setSuccess(''), 3000);
  };

  const updateSurcharge = (id: string, value: number) => {
    setSurcharges(surcharges.map(s =>
      s.id === id ? { ...s, surcharge_percent: value } : s
    ));
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-slate-800 mb-2">Configuración</h2>
        <p className="text-slate-600">Configura los parámetros de tu empresa</p>
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

      <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6">
        <div className="flex items-center space-x-3 mb-6">
          <Building2 className="w-6 h-6 text-blue-600" />
          <h3 className="text-xl font-bold text-slate-800">Información de la Empresa</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Nombre de la Empresa *
            </label>
            <input
              type="text"
              value={settings.company_name}
              onChange={(e) => setSettings({ ...settings, company_name: e.target.value })}
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Mi Empresa"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              NIT
            </label>
            <input
              type="text"
              value={settings.company_nit}
              onChange={(e) => setSettings({ ...settings, company_nit: e.target.value })}
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="123456789-0"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Dirección
            </label>
            <input
              type="text"
              value={settings.company_address}
              onChange={(e) => setSettings({ ...settings, company_address: e.target.value })}
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Calle 123 #45-67"
            />
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-slate-200">
          <h4 className="text-lg font-bold text-slate-800 mb-4">Configuración Salarial</h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Salario Mínimo
              </label>
              <input
                type="number"
                value={settings.minimum_salary}
                onChange={(e) => setSettings({ ...settings, minimum_salary: Number(e.target.value) })}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Auxilio de Transporte
              </label>
              <input
                type="number"
                value={settings.transport_allowance}
                onChange={(e) => setSettings({ ...settings, transport_allowance: Number(e.target.value) })}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Descuento Salud (%)
              </label>
              <input
                type="number"
                step="0.1"
                value={settings.health_deduction_percent}
                onChange={(e) => setSettings({ ...settings, health_deduction_percent: Number(e.target.value) })}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Descuento Pensión (%)
              </label>
              <input
                type="number"
                step="0.1"
                value={settings.pension_deduction_percent}
                onChange={(e) => setSettings({ ...settings, pension_deduction_percent: Number(e.target.value) })}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Horas Laborales por Semana
              </label>
              <input
                type="number"
                value={settings.weekly_work_hours}
                onChange={(e) => setSettings({ ...settings, weekly_work_hours: Number(e.target.value) })}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={handleSaveSettings}
            disabled={loading}
            className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-all disabled:opacity-50"
          >
            <Save className="w-5 h-5" />
            <span>{loading ? 'Guardando...' : 'Guardar Configuración'}</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6">
        <div className="flex items-center space-x-3 mb-6">
          <Percent className="w-6 h-6 text-blue-600" />
          <h3 className="text-xl font-bold text-slate-800">Recargos por Tipo de Hora</h3>
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-3 px-4 font-semibold text-slate-700">Tipo de Hora</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-700">Recargo Actual (%)</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-700">Nuevo Recargo (%)</th>
              </tr>
            </thead>
            <tbody>
              {surcharges.map((surcharge) => (
                <tr key={surcharge.id} className="border-b border-slate-100">
                  <td className="py-3 px-4 text-slate-800">{surcharge.hour_type_name}</td>
                  <td className="py-3 px-4 text-slate-600">{surcharge.surcharge_percent}%</td>
                  <td className="py-3 px-4">
                    <input
                      type="number"
                      step="0.1"
                      value={surcharge.surcharge_percent}
                      onChange={(e) => updateSurcharge(surcharge.id, Number(e.target.value))}
                      className="w-32 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="block md:hidden space-y-4">
          {surcharges.map((surcharge) => (
            <div key={surcharge.id} className="bg-white rounded-lg shadow p-4 space-y-3 border border-slate-200">
              <div className="text-lg font-bold text-slate-800">
                {surcharge.hour_type_name}
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700">
                  Recargo (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={surcharge.surcharge_percent}
                  onChange={(e) => updateSurcharge(surcharge.id, Number(e.target.value))}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
                />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={handleSaveSurcharges}
            disabled={loading}
            className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-all disabled:opacity-50 w-full md:w-auto justify-center"
          >
            <Save className="w-5 h-5" />
            <span>{loading ? 'Guardando...' : 'Guardar Recargos'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
