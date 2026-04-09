import { useState, useEffect } from 'react';
import { Clock, Info, Percent, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

interface HourSurcharge {
  id: string;
  hour_type_name: string;
  surcharge_percent: number;
}

interface HourTypeExplanation {
  name: string;
  description: string;
  example: string;
}

const hourTypeExplanations: HourTypeExplanation[] = [
  {
    name: 'Hora Ordinaria',
    description: 'Horas normales de trabajo dentro del horario laboral establecido (generalmente 6:00 AM - 9:00 PM).',
    example: 'Lunes a sábado de 8:00 AM a 5:00 PM'
  },
  {
    name: 'Recargo Nocturno',
    description: 'Trabajo realizado en horario nocturno (9:00 PM - 6:00 AM) sin exceder la jornada normal.',
    example: 'Turno de 10:00 PM a 6:00 AM dentro de las 8 horas normales'
  },
  {
    name: 'Recargo Diurno Dominical',
    description: 'Trabajo realizado en domingo o festivo durante el día (6:00 AM - 9:00 PM) dentro de la jornada normal.',
    example: 'Domingo de 8:00 AM a 4:00 PM'
  },
  {
    name: 'Recargo Nocturno Dominical',
    description: 'Trabajo realizado en domingo o festivo durante la noche (9:00 PM - 6:00 AM) dentro de la jornada normal.',
    example: 'Domingo de 10:00 PM a 6:00 AM del lunes'
  },
  {
    name: 'Hora Extra Diurna',
    description: 'Horas trabajadas adicionales a la jornada normal en horario diurno (6:00 AM - 9:00 PM).',
    example: 'Trabajar hasta las 8:00 PM cuando la jornada termina a 5:00 PM'
  },
  {
    name: 'Hora Extra Nocturna',
    description: 'Horas trabajadas adicionales a la jornada normal en horario nocturno (9:00 PM - 6:00 AM).',
    example: 'Trabajar de 10:00 PM a 12:00 AM después de la jornada normal'
  },
  {
    name: 'Hora Diurna Dominical',
    description: 'Horas extras trabajadas en domingo o festivo durante el día (6:00 AM - 9:00 PM).',
    example: 'Trabajar horas adicionales un domingo de 2:00 PM a 6:00 PM'
  },
  {
    name: 'Hora Extra Diurna Dominical',
    description: 'Horas extras trabajadas en domingo o festivo durante el día, adicionales a la jornada normal.',
    example: 'Horas extras dominicales en horario diurno'
  },
  {
    name: 'Hora Nocturna Dominical',
    description: 'Horas trabajadas en domingo o festivo durante la noche, dentro de la jornada normal.',
    example: 'Turno dominical nocturno regular'
  },
  {
    name: 'Hora Extra Nocturna Dominical',
    description: 'Horas extras trabajadas en domingo o festivo durante la noche (9:00 PM - 6:00 AM).',
    example: 'Trabajar horas adicionales un domingo de 10:00 PM a 2:00 AM'
  }
];

export function HourTypes() {
  const { user } = useAuth();
  const [surcharges, setSurcharges] = useState<HourSurcharge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      loadSurcharges();
    }
  }, [user]);

  const loadSurcharges = async () => {
    if (!user) return;

    setLoading(true);
    setError('');

    const { data, error: loadError } = await supabase
      .from('hour_surcharges')
      .select('*')
      .eq('user_id', user.id)
      .order('hour_type_name');

    if (loadError) {
      setError('Error al cargar los tipos de hora');
      console.error('Error loading surcharges:', loadError);
      setLoading(false);
      return;
    }

    setSurcharges(data || []);
    setLoading(false);
  };

  const getExplanation = (hourTypeName: string): HourTypeExplanation | undefined => {
    return hourTypeExplanations.find(exp => exp.name === hourTypeName);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-slate-800 mb-2">Tipos de Hora</h2>
        <p className="text-slate-600">Referencia de tipos de hora y sus recargos configurados</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center space-x-3">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <p className="text-red-800">{error}</p>
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start space-x-3">
        <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-sm text-blue-800">
            <strong>Nota:</strong> Los recargos se aplican sobre el valor de la hora ordinaria.
            Para modificar los porcentajes de recargo, ve al módulo de <strong>Configuración</strong>.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {surcharges.map((surcharge) => {
          const explanation = getExplanation(surcharge.hour_type_name);
          return (
            <div
              key={surcharge.id}
              className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6 hover:shadow-xl transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start space-x-3">
                  <div className="bg-blue-50 p-3 rounded-xl">
                    <Clock className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-800 mb-1">
                      {surcharge.hour_type_name}
                    </h3>
                    {explanation && (
                      <p className="text-sm text-slate-600 mb-2">
                        {explanation.description}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2 bg-green-50 px-4 py-2 rounded-xl border border-green-200">
                  <Percent className="w-5 h-5 text-green-600" />
                  <span className="text-2xl font-bold text-green-700">
                    {surcharge.surcharge_percent}%
                  </span>
                </div>
              </div>

              {explanation && (
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <div className="bg-slate-50 rounded-lg p-3">
                    <p className="text-sm font-semibold text-slate-700 mb-1">
                      Ejemplo:
                    </p>
                    <p className="text-sm text-slate-600">
                      {explanation.example}
                    </p>
                  </div>
                </div>
              )}

              <div className="mt-4 pt-4 border-t border-slate-100">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-slate-500 mb-1">Valor Base por Hora</p>
                    <p className="font-semibold text-slate-800">Salario / 220</p>
                  </div>
                  <div>
                    <p className="text-slate-500 mb-1">Recargo Aplicado</p>
                    <p className="font-semibold text-slate-800">
                      {surcharge.surcharge_percent > 0 ? `+${surcharge.surcharge_percent}%` : 'Sin recargo'}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-500 mb-1">Valor Final por Hora</p>
                    <p className="font-semibold text-slate-800">
                      Base × {(1 + surcharge.surcharge_percent / 100).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {surcharges.length === 0 && !loading && (
        <div className="bg-slate-50 rounded-2xl border-2 border-dashed border-slate-300 p-12 text-center">
          <Clock className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-700 mb-2">
            No hay tipos de hora configurados
          </h3>
          <p className="text-slate-500 mb-6">
            Ve al módulo de Configuración para crear tus tipos de hora
          </p>
        </div>
      )}
    </div>
  );
}
