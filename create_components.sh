#!/bin/bash

# Register component
cat > /tmp/cc-agent/62481720/project/src/components/Auth/Register.tsx << 'EOF'
import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

export function Register({ onToggle }: { onToggle: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error } = await signUp(email, password, fullName);

    if (error) {
      setError(error.message);
    } else {
      setSuccess(true);
    }

    setLoading(false);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Registro exitoso</h2>
            <p className="text-slate-600 mb-6">
              Tu cuenta ha sido creada. Ya puedes iniciar sesión.
            </p>
            <button
              onClick={onToggle}
              className="bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Ir a iniciar sesión
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-800">AXYRA Nómina</h1>
          <p className="text-slate-600 mt-2">Crear nueva cuenta</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-slate-700 mb-1">
              Nombre completo
            </label>
            <input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
              Correo electrónico
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
              minLength={6}
            />
            <p className="text-xs text-slate-500 mt-1">Mínimo 6 caracteres</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Creando cuenta...' : 'Crear cuenta'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={onToggle}
            className="text-blue-600 hover:text-blue-700 text-sm"
          >
            ¿Ya tienes cuenta? Inicia sesión
          </button>
        </div>
      </div>
    </div>
  );
}
EOF

# Simple placeholder components
cat > /tmp/cc-agent/62481720/project/src/components/Layout/MainLayout.tsx << 'EOF'
import { ReactNode } from 'react';
import { useAuth } from '../../contexts/AuthContext';

interface MainLayoutProps {
  children: ReactNode;
  currentView: string;
  onViewChange: (view: string) => void;
}

export function MainLayout({ children }: MainLayoutProps) {
  const { signOut, profile } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white shadow-sm border-b border-slate-200 px-6 py-4">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold text-slate-800">AXYRA Nómina</h1>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-slate-600">{profile?.full_name}</span>
            <button
              onClick={signOut}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </nav>
      <main className="p-6">{children}</main>
    </div>
  );
}
EOF

cat > /tmp/cc-agent/62481720/project/src/components/Dashboard/Dashboard.tsx << 'EOF'
export function Dashboard() {
  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-800 mb-4">Dashboard</h2>
      <p className="text-slate-600">Sistema de nómina en funcionamiento</p>
    </div>
  );
}
EOF

cat > /tmp/cc-agent/62481720/project/src/components/Companies/Companies.tsx << 'EOF'
export function Companies() {
  return <div className="text-slate-800">Módulo de Empresas</div>;
}
EOF

cat > /tmp/cc-agent/62481720/project/src/components/Employees/Employees.tsx << 'EOF'
export function Employees() {
  return <div className="text-slate-800">Módulo de Empleados</div>;
}
EOF

cat > /tmp/cc-agent/62481720/project/src/components/HourTypes/HourTypes.tsx << 'EOF'
export function HourTypes() {
  return <div className="text-slate-800">Módulo de Tipos de Hora</div>;
}
EOF

cat > /tmp/cc-agent/62481720/project/src/components/HourRecords/HourRecords.tsx << 'EOF'
export function HourRecords() {
  return <div className="text-slate-800">Módulo de Registro de Horas</div>;
}
EOF

cat > /tmp/cc-agent/62481720/project/src/components/Payroll/Payroll.tsx << 'EOF'
export function Payroll() {
  return <div className="text-slate-800">Módulo de Cálculo de Nómina</div>;
}
EOF

cat > /tmp/cc-agent/62481720/project/src/components/Settings/Settings.tsx << 'EOF'
export function Settings() {
  return <div className="text-slate-800">Módulo de Configuración</div>;
}
EOF

echo "All components created successfully"
