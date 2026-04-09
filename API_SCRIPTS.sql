-- Scripts SQL útiles para gestionar la API

-- =====================================================
-- 1. GENERAR NUEVA API KEY
-- =====================================================
-- Reemplaza 'tu_user_id' con tu ID de usuario
-- Reemplaza 'Nombre del Dispositivo' con el nombre que quieras darle

INSERT INTO api_keys (user_id, key_name, api_key, is_active)
VALUES (
  'tu_user_id',
  'Nombre del Dispositivo',
  'axyra_' || replace(gen_random_uuid()::text, '-', ''),
  true
)
RETURNING *;

-- Para obtener tu user_id:
SELECT id, email FROM auth.users WHERE email = 'tu_email@ejemplo.com';


-- =====================================================
-- 2. VER TODAS TUS API KEYS
-- =====================================================
SELECT
  id,
  key_name,
  api_key,
  is_active,
  created_at,
  last_used_at
FROM api_keys
WHERE user_id = auth.uid()
ORDER BY created_at DESC;


-- =====================================================
-- 3. DESACTIVAR UNA API KEY
-- =====================================================
UPDATE api_keys
SET is_active = false
WHERE api_key = 'axyra_tu_api_key_aqui'
  AND user_id = auth.uid();


-- =====================================================
-- 4. REACTIVAR UNA API KEY
-- =====================================================
UPDATE api_keys
SET is_active = true
WHERE api_key = 'axyra_tu_api_key_aqui'
  AND user_id = auth.uid();


-- =====================================================
-- 5. ELIMINAR UNA API KEY PERMANENTEMENTE
-- =====================================================
DELETE FROM api_keys
WHERE api_key = 'axyra_tu_api_key_aqui'
  AND user_id = auth.uid();


-- =====================================================
-- 6. VER REGISTROS DE ASISTENCIA RECIENTES
-- =====================================================
SELECT
  ar.id,
  e.full_name,
  e.cedula,
  ar.check_time,
  ar.check_type,
  ar.device_id,
  ar.location
FROM attendance_records ar
JOIN employees e ON ar.employee_id = e.id
WHERE ar.user_id = auth.uid()
ORDER BY ar.check_time DESC
LIMIT 50;


-- =====================================================
-- 7. VER ASISTENCIA DE UN EMPLEADO ESPECÍFICO
-- =====================================================
SELECT
  ar.check_time,
  ar.check_type,
  ar.device_id,
  ar.location,
  ar.notes
FROM attendance_records ar
JOIN employees e ON ar.employee_id = e.id
WHERE ar.user_id = auth.uid()
  AND e.cedula = '1234567890'  -- Reemplaza con la cédula
ORDER BY ar.check_time DESC;


-- =====================================================
-- 8. RESUMEN DIARIO DE ASISTENCIA
-- =====================================================
SELECT
  DATE(ar.check_time) as fecha,
  e.full_name,
  COUNT(CASE WHEN ar.check_type = 'IN' THEN 1 END) as entradas,
  COUNT(CASE WHEN ar.check_type = 'OUT' THEN 1 END) as salidas,
  MIN(CASE WHEN ar.check_type = 'IN' THEN ar.check_time END) as primera_entrada,
  MAX(CASE WHEN ar.check_type = 'OUT' THEN ar.check_time END) as ultima_salida
FROM attendance_records ar
JOIN employees e ON ar.employee_id = e.id
WHERE ar.user_id = auth.uid()
  AND ar.check_time >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE(ar.check_time), e.full_name
ORDER BY fecha DESC, e.full_name;


-- =====================================================
-- 9. CALCULAR HORAS TRABAJADAS POR DÍA
-- =====================================================
-- Nota: Este es un ejemplo básico. Ajusta según tu lógica de negocio.
WITH pairs AS (
  SELECT
    e.full_name,
    DATE(ar.check_time) as fecha,
    ar.check_time,
    ar.check_type,
    LEAD(ar.check_time) OVER (
      PARTITION BY ar.employee_id, DATE(ar.check_time)
      ORDER BY ar.check_time
    ) as siguiente_check,
    LEAD(ar.check_type) OVER (
      PARTITION BY ar.employee_id, DATE(ar.check_time)
      ORDER BY ar.check_time
    ) as siguiente_tipo
  FROM attendance_records ar
  JOIN employees e ON ar.employee_id = e.id
  WHERE ar.user_id = auth.uid()
    AND ar.check_time >= CURRENT_DATE - INTERVAL '30 days'
)
SELECT
  fecha,
  full_name,
  SUM(
    CASE
      WHEN check_type = 'IN' AND siguiente_tipo = 'OUT'
      THEN EXTRACT(EPOCH FROM (siguiente_check - check_time)) / 3600
      ELSE 0
    END
  ) as horas_trabajadas
FROM pairs
WHERE check_type = 'IN'
GROUP BY fecha, full_name
ORDER BY fecha DESC, full_name;


-- =====================================================
-- 10. LIMPIAR REGISTROS ANTIGUOS (MÁS DE 1 AÑO)
-- =====================================================
-- ¡CUIDADO! Esto eliminará registros permanentemente
DELETE FROM attendance_records
WHERE user_id = auth.uid()
  AND check_time < CURRENT_DATE - INTERVAL '1 year';


-- =====================================================
-- 11. ESTADÍSTICAS DE USO DE API
-- =====================================================
SELECT
  key_name,
  api_key,
  created_at,
  last_used_at,
  CASE
    WHEN last_used_at IS NULL THEN 'Nunca usado'
    WHEN last_used_at > NOW() - INTERVAL '1 hour' THEN 'Usado recientemente'
    WHEN last_used_at > NOW() - INTERVAL '1 day' THEN 'Usado hoy'
    WHEN last_used_at > NOW() - INTERVAL '7 days' THEN 'Usado esta semana'
    ELSE 'No usado recientemente'
  END as estado_uso
FROM api_keys
WHERE user_id = auth.uid()
ORDER BY last_used_at DESC NULLS LAST;
