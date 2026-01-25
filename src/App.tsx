import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Login } from './components/Auth/Login';
import { Register } from './components/Auth/Register';
import { GoogleCallback } from './components/Auth/GoogleCallback';
import { LandingPage } from './components/Landing/LandingPage';
import { MainLayout } from './components/Layout/MainLayout';
import { Dashboard } from './components/Dashboard/Dashboard';
import { Employees } from './components/Employees/Employees';
import { HourTypes } from './components/HourTypes/HourTypes';
import { HourRecords } from './components/HourRecords/HourRecords';
import { Payroll } from './components/Payroll/Payroll';
import { Settlement } from './components/Settlement/Settlement';
import { Settings } from './components/Settings/Settings';
import { EmployeeHistory } from './components/History/EmployeeHistory';

function AppContent() {
  const { user, loading } = useAuth();
  const [showRegister, setShowRegister] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [currentView, setCurrentView] = useState('dashboard');

  // Detectar si estamos procesando el callback de Google
  const isGoogleCallback = window.location.pathname === '/auth/google/callback';

  if (isGoogleCallback) {
    return (
      <GoogleCallback 
        onComplete={() => {
          // Limpiar los parámetros de la URL después de procesar
          window.history.replaceState({}, document.title, '/');
          // El usuario será redirigido al dashboard automáticamente
        }} 
      />
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    if (!showAuth) {
      return <LandingPage onGetStarted={() => setShowAuth(true)} />;
    }
    if (showRegister) {
      return <Register onToggle={() => setShowRegister(false)} />;
    }
    return <Login onToggle={() => setShowRegister(true)} />;
  }

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard onViewChange={setCurrentView} />;
      case 'employees':
        return <Employees />;
      case 'hour-types':
        return <HourTypes />;
      case 'hour-records':
        return <HourRecords />;
      case 'history':
        return <EmployeeHistory />;
      case 'payroll':
        return <Payroll />;
      case 'settlement':
        return <Settlement />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard onViewChange={setCurrentView} />;
    }
  };

  return (
    <MainLayout currentView={currentView} onViewChange={setCurrentView}>
      {renderView()}
    </MainLayout>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
