# 🔌 API de AXYRA Nómina - Guía Rápida

Tu API está lista para conectar dispositivos externos como huelleros biométricos con tu sistema de nómina.

## 📋 Archivos Importantes

1. **API_CREDENTIALS.md** - Tu API Key personal (¡guárdala con seguridad!)
2. **API_DOCUMENTATION.md** - Documentación completa de todos los endpoints
3. **API_SCRIPTS.sql** - Scripts SQL útiles para gestionar la API

---

## 🚀 Inicio Rápido

### Tu API Key
```
axyra_be52ad7c4a4848b1acb4bc5c183e3feb
```

### URL Base
```
https://taikhnqqedgukkgdoctn.supabase.co/functions/v1
```

---

## 📡 Endpoints Disponibles

### 1️⃣ Obtener Lista de Empleados
```bash
curl -X GET "https://taikhnqqedgukkgdoctn.supabase.co/functions/v1/api-employees" \
  -H "X-API-Key: axyra_be52ad7c4a4848b1acb4bc5c183e3feb"
```

**Respuesta:**
```json
{
  "success": true,
  "employees": [
    {
      "id": "uuid",
      "full_name": "Juan Pérez",
      "cedula": "1234567890",
      "status": "active"
    }
  ],
  "count": 12
}
```

---

### 2️⃣ Registrar Marcación (Entrada/Salida)
```bash
curl -X POST "https://taikhnqqedgukkgdoctn.supabase.co/functions/v1/api-attendance" \
  -H "X-API-Key: axyra_be52ad7c4a4848b1acb4bc5c183e3feb" \
  -H "Content-Type: application/json" \
  -d '{
    "employee_cedula": "1234567890",
    "check_type": "IN",
    "device_id": "HUELLERO-001",
    "location": "Sede Principal"
  }'
```

**Parámetros:**
- `employee_cedula`: Cédula del empleado
- `check_type`: "IN" para entrada, "OUT" para salida
- `device_id`: (opcional) ID de tu dispositivo
- `location`: (opcional) Ubicación

**Respuesta:**
```json
{
  "success": true,
  "message": "Marcación de entrada registrada exitosamente",
  "attendance": {
    "id": "uuid",
    "employee_id": "uuid",
    "check_time": "2026-01-14T08:30:00Z",
    "check_type": "IN",
    "device_id": "HUELLERO-001",
    "location": "Sede Principal"
  }
}
```

---

### 3️⃣ Obtener Registros de Asistencia
```bash
curl -X GET "https://taikhnqqedgukkgdoctn.supabase.co/functions/v1/api-get-attendance?start_date=2026-01-01&limit=10" \
  -H "X-API-Key: axyra_be52ad7c4a4848b1acb4bc5c183e3feb"
```

**Parámetros opcionales:**
- `employee_id`: Filtrar por empleado
- `start_date`: Fecha de inicio (formato: 2026-01-01)
- `end_date`: Fecha de fin
- `check_type`: "IN" o "OUT"
- `limit`: Número máximo de registros (por defecto: 100)

**Respuesta:**
```json
{
  "success": true,
  "records": [
    {
      "id": "uuid",
      "employee_name": "Juan Pérez",
      "employee_cedula": "1234567890",
      "check_time": "2026-01-14T08:30:00Z",
      "check_type": "IN",
      "device_id": "HUELLERO-001",
      "location": "Sede Principal"
    }
  ],
  "count": 1
}
```

---

## 🔐 Seguridad

### ✅ Hacer
- Usar la API Key solo en servidores o dispositivos seguros
- Mantener la API Key en variables de entorno
- Desactivar inmediatamente cualquier API Key comprometida

### ❌ NO Hacer
- NO compartir la API Key públicamente
- NO incluir la API Key en código del lado del cliente
- NO subir la API Key a repositorios públicos

---

## 🛠️ Gestión de API Keys

### Ver todas tus API Keys
```sql
SELECT key_name, api_key, is_active, last_used_at
FROM api_keys
WHERE user_id = auth.uid();
```

### Generar nueva API Key
```sql
INSERT INTO api_keys (user_id, key_name, api_key, is_active)
VALUES (
  auth.uid(),
  'Nombre del Dispositivo',
  'axyra_' || replace(gen_random_uuid()::text, '-', ''),
  true
)
RETURNING *;
```

### Desactivar API Key
```sql
UPDATE api_keys
SET is_active = false
WHERE api_key = 'tu_api_key_aqui'
  AND user_id = auth.uid();
```

---

## 📊 Consultas Útiles

### Ver registros recientes
```sql
SELECT
  ar.check_time,
  e.full_name,
  ar.check_type,
  ar.device_id
FROM attendance_records ar
JOIN employees e ON ar.employee_id = e.id
WHERE ar.user_id = auth.uid()
ORDER BY ar.check_time DESC
LIMIT 50;
```

### Resumen diario de asistencia
```sql
SELECT
  DATE(check_time) as fecha,
  COUNT(CASE WHEN check_type = 'IN' THEN 1 END) as entradas,
  COUNT(CASE WHEN check_type = 'OUT' THEN 1 END) as salidas
FROM attendance_records
WHERE user_id = auth.uid()
  AND check_time >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE(check_time)
ORDER BY fecha DESC;
```

---

## 🧪 Pruebas Realizadas

Todos los endpoints fueron probados exitosamente:

✅ **Obtener empleados**: 12 empleados activos encontrados
✅ **Registrar asistencia**: Marcación de entrada registrada correctamente
✅ **Obtener registros**: Registros recuperados correctamente

---

## 📚 Próximos Pasos

1. **Integra con tu huellero**: Usa los ejemplos de código para conectar tu dispositivo
2. **Prueba la API**: Realiza pruebas con diferentes escenarios
3. **Monitorea el uso**: Revisa `last_used_at` en tus API Keys
4. **Genera más keys**: Crea API Keys adicionales para diferentes dispositivos

---

## 🆘 Solución de Problemas

### Error 401: API Key inválida
- Verifica que la API Key sea correcta
- Asegúrate de que la API Key esté activa
- Confirma que el header `X-API-Key` esté correctamente configurado

### Error 404: Empleado no encontrado
- Verifica que la cédula sea correcta
- Asegúrate de que el empleado esté activo
- Confirma que el empleado pertenece a tu cuenta

### Error 500: Error del servidor
- Revisa los logs de Supabase
- Verifica que todos los datos sean válidos
- Contacta al soporte si el problema persiste

---

## 📖 Documentación Completa

Para ejemplos de código en diferentes lenguajes (JavaScript, Python, etc.), consulta **API_DOCUMENTATION.md**.

Para scripts SQL útiles, consulta **API_SCRIPTS.sql**.

---

## 🎯 Casos de Uso

### Huellero Biométrico
1. Sincroniza empleados con `GET /api-employees`
2. Registra marcaciones con `POST /api-attendance`
3. Verifica registros con `GET /api-get-attendance`

### Sistema de Control de Acceso
1. Valida identidad con la cédula
2. Registra entrada/salida automáticamente
3. Genera reportes de asistencia

### Aplicación Móvil
1. Los empleados marcan entrada/salida desde su teléfono
2. Sistema verifica ubicación GPS
3. Registros se sincronizan con el servidor

---

¡Tu API está lista para usar! 🎉
