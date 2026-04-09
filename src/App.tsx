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

const viewsWithEmployeeId = new Set(['history', 'payroll', 'hour-records']);

function normalizePath(pathname: string) {
  return pathname.replace(/\/+$|^\/+/, '').trim();
}

/**
 * Parses the current URL pathname to extract user ID, view name, and optional employee ID.
 * @param pathname - The URL pathname to parse (e.g., "/user123/history/emp456")
 * @returns An object containing userId, view, and employeeId
 */
function parseRoute(pathname: string) {
  const trimmed = normalizePath(pathname);
  const segments = trimmed.split('/').filter(Boolean);

  if (segments.length === 0 || segments[0] === 'auth') {
    return { userId: null, view: 'dashboard', employeeId: null };
  }

  const userId = segments[0];
  const view = segments[1] || 'dashboard';
  const employeeId = segments[2] || null;

  return {
    userId,
    view: routeViews.has(view) ? view : 'dashboard',
    employeeId: employeeId || null
  };
}

/**
 * Builds a URL path for a specific view with optional employee ID.
 * @param userId - The user ID for the URL
 * @param view - The view name (dashboard, history, etc.)
 * @param employeeId - Optional employee ID for employee-specific views
 * @returns The constructed URL path
 */
function buildViewPath(userId: string, view: string, employeeId: string | null = null) {
  const basePath = `/${userId}/${view === 'dashboard' ? 'dashboard' : view}`;
  return employeeId && viewsWithEmployeeId.has(view) ? `${basePath}/${employeeId}` : basePath;
}

/**
 * Checks if the given pathname corresponds to the Google OAuth callback route.
 * @param pathname - The URL pathname to check
 * @returns True if the path is the Google callback path, false otherwise
 */
function isGoogleCallbackPath(pathname: string) {
  const trimmed = normalizePath(pathname);
  return trimmed === 'auth/google/callback' || trimmed.endsWith('auth/google/callback');
}

function AppContent() {
  const { user, loading } = useAuth();
  const [showRegister, setShowRegister] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [currentView, setCurrentView] = useState('dashboard');
  const [routeEmployeeId, setRouteEmployeeId] = useState<string | null>(null);

  useEffect(() => {
    const updateRouteFromLocation = () => {
      if (isGoogleCallbackPath(window.location.pathname)) {
        return;
      }

      const { view, employeeId } = parseRoute(window.location.pathname);
      setCurrentView(view);
      setRouteEmployeeId(employeeId);
    };

    updateRouteFromLocation();
    window.addEventListener('popstate', updateRouteFromLocation);
    return () => window.removeEventListener('popstate', updateRouteFromLocation);
  }, []);

  useEffect(() => {
    if (!user) {
      if (!isGoogleCallbackPath(window.location.pathname) && window.location.pathname !== '/') {
        window.history.replaceState({}, document.title, '/');
      }
      return;
    }

    const desiredPath = buildViewPath(user.id, currentView, routeEmployeeId);
    if (window.location.pathname !== desiredPath) {
      window.history.replaceState({}, document.title, desiredPath);
    }
  }, [user, currentView, routeEmployeeId]);

  const handleViewChange = (view: string) => {
    const nextEmployeeId = viewsWithEmployeeId.has(view) ? routeEmployeeId : null;
    setCurrentView(view);
    setRouteEmployeeId(nextEmployeeId);

    if (user) {
      const newPath = buildViewPath(user.id, view, nextEmployeeId);
      window.history.pushState({}, '', newPath);
    }
  };

  const handleEmployeeSelect = (employeeId: string | null) => {
    setRouteEmployeeId(employeeId);
    if (user) {
      const newPath = buildViewPath(user.id, currentView, employeeId);
      window.history.pushState({}, '', newPath);
    }
  };

  // Detectar si estamos procesando el callback de Google
  const isGoogleCallback = isGoogleCallbackPath(window.location.pathname);

  if (isGoogleCallback) {
    return (
      <GoogleCallback
        onComplete={() => {
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
        return <HourRecords selectedEmployeeId={routeEmployeeId || undefined} onEmployeeChange={handleEmployeeSelect} />;
      case 'history':
        return <EmployeeHistory selectedEmployeeId={routeEmployeeId || undefined} onEmployeeChange={handleEmployeeSelect} />;
      case 'payroll':
        return <Payroll selectedEmployeeId={routeEmployeeId || undefined} onEmployeeChange={handleEmployeeSelect} />;
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
