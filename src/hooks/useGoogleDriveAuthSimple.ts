import { useCallback } from 'react';
import { supabase } from '../lib/supabase';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

interface GoogleToken {
  access_token: string;
  expires_at: string;
  refresh_token?: string;
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          renderButton: (element: HTMLElement, config: any) => void;
          prompt: (callback?: any) => void;
        };
        oauth2: {
          initCodeClient: (config: any) => {
            requestCode: () => void;
          };
        };
      };
    };
  }
}

export const useGoogleDriveAuthSimple = () => {
  const initiateGoogleAuth = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Usuario no autenticado');
      }

      if (!window.google) {
        throw new Error('Google SDK no cargado');
      }

      // Usar el flujo de authorization code
      const client = window.google.accounts.oauth2.initCodeClient({
        client_id: GOOGLE_CLIENT_ID,
        scope: 'https://www.googleapis.com/auth/drive.file',
        ux_mode: 'redirect',
        redirect_uri: `${window.location.origin}/auth/google/callback`,
        state: Math.random().toString(36).substring(7),
      });

      client.requestCode();
    } catch (err) {
      console.error('Google Auth Error:', err);
      throw err;
    }
  }, []);

  const handleGoogleCallback = useCallback(async (code: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Usuario no autenticado');
      }

      console.log('handleGoogleCallback: Starting token exchange with code:', code.substring(0, 20) + '...');

      // Llamar a la API de Vercel para intercambiar el código
      const response = await fetch('/api/google-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code,
        }),
      });

      console.log('handleGoogleCallback: API response status:', response.status);

      if (!response.ok) {
        const error = await response.json();
        console.error('handleGoogleCallback: API error:', error);
        throw new Error(`Error: ${error.error || 'Token exchange failed'}`);
      }

      const data = await response.json();
      console.log('handleGoogleCallback: Token response received:', { 
        success: data.success,
        hasAccessToken: !!data.access_token,
        expiresIn: data.expires_in,
      });

      if (!data?.success) {
        throw new Error(data?.error || 'No se pudo obtener el token');
      }

      const expiresAt = new Date(Date.now() + data.expires_in * 1000).toISOString();

      // Guardar token en Supabase
      console.log('handleGoogleCallback: Saving token to Supabase...');
      const { error: saveError } = await supabase
        .from('user_google_tokens')
        .upsert({
          user_id: user.id,
          access_token: data.access_token,
          refresh_token: data.refresh_token || null,
          expires_at: expiresAt,
        });

      if (saveError) {
        throw new Error(`Error guardando tokens: ${saveError.message}`);
      }

      console.log('handleGoogleCallback: Token saved successfully');
      return { success: true, access_token: data.access_token };
    } catch (err) {
      console.error('Google Callback Error:', err);
      throw err;
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
    initiateGoogleAuth,
    handleGoogleCallback,
    getStoredToken,
  };
};
