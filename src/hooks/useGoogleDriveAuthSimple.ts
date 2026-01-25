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

      // Intercambiar código por token usando Google REST API
      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          code,
          client_id: GOOGLE_CLIENT_ID,
          grant_type: 'authorization_code',
          redirect_uri: `${window.location.origin}/auth/google/callback`,
        }).toString(),
      });

      if (!tokenResponse.ok) {
        throw new Error('Error intercambiando código por token');
      }

      const tokenData = await tokenResponse.json();
      const expiresAt = new Date(Date.now() + tokenData.expires_in * 1000).toISOString();

      // Guardar token en Supabase
      const { error } = await supabase
        .from('user_google_tokens')
        .upsert({
          user_id: user.id,
          access_token: tokenData.access_token,
          refresh_token: tokenData.refresh_token || null,
          expires_at: expiresAt,
        });

      if (error) {
        throw new Error(`Error guardando tokens: ${error.message}`);
      }

      return { success: true, access_token: tokenData.access_token };
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
