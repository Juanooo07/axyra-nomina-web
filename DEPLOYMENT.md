# Guía de Despliegue - AXYRA Nómina

## Estado Actual

✅ Código completado y probado
✅ Logo integrado en toda la aplicación
✅ Git inicializado y archivos committeados
✅ Remote configurado: https://github.com/axyra-app/axyra-nomina-web.git

## Paso 1: Subir a GitHub

El código ya está listo para subir. Solo necesitas autenticarte:

### Opción A: Usar GitHub CLI (Recomendado)

```bash
# Si no tienes GitHub CLI instalado
# Windows: winget install GitHub.cli
# Mac: brew install gh
# Linux: https://github.com/cli/cli/blob/trunk/docs/install_linux.md

# Autenticarse
gh auth login

# Hacer push
git push -u origin main
```

### Opción B: Usar Personal Access Token

1. Ve a GitHub: https://github.com/settings/tokens
2. Click en "Generate new token" → "Generate new token (classic)"
3. Dale un nombre: "AXYRA Nomina Deploy"
4. Selecciona permisos: `repo` (todos los sub-permisos)
5. Click en "Generate token"
6. Copia el token (solo se muestra una vez)

Luego ejecuta:

```bash
# Reemplaza YOUR_TOKEN con el token que copiaste
git push https://YOUR_TOKEN@github.com/axyra-app/axyra-nomina-web.git main
```

### Opción C: Desde tu computadora local

Si estás trabajando en una terminal local con Git configurado:

```bash
# Simplemente ejecuta
git push -u origin main
```

## Paso 2: Desplegar en Vercel

### 2.1. Conectar Repositorio

1. Ve a https://vercel.com
2. Click en "Add New" → "Project"
3. Selecciona "Import Git Repository"
4. Busca y selecciona: `axyra-app/axyra-nomina-web`
5. Click en "Import"

### 2.2. Configurar Variables de Entorno

En la sección "Environment Variables", agrega:

```
VITE_SUPABASE_URL = https://taikhnqqedgukkgdoctn.supabase.co
VITE_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRhaWtobnFxZWRndWtrZ2RvY3RuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgyNjg4MjUsImV4cCI6MjA4Mzg0NDgyNX0.IQ8SySfNhMvxMMlodD1QoEHkYxzIA_XKRrBTI9zWxPQ
```

### 2.3. Configuración de Build

Vercel detectará automáticamente que es un proyecto Vite y configurará:

- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### 2.4. Desplegar

1. Click en "Deploy"
2. Espera 1-2 minutos mientras se construye
3. ¡Listo! Tu aplicación estará en línea

## Paso 3: Configurar Dominio (Opcional)

1. En Vercel, ve a tu proyecto
2. Click en "Settings" → "Domains"
3. Agrega tu dominio personalizado
4. Sigue las instrucciones para configurar DNS

## URLs Importantes

- **Repositorio GitHub**: https://github.com/axyra-app/axyra-nomina-web
- **Vercel Dashboard**: https://vercel.com/dashboard
- **Supabase Dashboard**: https://supabase.com/dashboard

## Actualizaciones Futuras

Cada vez que hagas cambios y los subas a GitHub, Vercel automáticamente:

1. Detectará el push
2. Construirá la nueva versión
3. Desplegará automáticamente

Para hacer cambios:

```bash
# Hacer cambios en el código
# Agregar archivos modificados
git add .

# Hacer commit
git commit -m "Descripción de los cambios"

# Subir a GitHub
git push origin main
```

## Verificación Post-Despliegue

Una vez desplegado, verifica:

- [ ] La aplicación carga correctamente
- [ ] El logo se muestra en login, registro y navbar
- [ ] Puedes registrar una cuenta
- [ ] Puedes iniciar sesión
- [ ] El dashboard se muestra correctamente
- [ ] Todas las secciones funcionan sin errores

## Solución de Problemas

### Error: "Missing environment variables"

Verifica que las variables de entorno estén configuradas en Vercel:
- Settings → Environment Variables

### Error de build en Vercel

1. Revisa los logs de build en Vercel
2. Asegúrate de que package.json tiene todas las dependencias
3. Verifica que el comando de build sea correcto

### Aplicación en blanco después de desplegar

1. Abre la consola del navegador (F12)
2. Revisa si hay errores de JavaScript
3. Verifica que las variables de entorno estén correctas

## Soporte

Para cualquier problema, verifica:
1. Los logs en Vercel Dashboard
2. La consola del navegador (F12 → Console)
3. El Supabase Dashboard para verificar la base de datos

¡Tu aplicación está lista para ser usada en producción!
