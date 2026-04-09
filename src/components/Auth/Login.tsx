import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Lock, Mail } from 'lucide-react';

export function Login({ onToggle }: { onToggle: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error } = await signIn(email, password);

    if (error) {
      setError(error.message);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-10 w-full max-w-md animate-fadeInUp">
        <div className="text-center mb-8">
          <img src="/nomina.png" alt="AXYRA Logo" className="h-24 mx-auto mb-4 animate-fadeIn" />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent mb-2">
            AXYRA
          </h1>
          <p className="text-slate-600 text-lg">Bienvenido de nuevo</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="transform transition-all hover:scale-[1.02]">
            <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-2">
              Correo electrónico
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-slate-400" />
              </div>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                placeholder="correo@ejemplo.com"
                required
              />
            </div>
          </div>

          <div className="transform transition-all hover:scale-[1.02]">
            <label htmlFor="password" className="block text-sm font-semibold text-slate-700 mb-2">
              Contraseña
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-slate-400" />
              </div>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                placeholder="Tu contraseña"
                required
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm animate-shake">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 px-4 rounded-xl hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] hover:shadow-xl font-semibold text-lg"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Iniciando sesión...
              </span>
            ) : (
              'Iniciar sesión'
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={onToggle}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium hover:underline transition-all"
          >
            ¿No tienes cuenta? Regístrate
          </button>
        </div>
      </div>
    </div>
  );
}
