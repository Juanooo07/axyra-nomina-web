import { useCallback } from 'react';
import { supabase } from '../lib/supabase';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

interface GoogleToken {
  access_token: string;
  refresh_token?: string;
  expires_at: string;
}

declare global {
  interface Window {
    google?: {
      accounts: {
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

      console.log('useGoogleDriveAuth: Iniciando autenticación con Google');

      // Usar el flujo de authorization code
      const client = window.google.accounts.oauth2.initCodeClient({
        client_id: GOOGLE_CLIENT_ID,
        scope: 'https://www.googleapis.com/auth/drive.file',
        ux_mode: 'redirect',
        redirect_uri: `${window.location.origin}/auth/google/callback`,
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

      console.log('handleGoogleCallback: Intercambiando código por token');

      // Llamar a la API de Vercel
      const redirectUri = `${window.location.origin}/auth/google/callback`;
      const response = await fetch('/api/google-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, redirectUri }),
      });

      console.log('handleGoogleCallback: Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('handleGoogleCallback: Error response:', errorData);
        throw new Error(errorData.error || 'No se pudo intercambiar el código');
      }

      const tokenData = await response.json();
      console.log('handleGoogleCallback: Token received:', {
        hasAccessToken: !!tokenData.access_token,
        expiresIn: tokenData.expires_in,
      });

      if (!tokenData.access_token) {
        throw new Error('No access token in response');
      }

      // Guardar en Supabase
      const expiresAt = new Date(Date.now() + tokenData.expires_in * 1000).toISOString();
      
      console.log('handleGoogleCallback: Guardando token en Supabase para user:', user.id);
      const { error: upsertError, data: savedData } = await supabase
        .from('user_google_tokens')
        .upsert(
          {
            user_id: user.id,
            access_token: tokenData.access_token,
            refresh_token: tokenData.refresh_token || null,
            expires_at: expiresAt,
            token_type: 'Bearer',
          },
          { onConflict: 'user_id' }
        )
        .select();

      if (upsertError) {
        console.error('handleGoogleCallback: Supabase error:', upsertError);
        throw new Error(`Error guardando token: ${upsertError.message}`);
      }

      console.log('handleGoogleCallback: Token guardado exitosamente:', savedData);
      return { success: true, access_token: tokenData.access_token };
    } catch (err) {
      console.error('handleGoogleCallback Error:', err);
      throw err;
    }
  }, []);

  const getStoredToken = useCallback(async (): Promise<GoogleToken | null> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('getStoredToken: No user logged in');
        return null;
      }

      console.log('getStoredToken: Buscando token para user:', user.id);

      const { data, error } = await supabase
        .from('user_google_tokens')
        .select('access_token, refresh_token, expires_at')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.log('getStoredToken: No token found or error:', error.message);
        return null;
      }

      if (!data) {
        console.log('getStoredToken: No data returned');
        return null;
      }

      // Verificar si el token está expirado
      const expiresAt = new Date(data.expires_at);
      const now = new Date();
      const isExpired = expiresAt <= now;

      console.log('getStoredToken: Token status:', {
        expiresAt: expiresAt.toISOString(),
        now: now.toISOString(),
        isExpired,
        token: data.access_token ? `${data.access_token.substring(0, 20)}...` : null,
      });

      if (isExpired) {
        console.log('getStoredToken: Token expired');
        return null;
      }

      return {
        access_token: data.access_token,
        refresh_token: data.refresh_token || undefined,
        expires_at: data.expires_at,
      };
    } catch (err) {
      console.error('getStoredToken Error:', err);
      return null;
    }
  }, []);

  return {
    initiateGoogleAuth,
    handleGoogleCallback,
    getStoredToken,
  };
};
