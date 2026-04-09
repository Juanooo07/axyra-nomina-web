# Credenciales de API - AXYRA Nómina

## Tu API Key Generada

**IMPORTANTE: Guarda esta información en un lugar seguro. No compartas tu API Key públicamente.**

### API Key Principal

```
axyra_be52ad7c4a4848b1acb4bc5c183e3feb
```

**Nombre:** Huellero Principal
**Estado:** Activa
**Fecha de creación:** 2026-01-14

---

## Uso de la API Key

Esta API Key te permite conectar dispositivos externos (como huelleros biométricos) con tu sistema de nómina.

### Incluir en tus solicitudes HTTP

```bash
X-API-Key: axyra_be52ad7c4a4848b1acb4bc5c183e3feb
```

### Ejemplo completo

```bash
curl -X GET "https://taikhnqqedgukkgdoctn.supabase.co/functions/v1/api-employees" \
  -H "X-API-Key: axyra_be52ad7c4a4848b1acb4bc5c183e3feb"
```

---

## Endpoints Disponibles

### 1. Obtener Empleados
```
GET /api-employees
```

### 2. Registrar Asistencia
```
POST /api-attendance
```

### 3. Obtener Registros de Asistencia
```
GET /api-get-attendance
```

---

## Documentación Completa

Consulta el archivo `API_DOCUMENTATION.md` para ver la documentación completa de la API con ejemplos detallados.

---

## Generar Nuevas API Keys

Para generar más API Keys (por ejemplo, para diferentes dispositivos), consulta el archivo `API_SCRIPTS.sql` que contiene scripts SQL útiles.

---

## Seguridad

- ⚠️ **NO compartas** tu API Key en repositorios públicos
- ⚠️ **NO incluyas** tu API Key en código del lado del cliente
- ✅ **USA** la API Key solo en servidores o dispositivos seguros
- ✅ **DESACTIVA** cualquier API Key comprometida inmediatamente

Para desactivar esta API Key, ejecuta:

```sql
UPDATE api_keys
SET is_active = false
WHERE api_key = 'axyra_be52ad7c4a4848b1acb4bc5c183e3feb';
```

---

## Soporte

Si tienes problemas con la API, revisa los códigos de error en la documentación o contacta al administrador del sistema.
