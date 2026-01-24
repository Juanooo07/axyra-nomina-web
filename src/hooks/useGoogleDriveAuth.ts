import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const REDIRECT_URI = `${window.location.origin}/auth/google/callback`;

interface GoogleToken {
  user_id: string;
  access_token: string;
  refresh_token?: string;
  expires_at: string;
}

export const useGoogleDriveAuth = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initiateGoogleAuth = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Usuario no autenticado');
      }

      // Generar URL de OAuth de Google
      const scope = 'https://www.googleapis.com/auth/drive.file';
      const state = Math.random().toString(36).substring(7);
      
      // Guardar estado en localStorage para validarlo después
      sessionStorage.setItem('google_oauth_state', state);

      const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
      authUrl.searchParams.append('client_id', GOOGLE_CLIENT_ID);
      authUrl.searchParams.append('redirect_uri', REDIRECT_URI);
      authUrl.searchParams.append('response_type', 'code');
      authUrl.searchParams.append('scope', scope);
      authUrl.searchParams.append('state', state);
      authUrl.searchParams.append('access_type', 'offline');
      authUrl.searchParams.append('prompt', 'consent');

      // Redirigir a Google OAuth
      window.location.href = authUrl.toString();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al iniciar autenticación';
      setError(message);
      console.error('Google Auth Error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleGoogleCallback = useCallback(async (code: string, state: string) => {
    try {
      setLoading(true);
      setError(null);

      // Validar state
      const savedState = sessionStorage.getItem('google_oauth_state');
      if (state !== savedState) {
        throw new Error('State inválido - posible ataque CSRF');
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Usuario no autenticado');
      }

      // Llamar a la edge function para intercambiar el código por tokens
      const { data, error: functionError } = await supabase.functions.invoke(
        'google-drive-token',
        {
          body: {
            code,
            userId: user.id,
          },
        }
      );

      if (functionError) {
        throw new Error(functionError.message || 'Error al obtener token');
      }

      // Limpiar estado
      sessionStorage.removeItem('google_oauth_state');

      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al procesar callback';
      setError(message);
      console.error('Google Callback Error:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getStoredToken = useCallback(async (): Promise<GoogleToken | null> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('user_google_tokens')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error || !data) return null;
      return data as GoogleToken;
    } catch (err) {
      console.error('Error getting stored token:', err);
      return null;
    }
  }, []);

  return {
    loading,
    error,
    initiateGoogleAuth,
    handleGoogleCallback,
    getStoredToken,
  };
};
