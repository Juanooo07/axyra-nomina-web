# 🚀 AXYRA - Guía de Deploy Completa

## 📋 Pre-requisitos

### 1. Variables de Entorno en Vercel

```bash
# Firebase
VITE_FIREBASE_API_KEY=tu_api_key
VITE_FIREBASE_AUTH_DOMAIN=tu_auth_domain
VITE_FIREBASE_PROJECT_ID=tu_project_id
VITE_FIREBASE_STORAGE_BUCKET=tu_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=tu_messaging_sender_id
VITE_FIREBASE_APP_ID=tu_app_id

# Wompi
WOMPI_PUBLIC_KEY=tu_public_key
WOMPI_PRIVATE_KEY=tu_private_key

# PayPal
PAYPAL_CLIENT_ID=tu_client_id
PAYPAL_CLIENT_SECRET=tu_client_secret
```

### 2. Configuración de Firebase

- Habilitar Authentication
- Configurar Firestore
- Establecer reglas de seguridad
- Configurar índices

## 🚀 Deploy Automático

### Opción 1: Script Automático

```bash
chmod +x scripts/deploy-production.sh
./scripts/deploy-production.sh
```

### Opción 2: Deploy Manual

#### 1. Deploy a Vercel

```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

#### 2. Deploy a Firebase

```bash
# Instalar Firebase CLI
npm i -g firebase-tools

# Login
firebase login

# Deploy
firebase deploy --only hosting,functions,firestore
```

## 🔧 Configuración Post-Deploy

### 1. Verificar Variables de Entorno

- Revisar que todas las variables estén configuradas
- Probar autenticación
- Verificar conexión a Firebase

### 2. Configurar Dominio Personalizado

- En Vercel: Settings > Domains
- En Firebase: Hosting > Add custom domain

### 3. Configurar SSL

- Vercel maneja SSL automáticamente
- Firebase Hosting también incluye SSL

## 📊 Monitoreo

### 1. Health Check

```bash
curl https://tu-dominio.com/api/health
```

### 2. Logs

- Vercel: Dashboard > Functions > Logs
- Firebase: Console > Functions > Logs

### 3. Métricas

- Vercel: Dashboard > Analytics
- Firebase: Console > Analytics

## 🔒 Seguridad

### 1. Reglas de Firestore

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### 2. Headers de Seguridad

- Configurados en `vercel.json`
- CORS configurado en API

## 🐛 Troubleshooting

### Problemas Comunes

#### 1. Error de Variables de Entorno

```bash
# Verificar variables
vercel env ls
```

#### 2. Error de Firebase

```bash
# Verificar configuración
firebase projects:list
```

#### 3. Error de Build

```bash
# Limpiar cache
rm -rf node_modules
npm install
```

## 📞 Soporte

Para problemas técnicos:

- Email: soporte@axyra.com
- Teléfono: (57) 300-123-4567
- Documentación: [docs.axyra.com](https://docs.axyra.com)

---

**Desarrollado con ❤️ para Villa Venecia**
