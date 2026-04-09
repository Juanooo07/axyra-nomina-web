# 🔧 Variables de Entorno - AXYRA Sistema de Gestión

## 📋 **CONFIGURACIÓN COMPLETA DE VARIABLES DE ENTORNO**

### **1. 🔥 FIREBASE (OBLIGATORIAS)**

```bash
# Configuración principal de Firebase
VITE_FIREBASE_API_KEY=tu_api_key_aqui
VITE_FIREBASE_AUTH_DOMAIN=tu-proyecto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tu-proyecto-id
VITE_FIREBASE_STORAGE_BUCKET=tu-proyecto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef123456
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
```

### **2. 💳 PAGOS - WOMPI (OBLIGATORIAS)**

```bash
# Configuración de Wompi
VITE_WOMPI_PUBLIC_KEY=pub_test_xxxxxxxxxxxxxxxx
VITE_WOMPI_PRIVATE_KEY=prv_test_xxxxxxxxxxxxxxxx
VITE_WOMPI_MERCHANT_ID=tu_merchant_id
VITE_WOMPI_WEBHOOK_SECRET=tu_webhook_secret
```

### **3. 📧 EMAIL - EMAILJS (OBLIGATORIAS)**

```bash
# Configuración de EmailJS
VITE_EMAILJS_SERVICE_ID=tu_service_id
VITE_EMAILJS_TEMPLATE_ID=tu_template_id
VITE_EMAILJS_PUBLIC_KEY=tu_public_key
VITE_EMAILJS_USER_ID=tu_user_id
```

### **4. 📱 SMS - TWILIO (OPCIONALES)**

```bash
# Configuración de Twilio para SMS
VITE_TWILIO_ACCOUNT_SID=tu_account_sid
VITE_TWILIO_AUTH_TOKEN=tu_auth_token
VITE_TWILIO_PHONE_NUMBER=+1234567890
```

### **5. ☁️ CLOUD STORAGE - AWS S3 (OPCIONALES)**

```bash
# Configuración de AWS S3
VITE_AWS_ACCESS_KEY_ID=tu_access_key
VITE_AWS_SECRET_ACCESS_KEY=tu_secret_key
VITE_AWS_REGION=us-east-1
VITE_AWS_S3_BUCKET=tu-bucket-name
```

### **6. 🔐 GOOGLE WORKSPACE (OPCIONALES)**

```bash
# Configuración de Google Workspace
VITE_GOOGLE_CLIENT_ID=tu_client_id.googleusercontent.com
VITE_GOOGLE_CLIENT_SECRET=tu_client_secret
VITE_GOOGLE_REDIRECT_URI=https://tu-dominio.com/auth/google/callback
```

### **7. 🏢 MICROSOFT 365 (OPCIONALES)**

```bash
# Configuración de Microsoft 365
VITE_MICROSOFT_CLIENT_ID=tu_client_id
VITE_MICROSOFT_CLIENT_SECRET=tu_client_secret
VITE_MICROSOFT_TENANT_ID=tu_tenant_id
VITE_MICROSOFT_REDIRECT_URI=https://tu-dominio.com/auth/microsoft/callback
```

### **8. 📊 ANALYTICS - GOOGLE ANALYTICS (OPCIONALES)**

```bash
# Configuración de Google Analytics
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
VITE_GA_API_SECRET=tu_api_secret
```

### **9. 🔒 SEGURIDAD (OBLIGATORIAS)**

```bash
# Claves de encriptación
VITE_ENCRYPTION_KEY=tu_clave_de_encriptacion_32_caracteres
VITE_JWT_SECRET=tu_jwt_secret_muy_seguro
VITE_2FA_SECRET=tu_2fa_secret_key
```

### **10. 🌐 CONFIGURACIÓN GENERAL (OBLIGATORIAS)**

```bash
# Configuración del entorno
NODE_ENV=production
VITE_APP_NAME=AXYRA Sistema de Gestión
VITE_APP_VERSION=2.0.0
VITE_APP_URL=https://tu-dominio.com
VITE_API_URL=https://tu-api.vercel.app
```

## 🚀 **CONFIGURACIÓN POR PLATAFORMA**

### **Vercel (Recomendado)**

1. Ve a tu proyecto en Vercel Dashboard
2. Ve a Settings > Environment Variables
3. Agrega todas las variables de la sección 1-3 (mínimo)
4. Para funcionalidades avanzadas, agrega las secciones 4-10

### **Firebase Hosting**

1. Ve a Firebase Console > Functions > Environment Variables
2. Configura las variables usando:

```bash
firebase functions:config:set app.api_key="tu_valor"
```

### **Variables de Desarrollo (.env.local)**

Crea un archivo `.env.local` en la raíz del proyecto:

```bash
# Copia este archivo y reemplaza los valores
VITE_FIREBASE_API_KEY=tu_api_key_desarrollo
VITE_FIREBASE_AUTH_DOMAIN=tu-proyecto-dev.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tu-proyecto-dev
# ... resto de variables
```

## ⚠️ **IMPORTANTE**

- **NUNCA** subas archivos `.env` a Git
- Usa valores de **desarrollo** para testing
- Usa valores de **producción** para el despliegue final
- Las variables con `VITE_` son accesibles en el frontend
- Las variables sin `VITE_` son solo para el backend

## 🔍 **VERIFICACIÓN**

Para verificar que las variables están configuradas correctamente, ejecuta:

```bash
npm run validate
```

Este comando verificará que todas las variables necesarias estén configuradas.
