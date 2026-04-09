#!/usr/bin/env node

/**
 * Script para verificar variables de entorno de AXYRA
 * Verifica que todas las variables necesarias estén configuradas
 */

const fs = require('fs');
const path = require('path');

// Cargar variables de entorno desde .env
require('dotenv').config();

class AxyraEnvChecker {
  constructor() {
    this.requiredVars = {
      // Firebase (OBLIGATORIAS)
      firebase: [
        'VITE_FIREBASE_API_KEY',
        'VITE_FIREBASE_AUTH_DOMAIN',
        'VITE_FIREBASE_PROJECT_ID',
        'VITE_FIREBASE_STORAGE_BUCKET',
        'VITE_FIREBASE_MESSAGING_SENDER_ID',
        'VITE_FIREBASE_APP_ID',
      ],

      // Wompi (OBLIGATORIAS)
      wompi: ['VITE_WOMPI_PUBLIC_KEY', 'VITE_WOMPI_PRIVATE_KEY', 'VITE_WOMPI_MERCHANT_ID'],

      // EmailJS (OBLIGATORIAS)
      email: ['VITE_EMAILJS_SERVICE_ID', 'VITE_EMAILJS_TEMPLATE_ID', 'VITE_EMAILJS_PUBLIC_KEY'],

      // Seguridad (OBLIGATORIAS)
      security: ['VITE_ENCRYPTION_KEY', 'VITE_JWT_SECRET'],

      // Configuración General (OBLIGATORIAS)
      general: ['NODE_ENV', 'VITE_APP_NAME', 'VITE_APP_URL'],

      // Opcionales
      optional: [
        'VITE_TWILIO_ACCOUNT_SID',
        'VITE_TWILIO_AUTH_TOKEN',
        'VITE_AWS_ACCESS_KEY_ID',
        'VITE_GOOGLE_CLIENT_ID',
        'VITE_MICROSOFT_CLIENT_ID',
        'VITE_GA_MEASUREMENT_ID',
      ],
    };

    this.missing = [];
    this.present = [];
    this.warnings = [];
  }

  log(message, type = 'info') {
    const prefix =
      {
        error: '❌',
        warning: '⚠️',
        success: '✅',
        info: 'ℹ️',
      }[type] || 'ℹ️';

    console.log(`${prefix} ${message}`);
  }

  checkEnvFile() {
    const envFiles = ['.env', '.env.local', '.env.production'];
    let envFileFound = false;

    for (const file of envFiles) {
      if (fs.existsSync(file)) {
        this.log(`Archivo de entorno encontrado: ${file}`, 'success');
        envFileFound = true;
        break;
      }
    }

    if (!envFileFound) {
      this.log('No se encontró archivo .env. Creando ejemplo...', 'warning');
      this.createEnvExample();
    }
  }

  createEnvExample() {
    const envExample = `# ========================================
# VARIABLES DE ENTORNO AXYRA
# Copia este archivo como .env y configura los valores
# ========================================

# 🔥 FIREBASE (OBLIGATORIAS)
VITE_FIREBASE_API_KEY=tu_api_key_aqui
VITE_FIREBASE_AUTH_DOMAIN=tu-proyecto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tu-proyecto-id
VITE_FIREBASE_STORAGE_BUCKET=tu-proyecto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef123456

# 💳 WOMPI (OBLIGATORIAS)
VITE_WOMPI_PUBLIC_KEY=pub_test_xxxxxxxxxxxxxxxx
VITE_WOMPI_PRIVATE_KEY=prv_test_xxxxxxxxxxxxxxxx
VITE_WOMPI_MERCHANT_ID=tu_merchant_id

# 📧 EMAIL (OBLIGATORIAS)
VITE_EMAILJS_SERVICE_ID=tu_service_id
VITE_EMAILJS_TEMPLATE_ID=tu_template_id
VITE_EMAILJS_PUBLIC_KEY=tu_public_key

# 🔒 SEGURIDAD (OBLIGATORIAS)
VITE_ENCRYPTION_KEY=tu_clave_de_encriptacion_32_caracteres
VITE_JWT_SECRET=tu_jwt_secret_muy_seguro

# 🌐 CONFIGURACIÓN GENERAL (OBLIGATORIAS)
NODE_ENV=production
VITE_APP_NAME=AXYRA Sistema de Gestión
VITE_APP_URL=https://tu-dominio.com

# 📱 SMS (OPCIONALES)
# VITE_TWILIO_ACCOUNT_SID=tu_account_sid
# VITE_TWILIO_AUTH_TOKEN=tu_auth_token

# ☁️ CLOUD STORAGE (OPCIONALES)
# VITE_AWS_ACCESS_KEY_ID=tu_access_key
# VITE_AWS_SECRET_ACCESS_KEY=tu_secret_key

# 🔐 GOOGLE WORKSPACE (OPCIONALES)
# VITE_GOOGLE_CLIENT_ID=tu_client_id.googleusercontent.com
# VITE_GOOGLE_CLIENT_SECRET=tu_client_secret

# 🏢 MICROSOFT 365 (OPCIONALES)
# VITE_MICROSOFT_CLIENT_ID=tu_client_id
# VITE_MICROSOFT_CLIENT_SECRET=tu_client_secret

# 📊 ANALYTICS (OPCIONALES)
# VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
`;

    fs.writeFileSync('.env.example', envExample);
    this.log('Archivo .env.example creado. Configúralo y renómbralo a .env', 'info');
  }

  checkVariables() {
    this.log('Verificando variables de entorno...', 'info');

    // Verificar variables obligatorias
    for (const [category, vars] of Object.entries(this.requiredVars)) {
      if (category === 'optional') continue;

      for (const varName of vars) {
        if (process.env[varName]) {
          this.present.push(`${varName} (${category})`);
        } else {
          this.missing.push(`${varName} (${category})`);
        }
      }
    }

    // Verificar variables opcionales
    for (const varName of this.requiredVars.optional) {
      if (process.env[varName]) {
        this.present.push(`${varName} (opcional)`);
      } else {
        this.warnings.push(`${varName} (opcional - no configurada)`);
      }
    }
  }

  generateReport() {
    console.log('\n' + '='.repeat(60));
    console.log('🔧 REPORTE DE VARIABLES DE ENTORNO - AXYRA');
    console.log('='.repeat(60));

    console.log(`\n✅ Variables configuradas: ${this.present.length}`);
    console.log(`❌ Variables faltantes: ${this.missing.length}`);
    console.log(`⚠️  Variables opcionales: ${this.warnings.length}`);

    if (this.present.length > 0) {
      console.log('\n✅ VARIABLES CONFIGURADAS:');
      this.present.forEach((item) => console.log(`   ${item}`));
    }

    if (this.missing.length > 0) {
      console.log('\n❌ VARIABLES FALTANTES (OBLIGATORIAS):');
      this.missing.forEach((item) => console.log(`   ${item}`));
    }

    if (this.warnings.length > 0) {
      console.log('\n⚠️  VARIABLES OPCIONALES:');
      this.warnings.forEach((item) => console.log(`   ${item}`));
    }

    const criticalMissing = this.missing.filter((item) => !item.includes('(opcional)')).length;

    if (criticalMissing === 0) {
      console.log('\n🎉 ¡TODAS LAS VARIABLES OBLIGATORIAS ESTÁN CONFIGURADAS!');
      console.log('🚀 El sistema está listo para funcionar.');
    } else {
      console.log('\n❌ FALTAN VARIABLES OBLIGATORIAS.');
      console.log('⚠️  Configura las variables faltantes antes de continuar.');
    }

    console.log('\n' + '='.repeat(60));

    return {
      present: this.present.length,
      missing: this.missing.length,
      warnings: this.warnings.length,
      criticalMissing,
    };
  }

  async run() {
    this.log('Iniciando verificación de variables de entorno...', 'info');

    this.checkEnvFile();
    this.checkVariables();

    const result = this.generateReport();

    return result;
  }
}

// Ejecutar verificación si se llama directamente
if (require.main === module) {
  const checker = new AxyraEnvChecker();
  checker
    .run()
    .then((result) => {
      process.exit(result.criticalMissing > 0 ? 1 : 0);
    })
    .catch((error) => {
      console.error('❌ Error durante la verificación:', error);
      process.exit(1);
    });
}

module.exports = AxyraEnvChecker;
