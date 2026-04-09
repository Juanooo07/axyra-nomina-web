# 🔧 Guía de Configuración de Variables de Entorno - AXYRA

## 📋 **PASO A PASO PARA CONFIGURAR TODAS LAS VARIABLES**

### **1. 🔥 FIREBASE (OBLIGATORIAS)**

#### **Cómo obtener las variables de Firebase:**

1. **Ve a [Firebase Console](https://console.firebase.google.com/)**
2. **Selecciona tu proyecto** (o crea uno nuevo)
3. **Ve a Project Settings** (⚙️ > Project settings)
4. **Scroll down hasta "Your apps"**
5. **Si no tienes una app web, haz clic en "Add app" > Web**
6. **Copia los valores del objeto de configuración:**

```javascript
const firebaseConfig = {
  apiKey: 'AIzaSyBvQvqQvqQvqQvqQvqQvqQvqQvqQvqQ', // ← VITE_FIREBASE_API_KEY
  authDomain: 'tu-proyecto.firebaseapp.com', // ← VITE_FIREBASE_AUTH_DOMAIN
  projectId: 'tu-proyecto-id', // ← VITE_FIREBASE_PROJECT_ID
  storageBucket: 'tu-proyecto.appspot.com', // ← VITE_FIREBASE_STORAGE_BUCKET
  messagingSenderId: '123456789', // ← VITE_FIREBASE_MESSAGING_SENDER_ID
  appId: '1:123456789:web:abcdef123456', // ← VITE_FIREBASE_APP_ID
};
```

### **2. 💳 WOMPI (OBLIGATORIAS)**

#### **Cómo obtener las variables de Wompi:**

1. **Ve a [Wompi Dashboard](https://dashboard.wompi.co/)**
2. **Inicia sesión** con tu cuenta
3. **Ve a "Configuración" > "API Keys"**
4. **Copia las siguientes variables:**
   - **Public Key** → `VITE_WOMPI_PUBLIC_KEY`
   - **Private Key** → `VITE_WOMPI_PRIVATE_KEY`
   - **Merchant ID** → `VITE_WOMPI_MERCHANT_ID`

### **3. 📧 EMAILJS (OBLIGATORIAS)**

#### **Cómo obtener las variables de EmailJS:**

1. **Ve a [EmailJS Dashboard](https://dashboard.emailjs.com/)**
2. **Inicia sesión** con tu cuenta
3. **Ve a "Email Services"** y crea un servicio (Gmail, Outlook, etc.)
4. **Ve a "Email Templates"** y crea una plantilla
5. **Ve a "Account" > "General"**
6. **Copia las siguientes variables:**
   - **Service ID** → `VITE_EMAILJS_SERVICE_ID`
   - **Template ID** → `VITE_EMAILJS_TEMPLATE_ID`
   - **Public Key** → `VITE_EMAILJS_PUBLIC_KEY`

### **4. 🔒 SEGURIDAD (OBLIGATORIAS)**

#### **Cómo generar las claves de seguridad:**

```bash
# Genera una clave de encriptación de 32 caracteres
VITE_ENCRYPTION_KEY=tu_clave_de_encriptacion_32_caracteres

# Genera un JWT secret seguro
VITE_JWT_SECRET=tu_jwt_secret_muy_seguro_de_al_menos_32_caracteres
```

**Puedes usar este comando para generar claves seguras:**

```bash
# En Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### **5. 🌐 CONFIGURACIÓN GENERAL (OBLIGATORIAS)**

```bash
NODE_ENV=production
VITE_APP_NAME=AXYRA Sistema de Gestión
VITE_APP_URL=https://tu-dominio.vercel.app
```

### **6. 📱 TWILIO (OPCIONALES - Para SMS)**

#### **Cómo obtener las variables de Twilio:**

1. **Ve a [Twilio Console](https://console.twilio.com/)**
2. **Inicia sesión** con tu cuenta
3. **En el Dashboard, copia:**
   - **Account SID** → `VITE_TWILIO_ACCOUNT_SID`
   - **Auth Token** → `VITE_TWILIO_AUTH_TOKEN`
4. **Ve a "Phone Numbers" > "Manage" > "Active numbers"**
5. **Copia el número de teléfono** → `VITE_TWILIO_PHONE_NUMBER`

### **7. ☁️ AWS S3 (OPCIONALES - Para Cloud Storage)**

#### **Cómo obtener las variables de AWS:**

1. **Ve a [AWS Console](https://console.aws.amazon.com/)**
2. **Ve a IAM > Users > Create user**
3. **Asigna políticas: AmazonS3FullAccess**
4. **Copia las credenciales:**
   - **Access Key ID** → `VITE_AWS_ACCESS_KEY_ID`
   - **Secret Access Key** → `VITE_AWS_SECRET_ACCESS_KEY`
5. **Selecciona la región** → `VITE_AWS_REGION`
6. **Crea un bucket S3** → `VITE_AWS_S3_BUCKET`

### **8. 🔐 GOOGLE WORKSPACE (OPCIONALES)**

#### **Cómo obtener las variables de Google:**

1. **Ve a [Google Cloud Console](https://console.cloud.google.com/)**
2. **Crea un proyecto** o selecciona uno existente
3. **Ve a "APIs & Services" > "Credentials"**
4. **Crea credenciales OAuth 2.0**
5. **Copia:**
   - **Client ID** → `VITE_GOOGLE_CLIENT_ID`
   - **Client Secret** → `VITE_GOOGLE_CLIENT_SECRET`

### **9. 🏢 MICROSOFT 365 (OPCIONALES)**

#### **Cómo obtener las variables de Microsoft:**

1. **Ve a [Azure Portal](https://portal.azure.com/)**
2. **Ve a "Azure Active Directory" > "App registrations"**
3. **Crea una nueva aplicación**
4. **Copia:**
   - **Application (client) ID** → `VITE_MICROSOFT_CLIENT_ID`
   - **Client Secret** → `VITE_MICROSOFT_CLIENT_SECRET`
   - **Directory (tenant) ID** → `VITE_MICROSOFT_TENANT_ID`

### **10. 📊 GOOGLE ANALYTICS (OPCIONALES)**

#### **Cómo obtener las variables de Google Analytics:**

1. **Ve a [Google Analytics](https://analytics.google.com/)**
2. **Crea una propiedad** o selecciona una existente
3. **Ve a "Admin" > "Data Streams"**
4. **Copia:**
   - **Measurement ID** → `VITE_GA_MEASUREMENT_ID`

## 🚀 **CONFIGURACIÓN EN VERCEL**

### **Método 1: Dashboard de Vercel**

1. **Ve a tu proyecto en [Vercel Dashboard](https://vercel.com/dashboard)**
2. **Ve a Settings > Environment Variables**
3. **Agrega cada variable** con su valor correspondiente
4. **Selecciona "Production"** para todas las variables

### **Método 2: CLI de Vercel**

```bash
# Instala Vercel CLI
npm i -g vercel

# Configura las variables
vercel env add VITE_FIREBASE_API_KEY
vercel env add VITE_FIREBASE_AUTH_DOMAIN
# ... continúa con todas las variables
```

## 🔍 **VERIFICACIÓN**

### **Verificar configuración local:**

```bash
npm run check-env
```

### **Verificar en Vercel:**

```bash
vercel env ls
```

## ⚠️ **IMPORTANTE**

- **NUNCA** subas archivos `.env` a Git
- Usa valores de **desarrollo** para testing local
- Usa valores de **producción** para el despliegue final
- Las variables con `VITE_` son accesibles en el frontend
- Las variables sin `VITE_` son solo para el backend

## 🆘 **SOPORTE**

Si tienes problemas configurando alguna variable, revisa:

1. **Documentación oficial** de cada servicio
2. **Logs de Vercel** para errores de variables
3. **Console del navegador** para errores de configuración
