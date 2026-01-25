# Google Drive Export - Quick Start Guide

## Para Usuarios

### ¿Cómo exportar una nómina a Google Drive?

1. **Accede a la sección Nóminas**
   - Haz clic en el menú principal
   - Selecciona "Nóminas"

2. **Selecciona un empleado**
   - Despliega el selector de empleados
   - Elige el empleado para el cual deseas generar la nómina

3. **Define el rango de fechas**
   - Especifica la fecha de inicio
   - Especifica la fecha final
   - Presiona "Generar nómina"

4. **Presiona el botón "A Drive"**
   - Busca el botón azul "A Drive" en los controles de acciones
   - Si es tu primera vez, se abrirá una ventana de Google para autorizar la app
   - Sigue las instrucciones de autorización

5. **¡Listo!**
   - Verás el mensaje "✅ Exportado!"
   - El archivo PDF se ha creado automáticamente en Google Drive

### ¿Dónde está mi archivo en Google Drive?

Los archivos se organizan así:

```
Mi Drive
└── AXYRA - Nóminas
    └── 2026-01-01-A-2026-01-31          (período)
        └── JUAN_FERNANDO_URAN_1046666450  (empleado)
            └── Nomina_2026-01-01_a_2026-01-31_2026-01-25.pdf
```

**Ruta simplificada**: `AXYRA - Nóminas → [Período] → [Empleado] → PDF`

### ¿Qué contiene el PDF?

El archivo PDF contiene:
- **Período**: Rango de fechas de la nómina
- **Empleado**: Nombre completo
- **Cédula**: Número de identificación
- **Salario Neto**: Monto final a pagar
- **Fecha de Exportación**: Cuándo se generó el PDF

### Preguntas Frecuentes

**P: ¿Necesito autorizar cada vez?**
R: No. La primera vez se abre Google Sign-In. Después, el sistema guarda tu autorización y la reutiliza automáticamente.

**P: ¿Dónde se guarda mi token?**
R: En Supabase (nube segura) con encriptación. Solo tú puedes verlo.

**P: ¿Qué permisos le doy a la app?**
R: Solo el permiso para crear archivos en Google Drive. La app no puede ver tus otros archivos.

**P: ¿Puedo compartir el archivo con otros?**
R: Sí, una vez en Google Drive, comparte la carpeta o el archivo normalmente.

**P: ¿Puedo exportar múltiples empleados a la vez?**
R: Actualmente, uno a uno. Cada nómina requiere presionar "A Drive" por separado.

---

## Para Desarrolladores

### Estructura de Carpetas en el Código

```
src/
├── components/
│   ├── HourRecords/
│   │   └── ExportToDrive.tsx          ← Componente principal
│   └── Payroll/
│       └── Payroll.tsx                 ← Llama a ExportToDrive
├── utils/
│   └── googleDriveExport.ts            ← Funciones de API de Drive
├── hooks/
│   └── useGoogleDriveAuthSimple.ts     ← Gestión de tokens
├── lib/
│   └── supabase.ts                     ← Cliente de Supabase
└── contexts/
    └── AuthContext.tsx                 ← Contexto de autenticación

api/
└── google-token.ts                     ← Endpoint Vercel para OAuth

supabase/
├── migrations/
│   └── *_create_google_tokens.sql      ← Crear tabla de tokens
```

### Entidades Principales

#### 1. `ExportToDrive.tsx`
**Responsabilidad**: UI + orquestación del flujo

**Props**:
```typescript
interface ExportToDriveProps {
  periodName: string;        // "2026-01-01 a 2026-01-31"
  periodData: {
    period?: string;         // Período completo
    employee?: string;       // Nombre del empleado
    cedula?: string;         // Cédula/ID
    netSalary?: number;      // Salario neto
    timestamp?: string;      // ISO timestamp
    [key: string]: unknown;
  };
  onExportSuccess?: () => void;
}
```

**Estado**:
- `loading`: boolean (mostrar spinner)
- `error`: string | null (mensaje de error)
- `success`: boolean (mostrar confirmación)

**Métodos principales**:
- `handleExportToDrive()`: Orquesta todo el proceso
- `generatePDF()`: Genera blob de PDF

#### 2. `googleDriveExport.ts`
**Responsabilidad**: Funciones de API de Google Drive

**Funciones exportadas**:
```typescript
// Buscar carpeta existente
findDriveFolder(
  accessToken: string,
  folderName: string,
  parentFolderId?: string
): Promise<string | null>

// Obtener o crear carpeta (idempotente)
getOrCreateDriveFolder(
  accessToken: string,
  folderName: string,
  parentFolderId?: string
): Promise<string | null>

// Subir archivo a Drive
uploadFileToDrive(
  accessToken: string,
  fileName: string,
  fileContent: Blob,
  parentFolderId?: string
): Promise<string | null>
```

#### 3. `useGoogleDriveAuthSimple.ts`
**Responsabilidad**: Gestión del ciclo de vida del token

**Funciones exportadas**:
```typescript
// Inicia Google Sign-In
initiateGoogleAuth(): void

// Maneja el callback de OAuth
handleGoogleCallback(code: string): Promise<void>

// Obtiene token de Supabase
getStoredToken(): Promise<{
  access_token: string;
  refresh_token: string;
  expires_at: string;
} | null>
```

#### 4. `/api/google-token.ts`
**Responsabilidad**: Intercambio seguro de código por token en backend

**Entrada**:
```json
{
  "code": "4/0AY0e-g...",
  "redirectUri": "https://axyra.vercel.app/auth/google/callback"
}
```

**Salida**:
```json
{
  "success": true,
  "access_token": "ya29.a0AUMWg...",
  "refresh_token": "1//0gU...",
  "expires_in": 3599
}
```

### Flujo de Datos

```
User Input (presiona botón "A Drive")
         ↓
ExportToDrive.handleExportToDrive()
         ↓
¿Token válido?
   ├─ NO: useGoogleDriveAuthSimple.initiateGoogleAuth()
   │       → Abre Google Sign-In
   │       → handleGoogleCallback(code)
   │       → /api/google-token.ts
   │       → Guarda en Supabase
   └─ SÍ: useGoogleDriveAuthSimple.getStoredToken()
         ↓
getOrCreateDriveFolder() [x3]
   ├─ Carpeta principal
   ├─ Carpeta período
   └─ Carpeta empleado
         ↓
generatePDF()
   → HTML → Blob
         ↓
uploadFileToDrive() [Two-step]
   ├─ Step 1: POST metadatos
   └─ Step 2: PATCH contenido
         ↓
setSuccess(true)
   → Mostrar "✅ Exportado!"
```

### Variables de Entorno

**En Vercel (Settings → Environment Variables)**:
```env
GOOGLE_CLIENT_ID=<your-google-client-id>
GOOGLE_CLIENT_SECRET=<your-google-client-secret>
```

**Nota**: Las credenciales se encuentran en Google Cloud Console y en el dashboard de Vercel. No expongas estas variables en repositorios públicos.

**En `.env.local` (desarrollo)**:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### Testing

#### Test Manual

1. **Compilar**:
   ```bash
   npm run build
   ```

2. **Servidor local**:
   ```bash
   npm run dev
   ```

3. **Probar flujo**:
   - Navega a http://localhost:5173
   - Ve a Nóminas
   - Genera una nómina
   - Presiona "A Drive"
   - Autoriza con Google
   - Verifica en Google Drive

#### Test de Errores

**Error de autenticación**:
- Revoca acceso en Google (myaccount.google.com)
- Prueba de nuevo el flujo

**Error de Drive**:
- Verifica permisos en Google Drive API Console
- Comprueba que no hay cuota agotada

**Error de token**:
- Abre DevTools → Console
- Busca logs de "Export:" para depuración
- Verifica Supabase → user_google_tokens

### Logs de Depuración

Todos los pasos se registran en la consola:

```javascript
console.log('Export: Creating folder structure...');
console.log('Export: Main folder created:', mainFolderId);
console.log('Export: Period folder created:', periodFolderId);
console.log('Export: Employee folder created:', employeeFolderId);
console.log('Export: Uploading file to employee folder...');
console.log('uploadFileToDrive: Step 1 - Creating file metadata');
console.log('uploadFileToDrive: Step 1 SUCCESS - File created with ID:', fileId);
console.log('uploadFileToDrive: Step 2 - Uploading content');
console.log('uploadFileToDrive: Step 2 SUCCESS - File uploaded');
console.log('uploadFileToDrive: COMPLETE - File ID:', fileId);
console.log('Export: SUCCESS - File uploaded with ID:', fileId);
```

### Mejoras Futuras

- [ ] **PDF mejorado**: Incluir tabla de horas, deducciones, descuentos
- [ ] **Batch export**: Exportar múltiples empleados de una vez
- [ ] **Validación de permisos**: Verificar Drive API antes de intentar subir
- [ ] **Reintentos automáticos**: Si falla, reintentar 3 veces
- [ ] **Compartir automático**: Compartir carpeta con empleado
- [ ] **Historial**: Guardar registro de exportaciones en la BD
- [ ] **Descarga local**: Opción de descargar PDF sin subir a Drive
- [ ] **Notificaciones**: Avisar al empleado cuando se exporta su nómina

### Recursos

- [Google Drive API Documentation](https://developers.google.com/drive/api/v3/about-sdk)
- [OAuth 2.0 Authorization Code Flow](https://developers.google.com/identity/protocols/oauth2/web-server-flow)
- [Google Sign-In for Web](https://developers.google.com/identity/gsi/web)
- [Supabase Auth Integration](https://supabase.com/docs/guides/auth)
- [Vercel Serverless Functions](https://vercel.com/docs/functions/serverless-functions)

---

## Soporte

Si encuentras problemas:

1. **Verifica los logs** en la consola del navegador (F12 → Console)
2. **Revisa Supabase** en la tabla `user_google_tokens` para el token
3. **Comprueba Google Drive** que la carpeta AXYRA - Nóminas exista
4. **Reinicia la sesión** revocando acceso en myaccount.google.com
5. **Contacta al equipo técnico** con screenshot del error

