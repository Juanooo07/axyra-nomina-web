# Guía de Instalación - AXYRA Nómina V2

## Requisitos Previos

- Node.js 18 o superior
- npm o yarn
- Cuenta de Supabase (gratuita)

## Paso 1: Clonar o Descargar el Proyecto

```bash
# Si tienes el repositorio
git clone [URL_DEL_REPOSITORIO]
cd axyra-nomina

# O simplemente descomprimir el archivo ZIP
```

## Paso 2: Instalar Dependencias

```bash
npm install
```

## Paso 3: Configurar Supabase

### 3.1. Crear Proyecto en Supabase

1. Ir a https://supabase.com
2. Crear una cuenta o iniciar sesión
3. Crear un nuevo proyecto
4. Esperar a que el proyecto se inicialice (2-3 minutos)

### 3.2. Obtener Credenciales

1. En el proyecto de Supabase, ir a Settings → API
2. Copiar:
   - `Project URL`
   - `anon/public` key

### 3.3. Configurar Variables de Entorno

Editar el archivo `.env` en la raíz del proyecto:

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu_clave_anon_aqui
```

### 3.4. Aplicar Migraciones

**NOTA**: La migración ya fue aplicada. Si necesitas aplicarla manualmente:

1. Ir a Supabase Dashboard → SQL Editor
2. Copiar el contenido del archivo de migración
3. Ejecutar el SQL

La migración crea automáticamente:
- Todas las tablas necesarias
- Políticas de seguridad (RLS)
- Funciones y triggers
- Tipos de hora predefinidos para cada empresa

## Paso 4: Iniciar la Aplicación

### Modo Desarrollo

```bash
npm run dev
```

La aplicación estará disponible en: `http://localhost:5173`

### Modo Producción

```bash
npm run build
npm run preview
```

## Paso 5: Primer Uso

### 5.1. Crear Usuario

1. Abrir la aplicación
2. Hacer clic en "¿No tienes cuenta? Regístrate"
3. Llenar el formulario de registro
4. Iniciar sesión

### 5.2. Crear Primera Empresa

1. Una vez dentro, ir a "Empresas"
2. Hacer clic en "Nueva Empresa"
3. Llenar los datos legales:
   - Razón Social
   - NIT
   - Dirección
   - Teléfono
   - Email
4. Hacer clic en "Crear"

**Nota**: Al crear la empresa se generan automáticamente:
- 10 tipos de hora predefinidos
- Configuración inicial con:
  - Salario mínimo: $1,423,500
  - Auxilio transporte: $200,000
  - Salud: 4%
  - Pensión: 4%
  - Horas base: 220

### 5.3. Agregar Empleados

1. Ir a "Empleados"
2. Hacer clic en "Nuevo Empleado"
3. Llenar información:
   - Nombre completo
   - Cédula (única por empresa)
   - Tipo de contrato
   - Salario mensual
4. Guardar

### 5.4. Registrar Horas

1. Ir a "Registro de Horas"
2. Hacer clic en "Registrar Horas"
3. Seleccionar:
   - Empleado
   - Quincena (ej: 2026-01-Q1)
   - Tipo de hora
   - Cantidad de horas
4. Opcionalmente marcar deudas
5. Guardar

### 5.5. Calcular Nómina

1. Ir a "Cálculo de Nómina"
2. Ingresar quincena
3. Seleccionar empleados (Ctrl/Cmd + clic para múltiples)
4. Hacer clic en "Calcular Nómina"
5. Revisar detalles
6. Hacer clic en "Guardar Nómina" para cada empleado

## Despliegue en Producción

### Opción 1: Vercel (Recomendado)

```bash
# Instalar Vercel CLI
npm i -g vercel

# Desplegar
vercel
```

### Opción 2: Netlify

```bash
# Instalar Netlify CLI
npm i -g netlify-cli

# Desplegar
netlify deploy --prod
```

### Opción 3: Servidor Propio (VPS)

```bash
# Construir
npm run build

# Los archivos estarán en la carpeta /dist
# Copiar a tu servidor web (Nginx, Apache, etc.)
```

## Configuración del Servidor Web

### Nginx

```nginx
server {
    listen 80;
    server_name tu-dominio.com;

    root /ruta/al/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

### Apache (.htaccess)

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

## Solución de Problemas

### Error: "Missing Supabase environment variables"

Verificar que el archivo `.env` existe y tiene las variables correctas.

### Error en la autenticación

1. Verificar las credenciales en `.env`
2. Confirmar que el proyecto de Supabase está activo
3. Revisar la consola del navegador para más detalles

### Empleados no aparecen

Verificar que tienes una empresa seleccionada y que el usuario tiene acceso a ella.

### Cálculo de nómina no funciona

1. Asegurarse de tener registros de horas para esa quincena
2. Verificar que los empleados seleccionados tienen horas registradas
3. Confirmar la configuración de la empresa

## Contacto y Soporte

Para soporte técnico: contactar a Villa Venecia

## Actualizaciones

Para actualizar el sistema:

```bash
git pull origin main
npm install
npm run build
```
