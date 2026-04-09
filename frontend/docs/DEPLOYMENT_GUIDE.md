# 🚀 Guía de Despliegue - AXYRA

## 📋 Índice

1. [Preparación del Entorno](#preparación-del-entorno)
2. [Configuración de Firebase](#configuración-de-firebase)
3. [Configuración de Vercel](#configuración-de-vercel)
4. [Variables de Entorno](#variables-de-entorno)
5. [Integraciones Externas](#integraciones-externas)
6. [Testing Pre-Despliegue](#testing-pre-despliegue)
7. [Despliegue a Producción](#despliegue-a-producción)
8. [Post-Despliegue](#post-despliegue)
9. [Monitoreo y Mantenimiento](#monitoreo-y-mantenimiento)

## 🛠️ Preparación del Entorno

### Requisitos Previos

- **Node.js**: 16.x o superior
- **npm**: 8.x o superior
- **Git**: 2.x o superior
- **Cuenta Firebase**: Proyecto creado
- **Cuenta Vercel**: Para hosting
- **Dominio**: Opcional, para producción

### Instalación de Herramientas

```bash
# Instalar Vercel CLI
npm i -g vercel

# Instalar Firebase CLI
npm i -g firebase-tools

# Verificar instalaciones
vercel --version
firebase --version
```

## 🔥 Configuración de Firebase

### 1. Crear Proyecto Firebase

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Haz clic en "Crear proyecto"
3. Ingresa el nombre: `axyra-sistema-gestion`
4. Habilita Google Analytics (opcional)
5. Selecciona la región: `us-central1`

### 2. Configurar Authentication

```bash
# En Firebase Console > Authentication > Sign-in method
# Habilitar los siguientes proveedores:
- Email/Password
- Google (para OAuth)
- Microsoft (para OAuth)
```

### 3. Configurar Firestore Database

```bash
# Crear base de datos
# Modo: Producción
# Región: us-central1

# Reglas de seguridad
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Usuarios autenticados pueden leer/escribir sus propios datos
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Empleados - solo usuarios autenticados
    match /employees/{document} {
      allow read, write: if request.auth != null;
    }

    // Inventario - solo usuarios autenticados
    match /inventory/{document} {
      allow read, write: if request.auth != null;
    }

    // Reportes - solo usuarios autenticados
    match /reports/{document} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### 4. Configurar Storage

```bash
# En Firebase Console > Storage
# Crear bucket de almacenamiento
# Región: us-central1
# Reglas de seguridad:

rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### 5. Obtener Configuración

```javascript
// En Firebase Console > Project Settings > General
// Copiar la configuración del proyecto

const firebaseConfig = {
  apiKey: 'AIzaSyBvQvqQvqQvqQvqQvqQvqQvqQvqQvqQ',
  authDomain: 'axyra-sistema-gestion.firebaseapp.com',
  projectId: 'axyra-sistema-gestion',
  storageBucket: 'axyra-sistema-gestion.appspot.com',
  messagingSenderId: '123456789',
  appId: '1:123456789:web:abcdef123456',
};
```

## ⚡ Configuración de Vercel

### 1. Conectar Repositorio

```bash
# En Vercel Dashboard
# 1. Importar proyecto desde GitHub
# 2. Seleccionar repositorio: axyra-sistema-gestion
# 3. Framework: Other
# 4. Root Directory: frontend
```

### 2. Configurar Build Settings

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "frontend",
  "installCommand": "npm install",
  "devCommand": "npm run dev"
}
```

### 3. Configurar Dominio Personalizado (Opcional)

```bash
# En Vercel Dashboard > Settings > Domains
# Agregar dominio personalizado
# Ejemplo: axyra.tudominio.com

# Configurar DNS
# CNAME: axyra -> cname.vercel-dns.com
```

## 🔐 Variables de Entorno

### Variables de Firebase

```bash
# En Vercel Dashboard > Settings > Environment Variables
VITE_FIREBASE_API_KEY=AIzaSyBvQvqQvqQvqQvqQvqQvqQvqQvqQvqQ
VITE_FIREBASE_AUTH_DOMAIN=axyra-sistema-gestion.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=axyra-sistema-gestion
VITE_FIREBASE_STORAGE_BUCKET=axyra-sistema-gestion.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef123456
```

### Variables de Google Workspace

```bash
# Obtener desde Google Cloud Console
VITE_GOOGLE_CLIENT_ID=your_google_client_id
VITE_GOOGLE_CLIENT_SECRET=your_google_client_secret
VITE_GOOGLE_REDIRECT_URI=https://axyra.vercel.app/auth/google/callback
```

### Variables de Microsoft 365

```bash
# Obtener desde Azure Portal
VITE_MICROSOFT_CLIENT_ID=your_microsoft_client_id
VITE_MICROSOFT_CLIENT_SECRET=your_microsoft_client_secret
VITE_MICROSOFT_TENANT_ID=your_tenant_id
VITE_MICROSOFT_REDIRECT_URI=https://axyra.vercel.app/auth/microsoft/callback
```

### Variables de Pagos

```bash
# Wompi
VITE_WOMPI_PUBLIC_KEY=your_wompi_public_key
VITE_WOMPI_PRIVATE_KEY=your_wompi_private_key
VITE_WOMPI_ENVIRONMENT=production

# PayPal
VITE_PAYPAL_CLIENT_ID=your_paypal_client_id
VITE_PAYPAL_CLIENT_SECRET=your_paypal_client_secret
VITE_PAYPAL_ENVIRONMENT=live

# Stripe
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
VITE_STRIPE_SECRET_KEY=your_stripe_secret_key
```

### Variables de Email

```bash
# SMTP
VITE_SMTP_HOST=smtp.gmail.com
VITE_SMTP_PORT=587
VITE_SMTP_USER=your_email@gmail.com
VITE_SMTP_PASSWORD=your_app_password
VITE_SMTP_SECURE=true

# SendGrid
VITE_SENDGRID_API_KEY=your_sendgrid_api_key

# Mailgun
VITE_MAILGUN_API_KEY=your_mailgun_api_key
VITE_MAILGUN_DOMAIN=your_mailgun_domain
```

## 🔗 Integraciones Externas

### Google Workspace Setup

1. **Google Cloud Console**:

   - Crear proyecto
   - Habilitar APIs: Gmail, Drive, Calendar, Docs
   - Crear credenciales OAuth 2.0
   - Configurar URIs de redirección

2. **Configuración OAuth**:

```javascript
// URIs de redirección autorizadas
https://axyra.vercel.app/auth/google/callback
http://localhost:3000/auth/google/callback

// Orígenes JavaScript autorizados
https://axyra.vercel.app
http://localhost:3000
```

### Microsoft 365 Setup

1. **Azure Portal**:

   - Registrar aplicación
   - Configurar permisos: Mail.Read, Files.ReadWrite, Calendars.ReadWrite
   - Crear secretos de cliente
   - Configurar URIs de redirección

2. **Configuración OAuth**:

```javascript
// URIs de redirección
https://axyra.vercel.app/auth/microsoft/callback
http://localhost:3000/auth/microsoft/callback
```

### Configuración de Pagos

#### Wompi

1. Crear cuenta en [Wompi](https://wompi.co/)
2. Obtener llaves de API
3. Configurar webhooks
4. Probar transacciones en sandbox

#### PayPal

1. Crear cuenta en [PayPal Developer](https://developer.paypal.com/)
2. Crear aplicación
3. Obtener credenciales
4. Configurar webhooks

#### Stripe

1. Crear cuenta en [Stripe](https://stripe.com/)
2. Obtener llaves de API
3. Configurar webhooks
4. Probar en modo test

## 🧪 Testing Pre-Despliegue

### 1. Tests Locales

```bash
# Ejecutar suite de testing
npm run test

# Tests de performance
npm run test:performance

# Tests de seguridad
npm run test:security

# Tests de integración
npm run test:integration
```

### 2. Build de Producción

```bash
# Crear build de producción
npm run build

# Verificar archivos generados
ls -la frontend/dist/

# Probar build localmente
npm run preview
```

### 3. Validación de Configuración

```bash
# Verificar variables de entorno
npm run validate:env

# Verificar configuración Firebase
npm run validate:firebase

# Verificar integraciones
npm run validate:integrations
```

## 🚀 Despliegue a Producción

### 1. Despliegue en Vercel

```bash
# Despliegue automático (si está conectado a GitHub)
# Se ejecuta automáticamente en cada push a main

# Despliegue manual
vercel --prod

# Verificar despliegue
vercel ls
```

### 2. Configurar Dominio

```bash
# En Vercel Dashboard
# Settings > Domains
# Agregar dominio personalizado

# Configurar DNS
# A record: @ -> 76.76.19.19
# CNAME: www -> cname.vercel-dns.com
```

### 3. Configurar SSL

```bash
# SSL se configura automáticamente en Vercel
# Verificar certificado en:
# https://www.ssllabs.com/ssltest/
```

## 📊 Post-Despliegue

### 1. Verificación de Funcionalidades

```bash
# Checklist de verificación:
✅ Login funciona correctamente
✅ Dashboard carga sin errores
✅ Módulos principales accesibles
✅ Integraciones funcionando
✅ Reportes se generan
✅ Notificaciones funcionan
✅ Responsive design
✅ Performance aceptable
```

### 2. Configurar Monitoreo

```javascript
// Google Analytics
// Agregar tracking code en index.html

// Sentry para error tracking
// Configurar Sentry en producción

// Uptime monitoring
// Configurar Pingdom o similar
```

### 3. Configurar Backups

```bash
# Firebase Backup
# Configurar backup automático en Firebase Console

# Database Backup
# Configurar exportación automática de Firestore

# File Backup
# Configurar backup de Firebase Storage
```

## 📈 Monitoreo y Mantenimiento

### 1. Métricas de Performance

```javascript
// Core Web Vitals
// LCP < 2.5s
// FID < 100ms
// CLS < 0.1

// Métricas personalizadas
// Tiempo de carga < 3s
// Tiempo de respuesta API < 500ms
// Uso de memoria < 50MB
```

### 2. Logs y Debugging

```bash
# Vercel Logs
vercel logs

# Firebase Logs
firebase functions:log

# Browser Console
# Monitorear errores en producción
```

### 3. Actualizaciones

```bash
# Actualizaciones de dependencias
npm audit
npm update

# Actualizaciones de Firebase
firebase update

# Actualizaciones de Vercel
vercel update
```

### 4. Mantenimiento Regular

```bash
# Semanal:
- Revisar logs de errores
- Verificar performance
- Actualizar dependencias

# Mensual:
- Backup completo
- Análisis de seguridad
- Optimización de performance

# Trimestral:
- Actualización mayor
- Revisión de arquitectura
- Plan de escalabilidad
```

## 🆘 Troubleshooting

### Problemas Comunes

#### Error 500 en Despliegue

```bash
# Verificar variables de entorno
vercel env ls

# Verificar logs
vercel logs --follow

# Revisar configuración Firebase
firebase projects:list
```

#### Problemas de CORS

```javascript
// Verificar configuración CORS en Firebase
// Agregar dominios autorizados
```

#### Problemas de Autenticación

```bash
# Verificar configuración OAuth
# Revisar URIs de redirección
# Verificar secretos de cliente
```

### Contacto de Soporte

- **Email**: dev@axyra.com
- **Slack**: #axyra-deployment
- **GitHub Issues**: https://github.com/axyra/issues
- **Documentación**: https://docs.axyra.com

---

**Última actualización**: Diciembre 2024  
**Versión**: 1.0.0  
**Mantenido por**: Equipo de DevOps AXYRA
