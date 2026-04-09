import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

export function Register({ onToggle }: { onToggle: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [position, setPosition] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setLoading(true);

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: fullName.trim(),
            phone: phone?.trim() || null,
            company_name: companyName?.trim() || null,
            position: position?.trim() || null
          }
        }
      });

      if (signUpError) {
        console.error('SignUp error details:', signUpError);
        let errorMessage = signUpError.message;
        if (errorMessage.includes('already registered')) {
          errorMessage = 'Este correo ya está registrado';
        } else if (errorMessage.includes('User already registered')) {
          errorMessage = 'Este correo ya está registrado';
        } else if (errorMessage.includes('Email rate limit exceeded')) {
          errorMessage = 'Demasiados intentos. Intenta de nuevo en unos minutos';
        }
        setError(errorMessage);
        setLoading(false);
        return;
      }

      if (data?.user) {
        setSuccess(true);
      } else {
        setError('Error al crear la cuenta');
        setLoading(false);
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      setError(`Error de conexión: ${err instanceof Error ? err.message : 'Verifica tu internet'}`);
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-slate-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md animate-fadeInScale">
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-checkmark">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-slate-800 mb-2">Registro exitoso</h2>
            <p className="text-slate-600 mb-6">
              Tu cuenta ha sido creada exitosamente. Bienvenido a AXYRA.
            </p>
            <button
              onClick={onToggle}
              className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-8 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all transform hover:scale-105 font-medium shadow-lg"
            >
              Iniciar sesión
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-2xl animate-fadeInUp">
        <div className="text-center mb-8">
          <img src="/nomina.png" alt="AXYRA Logo" className="h-20 mx-auto mb-4 animate-fadeIn" />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
            AXYRA
          </h1>
          <p className="text-slate-600 mt-2 text-lg">Crear nueva cuenta</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid md:grid-cols-2 gap-5">
            <div className="transform transition-all hover:scale-[1.02]">
              <label htmlFor="fullName" className="block text-sm font-semibold text-slate-700 mb-2">
                Nombre completo *
              </label>
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                placeholder="Ej: Juan Pérez"
                required
              />
            </div>

            <div className="transform transition-all hover:scale-[1.02]">
              <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-2">
                Correo electrónico *
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                placeholder="correo@ejemplo.com"
                required
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            <div className="transform transition-all hover:scale-[1.02]">
              <label htmlFor="phone" className="block text-sm font-semibold text-slate-700 mb-2">
                Teléfono
              </label>
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                placeholder="+57 300 123 4567"
              />
            </div>

            <div className="transform transition-all hover:scale-[1.02]">
              <label htmlFor="position" className="block text-sm font-semibold text-slate-700 mb-2">
                Cargo
              </label>
              <input
                id="position"
                type="text"
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                placeholder="Ej: Gerente de RRHH"
              />
            </div>
          </div>

          <div className="transform transition-all hover:scale-[1.02]">
            <label htmlFor="companyName" className="block text-sm font-semibold text-slate-700 mb-2">
              Empresa
            </label>
            <input
              id="companyName"
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              placeholder="Nombre de tu empresa"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            <div className="transform transition-all hover:scale-[1.02]">
              <label htmlFor="password" className="block text-sm font-semibold text-slate-700 mb-2">
                Contraseña *
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                placeholder="Mínimo 6 caracteres"
                required
                minLength={6}
              />
            </div>

            <div className="transform transition-all hover:scale-[1.02]">
              <label htmlFor="confirmPassword" className="block text-sm font-semibold text-slate-700 mb-2">
                Confirmar contraseña *
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                placeholder="Confirma tu contraseña"
                required
                minLength={6}
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
                Creando cuenta...
              </span>
            ) : (
              'Crear cuenta'
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={onToggle}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium hover:underline transition-all"
          >
            ¿Ya tienes cuenta? Inicia sesión
          </button>
        </div>
      </div>
    </div>
  );
}
