import { createClient } from 'npm:@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey, X-API-Key',
};

interface Employee {
  id: string;
  full_name: string;
  cedula: string;
  status: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Validar API Key
    const apiKey = req.headers.get('X-API-Key');
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'API Key requerida' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      );
    }

    // Verificar API Key y obtener user_id
    const { data: keyData, error: keyError } = await supabase
      .from('api_keys')
      .select('user_id, is_active')
      .eq('api_key', apiKey)
      .eq('is_active', true)
      .maybeSingle();

    if (keyError || !keyData) {
      return new Response(
        JSON.stringify({ error: 'API Key inválida' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      );
    }

    // Actualizar last_used_at
    await supabase
      .from('api_keys')
      .update({ last_used_at: new Date().toISOString() })
      .eq('api_key', apiKey);

    // Obtener empleados del usuario
    const { data: employees, error: employeesError } = await supabase
      .from('employees')
      .select('id, full_name, cedula, status')
      .eq('user_id', keyData.user_id)
      .eq('status', 'active')
      .order('full_name');

    if (employeesError) throw employeesError;

    return new Response(
      JSON.stringify({
        success: true,
        employees: employees || [],
        count: employees?.length || 0,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Error al obtener empleados',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  }
});