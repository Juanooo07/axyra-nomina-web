import { createClient } from 'npm:@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey, X-API-Key',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  if (req.method !== 'GET') {
    return new Response(
      JSON.stringify({ error: 'Método no permitido' }),
      {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
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

    // Obtener parámetros de query
    const url = new URL(req.url);
    const employeeId = url.searchParams.get('employee_id');
    const startDate = url.searchParams.get('start_date');
    const endDate = url.searchParams.get('end_date');
    const checkType = url.searchParams.get('check_type');
    const limit = parseInt(url.searchParams.get('limit') || '100');

    // Construir query
    let query = supabase
      .from('attendance_records')
      .select(`
        id,
        employee_id,
        check_time,
        check_type,
        device_id,
        location,
        notes,
        employees!inner(full_name, cedula)
      `)
      .eq('user_id', keyData.user_id)
      .order('check_time', { ascending: false })
      .limit(limit);

    // Aplicar filtros
    if (employeeId) {
      query = query.eq('employee_id', employeeId);
    }

    if (startDate) {
      query = query.gte('check_time', startDate);
    }

    if (endDate) {
      query = query.lte('check_time', endDate);
    }

    if (checkType && ['IN', 'OUT'].includes(checkType)) {
      query = query.eq('check_type', checkType);
    }

    const { data: records, error: recordsError } = await query;

    if (recordsError) throw recordsError;

    // Formatear respuesta
    const formattedRecords = (records || []).map((record: any) => ({
      id: record.id,
      employee_id: record.employee_id,
      employee_name: record.employees.full_name,
      employee_cedula: record.employees.cedula,
      check_time: record.check_time,
      check_type: record.check_type,
      device_id: record.device_id,
      location: record.location,
      notes: record.notes,
    }));

    return new Response(
      JSON.stringify({
        success: true,
        records: formattedRecords,
        count: formattedRecords.length,
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
        error: error.message || 'Error al obtener registros de asistencia',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  }
});