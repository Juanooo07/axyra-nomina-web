import { useEffect, useState } from 'react';
import { useGoogleDriveAuth } from '../../hooks/useGoogleDriveAuth';

interface GoogleCallbackProps {
  onComplete: () => void;
}

export function GoogleCallback({ onComplete }: GoogleCallbackProps) {
  const { handleGoogleCallback } = useGoogleDriveAuth();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const processCallback = async () => {
      try {
        setLoading(true);
        
        // Obtener los parámetros de la URL
        const searchParams = new URLSearchParams(window.location.search);
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        const errorParam = searchParams.get('error');

        // Verificar si hay error de Google
        if (errorParam) {
          throw new Error(`Google OAuth error: ${errorParam}`);
        }

        if (!code || !state) {
          throw new Error('Código o estado faltante en la URL');
        }

        // Procesar el callback
        const result = await handleGoogleCallback(code, state);
        
        if (!result) {
          throw new Error('No se pudo procesar el callback de Google');
        }

        // Esperar 1 segundo y luego volver al dashboard
        setTimeout(() => {
          onComplete();
        }, 1000);

      } catch (err) {
        const message = err instanceof Error ? err.message : 'Error desconocido';
        setError(message);
        console.error('Error procesando callback de Google:', err);
        
        // Volver al dashboard después de 3 segundos aunque haya error
        setTimeout(() => {
          onComplete();
        }, 3000);
      } finally {
        setLoading(false);
      }
    };

    processCallback();
  }, [handleGoogleCallback, onComplete]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md text-center">
        {loading && !error && (
          <>
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Procesando autorización...</h2>
            <p className="text-slate-600">Por favor espera mientras completamos la configuración de Google Drive.</p>
          </>
        )}

        {error && (
          <>
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-red-600 mb-2">Error en la autorización</h2>
            <p className="text-slate-600 mb-6">{error}</p>
            <p className="text-slate-500 text-sm">Serás redirigido al panel en unos segundos...</p>
          </>
        )}

        {!loading && !error && (
          <>
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-green-600 mb-2">¡Autorización completada!</h2>
            <p className="text-slate-600">Google Drive se ha configurado correctamente. Redirigiendo...</p>
          </>
        )}
      </div>
    </div>
  );
}
