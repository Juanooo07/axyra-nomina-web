# Google Drive Export - Diagrama del Flujo

## 1. Flujo de Exportación de Nómina

```
┌─────────────────────────────────────────────────────────────────┐
│                   Usuario en Página de Nómina                    │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│           Presiona botón "A Drive" (ExportToDrive.tsx)           │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          ▼
                   ¿Token válido?
                    /        \
                  NO/          \YES
                 /               \
                ▼                 ▼
    ┌──────────────────┐   ┌─────────────────────┐
    │ Abrir Google     │   │ Usar token          │
    │ Sign-In          │   │ almacenado          │
    │                  │   │                     │
    │ (window abierta) │   │ (sin re-autenticar) │
    └────────┬─────────┘   └────────┬────────────┘
             │                      │
             └──────────┬───────────┘
                        ▼
            ┌────────────────────────────┐
            │ ¿Tiene token en Supabase?  │
            │ ¿No está expirado?         │
            └────────────┬───────────────┘
                         │
                         ▼
        ┌────────────────────────────────────┐
        │ Token validado y listo para usar   │
        └────────┬─────────────────────────┘
                 │
                 ▼
        ╔════════════════════════════════════╗
        ║  CREAR ESTRUCTURA DE CARPETAS      ║
        ║  (Automático - no requiere input)  ║
        ╚════════════────┬═══════════════════╝
                         │
         ┌───────────────┼───────────────┐
         │               │               │
         ▼               ▼               ▼
    ┌──────────┐   ┌──────────┐   ┌──────────┐
    │ Carpeta  │   │ Carpeta  │   │ Carpeta  │
    │ Principal│───│ Período  │───│ Empleado │
    │          │   │          │   │          │
    │ AXYRA -  │   │2026-01-01│   │JUAN_     │
    │Nóminas   │   │A-2026-   │   │FERNANDO_ │
    │          │   │01-31     │   │URAN_     │
    │          │   │          │   │1046666450│
    └──────────┘   └──────────┘   └────┬─────┘
                                        │
                                        ▼
                        ┌───────────────────────────┐
                        │ Generar PDF en memoria    │
                        │ (HTML → Blob)             │
                        │                           │
                        │ - Período                 │
                        │ - Empleado                │
                        │ - Cédula                  │
                        │ - Salario neto            │
                        │ - Fecha exportación       │
                        └───────────┬───────────────┘
                                    │
                                    ▼
                    ┌──────────────────────────────┐
                    │ Subir archivo a Drive        │
                    │ (Two-step upload)            │
                    │                              │
                    │ Step 1: POST metadatos       │
                    │ Step 2: PATCH contenido      │
                    └────────────┬─────────────────┘
                                 │
                                 ▼
                    ┌──────────────────────────────┐
                    │ ✓ Exportación exitosa!       │
                    │                              │
                    │ Mostrar:                     │
                    │ "Archivo subido exitosamente │
                    │  a Google Drive"             │
                    └──────────────────────────────┘
```

---

## 2. Estructura de Carpetas en Google Drive

```
Google Drive (raíz)
│
└─ AXYRA - Nóminas/                    ← Carpeta Principal
   │
   ├─ 2026-01-01-A-2026-01-31/         ← Carpeta de Período 1
   │  │
   │  ├─ JUAN_FERNANDO_URAN_1046666450/
   │  │  │
   │  │  └─ Nomina_2026-01-01_a_2026-01-31_2026-01-25.pdf
   │  │
   │  └─ MARIA_GARCIA_LOPEZ_1050000001/
   │     │
   │     └─ Nomina_2026-01-01_a_2026-01-31_2026-01-25.pdf
   │
   ├─ 2026-02-01-A-2026-02-28/         ← Carpeta de Período 2
   │  │
   │  └─ JUAN_FERNANDO_URAN_1046666450/
   │     │
   │     └─ Nomina_2026-02-01_a_2026-02-28_2026-02-25.pdf
   │
   └─ 2026-03-01-A-2026-03-31/         ← Carpeta de Período 3
      │
      └─ JUAN_FERNANDO_URAN_1046666450/
         │
         └─ Nomina_2026-03-01_a_2026-03-31_2026-03-25.pdf
```

---

## 3. Autenticación OAuth 2.0

```
┌──────────┐                                    ┌────────────┐
│          │                                    │            │
│  Usuario │                                    │   Google   │
│          │                                    │            │
└────┬─────┘                                    └─────┬──────┘
     │                                                │
     │ 1. Presiona "A Drive"                        │
     │────────────────────────────────────────────> │
     │                                                │
     │ 2. Google Sign-In Window                     │
     │ <─────────────────────────────────────────── │
     │                                                │
     │ 3. Usuario autoriza app                      │
     │────────────────────────────────────────────> │
     │                                                │
     │ 4. Redirige con code                        │
     │ <─────────────────────────────────────────── │
     │    https://axyra.vercel.app/auth/google/
     │    callback?code=4/0AY0e-g...
     │
     ├─────────────────────────────────────────────────┐
     │ GoogleCallback.tsx captura code                 │
     └─────────────┬─────────────────────────────────┘
                   │
                   │ 5. Envía code a backend
                   │
         ┌─────────▼──────────────┐
         │ /api/google-token.ts   │
         │ (Vercel Function)      │
         └─────────┬──────────────┘
                   │
                   │ 6. Intercambia code por token
                   │
         ┌─────────▼──────────────────────────────┐
         │ POST oauth2.googleapis.com/token        │
         │                                        │
         │ {                                      │
         │   code: "4/0AY0e-g...",                │
         │   client_id: "256776...",              │
         │   client_secret: "GOCSPX-...",         │
         │   grant_type: "authorization_code",    │
         │   redirect_uri: "https://axyra..."     │
         │ }                                      │
         └─────────┬──────────────────────────────┘
                   │
                   │ 7. Google retorna access_token
                   │
         ┌─────────▼─────────────────────────┐
         │ {                                 │
         │   access_token: "ya29.a0AUMWg...",│
         │   refresh_token: "1//0gU...",     │
         │   expires_in: 3599                │
         │ }                                 │
         └─────────┬─────────────────────────┘
                   │
                   │ 8. Token guardado en Supabase
                   │
         ┌─────────▼──────────────────────────┐
         │ INSERT INTO user_google_tokens     │
         │ {                                  │
         │   user_id: "...",                  │
         │   access_token: "ya29...",         │
         │   refresh_token: "1//0...",        │
         │   expires_at: NOW() + 3599 sec     │
         │ }                                  │
         └────────────────────────────────────┘
```

---

## 4. Two-Step File Upload

```
┌────────────────────────────────────────────────────────┐
│          Subir archivo a Google Drive                  │
└────────┬───────────────────────────────────────────────┘
         │
         ▼
    ╔════════════════════════════════════════════════╗
    ║  Step 1: Crear metadatos del archivo           ║
    ║  POST /files?supportsAllDrives=true            ║
    ╚════════┬═══════════════════════════════════════╝
             │
             ▼
    ┌────────────────────────────────────────────────┐
    │ Request Headers:                              │
    │ - Authorization: Bearer {access_token}        │
    │ - Content-Type: application/json              │
    │                                               │
    │ Request Body:                                 │
    │ {                                             │
    │   "name": "Nomina_2026-01-01_a_..._2026.pdf", │
    │   "mimeType": "application/pdf",              │
    │   "parents": ["<employee_folder_id>"]         │
    │ }                                             │
    └────────┬──────────────────────────────────────┘
             │
             ▼
    ┌────────────────────────────────────────────────┐
    │ Response:                                     │
    │ {                                             │
    │   "id": "1A98yfdIAkShry-Ij5lGDGv4q7N2EdTnX",  │
    │   "name": "Nomina_2026-01-01_a_..._2026.pdf"  │
    │ }                                             │
    └────────┬──────────────────────────────────────┘
             │
             ▼
    ╔════════════════════════════════════════════════╗
    ║  Step 2: Subir contenido del archivo           ║
    ║  PATCH /files/{fileId}?uploadType=media       ║
    ╚════════┬═══════════════════════════════════════╝
             │
             ▼
    ┌────────────────────────────────────────────────┐
    │ Request Headers:                              │
    │ - Authorization: Bearer {access_token}        │
    │ - Content-Type: application/pdf               │
    │                                               │
    │ Request Body:                                 │
    │ [Binary PDF content - 5KB-50KB]               │
    └────────┬──────────────────────────────────────┘
             │
             ▼
    ┌────────────────────────────────────────────────┐
    │ Response:                                     │
    │ {                                             │
    │   "id": "1A98yfdIAkShry-Ij5lGDGv4q7N2EdTnX",  │
    │   "name": "Nomina_2026-01-01_a_..._2026.pdf", │
    │   "mimeType": "application/pdf",              │
    │   "size": "12345"                             │
    │ }                                             │
    └────────┬──────────────────────────────────────┘
             │
             ▼
         ✓ SUCCESS
```

---

## 5. Interfaz de Usuario

```
┌─────────────────────────────────────────────────────┐
│  AXYRA - Sistema de Nóminas                         │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│  Período: 2026-01-01 a 2026-01-31                  │
│  Empleado: JUAN FERNANDO URAN                      │
│  Cédula: 1046666450                                │
│                                                    │
│  Salario Base: $2,000,000                          │
│  Horas Extra: $300,000                             │
│  ────────────────────────────────────────────────  │
│  Salario Neto: $2,300,000                          │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│  [Imprimir/PDF]  [  ⬆ A Drive  ]  [Cerrar]        │
│                   ↑                                │
│              Aquí presiona usuario                │
└─────────────────────────────────────────────────────┘

                        ▼

        Estado durante exportación:
        
        ┌──────────────────────────────────┐
        │ [⟳ Subiendo...]                 │
        │ Creando estructura de carpetas... │
        │ Generando PDF...                 │
        │ Subiendo a Drive...              │
        └──────────────────────────────────┘

                        ▼

           Estado de éxito:

        ┌──────────────────────────────────┐
        │ [✅ Exportado!]                  │
        │ ✓ Archivo subido exitosamente    │
        │  a Google Drive                  │
        └──────────────────────────────────┘

                O

           Estado de error:

        ┌──────────────────────────────────┐
        │ [⚠️ Error]                       │
        │ ⚠️ No se pudo crear carpeta      │
        │    del período                   │
        └──────────────────────────────────┘
```

---

## 6. Integración de Componentes

```
Payroll.tsx (padre)
│
├─ Carga datos de nómina
├─ Calcula salario neto
│
└─ Renderiza ExportToDrive.tsx (hijo)
   │
   ├─ Recibe props:
   │  ├─ periodName: "2026-01-01 a 2026-01-31"
   │  └─ periodData:
   │     ├─ period: "2026-01-01 a 2026-01-31"
   │     ├─ employee: "JUAN FERNANDO URAN"
   │     ├─ cedula: "1046666450"
   │     ├─ netSalary: 2300000
   │     └─ timestamp: "2026-01-25T14:30:00Z"
   │
   └─ En handleExportToDrive():
      │
      ├─ Usa useGoogleDriveAuthSimple hook
      │  ├─ getStoredToken() → Token de Supabase
      │  └─ initiateGoogleAuth() → OAuth si es necesario
      │
      ├─ Usa googleDriveExport.ts funciones
      │  ├─ getOrCreateDriveFolder() → Crea carpetas
      │  └─ uploadFileToDrive() → Sube PDF
      │
      └─ Genera PDF internamente
         └─ generatePDF() → HTML → Blob
```

---

## 7. Flujo de Errores

```
                    ¿Error?
                      │
        ┌─────────────┼──────────────┐
        │             │              │
        ▼             ▼              ▼
   
   Captura         Log en         Muestra
   try/catch      consola        en UI
        │             │              │
        └─────────────┼──────────────┘
                      │
                      ▼
              console.error('...')
                      │
                      ▼
          setError('Mensaje para usuario')
                      │
                      ▼
        ┌────────────────────────────┐
        │ <div className="red">      │
        │ {error}                    │
        │ </div>                     │
        └────────────────────────────┘
```

---

## 8. Validaciones Implementadas

```
┌─────────────────────────────────────────┐
│  Antes de exportar                      │
└──────────────┬──────────────────────────┘
               │
        ┌──────┴──────┐
        │             │
        ▼             ▼
   ¿Usuario    ¿Token válido?
   autenticado?  ├─ Existe?
        │        ├─ No expirado?
        │        │
        ▼        ▼
       NO       NO
        │        │
        ├────┬───┘
        │    │
        ▼    ▼
    Error  Abrir
    msg    Google
           Auth
```

---

## 9. Ciclo de Vida del Token

```
┌─────────────────────────────────────────────────────┐
│  Token Lifecycle                                   │
└──────────────┬──────────────────────────────────────┘
               │
               ▼
        Obtener token
        (Google Auth)
               │
               ▼
        Validar código
        (/api/google-token)
               │
               ▼
        Guardar en Supabase
        + expires_at
               │
               ▼
        [Token activo por ~3600 segundos]
               │
               ▼
        Siguiente intento:
        - ¿Expirado?
          ├─ NO: Usar token existente
          └─ SÍ: Pedir nuevo token (Google Auth)
               │
               ▼
        Token actualizado
```

---

## Resumen Técnico

| Componente | Lenguaje | Propósito |
|-----------|----------|----------|
| `ExportToDrive.tsx` | TypeScript/React | UI + orquestación |
| `googleDriveExport.ts` | TypeScript | API de Drive |
| `useGoogleDriveAuthSimple.ts` | TypeScript/React Hook | Gestión de tokens |
| `/api/google-token.ts` | Node.js/Vercel Function | Intercambio OAuth |
| `user_google_tokens` (DB) | PostgreSQL | Almacenamiento seguro |

**Flujo total**: ~5-10 segundos (crear 3 carpetas + generar PDF + subir archivo)

