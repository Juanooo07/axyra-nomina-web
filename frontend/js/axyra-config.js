// ========================================
// CONFIGURACIÓN PRINCIPAL AXYRA
// Sistema de gestión empresarial
// ========================================

// Función para obtener la configuración
window.getAxyraConfig = function() {
  return window.AXYRA_CONFIG;
};

// Configuración de variables de entorno
window.ENV = {
  VITE_FIREBASE_API_KEY: 'AIzaSyAW3ejokcsWAP5G1yJT63jLBpFmdTiTUwc',
  VITE_FIREBASE_AUTH_DOMAIN: 'axyra-48238.firebaseapp.com',
  VITE_FIREBASE_PROJECT_ID: 'axyra-48238',
  VITE_FIREBASE_STORAGE_BUCKET: 'axyra-48238.firebasestorage.app',
  VITE_FIREBASE_MESSAGING_SENDER_ID: '796334517286',
  VITE_FIREBASE_APP_ID: '1:796334517286:web:95947cf0f773dc11378ae7',
  VITE_FIREBASE_MEASUREMENT_ID: 'G-R8W2MP15B7'
};

// Configuración principal
window.AXYRA_CONFIG = {
  // Configuración de Firebase
  firebase: {
    apiKey: window.ENV.VITE_FIREBASE_API_KEY,
    authDomain: window.ENV.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: window.ENV.VITE_FIREBASE_PROJECT_ID,
    storageBucket: window.ENV.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: window.ENV.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: window.ENV.VITE_FIREBASE_APP_ID,
    measurementId: window.ENV.VITE_FIREBASE_MEASUREMENT_ID
  },

  // Configuración de la empresa
  company: {
    name: 'AXYRA Sistema de Gestión',
    version: '2.0.0',
    description: 'Sistema integral de gestión empresarial',
    url: 'https://axyra.vercel.app',
    support: {
      email: 'soporte@axyra.com',
      phone: '+57 300 123 4567'
    }
  },

  // Configuración de seguridad
  security: {
    sessionTimeout: 3600000, // 1 hora
    maxLoginAttempts: 5,
    lockoutTime: 900000, // 15 minutos
    passwordMinLength: 6,
    requireEmailVerification: false
  },

  // Configuración de notificaciones
  notifications: {
    enabled: true,
    types: ['success', 'error', 'warning', 'info'],
    autoHide: true,
    duration: 5000,
    position: 'top-right'
  },

  // Configuración de la aplicación
  app: {
    theme: 'light',
    language: 'es',
    timezone: 'America/Bogota',
    currency: 'COP',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '24h'
  },

  // Configuración de paginación
  pagination: {
    defaultPageSize: 10,
    pageSizeOptions: [5, 10, 25, 50, 100]
  },

  // Configuración de exportación
  export: {
    defaultFormat: 'pdf',
    supportedFormats: ['pdf', 'excel', 'csv'],
    maxRecords: 10000
  },

  // Configuración de backup
  backup: {
    enabled: true,
    frequency: 'daily',
    retentionDays: 30,
    autoBackup: true
  },

  // Configuración de integraciones
  integrations: {
    // Google Workspace
    googleWorkspace: {
      clientId: window.ENV.VITE_GOOGLE_CLIENT_ID || '',
      clientSecret: window.ENV.VITE_GOOGLE_CLIENT_SECRET || '',
      redirectUri: window.ENV.VITE_GOOGLE_REDIRECT_URI || window.location.origin + '/auth/google/callback',
      enabled: true,
      scopes: [
        'https://www.googleapis.com/auth/gmail.readonly',
        'https://www.googleapis.com/auth/gmail.send',
        'https://www.googleapis.com/auth/drive.readonly',
        'https://www.googleapis.com/auth/drive.file',
        'https://www.googleapis.com/auth/calendar.readonly',
        'https://www.googleapis.com/auth/calendar.events'
      ]
    },

    // Microsoft 365
    microsoft365: {
      clientId: window.ENV.VITE_MICROSOFT_CLIENT_ID || '',
      clientSecret: window.ENV.VITE_MICROSOFT_CLIENT_SECRET || '',
      tenantId: window.ENV.VITE_MICROSOFT_TENANT_ID || 'common',
      redirectUri: window.ENV.VITE_MICROSOFT_REDIRECT_URI || window.location.origin + '/auth/microsoft/callback',
      enabled: true,
      scopes: [
        'https://graph.microsoft.com/Mail.Read',
        'https://graph.microsoft.com/Mail.Send',
        'https://graph.microsoft.com/Files.ReadWrite',
        'https://graph.microsoft.com/Calendars.ReadWrite',
        'https://graph.microsoft.com/Team.ReadBasic.All',
        'https://graph.microsoft.com/User.Read'
      ]
    },

    // Pagos
    payments: {
      wompi: {
        publicKey: window.ENV.VITE_WOMPI_PUBLIC_KEY || '',
        privateKey: window.ENV.VITE_WOMPI_PRIVATE_KEY || '',
        environment: window.ENV.VITE_WOMPI_ENVIRONMENT || 'sandbox',
        merchantId: window.ENV.VITE_WOMPI_MERCHANT_ID || '',
        accountId: window.ENV.VITE_WOMPI_ACCOUNT_ID || '',
        webhookSecret: window.ENV.VITE_WOMPI_WEBHOOK_SECRET || ''
      },
      paypal: {
        clientId: window.ENV.VITE_PAYPAL_CLIENT_ID || '',
        clientSecret: window.ENV.VITE_PAYPAL_CLIENT_SECRET || '',
        environment: window.ENV.VITE_PAYPAL_ENVIRONMENT || 'sandbox'
      },
      stripe: {
        publicKey: window.ENV.VITE_STRIPE_PUBLIC_KEY || '',
        secretKey: window.ENV.VITE_STRIPE_SECRET_KEY || ''
      }
    },

    // Email
    email: {
      emailjsServiceId: window.ENV.VITE_EMAILJS_SERVICE_ID || '',
      emailjsTemplateId: window.ENV.VITE_EMAILJS_TEMPLATE_ID || '',
      emailjsPublicKey: window.ENV.VITE_EMAILJS_PUBLIC_KEY || '',
      smtpHost: window.ENV.VITE_SMTP_HOST || '',
      smtpPort: window.ENV.VITE_SMTP_PORT || '',
      smtpUser: window.ENV.VITE_SMTP_USER || '',
      smtpPass: window.ENV.VITE_SMTP_PASS || '',
      sendgridApiKey: window.ENV.VITE_SENDGRID_API_KEY || '',
      mailgunApiKey: window.ENV.VITE_MAILGUN_API_KEY || '',
      mailgunDomain: window.ENV.VITE_MAILGUN_DOMAIN || '',
      awsSesRegion: window.ENV.VITE_AWS_SES_REGION || '',
      awsSesAccessKeyId: window.ENV.VITE_AWS_SES_ACCESS_KEY_ID || '',
      awsSesSecretAccessKey: window.ENV.VITE_AWS_SES_SECRET_ACCESS_KEY || ''
    },

    // SMS
    sms: {
      twilioAccountSid: window.ENV.VITE_TWILIO_ACCOUNT_SID || '',
      twilioAuthToken: window.ENV.VITE_TWILIO_AUTH_TOKEN || '',
      twilioPhoneNumber: window.ENV.VITE_TWILIO_PHONE_NUMBER || '',
      awsSnsRegion: window.ENV.VITE_AWS_SNS_REGION || '',
      awsSnsAccessKeyId: window.ENV.VITE_AWS_SNS_ACCESS_KEY_ID || '',
      awsSnsSecretAccessKey: window.ENV.VITE_AWS_SNS_SECRET_ACCESS_KEY || '',
      sendgridApiKey: window.ENV.VITE_SENDGRID_SMS_API_KEY || ''
    },

    // Cloud Storage
    cloudStorage: {
      awsS3AccessKeyId: window.ENV.VITE_AWS_ACCESS_KEY_ID || '',
      awsS3SecretAccessKey: window.ENV.VITE_AWS_SECRET_ACCESS_KEY || '',
      awsS3Region: window.ENV.VITE_AWS_REGION || '',
      awsS3BucketName: window.ENV.VITE_AWS_S3_BUCKET_NAME || '',
      googleCloudProjectId: window.ENV.VITE_GOOGLE_CLOUD_PROJECT_ID || '',
      googleCloudKeyFile: window.ENV.VITE_GOOGLE_CLOUD_KEY_FILE || '',
      azureStorageAccount: window.ENV.VITE_AZURE_STORAGE_ACCOUNT || '',
      azureStorageKey: window.ENV.VITE_AZURE_STORAGE_KEY || '',
      dropboxAccessToken: window.ENV.VITE_DROPBOX_ACCESS_TOKEN || ''
    },

    // API Management
    apiManagement: {
      jwtSecret: window.ENV.VITE_JWT_SECRET || '',
      apiKeyHeader: window.ENV.VITE_API_KEY_HEADER || 'X-API-KEY'
    }
  },

  // Configuración general
  general: {
    appName: window.ENV.VITE_APP_NAME || 'AXYRA Sistema de Gestión',
    appUrl: window.ENV.VITE_APP_URL || 'https://axyra.vercel.app',
    nodeEnv: window.ENV.NODE_ENV || 'production'
  },

  // Configuración de analytics
  analytics: {
    googleAnalyticsId: window.ENV.VITE_GA_MEASUREMENT_ID || ''
  }
};

// Función para actualizar configuración
window.updateAxyraConfig = function(newConfig) {
  window.AXYRA_CONFIG = { ...window.AXYRA_CONFIG, ...newConfig };
  localStorage.setItem('axyra_config', JSON.stringify(window.AXYRA_CONFIG));
};

// Cargar configuración guardada
window.loadAxyraConfig = function() {
  const savedConfig = localStorage.getItem('axyra_config');
  if (savedConfig) {
    try {
      const parsedConfig = JSON.parse(savedConfig);
      window.AXYRA_CONFIG = { ...window.AXYRA_CONFIG, ...parsedConfig };
    } catch (error) {
      console.error('Error cargando configuración guardada:', error);
    }
  }
};

// Inicializar configuración
window.loadAxyraConfig();

console.log('🔧 AXYRA Config cargado correctamente');