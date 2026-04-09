import { useEffect, useState } from 'react';
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

const routeViews = new Set([
  'dashboard',
  'employees',
  'hour-types',
  'hour-records',
  'payroll',
  'settlement',
  'settings',
  'history'
]);

function normalizePath(pathname: string) {
  return pathname.replace(/\/+$|^\/+/, '').trim();
}

function extractViewFromPath(pathname: string) {
  const trimmed = normalizePath(pathname);
  const segments = trimmed.split('/').filter(Boolean);
  if (segments.length === 0) {
    return 'dashboard';
  }
  if (segments[0] === 'auth') {
    return 'dashboard';
  }
  const view = segments[1] || 'dashboard';
  return routeViews.has(view) ? view : 'dashboard';
}

function buildViewPath(userId: string, view: string) {
  return `/${userId}/${view === 'dashboard' ? 'dashboard' : view}`;
}

function isGoogleCallbackPath(pathname: string) {
  const trimmed = normalizePath(pathname);
  return trimmed === 'auth/google/callback' || trimmed.endsWith('auth/google/callback');
}

function AppContent() {
  const { user, loading } = useAuth();
  const [showRegister, setShowRegister] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [currentView, setCurrentView] = useState('dashboard');

  useEffect(() => {
    const updateViewFromLocation = () => {
      if (isGoogleCallbackPath(window.location.pathname)) {
        return;
      }
      setCurrentView(extractViewFromPath(window.location.pathname));
    };

    updateViewFromLocation();
    window.addEventListener('popstate', updateViewFromLocation);
    return () => window.removeEventListener('popstate', updateViewFromLocation);
  }, []);

  useEffect(() => {
    if (!user) {
      if (!isGoogleCallbackPath(window.location.pathname) && window.location.pathname !== '/') {
        window.history.replaceState({}, document.title, '/');
      }
      return;
    }

    const desiredView = extractViewFromPath(window.location.pathname);
    const desiredPath = buildViewPath(user.id, desiredView);

    if (window.location.pathname !== desiredPath) {
      window.history.replaceState({}, document.title, desiredPath);
    }

    if (currentView !== desiredView) {
      setCurrentView(desiredView);
    }
  }, [user]);

  const handleViewChange = (view: string) => {
    setCurrentView(view);
    if (user) {
      const newPath = buildViewPath(user.id, view);
      window.history.pushState({}, '', newPath);
    }
  };

  // Detectar si estamos procesando el callback de Google
  const isGoogleCallback = isGoogleCallbackPath(window.location.pathname);

  if (isGoogleCallback) {
    return (
      <GoogleCallback
        onComplete={() => {
          console.log('GoogleCallback: onComplete called, redirecting to dashboard');
          window.history.replaceState({}, document.title, '/');
          window.location.href = '/';
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
        return <Dashboard onViewChange={handleViewChange} />;
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
        return <Dashboard onViewChange={handleViewChange} />;
    }
  };

  return (
    <MainLayout currentView={currentView} onViewChange={handleViewChange}>
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
