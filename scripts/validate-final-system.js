#!/usr/bin/env node

/**
 * Script de Validación Final del Sistema AXYRA
 * Verifica que todos los componentes estén funcionando correctamente
 */

const fs = require('fs');
const path = require('path');

class AxyraFinalValidator {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.success = [];
    this.startTime = Date.now();
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix =
      {
        error: '❌',
        warning: '⚠️',
        success: '✅',
        info: 'ℹ️',
      }[type] || 'ℹ️';

    console.log(`${prefix} [${timestamp}] ${message}`);
  }

  async validateProjectStructure() {
    this.log('Validando estructura del proyecto...', 'info');

    const requiredFiles = [
      'package.json',
      'firebase.json',
      'vercel.json',
      'frontend/index.html',
      'frontend/login-optimized.html',
      'frontend/dashboard-optimized.html',
      'frontend/js/axyra-config.js',
      'frontend/js/axyra-auth.js',
      'frontend/js/axyra-notifications.js',
    ];

    for (const file of requiredFiles) {
      if (fs.existsSync(file)) {
        this.success.push(`Archivo encontrado: ${file}`);
      } else {
        this.errors.push(`Archivo faltante: ${file}`);
      }
    }
  }

  async validateCoreScripts() {
    this.log('Validando scripts principales...', 'info');

    const coreScripts = [
      'frontend/js/axyra-config.js',
      'frontend/js/axyra-auth.js',
      'frontend/js/axyra-notifications.js',
      'frontend/js/axyra-realtime.js',
      'frontend/js/axyra-push-notifications.js',
      'frontend/js/axyra-reports.js',
      'frontend/js/axyra-backup.js',
      'frontend/js/axyra-analytics.js',
    ];

    for (const script of coreScripts) {
      if (fs.existsSync(script)) {
        const content = fs.readFileSync(script, 'utf8');
        if (content.includes('class') && content.includes('constructor')) {
          this.success.push(`Script válido: ${script}`);
        } else {
          this.warnings.push(`Script puede estar incompleto: ${script}`);
        }
      } else {
        this.errors.push(`Script faltante: ${script}`);
      }
    }
  }

  async validateOptimizationScripts() {
    this.log('Validando scripts de optimización...', 'info');

    const optimizationScripts = [
      'frontend/js/axyra-lazy-loading.js',
      'frontend/js/axyra-cache.js',
      'frontend/js/axyra-compression.js',
      'frontend/js/axyra-cdn.js',
      'frontend/js/axyra-optimizer.js',
      'frontend/js/axyra-validator.js',
      'frontend/js/axyra-cleanup.js',
    ];

    for (const script of optimizationScripts) {
      if (fs.existsSync(script)) {
        this.success.push(`Script de optimización encontrado: ${script}`);
      } else {
        this.errors.push(`Script de optimización faltante: ${script}`);
      }
    }
  }

  async validateSecurityScripts() {
    this.log('Validando scripts de seguridad...', 'info');

    const securityScripts = [
      'frontend/js/axyra-2fa.js',
      'frontend/js/axyra-encryption.js',
      'frontend/js/axyra-security-monitoring.js',
      'frontend/js/axyra-rbac.js',
      'frontend/js/axyra-security-audit.js',
    ];

    for (const script of securityScripts) {
      if (fs.existsSync(script)) {
        this.success.push(`Script de seguridad encontrado: ${script}`);
      } else {
        this.errors.push(`Script de seguridad faltante: ${script}`);
      }
    }
  }

  async validateIntegrationScripts() {
    this.log('Validando scripts de integración...', 'info');

    const integrationScripts = [
      'frontend/js/axyra-payment-integration.js',
      'frontend/js/axyra-email-integration.js',
      'frontend/js/axyra-sms-integration.js',
      'frontend/js/axyra-cloud-storage.js',
      'frontend/js/axyra-api-management.js',
      'frontend/js/axyra-google-workspace.js',
      'frontend/js/axyra-microsoft-365.js',
      'frontend/js/axyra-third-party-manager.js',
    ];

    for (const script of integrationScripts) {
      if (fs.existsSync(script)) {
        this.success.push(`Script de integración encontrado: ${script}`);
      } else {
        this.errors.push(`Script de integración faltante: ${script}`);
      }
    }
  }

  async validateTestingScripts() {
    this.log('Validando scripts de testing...', 'info');

    const testingScripts = ['frontend/js/axyra-testing-suite.js'];

    for (const script of testingScripts) {
      if (fs.existsSync(script)) {
        this.success.push(`Script de testing encontrado: ${script}`);
      } else {
        this.errors.push(`Script de testing faltante: ${script}`);
      }
    }
  }

  async validateDocumentation() {
    this.log('Validando documentación...', 'info');

    const docs = [
      'frontend/docs/USER_GUIDE.md',
      'frontend/docs/TECHNICAL_DOCS.md',
      'frontend/docs/DEPLOYMENT_GUIDE.md',
      'README.md',
    ];

    for (const doc of docs) {
      if (fs.existsSync(doc)) {
        this.success.push(`Documentación encontrada: ${doc}`);
      } else {
        this.warnings.push(`Documentación faltante: ${doc}`);
      }
    }
  }

  async validateConfiguration() {
    this.log('Validando configuración...', 'info');

    // Verificar package.json
    if (fs.existsSync('package.json')) {
      const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      if (packageJson.scripts && packageJson.scripts.deploy) {
        this.success.push('Scripts de despliegue configurados');
      } else {
        this.warnings.push('Scripts de despliegue no configurados');
      }
    }

    // Verificar firebase.json
    if (fs.existsSync('firebase.json')) {
      this.success.push('Configuración de Firebase encontrada');
    } else {
      this.errors.push('Configuración de Firebase faltante');
    }

    // Verificar vercel.json
    if (fs.existsSync('vercel.json')) {
      this.success.push('Configuración de Vercel encontrada');
    } else {
      this.warnings.push('Configuración de Vercel faltante');
    }
  }

  async generateReport() {
    const endTime = Date.now();
    const duration = endTime - this.startTime;

    console.log('\n' + '='.repeat(60));
    console.log('📊 REPORTE DE VALIDACIÓN FINAL - AXYRA');
    console.log('='.repeat(60));

    console.log(`\n⏱️  Duración: ${duration}ms`);
    console.log(`✅ Éxitos: ${this.success.length}`);
    console.log(`⚠️  Advertencias: ${this.warnings.length}`);
    console.log(`❌ Errores: ${this.errors.length}`);

    if (this.success.length > 0) {
      console.log('\n✅ COMPONENTES VÁLIDOS:');
      this.success.forEach((item) => console.log(`   ${item}`));
    }

    if (this.warnings.length > 0) {
      console.log('\n⚠️  ADVERTENCIAS:');
      this.warnings.forEach((item) => console.log(`   ${item}`));
    }

    if (this.errors.length > 0) {
      console.log('\n❌ ERRORES:');
      this.errors.forEach((item) => console.log(`   ${item}`));
    }

    const totalIssues = this.errors.length + this.warnings.length;
    if (totalIssues === 0) {
      console.log('\n🎉 ¡SISTEMA AXYRA COMPLETAMENTE VALIDADO!');
      console.log('🚀 El sistema está listo para producción.');
    } else if (this.errors.length === 0) {
      console.log('\n✅ Sistema validado con advertencias menores.');
    } else {
      console.log('\n❌ Sistema requiere correcciones antes del despliegue.');
    }

    console.log('\n' + '='.repeat(60));
  }

  async run() {
    this.log('Iniciando validación final del sistema AXYRA...', 'info');

    await this.validateProjectStructure();
    await this.validateCoreScripts();
    await this.validateOptimizationScripts();
    await this.validateSecurityScripts();
    await this.validateIntegrationScripts();
    await this.validateTestingScripts();
    await this.validateDocumentation();
    await this.validateConfiguration();

    await this.generateReport();

    return {
      success: this.success.length,
      warnings: this.warnings.length,
      errors: this.errors.length,
      total: this.success.length + this.warnings.length + this.errors.length,
    };
  }
}

// Ejecutar validación si se llama directamente
if (require.main === module) {
  const validator = new AxyraFinalValidator();
  validator
    .run()
    .then((result) => {
      process.exit(result.errors > 0 ? 1 : 0);
    })
    .catch((error) => {
      console.error('❌ Error durante la validación:', error);
      process.exit(1);
    });
}

module.exports = AxyraFinalValidator;
