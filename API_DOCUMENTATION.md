# Documentación de la API de AXYRA Nómina

Esta documentación describe los endpoints disponibles para integración con dispositivos externos como huelleros biométricos.

## URL Base

```
https://taikhnqqedgukkgdoctn.supabase.co/functions/v1
```

## Autenticación

Todos los endpoints requieren una API Key que debe ser enviada en el header `X-API-Key`.

```
X-API-Key: tu_api_key_aqui
```

### Cómo generar una API Key

Para generar una API Key, debes ejecutar el siguiente código SQL en tu consola de Supabase:

```sql
-- Generar una nueva API Key
INSERT INTO api_keys (user_id, key_name, api_key, is_active)
VALUES (
  'tu_user_id_aqui',
  'Huellero Principal',
  'axyra_' || gen_random_uuid()::text,
  true
)
RETURNING *;
```

O usa la aplicación web para generar nuevas API Keys desde la sección de Configuración.

---

## Endpoints

### 1. Obtener Lista de Empleados

Obtiene la lista de empleados activos para sincronizar con el huellero.

**Endpoint:** `GET /api-employees`

**Headers:**
```
X-API-Key: tu_api_key
```

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "employees": [
    {
      "id": "uuid-del-empleado",
      "full_name": "Juan Pérez",
      "cedula": "1234567890",
      "status": "active"
    }
  ],
  "count": 1
}
```

**Errores:**
- `401`: API Key faltante o inválida
- `500`: Error del servidor

---

### 2. Registrar Asistencia (Check-In/Out)

Registra una marcación de entrada o salida de un empleado.

**Endpoint:** `POST /api-attendance`

**Headers:**
```
X-API-Key: tu_api_key
Content-Type: application/json
```

**Body:**
```json
{
  "employee_id": "uuid-del-empleado",
  "check_type": "IN",
  "device_id": "HUELLERO-001",
  "location": "Sede Principal",
  "notes": "Marcación automática",
  "check_time": "2026-01-14T08:30:00Z"
}
```

**Parámetros del Body:**

| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| employee_id | string (uuid) | Sí* | ID del empleado |
| employee_cedula | string | Sí* | Cédula del empleado (alternativa a employee_id) |
| check_type | string | Sí | Tipo de marcación: "IN" (entrada) o "OUT" (salida) |
| device_id | string | No | ID del dispositivo que registra |
| location | string | No | Ubicación de la marcación |
| notes | string | No | Notas adicionales |
| check_time | string (ISO 8601) | No | Fecha/hora de la marcación (por defecto: ahora) |

*Nota: Debes proporcionar `employee_id` O `employee_cedula`, al menos uno es requerido.

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "message": "Marcación de entrada registrada exitosamente",
  "attendance": {
    "id": "uuid-del-registro",
    "user_id": "uuid-del-usuario",
    "employee_id": "uuid-del-empleado",
    "check_time": "2026-01-14T08:30:00Z",
    "check_type": "IN",
    "device_id": "HUELLERO-001",
    "location": "Sede Principal",
    "notes": "Marcación automática",
    "created_at": "2026-01-14T08:30:01Z"
  }
}
```

**Errores:**
- `400`: Datos inválidos o faltantes
- `401`: API Key faltante o inválida
- `404`: Empleado no encontrado
- `405`: Método no permitido (solo POST)
- `500`: Error del servidor

---

### 3. Obtener Registros de Asistencia

Obtiene los registros de asistencia con filtros opcionales.

**Endpoint:** `GET /api-get-attendance`

**Headers:**
```
X-API-Key: tu_api_key
```

**Parámetros de Query (opcionales):**

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| employee_id | string (uuid) | Filtrar por empleado específico |
| start_date | string (ISO 8601) | Fecha/hora de inicio |
| end_date | string (ISO 8601) | Fecha/hora de fin |
| check_type | string | Filtrar por tipo: "IN" o "OUT" |
| limit | number | Límite de registros (por defecto: 100, máximo: 1000) |

**Ejemplo de URL:**
```
GET /api-get-attendance?start_date=2026-01-01&end_date=2026-01-31&check_type=IN&limit=50
```

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "records": [
    {
      "id": "uuid-del-registro",
      "employee_id": "uuid-del-empleado",
      "employee_name": "Juan Pérez",
      "employee_cedula": "1234567890",
      "check_time": "2026-01-14T08:30:00Z",
      "check_type": "IN",
      "device_id": "HUELLERO-001",
      "location": "Sede Principal",
      "notes": "Marcación automática"
    }
  ],
  "count": 1
}
```

**Errores:**
- `401`: API Key faltante o inválida
- `405`: Método no permitido (solo GET)
- `500`: Error del servidor

---

## Ejemplos de Uso

### cURL

**Obtener empleados:**
```bash
curl -X GET "https://taikhnqqedgukkgdoctn.supabase.co/functions/v1/api-employees" \
  -H "X-API-Key: tu_api_key"
```

**Registrar entrada:**
```bash
curl -X POST "https://taikhnqqedgukkgdoctn.supabase.co/functions/v1/api-attendance" \
  -H "X-API-Key: tu_api_key" \
  -H "Content-Type: application/json" \
  -d '{
    "employee_cedula": "1234567890",
    "check_type": "IN",
    "device_id": "HUELLERO-001"
  }'
```

**Obtener registros:**
```bash
curl -X GET "https://taikhnqqedgukkgdoctn.supabase.co/functions/v1/api-get-attendance?start_date=2026-01-01&limit=10" \
  -H "X-API-Key: tu_api_key"
```

### JavaScript/Node.js

```javascript
const API_URL = 'https://taikhnqqedgukkgdoctn.supabase.co/functions/v1';
const API_KEY = 'tu_api_key';

// Obtener empleados
async function getEmployees() {
  const response = await fetch(`${API_URL}/api-employees`, {
    headers: {
      'X-API-Key': API_KEY
    }
  });
  return await response.json();
}

// Registrar asistencia
async function registerAttendance(cedula, checkType) {
  const response = await fetch(`${API_URL}/api-attendance`, {
    method: 'POST',
    headers: {
      'X-API-Key': API_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      employee_cedula: cedula,
      check_type: checkType,
      device_id: 'HUELLERO-001'
    })
  });
  return await response.json();
}

// Obtener registros
async function getAttendance(startDate, endDate) {
  const url = new URL(`${API_URL}/api-get-attendance`);
  url.searchParams.append('start_date', startDate);
  url.searchParams.append('end_date', endDate);

  const response = await fetch(url, {
    headers: {
      'X-API-Key': API_KEY
    }
  });
  return await response.json();
}
```

### Python

```python
import requests
import json

API_URL = 'https://taikhnqqedgukkgdoctn.supabase.co/functions/v1'
API_KEY = 'tu_api_key'

headers = {
    'X-API-Key': API_KEY,
    'Content-Type': 'application/json'
}

# Obtener empleados
def get_employees():
    response = requests.get(f'{API_URL}/api-employees', headers=headers)
    return response.json()

# Registrar asistencia
def register_attendance(cedula, check_type):
    data = {
        'employee_cedula': cedula,
        'check_type': check_type,
        'device_id': 'HUELLERO-001'
    }
    response = requests.post(f'{API_URL}/api-attendance', headers=headers, json=data)
    return response.json()

# Obtener registros
def get_attendance(start_date, end_date):
    params = {
        'start_date': start_date,
        'end_date': end_date
    }
    response = requests.get(f'{API_URL}/api-get-attendance', headers=headers, params=params)
    return response.json()
```

---

## Códigos de Estado HTTP

| Código | Significado |
|--------|-------------|
| 200 | Éxito |
| 400 | Solicitud inválida (datos faltantes o incorrectos) |
| 401 | No autorizado (API Key inválida o faltante) |
| 404 | Recurso no encontrado |
| 405 | Método no permitido |
| 500 | Error interno del servidor |

---

## Notas Importantes

1. **Seguridad**: Mantén tu API Key segura. No la compartas públicamente ni la incluyas en repositorios de código.

2. **Rate Limiting**: Los endpoints tienen límites de tasa. Si realizas demasiadas solicitudes, podrías recibir errores temporales.

3. **Formato de Fechas**: Todas las fechas deben estar en formato ISO 8601 (ejemplo: `2026-01-14T08:30:00Z`).

4. **Zona Horaria**: Se recomienda usar UTC para las marcaciones y convertir a la zona horaria local en tu aplicación.

5. **Identificación de Empleados**: Puedes usar `employee_id` (UUID) o `employee_cedula` para identificar empleados. La cédula es más conveniente para dispositivos biométricos.

---

## Soporte

Para soporte técnico o reportar problemas, contacta al administrador del sistema.
