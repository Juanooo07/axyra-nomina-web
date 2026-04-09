/**
 * AXYRA System Validator
 * Validador final del sistema AXYRA
 * Incluye: Validación de funcionalidades, performance, seguridad y compatibilidad
 */

class AxyraSystemValidator {
  constructor() {
    this.validationResults = {
      passed: 0,
      failed: 0,
      warnings: 0,
      total: 0,
      details: [],
    };
    this.isValidating = false;
  }

  /**
   * Inicializar el validador
   */
  async initialize() {
    try {
      console.log('🔍 Inicializando AXYRA System Validator...');

      // Configurar validaciones automáticas
      this.setupAutomaticValidations();

      console.log('✅ AXYRA System Validator inicializado');
      return true;
    } catch (error) {
      console.error('❌ Error inicializando validator:', error);
      return false;
    }
  }

  /**
   * Configurar validaciones automáticas
   */
  setupAutomaticValidations() {
    // Validación al cargar
    window.addEventListener('load', () => {
      this.validateOnLoad();
    });

    // Validación de cambios
    document.addEventListener('DOMContentLoaded', () => {
      this.validateOnReady();
    });

    // Validación de errores
    window.addEventListener('error', (event) => {
      this.validateError(event);
    });
  }

  /**
   * Validación al cargar
   */
  async validateOnLoad() {
    try {
      // Validar Core Web Vitals
      await this.validateCoreWebVitals();

      // Validar recursos críticos
      await this.validateCriticalResources();

      // Validar configuración
      await this.validateConfiguration();
    } catch (error) {
      console.error('❌ Error en validación de carga:', error);
    }
  }

  /**
   * Validación cuando está listo
   */
  async validateOnReady() {
    try {
      // Validar funcionalidades
      await this.validateFunctionalities();

      // Validar integraciones
      await this.validateIntegrations();

      // Validar seguridad
      await this.validateSecurity();
    } catch (error) {
      console.error('❌ Error en validación de listo:', error);
    }
  }

  /**
   * Validar errores
   */
  validateError(event) {
    try {
      const error = {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error,
      };

      this.addValidationResult('error', 'Error de JavaScript', false, error);
    } catch (error) {
      console.error('❌ Error validando error:', error);
    }
  }

  /**
   * Validar Core Web Vitals
   */
  async validateCoreWebVitals() {
    try {
      const vitals = await this.measureCoreWebVitals();

      // Validar LCP
      if (vitals.lcp > 2500) {
        this.addValidationResult('performance', 'LCP muy lento', false, {
          metric: 'LCP',
          value: vitals.lcp,
          threshold: 2500,
        });
      } else {
        this.addValidationResult('performance', 'LCP óptimo', true, {
          metric: 'LCP',
          value: vitals.lcp,
        });
      }

      // Validar FID
      if (vitals.fid > 100) {
        this.addValidationResult('performance', 'FID muy lento', false, {
          metric: 'FID',
          value: vitals.fid,
          threshold: 100,
        });
      } else {
        this.addValidationResult('performance', 'FID óptimo', true, {
          metric: 'FID',
          value: vitals.fid,
        });
      }

      // Validar CLS
      if (vitals.cls > 0.1) {
        this.addValidationResult('performance', 'CLS muy alto', false, {
          metric: 'CLS',
          value: vitals.cls,
          threshold: 0.1,
        });
      } else {
        this.addValidationResult('performance', 'CLS óptimo', true, {
          metric: 'CLS',
          value: vitals.cls,
        });
      }
    } catch (error) {
      console.error('❌ Error validando Core Web Vitals:', error);
    }
  }

  /**
   * Medir Core Web Vitals
   */
  async measureCoreWebVitals() {
    return new Promise((resolve) => {
      const vitals = {};

      // LCP
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        vitals.lcp = lastEntry.startTime;
      }).observe({ entryTypes: ['largest-contentful-paint'] });

      // FID
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          vitals.fid = entry.processingStart - entry.startTime;
        });
      }).observe({ entryTypes: ['first-input'] });

      // CLS
      let clsValue = 0;
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        });
        vitals.cls = clsValue;
      }).observe({ entryTypes: ['layout-shift'] });

      setTimeout(() => resolve(vitals), 3000);
    });
  }

  /**
   * Validar recursos críticos
   */
  async validateCriticalResources() {
    try {
      const criticalResources = ['js/axyra-config.js', 'js/axyra-auth.js', 'js/axyra-notifications.js'];

      for (const resource of criticalResources) {
        const exists = await this.checkResourceExists(resource);
        if (exists) {
          this.addValidationResult('resources', `Recurso crítico ${resource} encontrado`, true);
        } else {
          this.addValidationResult('resources', `Recurso crítico ${resource} no encontrado`, false);
        }
      }
    } catch (error) {
      console.error('❌ Error validando recursos críticos:', error);
    }
  }

  /**
   * Verificar si un recurso existe
   */
  async checkResourceExists(url) {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  /**
   * Validar configuración
   */
  async validateConfiguration() {
    try {
      // Validar configuración Firebase
      if (window.axyraConfig) {
        const config = window.axyraConfig.getAxyraConfig();

        if (config.firebase) {
          this.addValidationResult('configuration', 'Configuración Firebase encontrada', true);
        } else {
          this.addValidationResult('configuration', 'Configuración Firebase no encontrada', false);
        }

        if (config.company) {
          this.addValidationResult('configuration', 'Configuración de empresa encontrada', true);
        } else {
          this.addValidationResult('configuration', 'Configuración de empresa no encontrada', false);
        }
      } else {
        this.addValidationResult('configuration', 'axyraConfig no disponible', false);
      }
    } catch (error) {
      console.error('❌ Error validando configuración:', error);
    }
  }

  /**
   * Validar funcionalidades
   */
  async validateFunctionalities() {
    try {
      // Validar autenticación
      await this.validateAuthentication();

      // Validar notificaciones
      await this.validateNotifications();

      // Validar dashboard
      await this.validateDashboard();

      // Validar módulos
      await this.validateModules();
    } catch (error) {
      console.error('❌ Error validando funcionalidades:', error);
    }
  }

  /**
   * Validar autenticación
   */
  async validateAuthentication() {
    try {
      if (window.axyraAuth) {
        this.addValidationResult('functionality', 'Sistema de autenticación disponible', true);

        // Validar métodos de autenticación
        const methods = ['login', 'logout', 'isAuthenticated'];
        for (const method of methods) {
          if (typeof window.axyraAuth[method] === 'function') {
            this.addValidationResult('functionality', `Método ${method} disponible`, true);
          } else {
            this.addValidationResult('functionality', `Método ${method} no disponible`, false);
          }
        }
      } else {
        this.addValidationResult('functionality', 'Sistema de autenticación no disponible', false);
      }
    } catch (error) {
      console.error('❌ Error validando autenticación:', error);
    }
  }

  /**
   * Validar notificaciones
   */
  async validateNotifications() {
    try {
      if (window.axyraNotifications) {
        this.addValidationResult('functionality', 'Sistema de notificaciones disponible', true);

        // Probar notificación
        window.axyraNotifications.showSuccess('Validación de notificaciones');
        this.addValidationResult('functionality', 'Notificaciones funcionando', true);
      } else {
        this.addValidationResult('functionality', 'Sistema de notificaciones no disponible', false);
      }
    } catch (error) {
      console.error('❌ Error validando notificaciones:', error);
    }
  }

  /**
   * Validar dashboard
   */
  async validateDashboard() {
    try {
      const dashboard = document.querySelector('.dashboard');
      if (dashboard) {
        this.addValidationResult('functionality', 'Dashboard encontrado', true);

        // Validar elementos del dashboard
        const elements = ['.metrics-grid', '.recent-activity', '.quick-actions'];

        for (const selector of elements) {
          const element = document.querySelector(selector);
          if (element) {
            this.addValidationResult('functionality', `Elemento ${selector} encontrado`, true);
          } else {
            this.addValidationResult('functionality', `Elemento ${selector} no encontrado`, false);
          }
        }
      } else {
        this.addValidationResult('functionality', 'Dashboard no encontrado', false);
      }
    } catch (error) {
      console.error('❌ Error validando dashboard:', error);
    }
  }

  /**
   * Validar módulos
   */
  async validateModules() {
    try {
      const modules = ['gestion-personal', 'inventario', 'cuadre-caja', 'configuracion'];

      for (const module of modules) {
        const moduleElement = document.querySelector(`[data-module="${module}"]`);
        if (moduleElement) {
          this.addValidationResult('functionality', `Módulo ${module} encontrado`, true);
        } else {
          this.addValidationResult('functionality', `Módulo ${module} no encontrado`, false);
        }
      }
    } catch (error) {
      console.error('❌ Error validando módulos:', error);
    }
  }

  /**
   * Validar integraciones
   */
  async validateIntegrations() {
    try {
      // Validar Google Workspace
      if (window.axyraGoogleWorkspace) {
        this.addValidationResult('integration', 'Google Workspace disponible', true);
      } else {
        this.addValidationResult('integration', 'Google Workspace no disponible', false);
      }

      // Validar Microsoft 365
      if (window.axyraMicrosoft365) {
        this.addValidationResult('integration', 'Microsoft 365 disponible', true);
      } else {
        this.addValidationResult('integration', 'Microsoft 365 no disponible', false);
      }

      // Validar Third Party Manager
      if (window.axyraThirdPartyManager) {
        this.addValidationResult('integration', 'Third Party Manager disponible', true);
      } else {
        this.addValidationResult('integration', 'Third Party Manager no disponible', false);
      }
    } catch (error) {
      console.error('❌ Error validando integraciones:', error);
    }
  }

  /**
   * Validar seguridad
   */
  async validateSecurity() {
    try {
      // Validar HTTPS
      if (location.protocol === 'https:') {
        this.addValidationResult('security', 'Conexión HTTPS segura', true);
      } else {
        this.addValidationResult('security', 'Conexión no segura (HTTP)', false);
      }

      // Validar Content Security Policy
      const csp = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
      if (csp) {
        this.addValidationResult('security', 'Content Security Policy configurado', true);
      } else {
        this.addValidationResult('security', 'Content Security Policy no configurado', false);
      }

      // Validar encriptación
      if (window.axyraEncryption) {
        this.addValidationResult('security', 'Sistema de encriptación disponible', true);
      } else {
        this.addValidationResult('security', 'Sistema de encriptación no disponible', false);
      }
    } catch (error) {
      console.error('❌ Error validando seguridad:', error);
    }
  }

  /**
   * Agregar resultado de validación
   */
  addValidationResult(category, message, passed, details = null) {
    const result = {
      category,
      message,
      passed,
      details,
      timestamp: new Date().toISOString(),
    };

    this.validationResults.details.push(result);
    this.validationResults.total++;

    if (passed) {
      this.validationResults.passed++;
    } else {
      this.validationResults.failed++;
    }

    console.log(`${passed ? '✅' : '❌'} ${message}`);
  }

  /**
   * Ejecutar validación completa
   */
  async runFullValidation() {
    if (this.isValidating) {
      console.warn('⚠️ Validación ya está en progreso');
      return;
    }

    this.isValidating = true;
    this.validationResults = {
      passed: 0,
      failed: 0,
      warnings: 0,
      total: 0,
      details: [],
    };

    try {
      console.log('🚀 Iniciando validación completa...');

      // Ejecutar todas las validaciones
      await this.validateOnLoad();
      await this.validateOnReady();
      await this.validateFunctionalities();
      await this.validateIntegrations();
      await this.validateSecurity();

      // Generar reporte
      this.generateValidationReport();

      console.log('✅ Validación completa finalizada');
    } catch (error) {
      console.error('❌ Error en validación completa:', error);
    } finally {
      this.isValidating = false;
    }
  }

  /**
   * Generar reporte de validación
   */
  generateValidationReport() {
    const report = {
      timestamp: new Date().toISOString(),
      results: this.validationResults,
      summary: this.generateValidationSummary(),
      recommendations: this.generateValidationRecommendations(),
    };

    console.log('📊 Reporte de Validación:', report);

    // Guardar reporte
    localStorage.setItem('axyra_validation_report', JSON.stringify(report));

    // Mostrar notificación
    if (window.axyraNotifications) {
      const successRate = Math.round((this.validationResults.passed / this.validationResults.total) * 100);
      if (successRate >= 90) {
        window.axyraNotifications.showSuccess(`✅ Validación completada: ${successRate}% de éxito`);
      } else {
        window.axyraNotifications.showError(`❌ Validación completada: ${successRate}% de éxito`);
      }
    }

    return report;
  }

  /**
   * Generar resumen de validación
   */
  generateValidationSummary() {
    const total = this.validationResults.total;
    const passed = this.validationResults.passed;
    const failed = this.validationResults.failed;
    const successRate = Math.round((passed / total) * 100);

    return {
      total,
      passed,
      failed,
      successRate,
      status: successRate >= 90 ? 'excellent' : successRate >= 70 ? 'good' : 'needs_improvement',
    };
  }

  /**
   * Generar recomendaciones de validación
   */
  generateValidationRecommendations() {
    const recommendations = [];
    const failed = this.validationResults.details.filter((d) => !d.passed);

    for (const failure of failed) {
      switch (failure.category) {
        case 'performance':
          recommendations.push({
            type: 'performance',
            message: 'Optimizar rendimiento del sistema',
            details: failure.details,
          });
          break;
        case 'security':
          recommendations.push({
            type: 'security',
            message: 'Mejorar configuración de seguridad',
            details: failure.details,
          });
          break;
        case 'functionality':
          recommendations.push({
            type: 'functionality',
            message: 'Verificar funcionalidades del sistema',
            details: failure.details,
          });
          break;
        case 'integration':
          recommendations.push({
            type: 'integration',
            message: 'Configurar integraciones correctamente',
            details: failure.details,
          });
          break;
      }
    }

    return recommendations;
  }

  /**
   * Obtener reporte de validación
   */
  getValidationReport() {
    const report = localStorage.getItem('axyra_validation_report');
    return report ? JSON.parse(report) : null;
  }

  /**
   * Limpiar reportes
   */
  clearValidationReports() {
    localStorage.removeItem('axyra_validation_report');
    this.validationResults = {
      passed: 0,
      failed: 0,
      warnings: 0,
      total: 0,
      details: [],
    };
  }
}

// Inicializar validador
window.axyraSystemValidator = new AxyraSystemValidator();

// Auto-inicializar
document.addEventListener('DOMContentLoaded', async () => {
  await window.axyraSystemValidator.initialize();
});

console.log('🔍 AXYRA System Validator cargado');
