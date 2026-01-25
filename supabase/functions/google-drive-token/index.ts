import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const googleClientId = Deno.env.get("GOOGLE_CLIENT_ID");
const googleClientSecret = Deno.env.get("GOOGLE_CLIENT_SECRET");
const googleRedirectUri = Deno.env.get("GOOGLE_REDIRECT_URI");

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Headers CORS requeridos
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Content-Type": "application/json",
};

serve(async (req: Request) => {
  // Manejar OPTIONS preflight request
  if (req.method === "OPTIONS") {
    return new Response("ok", { 
      status: 200,
      headers: corsHeaders 
    });
  }

  try {
    // Verificar que las variables de entorno estén configuradas
    if (!googleClientId || !googleClientSecret || !googleRedirectUri) {
      console.error("Missing environment variables:", {
        googleClientId: !!googleClientId,
        googleClientSecret: !!googleClientSecret,
        googleRedirectUri: !!googleRedirectUri,
      });
      return new Response(
        JSON.stringify({
          error: "Server not properly configured. Missing Google OAuth credentials.",
          details: "Check GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and GOOGLE_REDIRECT_URI environment variables",
        }),
        { status: 500, headers: corsHeaders }
      );
    }

    // Parsear el body
    const { code, userId } = await req.json() as { code: string; userId: string };

    if (!code || !userId) {
      return new Response(
        JSON.stringify({ error: "Missing code or userId" }),
        { status: 400, headers: corsHeaders }
      );
    }

    // Intercambiar código por tokens
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: googleClientId,
        client_secret: googleClientSecret,
        redirect_uri: googleRedirectUri,
        grant_type: "authorization_code",
      }).toString(),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text();
      console.error("Token exchange failed:", {
        status: tokenResponse.status,
        error: errorData,
        redirect_uri: googleRedirectUri,
        client_id: googleClientId,
      });
      return new Response(
        JSON.stringify({
          error: "Failed to exchange code for token",
          details: errorData,
          status: tokenResponse.status,
        }),
        { status: 400, headers: corsHeaders }
      );
    }

    const tokenData = await tokenResponse.json() as {
      access_token: string;
      refresh_token?: string;
      expires_in: number;
      token_type: string;
    };

    // Calcular fecha de expiración
    const expiresAt = new Date(Date.now() + tokenData.expires_in * 1000).toISOString();

    // Guardar tokens en Supabase
    const { error: upsertError } = await supabase
      .from("user_google_tokens")
      .upsert(
        {
          user_id: userId,
          access_token: tokenData.access_token,
          refresh_token: tokenData.refresh_token || null,
          expires_at: expiresAt,
          token_type: tokenData.token_type,
        },
        { onConflict: "user_id" }
      );

    if (upsertError) {
      console.error("Upsert error:", upsertError);
      return new Response(
        JSON.stringify({ error: "Failed to save tokens" }),
        { status: 500, headers: corsHeaders }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Tokens saved successfully",
        data: {
          access_token: tokenData.access_token,
          expires_at: expiresAt,
        },
      }),
      { status: 200, headers: corsHeaders }
    );
  } catch (error: unknown) {
    console.error("Function error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: corsHeaders }
    );
  }
});
