// ========================================
// AXYRA SECURITY MONITORING SYSTEM
// Sistema de monitoreo de seguridad en tiempo real
// ========================================

class AxyraSecurityMonitoringSystem {
  constructor() {
    this.isMonitoring = false;
    this.securityEvents = [];
    this.threatLevel = 'low';
    this.securityMetrics = {
      totalEvents: 0,
      criticalEvents: 0,
      warningEvents: 0,
      infoEvents: 0,
      blockedAttempts: 0,
      lastEventTime: null,
    };

    this.monitoringSettings = {
      enableRealTimeMonitoring: true,
      enableThreatDetection: true,
      enableBehaviorAnalysis: true,
      enableNetworkMonitoring: true,
      enableDeviceMonitoring: true,
      alertThreshold: 5,
      criticalThreshold: 10,
    };

    this.init();
  }

  async init() {
    console.log('🛡️ Inicializando Sistema de Monitoreo de Seguridad AXYRA...');

    try {
      await this.loadSecuritySettings();
      this.setupSecurityMonitoring();
      this.setupThreatDetection();
      this.setupBehaviorAnalysis();
      this.setupNetworkMonitoring();
      this.setupDeviceMonitoring();
      this.setupSecurityAlerts();
      console.log('✅ Sistema de Monitoreo de Seguridad AXYRA inicializado');
    } catch (error) {
      console.error('❌ Error inicializando monitoreo de seguridad:', error);
    }
  }

  async loadSecuritySettings() {
    try {
      const settings = localStorage.getItem('axyra_security_monitoring_settings');
      if (settings) {
        const parsedSettings = JSON.parse(settings);
        this.monitoringSettings = { ...this.monitoringSettings, ...parsedSettings };
      }

      const events = localStorage.getItem('axyra_security_events');
      if (events) {
        this.securityEvents = JSON.parse(events);
      }

      const metrics = localStorage.getItem('axyra_security_metrics');
      if (metrics) {
        this.securityMetrics = { ...this.securityMetrics, ...JSON.parse(metrics) };
      }
    } catch (error) {
      console.error('❌ Error cargando configuración de seguridad:', error);
    }
  }

  setupSecurityMonitoring() {
    if (!this.monitoringSettings.enableRealTimeMonitoring) return;

    this.isMonitoring = true;

    // Monitorear eventos de seguridad
    this.monitorSecurityEvents();

    // Monitorear actividad del usuario
    this.monitorUserActivity();

    // Monitorear cambios en el sistema
    this.monitorSystemChanges();

    // Monitorear acceso a datos
    this.monitorDataAccess();
  }

  monitorSecurityEvents() {
    // Monitorear eventos de autenticación
    document.addEventListener('authSuccess', (event) => {
      this.recordSecurityEvent('auth_success', {
        userId: event.detail.userId,
        timestamp: Date.now(),
        device: this.getCurrentDeviceInfo(),
      });
    });

    document.addEventListener('authFailure', (event) => {
      this.recordSecurityEvent('auth_failure', {
        userId: event.detail.userId,
        reason: event.detail.reason,
        timestamp: Date.now(),
        device: this.getCurrentDeviceInfo(),
      });
    });

    // Monitorear eventos de 2FA
    document.addEventListener('2FASuccess', (event) => {
      this.recordSecurityEvent('2fa_success', {
        userId: event.detail.userId,
        timestamp: Date.now(),
      });
    });

    document.addEventListener('2FAFailure', (event) => {
      this.recordSecurityEvent('2fa_failure', {
        userId: event.detail.userId,
        timestamp: Date.now(),
      });
    });

    // Monitorear eventos de encriptación
    document.addEventListener('encryptionSuccess', (event) => {
      this.recordSecurityEvent('encryption_success', {
        dataType: event.detail.dataType,
        timestamp: Date.now(),
      });
    });

    document.addEventListener('encryptionFailure', (event) => {
      this.recordSecurityEvent('encryption_failure', {
        dataType: event.detail.dataType,
        error: event.detail.error,
        timestamp: Date.now(),
      });
    });
  }

  monitorUserActivity() {
    // Monitorear actividad del usuario
    this.monitorMouseActivity();
    this.monitorKeyboardActivity();
    this.monitorScrollActivity();
    this.monitorClickActivity();
    this.monitorFormActivity();
  }

  monitorMouseActivity() {
    let mouseEvents = 0;
    let lastMouseTime = Date.now();

    document.addEventListener('mousemove', (event) => {
      const now = Date.now();
      const timeDiff = now - lastMouseTime;

      if (timeDiff < 100) {
        // Muy rápido
        mouseEvents++;
        if (mouseEvents > 100) {
          this.recordSecurityEvent('suspicious_mouse_activity', {
            events: mouseEvents,
            timestamp: now,
            coordinates: { x: event.clientX, y: event.clientY },
          });
        }
      } else {
        mouseEvents = 0;
      }

      lastMouseTime = now;
    });
  }

  monitorKeyboardActivity() {
    let keyEvents = 0;
    let lastKeyTime = Date.now();

    document.addEventListener('keydown', (event) => {
      const now = Date.now();
      const timeDiff = now - lastKeyTime;

      if (timeDiff < 50) {
        // Muy rápido
        keyEvents++;
        if (keyEvents > 50) {
          this.recordSecurityEvent('suspicious_keyboard_activity', {
            events: keyEvents,
            timestamp: now,
            key: event.key,
          });
        }
      } else {
        keyEvents = 0;
      }

      lastKeyTime = now;
    });
  }

  monitorScrollActivity() {
    let scrollEvents = 0;
    let lastScrollTime = Date.now();

    document.addEventListener('scroll', (event) => {
      const now = Date.now();
      const timeDiff = now - lastScrollTime;

      if (timeDiff < 10) {
        // Muy rápido
        scrollEvents++;
        if (scrollEvents > 20) {
          this.recordSecurityEvent('suspicious_scroll_activity', {
            events: scrollEvents,
            timestamp: now,
            scrollY: window.scrollY,
          });
        }
      } else {
        scrollEvents = 0;
      }

      lastScrollTime = now;
    });
  }

  monitorClickActivity() {
    let clickEvents = 0;
    let lastClickTime = Date.now();

    document.addEventListener('click', (event) => {
      const now = Date.now();
      const timeDiff = now - lastClickTime;

      if (timeDiff < 100) {
        // Muy rápido
        clickEvents++;
        if (clickEvents > 10) {
          this.recordSecurityEvent('suspicious_click_activity', {
            events: clickEvents,
            timestamp: now,
            target: event.target.tagName,
          });
        }
      } else {
        clickEvents = 0;
      }

      lastClickTime = now;
    });
  }

  monitorFormActivity() {
    const forms = document.querySelectorAll('form');
    forms.forEach((form) => {
      form.addEventListener('submit', (event) => {
        this.recordSecurityEvent('form_submission', {
          formId: form.id || 'unknown',
          timestamp: Date.now(),
          action: form.action,
        });
      });
    });
  }

  monitorSystemChanges() {
    // Monitorear cambios en el DOM
    this.monitorDOMChanges();

    // Monitorear cambios en localStorage
    this.monitorLocalStorageChanges();

    // Monitorear cambios en sessionStorage
    this.monitorSessionStorageChanges();
  }

  monitorDOMChanges() {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          this.recordSecurityEvent('dom_change', {
            type: 'childList',
            timestamp: Date.now(),
            target: mutation.target.tagName,
            addedNodes: mutation.addedNodes.length,
            removedNodes: mutation.removedNodes.length,
          });
        }
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeOldValue: true,
    });
  }

  monitorLocalStorageChanges() {
    const originalSetItem = localStorage.setItem;
    const originalRemoveItem = localStorage.removeItem;

    localStorage.setItem = (key, value) => {
      this.recordSecurityEvent('localStorage_set', {
        key: key,
        timestamp: Date.now(),
        valueLength: value.length,
      });
      return originalSetItem.call(localStorage, key, value);
    };

    localStorage.removeItem = (key) => {
      this.recordSecurityEvent('localStorage_remove', {
        key: key,
        timestamp: Date.now(),
      });
      return originalRemoveItem.call(localStorage, key);
    };
  }

  monitorSessionStorageChanges() {
    const originalSetItem = sessionStorage.setItem;
    const originalRemoveItem = sessionStorage.removeItem;

    sessionStorage.setItem = (key, value) => {
      this.recordSecurityEvent('sessionStorage_set', {
        key: key,
        timestamp: Date.now(),
        valueLength: value.length,
      });
      return originalSetItem.call(sessionStorage, key, value);
    };

    sessionStorage.removeItem = (key) => {
      this.recordSecurityEvent('sessionStorage_remove', {
        key: key,
        timestamp: Date.now(),
      });
      return originalRemoveItem.call(sessionStorage, key);
    };
  }

  monitorDataAccess() {
    // Monitorear acceso a datos sensibles
    this.monitorSensitiveDataAccess();

    // Monitorear exportación de datos
    this.monitorDataExport();

    // Monitorear importación de datos
    this.monitorDataImport();
  }

  monitorSensitiveDataAccess() {
    const sensitiveKeys = ['axyra_user_', 'axyra_employee_', 'axyra_payroll_', 'axyra_financial_'];

    const originalGetItem = localStorage.getItem;
    localStorage.getItem = (key) => {
      if (sensitiveKeys.some((prefix) => key.startsWith(prefix))) {
        this.recordSecurityEvent('sensitive_data_access', {
          key: key,
          timestamp: Date.now(),
          userAgent: navigator.userAgent,
        });
      }
      return originalGetItem.call(localStorage, key);
    };
  }

  monitorDataExport() {
    // Monitorear exportación de datos
    document.addEventListener('dataExport', (event) => {
      this.recordSecurityEvent('data_export', {
        dataType: event.detail.dataType,
        timestamp: Date.now(),
        userId: event.detail.userId,
      });
    });
  }

  monitorDataImport() {
    // Monitorear importación de datos
    document.addEventListener('dataImport', (event) => {
      this.recordSecurityEvent('data_import', {
        dataType: event.detail.dataType,
        timestamp: Date.now(),
        userId: event.detail.userId,
      });
    });
  }

  // Métodos de detección de amenazas
  setupThreatDetection() {
    if (!this.monitoringSettings.enableThreatDetection) return;

    this.detectSuspiciousPatterns();
    this.detectAnomalousBehavior();
    this.detectPotentialAttacks();
  }

  detectSuspiciousPatterns() {
    // Detectar patrones sospechosos
    this.detectRapidRequests();
    this.detectUnusualAccess();
    this.detectSuspiciousNavigation();
  }

  detectRapidRequests() {
    let requestCount = 0;
    let lastRequestTime = Date.now();

    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const now = Date.now();

      if (now - lastRequestTime < 1000) {
        // Menos de 1 segundo
        requestCount++;

        if (requestCount > 10) {
          this.recordSecurityEvent('rapid_requests', {
            count: requestCount,
            timestamp: now,
            url: args[0],
          });
        }
      } else {
        requestCount = 0;
      }

      lastRequestTime = now;
      return originalFetch(...args);
    };
  }

  detectUnusualAccess() {
    // Detectar acceso en horas inusuales
    const currentHour = new Date().getHours();
    const unusualHours = [0, 1, 2, 3, 4, 5, 22, 23];

    if (unusualHours.includes(currentHour)) {
      this.recordSecurityEvent('unusual_access_time', {
        hour: currentHour,
        timestamp: Date.now(),
      });
    }
  }

  detectSuspiciousNavigation() {
    // Detectar navegación sospechosa
    let navigationCount = 0;
    let lastNavigationTime = Date.now();

    window.addEventListener('popstate', () => {
      const now = Date.now();
      const timeDiff = now - lastNavigationTime;

      if (timeDiff < 1000) {
        // Muy rápido
        navigationCount++;
        if (navigationCount > 5) {
          this.recordSecurityEvent('suspicious_navigation', {
            count: navigationCount,
            timestamp: now,
          });
        }
      } else {
        navigationCount = 0;
      }

      lastNavigationTime = now;
    });
  }

  detectAnomalousBehavior() {
    // Detectar comportamiento anómalo
    this.detectUnusualMousePatterns();
    this.detectUnusualKeyboardPatterns();
    this.detectUnusualScrollPatterns();
  }

  detectUnusualMousePatterns() {
    let mouseMovements = [];
    let lastMouseTime = Date.now();

    document.addEventListener('mousemove', (event) => {
      const now = Date.now();
      const timeDiff = now - lastMouseTime;

      mouseMovements.push({
        x: event.clientX,
        y: event.clientY,
        time: now,
        timeDiff: timeDiff,
      });

      // Mantener solo los últimos 100 movimientos
      if (mouseMovements.length > 100) {
        mouseMovements.shift();
      }

      // Analizar patrones
      if (mouseMovements.length > 50) {
        this.analyzeMousePatterns(mouseMovements);
      }

      lastMouseTime = now;
    });
  }

  analyzeMousePatterns(movements) {
    // Analizar patrones de movimiento del mouse
    const distances = [];
    const times = [];

    for (let i = 1; i < movements.length; i++) {
      const prev = movements[i - 1];
      const curr = movements[i];

      const distance = Math.sqrt(Math.pow(curr.x - prev.x, 2) + Math.pow(curr.y - prev.y, 2));

      distances.push(distance);
      times.push(curr.timeDiff);
    }

    // Detectar patrones anómalos
    const avgDistance = distances.reduce((sum, d) => sum + d, 0) / distances.length;
    const avgTime = times.reduce((sum, t) => sum + t, 0) / times.length;

    if (avgDistance > 500 || avgTime < 10) {
      this.recordSecurityEvent('anomalous_mouse_pattern', {
        avgDistance: avgDistance,
        avgTime: avgTime,
        timestamp: Date.now(),
      });
    }
  }

  detectUnusualKeyboardPatterns() {
    let keyPresses = [];
    let lastKeyTime = Date.now();

    document.addEventListener('keydown', (event) => {
      const now = Date.now();
      const timeDiff = now - lastKeyTime;

      keyPresses.push({
        key: event.key,
        time: now,
        timeDiff: timeDiff,
      });

      // Mantener solo los últimos 100 teclas
      if (keyPresses.length > 100) {
        keyPresses.shift();
      }

      // Analizar patrones
      if (keyPresses.length > 50) {
        this.analyzeKeyboardPatterns(keyPresses);
      }

      lastKeyTime = now;
    });
  }

  analyzeKeyboardPatterns(keyPresses) {
    // Analizar patrones de teclado
    const times = keyPresses.map((k) => k.timeDiff);
    const avgTime = times.reduce((sum, t) => sum + t, 0) / times.length;

    if (avgTime < 10) {
      // Muy rápido
      this.recordSecurityEvent('anomalous_keyboard_pattern', {
        avgTime: avgTime,
        timestamp: Date.now(),
      });
    }
  }

  detectUnusualScrollPatterns() {
    let scrollEvents = [];
    let lastScrollTime = Date.now();

    document.addEventListener('scroll', (event) => {
      const now = Date.now();
      const timeDiff = now - lastScrollTime;

      scrollEvents.push({
        scrollY: window.scrollY,
        time: now,
        timeDiff: timeDiff,
      });

      // Mantener solo los últimos 100 eventos
      if (scrollEvents.length > 100) {
        scrollEvents.shift();
      }

      // Analizar patrones
      if (scrollEvents.length > 50) {
        this.analyzeScrollPatterns(scrollEvents);
      }

      lastScrollTime = now;
    });
  }

  analyzeScrollPatterns(scrollEvents) {
    // Analizar patrones de scroll
    const times = scrollEvents.map((s) => s.timeDiff);
    const avgTime = times.reduce((sum, t) => sum + t, 0) / times.length;

    if (avgTime < 5) {
      // Muy rápido
      this.recordSecurityEvent('anomalous_scroll_pattern', {
        avgTime: avgTime,
        timestamp: Date.now(),
      });
    }
  }

  detectPotentialAttacks() {
    // Detectar ataques potenciales
    this.detectXSSAttempts();
    this.detectCSRFAttempts();
    this.detectSQLInjectionAttempts();
    this.detectBruteForceAttempts();
  }

  detectXSSAttempts() {
    // Detectar intentos de XSS
    const suspiciousPatterns = [/<script/i, /javascript:/i, /on\w+\s*=/i, /<iframe/i, /<object/i, /<embed/i];

    document.addEventListener('input', (event) => {
      const value = event.target.value;

      suspiciousPatterns.forEach((pattern) => {
        if (pattern.test(value)) {
          this.recordSecurityEvent('xss_attempt', {
            pattern: pattern.toString(),
            value: value,
            timestamp: Date.now(),
            target: event.target.tagName,
          });
        }
      });
    });
  }

  detectCSRFAttempts() {
    // Detectar intentos de CSRF
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const url = args[0];
      const options = args[1] || {};

      // Verificar headers de seguridad
      if (!options.headers || !options.headers['X-Requested-With']) {
        this.recordSecurityEvent('csrf_attempt', {
          url: url,
          timestamp: Date.now(),
          method: options.method || 'GET',
        });
      }

      return originalFetch(...args);
    };
  }

  detectSQLInjectionAttempts() {
    // Detectar intentos de inyección SQL
    const suspiciousPatterns = [
      /union\s+select/i,
      /drop\s+table/i,
      /delete\s+from/i,
      /insert\s+into/i,
      /update\s+set/i,
      /or\s+1\s*=\s*1/i,
    ];

    document.addEventListener('input', (event) => {
      const value = event.target.value;

      suspiciousPatterns.forEach((pattern) => {
        if (pattern.test(value)) {
          this.recordSecurityEvent('sql_injection_attempt', {
            pattern: pattern.toString(),
            value: value,
            timestamp: Date.now(),
            target: event.target.tagName,
          });
        }
      });
    });
  }

  detectBruteForceAttempts() {
    // Detectar intentos de fuerza bruta
    let failedAttempts = 0;
    let lastAttemptTime = Date.now();

    document.addEventListener('authFailure', () => {
      const now = Date.now();
      const timeDiff = now - lastAttemptTime;

      if (timeDiff < 60000) {
        // Menos de 1 minuto
        failedAttempts++;

        if (failedAttempts > 5) {
          this.recordSecurityEvent('brute_force_attempt', {
            attempts: failedAttempts,
            timestamp: now,
          });
        }
      } else {
        failedAttempts = 0;
      }

      lastAttemptTime = now;
    });
  }

  // Métodos de análisis de comportamiento
  setupBehaviorAnalysis() {
    if (!this.monitoringSettings.enableBehaviorAnalysis) return;

    this.analyzeUserBehavior();
    this.analyzeSystemBehavior();
    this.analyzeNetworkBehavior();
  }

  analyzeUserBehavior() {
    // Analizar comportamiento del usuario
    this.analyzeNavigationPatterns();
    this.analyzeInteractionPatterns();
    this.analyzeTimePatterns();
  }

  analyzeNavigationPatterns() {
    // Analizar patrones de navegación
    const navigationHistory = JSON.parse(localStorage.getItem('axyra_navigation_history') || '[]');

    // Detectar navegación anómala
    if (navigationHistory.length > 0) {
      const lastNavigation = navigationHistory[navigationHistory.length - 1];
      const timeDiff = Date.now() - lastNavigation.timestamp;

      if (timeDiff < 1000) {
        // Muy rápido
        this.recordSecurityEvent('anomalous_navigation', {
          timeDiff: timeDiff,
          timestamp: Date.now(),
        });
      }
    }
  }

  analyzeInteractionPatterns() {
    // Analizar patrones de interacción
    this.analyzeClickPatterns();
    this.analyzeFormPatterns();
    this.analyzeScrollPatterns();
  }

  analyzeClickPatterns() {
    // Analizar patrones de clics
    let clickCount = 0;
    let lastClickTime = Date.now();

    document.addEventListener('click', (event) => {
      const now = Date.now();
      const timeDiff = now - lastClickTime;

      if (timeDiff < 100) {
        // Muy rápido
        clickCount++;

        if (clickCount > 10) {
          this.recordSecurityEvent('anomalous_click_pattern', {
            count: clickCount,
            timestamp: now,
          });
        }
      } else {
        clickCount = 0;
      }

      lastClickTime = now;
    });
  }

  analyzeFormPatterns() {
    // Analizar patrones de formularios
    const forms = document.querySelectorAll('form');
    forms.forEach((form) => {
      form.addEventListener('submit', (event) => {
        const formData = new FormData(form);
        const data = Object.fromEntries(formData);

        // Detectar datos sospechosos
        Object.entries(data).forEach(([key, value]) => {
          if (typeof value === 'string' && value.length > 1000) {
            this.recordSecurityEvent('suspicious_form_data', {
              key: key,
              length: value.length,
              timestamp: Date.now(),
            });
          }
        });
      });
    });
  }

  analyzeScrollPatterns() {
    // Analizar patrones de scroll
    let scrollCount = 0;
    let lastScrollTime = Date.now();

    document.addEventListener('scroll', (event) => {
      const now = Date.now();
      const timeDiff = now - lastScrollTime;

      if (timeDiff < 10) {
        // Muy rápido
        scrollCount++;

        if (scrollCount > 20) {
          this.recordSecurityEvent('anomalous_scroll_pattern', {
            count: scrollCount,
            timestamp: now,
          });
        }
      } else {
        scrollCount = 0;
      }

      lastScrollTime = now;
    });
  }

  analyzeTimePatterns() {
    // Analizar patrones de tiempo
    const currentHour = new Date().getHours();
    const currentDay = new Date().getDay();

    // Detectar acceso en horas inusuales
    if (currentHour < 6 || currentHour > 22) {
      this.recordSecurityEvent('unusual_access_time', {
        hour: currentHour,
        day: currentDay,
        timestamp: Date.now(),
      });
    }
  }

  analyzeSystemBehavior() {
    // Analizar comportamiento del sistema
    this.analyzePerformancePatterns();
    this.analyzeErrorPatterns();
    this.analyzeResourcePatterns();
  }

  analyzePerformancePatterns() {
    // Analizar patrones de rendimiento
    const performanceEntries = performance.getEntriesByType('navigation');

    if (performanceEntries.length > 0) {
      const entry = performanceEntries[0];
      const loadTime = entry.loadEventEnd - entry.loadEventStart;

      if (loadTime > 10000) {
        // Más de 10 segundos
        this.recordSecurityEvent('performance_anomaly', {
          loadTime: loadTime,
          timestamp: Date.now(),
        });
      }
    }
  }

  analyzeErrorPatterns() {
    // Analizar patrones de errores
    let errorCount = 0;
    let lastErrorTime = Date.now();

    window.addEventListener('error', (event) => {
      const now = Date.now();
      const timeDiff = now - lastErrorTime;

      if (timeDiff < 1000) {
        // Menos de 1 segundo
        errorCount++;

        if (errorCount > 5) {
          this.recordSecurityEvent('error_anomaly', {
            count: errorCount,
            timestamp: now,
            error: event.error?.message,
          });
        }
      } else {
        errorCount = 0;
      }

      lastErrorTime = now;
    });
  }

  analyzeResourcePatterns() {
    // Analizar patrones de recursos
    const resourceEntries = performance.getEntriesByType('resource');

    resourceEntries.forEach((entry) => {
      if (entry.duration > 5000) {
        // Más de 5 segundos
        this.recordSecurityEvent('resource_anomaly', {
          name: entry.name,
          duration: entry.duration,
          timestamp: Date.now(),
        });
      }
    });
  }

  analyzeNetworkBehavior() {
    // Analizar comportamiento de red
    this.analyzeRequestPatterns();
    this.analyzeResponsePatterns();
    this.analyzeConnectionPatterns();
  }

  analyzeRequestPatterns() {
    // Analizar patrones de requests
    let requestCount = 0;
    let lastRequestTime = Date.now();

    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const now = Date.now();
      const timeDiff = now - lastRequestTime;

      if (timeDiff < 1000) {
        // Menos de 1 segundo
        requestCount++;

        if (requestCount > 10) {
          this.recordSecurityEvent('request_anomaly', {
            count: requestCount,
            timestamp: now,
            url: args[0],
          });
        }
      } else {
        requestCount = 0;
      }

      lastRequestTime = now;
      return originalFetch(...args);
    };
  }

  analyzeResponsePatterns() {
    // Analizar patrones de respuestas
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      try {
        const response = await originalFetch(...args);

        if (response.status >= 400) {
          this.recordSecurityEvent('response_error', {
            status: response.status,
            url: args[0],
            timestamp: Date.now(),
          });
        }

        return response;
      } catch (error) {
        this.recordSecurityEvent('network_error', {
          error: error.message,
          url: args[0],
          timestamp: Date.now(),
        });
        throw error;
      }
    };
  }

  analyzeConnectionPatterns() {
    // Analizar patrones de conexión
    if (navigator.onLine === false) {
      this.recordSecurityEvent('connection_lost', {
        timestamp: Date.now(),
      });
    }

    window.addEventListener('online', () => {
      this.recordSecurityEvent('connection_restored', {
        timestamp: Date.now(),
      });
    });

    window.addEventListener('offline', () => {
      this.recordSecurityEvent('connection_lost', {
        timestamp: Date.now(),
      });
    });
  }

  // Métodos de monitoreo de red
  setupNetworkMonitoring() {
    if (!this.monitoringSettings.enableNetworkMonitoring) return;

    this.monitorNetworkTraffic();
    this.monitorNetworkLatency();
    this.monitorNetworkErrors();
  }

  monitorNetworkTraffic() {
    // Monitorear tráfico de red
    let totalRequests = 0;
    let totalBytes = 0;

    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      totalRequests++;

      try {
        const response = await originalFetch(...args);

        // Estimar tamaño de respuesta
        const contentLength = response.headers.get('content-length');
        if (contentLength) {
          totalBytes += parseInt(contentLength);
        }

        return response;
      } catch (error) {
        this.recordSecurityEvent('network_error', {
          error: error.message,
          url: args[0],
          timestamp: Date.now(),
        });
        throw error;
      }
    };

    // Reportar métricas cada 5 minutos
    setInterval(() => {
      this.recordSecurityEvent('network_metrics', {
        totalRequests: totalRequests,
        totalBytes: totalBytes,
        timestamp: Date.now(),
      });

      totalRequests = 0;
      totalBytes = 0;
    }, 5 * 60 * 1000);
  }

  monitorNetworkLatency() {
    // Monitorear latencia de red
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const startTime = performance.now();

      try {
        const response = await originalFetch(...args);
        const endTime = performance.now();
        const latency = endTime - startTime;

        if (latency > 5000) {
          // Más de 5 segundos
          this.recordSecurityEvent('high_latency', {
            latency: latency,
            url: args[0],
            timestamp: Date.now(),
          });
        }

        return response;
      } catch (error) {
        this.recordSecurityEvent('network_error', {
          error: error.message,
          url: args[0],
          timestamp: Date.now(),
        });
        throw error;
      }
    };
  }

  monitorNetworkErrors() {
    // Monitorear errores de red
    window.addEventListener('error', (event) => {
      if (event.target.tagName === 'SCRIPT' || event.target.tagName === 'LINK') {
        this.recordSecurityEvent('resource_load_error', {
          tagName: event.target.tagName,
          src: event.target.src || event.target.href,
          timestamp: Date.now(),
        });
      }
    });
  }

  // Métodos de monitoreo de dispositivos
  setupDeviceMonitoring() {
    if (!this.monitoringSettings.enableDeviceMonitoring) return;

    this.monitorDeviceChanges();
    this.monitorDeviceCapabilities();
    this.monitorDeviceSecurity();
  }

  monitorDeviceChanges() {
    // Monitorear cambios en el dispositivo
    const currentDevice = this.getCurrentDeviceInfo();
    const storedDevice = localStorage.getItem('axyra_last_device');

    if (storedDevice) {
      const previousDevice = JSON.parse(storedDevice);

      if (!this.isSameDevice(currentDevice, previousDevice)) {
        this.recordSecurityEvent('device_change', {
          current: currentDevice,
          previous: previousDevice,
          timestamp: Date.now(),
        });
      }
    }

    localStorage.setItem('axyra_last_device', JSON.stringify(currentDevice));
  }

  monitorDeviceCapabilities() {
    // Monitorear capacidades del dispositivo
    const capabilities = {
      screen: {
        width: screen.width,
        height: screen.height,
        colorDepth: screen.colorDepth,
        pixelDepth: screen.pixelDepth,
      },
      navigator: {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language,
        cookieEnabled: navigator.cookieEnabled,
        onLine: navigator.onLine,
      },
      window: {
        innerWidth: window.innerWidth,
        innerHeight: window.innerHeight,
        outerWidth: window.outerWidth,
        outerHeight: window.outerHeight,
      },
    };

    this.recordSecurityEvent('device_capabilities', {
      capabilities: capabilities,
      timestamp: Date.now(),
    });
  }

  monitorDeviceSecurity() {
    // Monitorear seguridad del dispositivo
    const securityFeatures = {
      https: window.location.protocol === 'https:',
      secureContext: window.isSecureContext,
      serviceWorker: 'serviceWorker' in navigator,
      webCrypto: 'crypto' in window && 'subtle' in window.crypto,
    };

    this.recordSecurityEvent('device_security', {
      features: securityFeatures,
      timestamp: Date.now(),
    });
  }

  // Métodos de alertas de seguridad
  setupSecurityAlerts() {
    this.setupAlertThresholds();
    this.setupAlertNotifications();
    this.setupAlertActions();
  }

  setupAlertThresholds() {
    // Configurar umbrales de alerta
    this.alertThresholds = {
      critical: 10,
      warning: 5,
      info: 1,
    };
  }

  setupAlertNotifications() {
    // Configurar notificaciones de alerta
    this.alertNotifications = {
      enabled: true,
      sound: true,
      visual: true,
      email: false,
    };
  }

  setupAlertActions() {
    // Configurar acciones de alerta
    this.alertActions = {
      blockUser: false,
      requireReauth: false,
      logEvent: true,
      notifyAdmin: false,
    };
  }

  // Métodos de registro de eventos
  recordSecurityEvent(type, details) {
    const event = {
      type: type,
      details: details,
      timestamp: Date.now(),
      threatLevel: this.calculateThreatLevel(type, details),
    };

    this.securityEvents.push(event);
    this.updateSecurityMetrics(event);

    // Mantener solo los últimos 1000 eventos
    if (this.securityEvents.length > 1000) {
      this.securityEvents.shift();
    }

    // Guardar eventos
    this.saveSecurityEvents();

    // Verificar alertas
    this.checkSecurityAlerts(event);
  }

  calculateThreatLevel(type, details) {
    const criticalEvents = [
      'xss_attempt',
      'csrf_attempt',
      'sql_injection_attempt',
      'brute_force_attempt',
      'data_breach',
      'unauthorized_access',
    ];

    const warningEvents = [
      'suspicious_activity',
      'anomalous_behavior',
      'unusual_access',
      'device_change',
      'high_latency',
    ];

    if (criticalEvents.includes(type)) {
      return 'critical';
    } else if (warningEvents.includes(type)) {
      return 'warning';
    } else {
      return 'info';
    }
  }

  updateSecurityMetrics(event) {
    this.securityMetrics.totalEvents++;
    this.securityMetrics.lastEventTime = event.timestamp;

    switch (event.threatLevel) {
      case 'critical':
        this.securityMetrics.criticalEvents++;
        break;
      case 'warning':
        this.securityMetrics.warningEvents++;
        break;
      case 'info':
        this.securityMetrics.infoEvents++;
        break;
    }

    this.saveSecurityMetrics();
  }

  checkSecurityAlerts(event) {
    if (event.threatLevel === 'critical') {
      this.triggerCriticalAlert(event);
    } else if (event.threatLevel === 'warning') {
      this.triggerWarningAlert(event);
    }
  }

  triggerCriticalAlert(event) {
    console.error('🚨 ALERTA CRÍTICA DE SEGURIDAD:', event);

    if (this.alertNotifications.enabled) {
      this.showSecurityAlert('Alerta Crítica', event.type, 'error');
    }

    if (this.alertActions.blockUser) {
      this.blockUser();
    }

    if (this.alertActions.requireReauth) {
      this.requireReauthentication();
    }
  }

  triggerWarningAlert(event) {
    console.warn('⚠️ ALERTA DE SEGURIDAD:', event);

    if (this.alertNotifications.enabled) {
      this.showSecurityAlert('Alerta de Seguridad', event.type, 'warning');
    }
  }

  showSecurityAlert(title, message, type) {
    if (window.axyraNotifications) {
      window.axyraNotifications.showWarning(message, {
        title: title,
        persistent: true,
        type: type,
      });
    }
  }

  blockUser() {
    // Bloquear usuario
    localStorage.setItem('axyra_user_blocked', 'true');
    window.location.href = '/blocked.html';
  }

  requireReauthentication() {
    // Requerir reautenticación
    localStorage.removeItem('axyra_user_session');
    window.location.href = '/login-optimized.html';
  }

  // Métodos de utilidad
  getCurrentDeviceInfo() {
    return {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      screenResolution: `${screen.width}x${screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      language: navigator.language,
      cookieEnabled: navigator.cookieEnabled,
      onLine: navigator.onLine,
    };
  }

  isSameDevice(device1, device2) {
    return (
      device1.userAgent === device2.userAgent &&
      device1.platform === device2.platform &&
      device1.screenResolution === device2.screenResolution
    );
  }

  // Métodos de guardado
  saveSecurityEvents() {
    try {
      localStorage.setItem('axyra_security_events', JSON.stringify(this.securityEvents));
    } catch (error) {
      console.error('❌ Error guardando eventos de seguridad:', error);
    }
  }

  saveSecurityMetrics() {
    try {
      localStorage.setItem('axyra_security_metrics', JSON.stringify(this.securityMetrics));
    } catch (error) {
      console.error('❌ Error guardando métricas de seguridad:', error);
    }
  }

  // Métodos de exportación
  exportSecurityLogs() {
    const data = {
      events: this.securityEvents,
      metrics: this.securityMetrics,
      settings: this.monitoringSettings,
      timestamp: new Date().toISOString(),
      device: this.getCurrentDeviceInfo(),
    };

    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });

    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `axyra_security_logs_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  }

  // Métodos de limpieza
  clearSecurityLogs() {
    this.securityEvents = [];
    this.securityMetrics = {
      totalEvents: 0,
      criticalEvents: 0,
      warningEvents: 0,
      infoEvents: 0,
      blockedAttempts: 0,
      lastEventTime: null,
    };

    this.saveSecurityEvents();
    this.saveSecurityMetrics();
  }

  // Métodos de limpieza
  destroy() {
    this.isMonitoring = false;
    this.securityEvents = [];
    this.securityMetrics = {
      totalEvents: 0,
      criticalEvents: 0,
      warningEvents: 0,
      infoEvents: 0,
      blockedAttempts: 0,
      lastEventTime: null,
    };
  }
}

// Inicializar sistema de monitoreo de seguridad
document.addEventListener('DOMContentLoaded', function () {
  try {
    window.axyraSecurityMonitoring = new AxyraSecurityMonitoringSystem();
    console.log('✅ Sistema de Monitoreo de Seguridad AXYRA cargado');
  } catch (error) {
    console.error('❌ Error cargando sistema de monitoreo de seguridad:', error);
  }
});

// Exportar para uso global
window.AxyraSecurityMonitoringSystem = AxyraSecurityMonitoringSystem;
