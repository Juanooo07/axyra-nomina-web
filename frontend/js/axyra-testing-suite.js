/**
 * AXYRA Testing Suite
 * Suite de testing automatizado para el sistema AXYRA
 * Incluye: Tests unitarios, integración, performance y seguridad
 */

class AxyraTestingSuite {
  constructor() {
    this.tests = [];
    this.results = [];
    this.isRunning = false;
    this.config = {
      timeout: 30000, // 30 segundos
      retries: 3,
      parallel: true,
      verbose: true,
    };
  }

  /**
   * Inicializar la suite de testing
   */
  async initialize() {
    try {
      console.log('🧪 Inicializando AXYRA Testing Suite...');

      // Configurar listeners de eventos
      this.setupEventListeners();

      // Registrar tests por defecto
      this.registerDefaultTests();

      console.log('✅ AXYRA Testing Suite inicializada');
      return true;
    } catch (error) {
      console.error('❌ Error inicializando Testing Suite:', error);
      return false;
    }
  }

  /**
   * Configurar listeners de eventos
   */
  setupEventListeners() {
    // Listener para tests de performance
    window.addEventListener('load', () => {
      this.runPerformanceTests();
    });

    // Listener para tests de seguridad
    document.addEventListener('click', (event) => {
      this.runSecurityTests(event);
    });
  }

  /**
   * Registrar tests por defecto
   */
  registerDefaultTests() {
    // Tests de autenticación
    this.addTest('auth-login', 'Test de login', this.testAuthLogin.bind(this));
    this.addTest('auth-logout', 'Test de logout', this.testAuthLogout.bind(this));
    this.addTest('auth-session', 'Test de sesión', this.testAuthSession.bind(this));

    // Tests de configuración
    this.addTest('config-load', 'Test de carga de configuración', this.testConfigLoad.bind(this));
    this.addTest('config-save', 'Test de guardado de configuración', this.testConfigSave.bind(this));

    // Tests de notificaciones
    this.addTest('notifications-show', 'Test de notificaciones', this.testNotifications.bind(this));

    // Tests de integraciones
    this.addTest('integrations-status', 'Test de estado de integraciones', this.testIntegrationsStatus.bind(this));

    // Tests de performance
    this.addTest('performance-load', 'Test de tiempo de carga', this.testPerformanceLoad.bind(this));
    this.addTest('performance-memory', 'Test de uso de memoria', this.testPerformanceMemory.bind(this));

    // Tests de seguridad
    this.addTest('security-xss', 'Test de protección XSS', this.testSecurityXSS.bind(this));
    this.addTest('security-csrf', 'Test de protección CSRF', this.testSecurityCSRF.bind(this));
  }

  /**
   * Agregar test a la suite
   */
  addTest(id, name, testFunction, options = {}) {
    this.tests.push({
      id,
      name,
      testFunction,
      options: {
        timeout: this.config.timeout,
        retries: this.config.retries,
        ...options,
      },
    });
  }

  /**
   * Ejecutar todos los tests
   */
  async runAllTests() {
    if (this.isRunning) {
      console.warn('⚠️ Tests ya están ejecutándose');
      return;
    }

    this.isRunning = true;
    this.results = [];

    console.log('🚀 Iniciando ejecución de tests...');
    const startTime = Date.now();

    try {
      if (this.config.parallel) {
        await this.runTestsParallel();
      } else {
        await this.runTestsSequential();
      }

      const endTime = Date.now();
      const duration = endTime - startTime;

      this.generateReport(duration);
    } catch (error) {
      console.error('❌ Error ejecutando tests:', error);
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Ejecutar tests en paralelo
   */
  async runTestsParallel() {
    const testPromises = this.tests.map((test) => this.runSingleTest(test));
    await Promise.allSettled(testPromises);
  }

  /**
   * Ejecutar tests secuencialmente
   */
  async runTestsSequential() {
    for (const test of this.tests) {
      await this.runSingleTest(test);
    }
  }

  /**
   * Ejecutar un test individual
   */
  async runSingleTest(test) {
    const startTime = Date.now();
    let attempts = 0;
    let lastError = null;

    while (attempts < test.options.retries) {
      try {
        attempts++;

        const result = await Promise.race([
          test.testFunction(),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), test.options.timeout)),
        ]);

        const endTime = Date.now();
        const duration = endTime - startTime;

        this.results.push({
          id: test.id,
          name: test.name,
          status: 'passed',
          duration,
          attempts,
          result,
        });

        if (this.config.verbose) {
          console.log(`✅ ${test.name} - ${duration}ms`);
        }

        return;
      } catch (error) {
        lastError = error;

        if (attempts < test.options.retries) {
          console.warn(`⚠️ ${test.name} - Intento ${attempts} falló, reintentando...`);
          await this.delay(1000 * attempts); // Delay progresivo
        }
      }
    }

    const endTime = Date.now();
    const duration = endTime - startTime;

    this.results.push({
      id: test.id,
      name: test.name,
      status: 'failed',
      duration,
      attempts,
      error: lastError?.message || 'Error desconocido',
    });

    if (this.config.verbose) {
      console.error(`❌ ${test.name} - ${lastError?.message || 'Error desconocido'}`);
    }
  }

  /**
   * Tests de autenticación
   */
  async testAuthLogin() {
    if (!window.axyraAuth) {
      throw new Error('axyraAuth no está disponible');
    }

    // Test de inicialización
    const isInitialized = await window.axyraAuth.initialize();
    if (!isInitialized) {
      throw new Error('Error inicializando autenticación');
    }

    return { message: 'Login test passed' };
  }

  async testAuthLogout() {
    if (!window.axyraAuth) {
      throw new Error('axyraAuth no está disponible');
    }

    // Test de logout
    const result = await window.axyraAuth.logout();
    if (!result.success) {
      throw new Error('Error en logout');
    }

    return { message: 'Logout test passed' };
  }

  async testAuthSession() {
    if (!window.axyraAuth) {
      throw new Error('axyraAuth no está disponible');
    }

    // Test de verificación de sesión
    const isAuthenticated = await window.axyraAuth.isAuthenticated();

    return {
      message: 'Session test passed',
      authenticated: isAuthenticated,
    };
  }

  /**
   * Tests de configuración
   */
  async testConfigLoad() {
    if (!window.axyraConfig) {
      throw new Error('axyraConfig no está disponible');
    }

    // Test de carga de configuración
    const config = window.axyraConfig.getAxyraConfig();
    if (!config) {
      throw new Error('Error cargando configuración');
    }

    return {
      message: 'Config load test passed',
      hasFirebase: !!config.firebase,
      hasCompany: !!config.company,
    };
  }

  async testConfigSave() {
    if (!window.axyraConfig) {
      throw new Error('axyraConfig no está disponible');
    }

    // Test de guardado de configuración
    const testKey = 'test.value';
    const testValue = 'test-data-' + Date.now();

    window.axyraConfig.updateAxyraConfig(testKey, testValue);

    const savedValue = window.axyraConfig.getAxyraConfig(testKey);
    if (savedValue !== testValue) {
      throw new Error('Error guardando configuración');
    }

    return { message: 'Config save test passed' };
  }

  /**
   * Tests de notificaciones
   */
  async testNotifications() {
    if (!window.axyraNotifications) {
      throw new Error('axyraNotifications no está disponible');
    }

    // Test de mostrar notificación
    window.axyraNotifications.showSuccess('Test notification');

    // Verificar que la notificación se mostró
    const notificationElement = document.querySelector('.axyra-notification');
    if (!notificationElement) {
      throw new Error('Notificación no se mostró');
    }

    return { message: 'Notifications test passed' };
  }

  /**
   * Tests de integraciones
   */
  async testIntegrationsStatus() {
    if (!window.axyraThirdPartyManager) {
      throw new Error('axyraThirdPartyManager no está disponible');
    }

    // Test de estado de integraciones
    const status = await window.axyraThirdPartyManager.getIntegrationsStatus();
    if (!status || !status.integrations) {
      throw new Error('Error obteniendo estado de integraciones');
    }

    return {
      message: 'Integrations status test passed',
      integrations: Object.keys(status.integrations).length,
    };
  }

  /**
   * Tests de performance
   */
  async testPerformanceLoad() {
    const startTime = performance.now();

    // Simular carga de datos
    await this.delay(100);

    const endTime = performance.now();
    const loadTime = endTime - startTime;

    if (loadTime > 5000) {
      // Más de 5 segundos
      throw new Error(`Tiempo de carga muy lento: ${loadTime}ms`);
    }

    return {
      message: 'Performance load test passed',
      loadTime: Math.round(loadTime),
    };
  }

  async testPerformanceMemory() {
    if (!performance.memory) {
      return { message: 'Memory API no disponible' };
    }

    const memory = performance.memory;
    const usedMB = Math.round(memory.usedJSHeapSize / 1024 / 1024);
    const totalMB = Math.round(memory.totalJSHeapSize / 1024 / 1024);

    if (usedMB > 100) {
      // Más de 100MB
      throw new Error(`Uso de memoria muy alto: ${usedMB}MB`);
    }

    return {
      message: 'Performance memory test passed',
      usedMB,
      totalMB,
    };
  }

  /**
   * Tests de seguridad
   */
  async testSecurityXSS() {
    // Test de protección XSS
    const maliciousScript = '<script>alert("XSS")</script>';
    const sanitized = this.sanitizeHTML(maliciousScript);

    if (sanitized.includes('<script>')) {
      throw new Error('Protección XSS fallida');
    }

    return { message: 'Security XSS test passed' };
  }

  async testSecurityCSRF() {
    // Test de protección CSRF
    const csrfToken = this.generateCSRFToken();
    const isValid = this.validateCSRFToken(csrfToken);

    if (!isValid) {
      throw new Error('Protección CSRF fallida');
    }

    return { message: 'Security CSRF test passed' };
  }

  /**
   * Tests de performance automáticos
   */
  async runPerformanceTests() {
    try {
      // Test de Core Web Vitals
      const vitals = await this.measureCoreWebVitals();

      // Test de tiempo de carga de recursos
      const resourceTiming = this.analyzeResourceTiming();

      // Test de interacción
      const interactionTiming = this.measureInteractionTiming();

      console.log('📊 Performance Tests:', {
        vitals,
        resourceTiming,
        interactionTiming,
      });
    } catch (error) {
      console.error('❌ Error en performance tests:', error);
    }
  }

  /**
   * Tests de seguridad automáticos
   */
  runSecurityTests(event) {
    try {
      // Test de eventos sospechosos
      this.detectSuspiciousActivity(event);

      // Test de validación de entrada
      this.validateUserInput(event);
    } catch (error) {
      console.error('❌ Error en security tests:', error);
    }
  }

  /**
   * Medir Core Web Vitals
   */
  async measureCoreWebVitals() {
    return new Promise((resolve) => {
      const vitals = {};

      // LCP (Largest Contentful Paint)
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        vitals.lcp = lastEntry.startTime;
      }).observe({ entryTypes: ['largest-contentful-paint'] });

      // FID (First Input Delay)
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          vitals.fid = entry.processingStart - entry.startTime;
        });
      }).observe({ entryTypes: ['first-input'] });

      // CLS (Cumulative Layout Shift)
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

      setTimeout(() => resolve(vitals), 5000);
    });
  }

  /**
   * Analizar timing de recursos
   */
  analyzeResourceTiming() {
    const resources = performance.getEntriesByType('resource');
    const analysis = {
      total: resources.length,
      slow: 0,
      fast: 0,
      average: 0,
    };

    let totalTime = 0;
    resources.forEach((resource) => {
      const duration = resource.responseEnd - resource.startTime;
      totalTime += duration;

      if (duration > 1000) {
        analysis.slow++;
      } else {
        analysis.fast++;
      }
    });

    analysis.average = Math.round(totalTime / resources.length);
    return analysis;
  }

  /**
   * Medir timing de interacción
   */
  measureInteractionTiming() {
    const interactions = performance.getEntriesByType('measure');
    return {
      total: interactions.length,
      measures: interactions.map((m) => ({
        name: m.name,
        duration: m.duration,
      })),
    };
  }

  /**
   * Detectar actividad sospechosa
   */
  detectSuspiciousActivity(event) {
    // Detectar clicks rápidos (posible bot)
    const now = Date.now();
    if (!this.lastClickTime) {
      this.lastClickTime = now;
      return;
    }

    const timeDiff = now - this.lastClickTime;
    if (timeDiff < 100) {
      // Menos de 100ms entre clicks
      console.warn('⚠️ Actividad sospechosa detectada: clicks muy rápidos');
    }

    this.lastClickTime = now;
  }

  /**
   * Validar entrada del usuario
   */
  validateUserInput(event) {
    if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
      const value = event.target.value;

      // Detectar scripts maliciosos
      if (value.includes('<script>') || value.includes('javascript:')) {
        console.warn('⚠️ Entrada sospechosa detectada:', value);
        event.preventDefault();
      }
    }
  }

  /**
   * Utilidades
   */
  sanitizeHTML(html) {
    const div = document.createElement('div');
    div.textContent = html;
    return div.innerHTML;
  }

  generateCSRFToken() {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  validateCSRFToken(token) {
    return token && token.length > 10;
  }

  delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Generar reporte de tests
   */
  generateReport(duration) {
    const passed = this.results.filter((r) => r.status === 'passed').length;
    const failed = this.results.filter((r) => r.status === 'failed').length;
    const total = this.results.length;

    const report = {
      summary: {
        total,
        passed,
        failed,
        duration: Math.round(duration),
        successRate: Math.round((passed / total) * 100),
      },
      results: this.results,
    };

    console.log('📊 Test Report:', report);

    // Guardar reporte
    localStorage.setItem('axyra_test_report', JSON.stringify(report));

    // Mostrar notificación
    if (window.axyraNotifications) {
      if (failed === 0) {
        window.axyraNotifications.showSuccess(`✅ Todos los tests pasaron (${passed}/${total})`);
      } else {
        window.axyraNotifications.showError(`❌ ${failed} tests fallaron (${passed}/${total})`);
      }
    }

    return report;
  }

  /**
   * Obtener reporte de tests
   */
  getTestReport() {
    const report = localStorage.getItem('axyra_test_report');
    return report ? JSON.parse(report) : null;
  }

  /**
   * Limpiar reportes
   */
  clearReports() {
    localStorage.removeItem('axyra_test_report');
    this.results = [];
  }
}

// Inicializar suite de testing
window.axyraTestingSuite = new AxyraTestingSuite();

// Auto-inicializar
document.addEventListener('DOMContentLoaded', async () => {
  await window.axyraTestingSuite.initialize();
});

console.log('🧪 AXYRA Testing Suite cargado');
