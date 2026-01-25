# Google Drive Export Flow - Documentación

## Descripción General

El sistema de exportación a Google Drive ha sido completamente implementado con las siguientes características:

1. **Autenticación automática** con Google OAuth 2.0
2. **Creación de carpetas automática** con estructura jerárquica
3. **Generación de PDF** con datos de nómina
4. **Almacenamiento seguro** de tokens en Supabase

---

## Flujo de Exportación

### 1. Usuario presiona botón "A Drive"

El componente `ExportToDrive` se dispara desde [Payroll.tsx](src/components/Payroll/Payroll.tsx#L931) con los siguientes datos:

```typescript
<ExportToDrive
  periodName={`${viewingCalculation.period_start} a ${viewingCalculation.period_end}`}
  periodData={{
    period: `${viewingCalculation.period_start} a ${viewingCalculation.period_end}`,
    employee: viewingCalculation.employee_name,
    cedula: viewingCalculation.employee_cedula,
    netSalary: viewingCalculation.net_salary,
    timestamp: new Date().toISOString(),
  }}
  onExportSuccess={() => {
    alert('Nómina exportada exitosamente a Google Drive');
  }}
/>
```

---

### 2. Verificar autenticación

Si el usuario **no tiene token almacenado**:
- Se abre una ventana con Google Sign-In
- Usuario inicia sesión
- Token se guarda automáticamente en Supabase tabla `user_google_tokens`

Si el usuario **tiene token almacenado**:
- Se valida que no esté expirado
- Se reutiliza el token existente

---

### 3. Crear estructura de carpetas (Automático)

#### **Paso 1: Carpeta Principal**
- Nombre: `AXYRA - Nóminas`
- Se crea en la raíz de Google Drive (o se reutiliza si ya existe)
- Función: [getOrCreateDriveFolder()](src/utils/googleDriveExport.ts#L45)

#### **Paso 2: Carpeta del Período**
- Nombre: Se extrae de `periodData.period` (ej: "2026-01-01 A 2026-01-31")
- Se crea dentro de la carpeta principal
- Formato: Espacios se reemplazan con guiones y se convierte a mayúsculas
- Ejemplo: `2026-01-01-A-2026-01-31`

#### **Paso 3: Carpeta del Empleado**
- Nombre: `{NOMBRE_EMPLEADO}_{CEDULA}`
- Se crea dentro de la carpeta del período
- Formato del nombre: Mayúsculas, espacios se reemplazan con guiones bajos
- Ejemplo: `JUAN_FERNANDO_URAN_1046666450`

```
AXYRA - Nóminas/
├── 2026-01-01-A-2026-01-31/
│   ├── JUAN_FERNANDO_URAN_1046666450/
│   │   └── Nomina_2026-01-01_a_2026-01-31_2026-01-25.pdf
```

---

### 4. Generar PDF

El PDF se genera en memoria usando HTML simplificado con la siguiente estructura:

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
    <style>
      body { font-family: Arial, sans-serif; margin: 20px; }
      .header { background-color: #4CAF50; color: white; ... }
      table { width: 100%; border-collapse: collapse; ... }
    </style>
  </head>
  <body>
    <div class="header">
      <h1>AXYRA - Nómina</h1>
    </div>
    <table>
      <tr><th>Campo</th><th>Valor</th></tr>
      <tr><td>Período</td><td>2026-01-01 a 2026-01-31</td></tr>
      <tr><td>Empleado</td><td>JUAN FERNANDO URAN</td></tr>
      <tr><td>Cédula</td><td>1046666450</td></tr>
      <tr><td>Salario Neto</td><td>1500000</td></tr>
      <tr><td>Fecha de Exportación</td><td>25/01/2026 14:30:00</td></tr>
    </table>
  </body>
</html>
```

Función: [generatePDF()](src/components/HourRecords/ExportToDrive.tsx#L29)

---

### 5. Subir archivo a Drive

Proceso de **dos pasos** (Two-Step Upload):

#### **Paso 1: Crear metadatos del archivo**
```
POST /files
Content-Type: application/json

{
  "name": "Nomina_2026-01-01_a_2026-01-31_2026-01-25.pdf",
  "mimeType": "application/pdf",
  "parents": ["1UHyjEXDXAP66dtZUNGUFr9aPKkYX-x6k"]  // employee folder ID
}
```

Respuesta: `{ "id": "1A98yfdIAkShry-Ij5lGDGv4q7N2EdTnX" }`

#### **Paso 2: Subir contenido del archivo**
```
PATCH /files/{fileId}?uploadType=media
Content-Type: application/pdf

[Binary PDF content]
```

Función: [uploadFileToDrive()](src/utils/googleDriveExport.ts#L105)

---

## Componentes Involucrados

### 1. [ExportToDrive.tsx](src/components/HourRecords/ExportToDrive.tsx)
**Propósito**: Componente React que maneja la UI y flujo de exportación

**Funciones principales**:
- `handleExportToDrive()`: Orquesta todo el proceso
- `generatePDF()`: Crea blob de PDF en memoria

**Estado**:
- `loading`: Mostrar spinner durante la exportación
- `error`: Mostrar mensaje de error
- `success`: Mostrar confirmación de éxito

---

### 2. [googleDriveExport.ts](src/utils/googleDriveExport.ts)
**Propósito**: Funciones auxiliares de la API de Google Drive

**Funciones**:
- `findDriveFolder()`: Busca carpeta existente por nombre
- `getOrCreateDriveFolder()`: Obtiene o crea carpeta (idempotente)
- `uploadFileToDrive()`: Sube archivo usando two-step upload
- `getDriveFiles()`: Lista archivos del usuario
- `shareFileOnDrive()`: Comparte archivo con permisos

---

### 3. [useGoogleDriveAuthSimple.ts](src/hooks/useGoogleDriveAuthSimple.ts)
**Propósito**: Hook de React para gestionar autenticación y tokens

**Funciones**:
- `initiateGoogleAuth()`: Abre ventana de sign-in
- `handleGoogleCallback()`: Intercambia código por token
- `getStoredToken()`: Recupera token de Supabase (valida expiración)

---

### 4. [/api/google-token.ts](api/google-token.ts)
**Propósito**: Endpoint de Vercel que intercambia auth code por access token

**Solicitud**:
```json
{
  "code": "4/0AY0e-g...",
  "redirectUri": "https://axyra.vercel.app/auth/google/callback"
}
```

**Respuesta**:
```json
{
  "success": true,
  "access_token": "ya29.a0AUMWg...",
  "refresh_token": "1//0gU...",
  "expires_in": 3599
}
```

---

## Base de Datos

### Tabla: `user_google_tokens`

```sql
CREATE TABLE user_google_tokens (
  id UUID PRIMARY KEY,
  user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  token_type VARCHAR(20) DEFAULT 'Bearer',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE user_google_tokens ENABLE ROW LEVEL SECURITY;

-- Users can view their own tokens
CREATE POLICY "Users can view own tokens" ON user_google_tokens
  FOR SELECT USING (auth.uid() = user_id);

-- Users can create their own tokens
CREATE POLICY "Users can create own tokens" ON user_google_tokens
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own tokens
CREATE POLICY "Users can update own tokens" ON user_google_tokens
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own tokens
CREATE POLICY "Users can delete own tokens" ON user_google_tokens
  FOR DELETE USING (auth.uid() = user_id);
```

---

## Variables de Entorno

### En Vercel Settings

```env
GOOGLE_CLIENT_ID=<your-google-client-id>
GOOGLE_CLIENT_SECRET=<your-google-client-secret>
```

**Nota**: Estas credenciales son específicas del proyecto y se encuentran en Google Cloud Console. No se deben compartir públicamente.

### En `.env.local` (desarrollo local)

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

---

## Logs de Depuración

El sistema registra toda la operación en la consola del navegador:

```
Export: Creating folder structure...
Export: Main folder created: 1UHyjEXDXAP66dtZUNGUFr9aPKkYX-x6k
Export: Period folder created: 1B2CdXyZ...
Export: Employee folder created: 1F3GeHaB...
Export: Uploading file to employee folder...
uploadFileToDrive: Step 1 - Creating file metadata
uploadFileToDrive: Step 1 SUCCESS - File created with ID: 1A98yfdIAkShry-Ij5lGDGv4q7N2EdTnX
uploadFileToDrive: Step 2 - Uploading content
uploadFileToDrive: Step 2 SUCCESS - File uploaded
uploadFileToDrive: COMPLETE - File ID: 1A98yfdIAkShry-Ij5lGDGv4q7N2EdTnX
Export: SUCCESS - File uploaded with ID: 1A98yfdIAkShry-Ij5lGDGv4q7N2EdTnX
```

---

## Manejo de Errores

El sistema captura y reporta los siguientes errores:

| Error | Causa | Solución |
|-------|-------|----------|
| "Usuario no autenticado" | No hay sesión activa | Iniciar sesión en la app |
| "Autenticación cancelada" | Usuario rechazó Google Sign-In | Intentar de nuevo |
| "No se pudo crear carpeta principal" | Error de API de Drive | Verificar permisos de Drive |
| "No se pudo crear carpeta del período" | Error anidando en carpeta principal | Verificar estructura de Drive |
| "No se pudo crear carpeta del empleado" | Error anidando en carpeta del período | Verificar estructura de Drive |
| "No se pudo subir el archivo a Google Drive" | Error al crear/subir archivo | Verificar cuota de Drive |

Todos los errores se muestran en la UI con fondo rojo.

---

## Prueba del Sistema

### 1. Acceder a la sección de Nóminas
```
App → Menú → Nóminas
```

### 2. Generar una nómina
```
Seleccionar empleado → Ingresar rango de fechas → Generar nómina
```

### 3. Presionar botón "A Drive"
```
Botón azul "A Drive" en la sección de acciones
```

### 4. Verificar en Google Drive
```
Abrir Google Drive → AXYRA - Nóminas → {Período} → {Empleado} → PDF
```

---

## Arquitectura de Seguridad

### OAuth 2.0 Authorization Code Flow
```
1. Usuario presiona "A Drive"
2. App abre: https://accounts.google.com/o/oauth2/v2/auth?client_id=...&redirect_uri=...
3. Usuario autoriza en Google
4. Google redirige a: https://axyra.vercel.app/auth/google/callback?code=...
5. GoogleCallback.tsx captura el code
6. App envía code a: /api/google-token.ts
7. Vercel intercambia code por access_token
8. App guarda token en Supabase con encriptación
9. Token se usa solo para operaciones en Drive
```

### Protección de Tokens
- **Almacenamiento**: Supabase con RLS policies (solo usuario puede ver su token)
- **Transmisión**: HTTPS (automático en Vercel)
- **Expiración**: Se valida antes de cada uso
- **Refrescado**: Automático usando refresh_token

### Permisos de Drive
- **Scope**: `https://www.googleapis.com/auth/drive.file`
- **Limitación**: Solo puede crear archivos/carpetas en la app
- **No puede**: Acceder a otros archivos/carpetas del usuario

---

## Commits Relacionados

```
commit 40c9238 (HEAD -> main)
feat: Implement automatic folder hierarchy and PDF generation for Drive exports

- Create nested folder structure: AXYRA - Nóminas → Period → Employee → File
- Generate PDF instead of CSV with payroll period data
- Auto-format employee folder name: EMPLOYEE_NAME_CEDULA
- Support dynamic MIME type detection based on file extension
- Add detailed console logging for folder/file creation flow

 2 files changed, 76 insertions(+), 39 deletions(-)
 src/components/HourRecords/ExportToDrive.tsx | 55 +++++++++++++++++--
 src/utils/googleDriveExport.ts               | 21 +++++--
```

---

## Próximos Pasos Opcionales

- [ ] Mejorar diseño del PDF (incluir tabla de horas, deducciones, etc.)
- [ ] Agregar opción de descargar PDF sin subir a Drive
- [ ] Implementar batch export (múltiples empleados a la vez)
- [ ] Agregar validación de permisos de Drive antes de intentar crear carpetas
- [ ] Implementar reintentos automáticos en caso de error temporal
- [ ] Agregar opción de compartir carpeta con empleado
- [ ] Crear historial de exportaciones en la base de datos

---

## Referencias

- [Google Drive API v3 Documentation](https://developers.google.com/drive/api/v3/about-sdk)
- [OAuth 2.0 Authorization Code Flow](https://developers.google.com/identity/protocols/oauth2/web-server-flow)
- [Supabase Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Vercel Serverless Functions](https://vercel.com/docs/functions/serverless-functions)
