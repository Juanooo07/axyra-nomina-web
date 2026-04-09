import { ReactNode, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
  LayoutDashboard,
  Users,
  Clock,
  FileText,
  History,
  DollarSign,
  Settings as SettingsIcon,
  LogOut,
  User,
  Menu,
  X,
  Calculator
} from 'lucide-react';

interface MainLayoutProps {
  children: ReactNode;
  currentView: string;
  onViewChange: (view: string) => void;
}

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'employees', label: 'Empleados', icon: Users },
  { id: 'hour-types', label: 'Tipos de Hora', icon: Clock },
  { id: 'hour-records', label: 'Registros', icon: FileText },
  { id: 'history', label: 'Historial', icon: History },
  { id: 'payroll', label: 'Nómina', icon: DollarSign },
  { id: 'settlement', label: 'Liquidación (Calculadora)', icon: Calculator },
  { id: 'settings', label: 'Configuración', icon: SettingsIcon },
];

export function MainLayout({ children, currentView, onViewChange }: MainLayoutProps) {
  const { signOut, profile } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleViewChange = (view: string) => {
    onViewChange(view);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <button
        onClick={() => setIsMobileMenuOpen(true)}
        className="fixed top-4 left-4 z-40 p-2 bg-white rounded-lg shadow-lg md:hidden hover:bg-slate-50 transition-colors"
        aria-label="Abrir menú"
      >
        <Menu className="w-6 h-6 text-slate-700" />
      </button>

      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <aside className={`
        fixed md:static inset-y-0 left-0 z-50
        w-64 bg-white shadow-xl border-r border-slate-200 flex flex-col
        transform transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img src="/nomina.png" alt="AXYRA Logo" className="h-12 w-12 object-contain" />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                AXYRA
              </h1>
            </div>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="md:hidden p-2 hover:bg-slate-100 rounded-lg transition-colors"
              aria-label="Cerrar menú"
            >
              <X className="w-5 h-5 text-slate-600" />
            </button>
          </div>
        </div>

        <nav className="flex-1 py-6 overflow-y-auto">
          <div className="space-y-1 px-3">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleViewChange(item.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 text-sm font-semibold rounded-xl transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </nav>

        <div className="p-4 border-t border-slate-200 space-y-2">
          <div className="flex items-center space-x-3 px-4 py-3 bg-slate-50 rounded-xl">
            <User className="w-5 h-5 text-blue-600" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 truncate">{profile?.full_name}</p>
            </div>
          </div>
          <button
            onClick={signOut}
            className="w-full flex items-center space-x-3 px-4 py-3 text-sm font-semibold text-red-600 hover:bg-red-50 rounded-xl transition-all"
          >
            <LogOut className="w-5 h-5" />
            <span>Salir</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <div className="p-4 md:p-8 pt-16 md:pt-8">{children}</div>
      </main>
    </div>
  );
}
