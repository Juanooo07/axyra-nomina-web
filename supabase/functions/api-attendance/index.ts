import { createClient } from 'npm:@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey, X-API-Key',
};

interface AttendanceRequest {
  employee_id?: string;
  employee_cedula?: string;
  check_type: 'IN' | 'OUT';
  device_id?: string;
  location?: string;
  notes?: string;
  check_time?: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  if (req.method !== 'POST') {
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

    // Obtener datos del request
    const body: AttendanceRequest = await req.json();

    // Validar datos requeridos
    if (!body.check_type || !['IN', 'OUT'].includes(body.check_type)) {
      return new Response(
        JSON.stringify({ error: 'check_type debe ser IN o OUT' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      );
    }

    if (!body.employee_id && !body.employee_cedula) {
      return new Response(
        JSON.stringify({ error: 'employee_id o employee_cedula es requerido' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      );
    }

    // Buscar empleado por ID o cédula
    let employeeId = body.employee_id;
    
    if (!employeeId && body.employee_cedula) {
      const { data: employee, error: empError } = await supabase
        .from('employees')
        .select('id')
        .eq('user_id', keyData.user_id)
        .eq('cedula', body.employee_cedula)
        .eq('status', 'active')
        .maybeSingle();

      if (empError || !employee) {
        return new Response(
          JSON.stringify({ error: 'Empleado no encontrado' }),
          {
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          },
        );
      }

      employeeId = employee.id;
    }

    // Verificar que el empleado pertenece al usuario
    const { data: empVerify, error: verifyError } = await supabase
      .from('employees')
      .select('id')
      .eq('id', employeeId)
      .eq('user_id', keyData.user_id)
      .maybeSingle();

    if (verifyError || !empVerify) {
      return new Response(
        JSON.stringify({ error: 'Empleado no encontrado o no autorizado' }),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        },
      );
    }

    // Registrar asistencia
    const checkTime = body.check_time || new Date().toISOString();
    
    const { data: attendance, error: attendanceError } = await supabase
      .from('attendance_records')
      .insert({
        user_id: keyData.user_id,
        employee_id: employeeId,
        check_time: checkTime,
        check_type: body.check_type,
        device_id: body.device_id || null,
        location: body.location || null,
        notes: body.notes || null,
      })
      .select()
      .single();

    if (attendanceError) throw attendanceError;

    return new Response(
      JSON.stringify({
        success: true,
        message: `Marcación de ${body.check_type === 'IN' ? 'entrada' : 'salida'} registrada exitosamente`,
        attendance,
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
        error: error.message || 'Error al registrar asistencia',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  }
});