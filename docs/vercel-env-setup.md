# 🔧 CONFIGURACIÓN DE VARIABLES DE ENTORNO VERCEL

## 📋 Variables Requeridas

Configura estas variables en Vercel Dashboard → Settings → Environment Variables:

### **Firebase Configuration**

```
FIREBASE_API_KEY=TU_API_KEY_AQUI
FIREBASE_AUTH_DOMAIN=axyra-48238.firebaseapp.com
FIREBASE_PROJECT_ID=axyra-48238
FIREBASE_STORAGE_BUCKET=axyra-48238.appspot.com
FIREBASE_MESSAGING_SENDER_ID=TU_SENDER_ID_AQUI
FIREBASE_APP_ID=TU_APP_ID_AQUI
FIREBASE_MEASUREMENT_ID=TU_MEASUREMENT_ID_AQUI
```

### **Application Configuration**

```
NODE_ENV=production
APP_NAME=AXYRA Sistema de Gestión
APP_VERSION=1.0.0
```

### **Security Configuration**

```
JWT_SECRET=tu-jwt-secret-super-seguro-123456789
ENCRYPTION_KEY=tu-encryption-key-super-seguro-123456789
```

## 🚀 Comandos para Configurar

### **Opción 1: Desde Vercel CLI**

```bash
vercel env add FIREBASE_API_KEY
vercel env add FIREBASE_AUTH_DOMAIN
vercel env add FIREBASE_PROJECT_ID
vercel env add FIREBASE_STORAGE_BUCKET
vercel env add FIREBASE_MESSAGING_SENDER_ID
vercel env add FIREBASE_APP_ID
vercel env add FIREBASE_MEASUREMENT_ID
vercel env add JWT_SECRET
vercel env add ENCRYPTION_KEY
```

### **Opción 2: Desde Vercel Dashboard**

1. Ve a [vercel.com/dashboard](https://vercel.com/dashboard)
2. Selecciona tu proyecto
3. Ve a **Settings** → **Environment Variables**
4. Agrega cada variable una por una

## 🔍 Verificar Variables

```bash
vercel env ls
```

## 📝 Notas Importantes

- **FIREBASE_API_KEY**: Obtener de Firebase Console → Project Settings → General
- **FIREBASE_AUTH_DOMAIN**: Generalmente es `tu-proyecto.firebaseapp.com`
- **FIREBASE_PROJECT_ID**: El ID de tu proyecto Firebase
- **FIREBASE_STORAGE_BUCKET**: Generalmente es `tu-proyecto.appspot.com`
- **FIREBASE_MESSAGING_SENDER_ID**: Número de 12 dígitos
- **FIREBASE_APP_ID**: Formato `1:123456789012:web:abcdef...`
- **FIREBASE_MEASUREMENT_ID**: Formato `G-XXXXXXXXXX`

## ⚠️ Seguridad

- **NUNCA** subas las variables de entorno al repositorio
- Usa valores únicos y seguros para JWT_SECRET y ENCRYPTION_KEY
- Las variables de Firebase son públicas, pero las de seguridad deben ser privadas
