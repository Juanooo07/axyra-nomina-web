// ========================================
// AXYRA API MANAGEMENT SYSTEM
// Sistema de gestión de APIs y webhooks
// ========================================

class AxyraAPIManagementSystem {
  constructor() {
    this.apiEndpoints = new Map();
    this.webhooks = new Map();
    this.apiSettings = {
      enableRateLimiting: true,
      enableAuthentication: true,
      enableLogging: true,
      enableMonitoring: true,
      enableCaching: true,
      rateLimitPerMinute: 100,
      rateLimitPerHour: 1000,
      rateLimitPerDay: 10000,
      cacheTimeout: 300, // 5 minutos
      webhookTimeout: 30000, // 30 segundos
      webhookRetryAttempts: 3,
      webhookRetryDelay: 5000, // 5 segundos
      enableCORS: true,
      corsOrigins: ['https://axyra.com', 'https://app.axyra.com'],
      enableCompression: true,
      enableEncryption: true,
    };

    this.apiMetrics = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      rateLimitedRequests: 0,
      cachedRequests: 0,
      averageResponseTime: 0,
      totalWebhooks: 0,
      successfulWebhooks: 0,
      failedWebhooks: 0,
    };

    this.init();
  }

  async init() {
    console.log('🔌 Inicializando Sistema de Gestión de APIs AXYRA...');

    try {
      await this.loadAPISettings();
      this.setupAPIEndpoints();
      this.setupWebhooks();
      this.setupRateLimiting();
      this.setupAuthentication();
      this.setupLogging();
      this.setupMonitoring();
      this.setupCaching();
      this.setupCORS();
      this.setupCompression();
      this.setupEncryption();
      console.log('✅ Sistema de Gestión de APIs AXYRA inicializado');
    } catch (error) {
      console.error('❌ Error inicializando sistema de APIs:', error);
    }
  }

  async loadAPISettings() {
    try {
      const settings = localStorage.getItem('axyra_api_settings');
      if (settings) {
        const parsedSettings = JSON.parse(settings);
        this.apiSettings = { ...this.apiSettings, ...parsedSettings };
      }

      const metrics = localStorage.getItem('axyra_api_metrics');
      if (metrics) {
        this.apiMetrics = { ...this.apiMetrics, ...JSON.parse(metrics) };
      }
    } catch (error) {
      console.error('❌ Error cargando configuración de APIs:', error);
    }
  }

  setupAPIEndpoints() {
    // Configurar endpoints de API
    this.apiEndpoints.set('users', {
      path: '/api/users',
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      authentication: true,
      rateLimit: true,
      caching: true,
      logging: true,
    });

    this.apiEndpoints.set('employees', {
      path: '/api/employees',
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      authentication: true,
      rateLimit: true,
      caching: true,
      logging: true,
    });

    this.apiEndpoints.set('payroll', {
      path: '/api/payroll',
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      authentication: true,
      rateLimit: true,
      caching: false,
      logging: true,
    });

    this.apiEndpoints.set('inventory', {
      path: '/api/inventory',
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      authentication: true,
      rateLimit: true,
      caching: true,
      logging: true,
    });

    this.apiEndpoints.set('reports', {
      path: '/api/reports',
      methods: ['GET', 'POST'],
      authentication: true,
      rateLimit: true,
      caching: true,
      logging: true,
    });

    this.apiEndpoints.set('payments', {
      path: '/api/payments',
      methods: ['GET', 'POST', 'PUT'],
      authentication: true,
      rateLimit: true,
      caching: false,
      logging: true,
    });

    this.apiEndpoints.set('email', {
      path: '/api/email',
      methods: ['POST'],
      authentication: true,
      rateLimit: true,
      caching: false,
      logging: true,
    });

    this.apiEndpoints.set('sms', {
      path: '/api/sms',
      methods: ['POST'],
      authentication: true,
      rateLimit: true,
      caching: false,
      logging: true,
    });

    this.apiEndpoints.set('storage', {
      path: '/api/storage',
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      authentication: true,
      rateLimit: true,
      caching: false,
      logging: true,
    });
  }

  setupWebhooks() {
    // Configurar webhooks
    this.webhooks.set('user_created', {
      name: 'Usuario Creado',
      url: '/api/webhooks/user-created',
      events: ['user.created'],
      authentication: true,
      retryAttempts: 3,
      timeout: 30000,
    });

    this.webhooks.set('user_updated', {
      name: 'Usuario Actualizado',
      url: '/api/webhooks/user-updated',
      events: ['user.updated'],
      authentication: true,
      retryAttempts: 3,
      timeout: 30000,
    });

    this.webhooks.set('user_deleted', {
      name: 'Usuario Eliminado',
      url: '/api/webhooks/user-deleted',
      events: ['user.deleted'],
      authentication: true,
      retryAttempts: 3,
      timeout: 30000,
    });

    this.webhooks.set('employee_created', {
      name: 'Empleado Creado',
      url: '/api/webhooks/employee-created',
      events: ['employee.created'],
      authentication: true,
      retryAttempts: 3,
      timeout: 30000,
    });

    this.webhooks.set('employee_updated', {
      name: 'Empleado Actualizado',
      url: '/api/webhooks/employee-updated',
      events: ['employee.updated'],
      authentication: true,
      retryAttempts: 3,
      timeout: 30000,
    });

    this.webhooks.set('employee_deleted', {
      name: 'Empleado Eliminado',
      url: '/api/webhooks/employee-deleted',
      events: ['employee.deleted'],
      authentication: true,
      retryAttempts: 3,
      timeout: 30000,
    });

    this.webhooks.set('payroll_created', {
      name: 'Nómina Creada',
      url: '/api/webhooks/payroll-created',
      events: ['payroll.created'],
      authentication: true,
      retryAttempts: 3,
      timeout: 30000,
    });

    this.webhooks.set('payment_processed', {
      name: 'Pago Procesado',
      url: '/api/webhooks/payment-processed',
      events: ['payment.processed'],
      authentication: true,
      retryAttempts: 3,
      timeout: 30000,
    });

    this.webhooks.set('file_uploaded', {
      name: 'Archivo Subido',
      url: '/api/webhooks/file-uploaded',
      events: ['file.uploaded'],
      authentication: true,
      retryAttempts: 3,
      timeout: 30000,
    });

    this.webhooks.set('file_deleted', {
      name: 'Archivo Eliminado',
      url: '/api/webhooks/file-deleted',
      events: ['file.deleted'],
      authentication: true,
      retryAttempts: 3,
      timeout: 30000,
    });
  }

  setupRateLimiting() {
    if (!this.apiSettings.enableRateLimiting) return;

    // Configurar rate limiting
    this.rateLimitStore = new Map();
    this.rateLimitCleanup();
  }

  rateLimitCleanup() {
    // Limpiar rate limit store cada minuto
    setInterval(() => {
      const now = Date.now();
      for (const [key, value] of this.rateLimitStore.entries()) {
        if (now - value.timestamp > 60 * 1000) {
          this.rateLimitStore.delete(key);
        }
      }
    }, 60 * 1000);
  }

  setupAuthentication() {
    if (!this.apiSettings.enableAuthentication) return;

    // Configurar autenticación
    this.setupJWTValidation();
    this.setupAPIKeyValidation();
    this.setupOAuthValidation();
  }

  setupJWTValidation() {
    // Configurar validación JWT
    this.jwtSecret = this.apiSettings.jwtSecret || 'axyra-secret-key';
    this.jwtExpiration = this.apiSettings.jwtExpiration || '24h';
  }

  setupAPIKeyValidation() {
    // Configurar validación de API Key
    this.apiKeys = new Map();
    this.loadAPIKeys();
  }

  setupOAuthValidation() {
    // Configurar validación OAuth
    this.oauthProviders = new Map();
    this.setupOAuthProviders();
  }

  setupOAuthProviders() {
    // Configurar proveedores OAuth
    this.oauthProviders.set('google', {
      name: 'Google',
      clientId: this.apiSettings.googleClientId,
      clientSecret: this.apiSettings.googleClientSecret,
      redirectUri: this.apiSettings.googleRedirectUri,
    });

    this.oauthProviders.set('microsoft', {
      name: 'Microsoft',
      clientId: this.apiSettings.microsoftClientId,
      clientSecret: this.apiSettings.microsoftClientSecret,
      redirectUri: this.apiSettings.microsoftRedirectUri,
    });

    this.oauthProviders.set('github', {
      name: 'GitHub',
      clientId: this.apiSettings.githubClientId,
      clientSecret: this.apiSettings.githubClientSecret,
      redirectUri: this.apiSettings.githubRedirectUri,
    });
  }

  setupLogging() {
    if (!this.apiSettings.enableLogging) return;

    // Configurar logging
    this.setupRequestLogging();
    this.setupResponseLogging();
    this.setupErrorLogging();
  }

  setupRequestLogging() {
    // Interceptar requests para logging
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const startTime = performance.now();
      const requestId = this.generateRequestId();

      // Log request
      this.logRequest(requestId, args[0], args[1]);

      try {
        const response = await originalFetch(...args);
        const endTime = performance.now();
        const responseTime = endTime - startTime;

        // Log response
        this.logResponse(requestId, response, responseTime);

        return response;
      } catch (error) {
        const endTime = performance.now();
        const responseTime = endTime - startTime;

        // Log error
        this.logError(requestId, error, responseTime);

        throw error;
      }
    };
  }

  setupResponseLogging() {
    // Configurar logging de respuestas
    this.responseLogs = [];
  }

  setupErrorLogging() {
    // Configurar logging de errores
    this.errorLogs = [];
  }

  setupMonitoring() {
    if (!this.apiSettings.enableMonitoring) return;

    // Configurar monitoreo
    this.setupHealthChecks();
    this.setupPerformanceMonitoring();
    this.setupUptimeMonitoring();
  }

  setupHealthChecks() {
    // Configurar health checks
    this.healthChecks = new Map();
    this.setupEndpointHealthChecks();
  }

  setupEndpointHealthChecks() {
    // Configurar health checks para endpoints
    this.healthChecks.set('users', {
      endpoint: '/api/users/health',
      interval: 60000, // 1 minuto
      timeout: 5000,
      retries: 3,
    });

    this.healthChecks.set('employees', {
      endpoint: '/api/employees/health',
      interval: 60000,
      timeout: 5000,
      retries: 3,
    });

    this.healthChecks.set('payroll', {
      endpoint: '/api/payroll/health',
      interval: 60000,
      timeout: 5000,
      retries: 3,
    });

    this.healthChecks.set('inventory', {
      endpoint: '/api/inventory/health',
      interval: 60000,
      timeout: 5000,
      retries: 3,
    });

    this.healthChecks.set('reports', {
      endpoint: '/api/reports/health',
      interval: 60000,
      timeout: 5000,
      retries: 3,
    });
  }

  setupPerformanceMonitoring() {
    // Configurar monitoreo de rendimiento
    this.performanceMetrics = {
      averageResponseTime: 0,
      p95ResponseTime: 0,
      p99ResponseTime: 0,
      throughput: 0,
      errorRate: 0,
    };
  }

  setupUptimeMonitoring() {
    // Configurar monitoreo de uptime
    this.uptimeMetrics = {
      totalUptime: 0,
      totalDowntime: 0,
      uptimePercentage: 100,
      lastCheck: Date.now(),
    };
  }

  setupCaching() {
    if (!this.apiSettings.enableCaching) return;

    // Configurar caché
    this.cacheStore = new Map();
    this.cacheCleanup();
  }

  cacheCleanup() {
    // Limpiar caché expirado cada 5 minutos
    setInterval(() => {
      const now = Date.now();
      for (const [key, value] of this.cacheStore.entries()) {
        if (now - value.timestamp > this.apiSettings.cacheTimeout * 1000) {
          this.cacheStore.delete(key);
        }
      }
    }, 5 * 60 * 1000);
  }

  setupCORS() {
    if (!this.apiSettings.enableCORS) return;

    // Configurar CORS
    this.corsOrigins = this.apiSettings.corsOrigins;
    this.corsMethods = ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'];
    this.corsHeaders = ['Content-Type', 'Authorization', 'X-API-Key'];
  }

  setupCompression() {
    if (!this.apiSettings.enableCompression) return;

    // Configurar compresión
    this.compressionEnabled = true;
    this.compressionLevel = 6;
  }

  setupEncryption() {
    if (!this.apiSettings.enableEncryption) return;

    // Configurar encriptación
    this.encryptionEnabled = true;
    this.encryptionKey = this.generateEncryptionKey();
  }

  // Métodos de rate limiting
  checkRateLimit(identifier, endpoint) {
    if (!this.apiSettings.enableRateLimiting) return true;

    const key = `${identifier}_${endpoint}`;
    const now = Date.now();
    const minute = Math.floor(now / 60000);
    const hour = Math.floor(now / 3600000);
    const day = Math.floor(now / 86400000);

    // Verificar límites
    if (!this.rateLimitStore.has(key)) {
      this.rateLimitStore.set(key, {
        minute: { count: 0, timestamp: minute },
        hour: { count: 0, timestamp: hour },
        day: { count: 0, timestamp: day },
      });
    }

    const rateLimit = this.rateLimitStore.get(key);

    // Verificar límite por minuto
    if (rateLimit.minute.timestamp === minute) {
      if (rateLimit.minute.count >= this.apiSettings.rateLimitPerMinute) {
        return false;
      }
      rateLimit.minute.count++;
    } else {
      rateLimit.minute = { count: 1, timestamp: minute };
    }

    // Verificar límite por hora
    if (rateLimit.hour.timestamp === hour) {
      if (rateLimit.hour.count >= this.apiSettings.rateLimitPerHour) {
        return false;
      }
      rateLimit.hour.count++;
    } else {
      rateLimit.hour = { count: 1, timestamp: hour };
    }

    // Verificar límite por día
    if (rateLimit.day.timestamp === day) {
      if (rateLimit.day.count >= this.apiSettings.rateLimitPerDay) {
        return false;
      }
      rateLimit.day.count++;
    } else {
      rateLimit.day = { count: 1, timestamp: day };
    }

    return true;
  }

  // Métodos de autenticación
  validateAuthentication(request) {
    if (!this.apiSettings.enableAuthentication) return true;

    const authHeader = request.headers.get('Authorization');
    const apiKey = request.headers.get('X-API-Key');

    if (authHeader && authHeader.startsWith('Bearer ')) {
      return this.validateJWT(authHeader.substring(7));
    } else if (apiKey) {
      return this.validateAPIKey(apiKey);
    }

    return false;
  }

  validateJWT(token) {
    try {
      // Implementar validación JWT
      const payload = this.decodeJWT(token);
      return payload && payload.exp > Date.now() / 1000;
    } catch (error) {
      console.error('❌ Error validando JWT:', error);
      return false;
    }
  }

  decodeJWT(token) {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        throw new Error('Token JWT inválido');
      }

      const payload = JSON.parse(atob(parts[1]));
      return payload;
    } catch (error) {
      console.error('❌ Error decodificando JWT:', error);
      return null;
    }
  }

  validateAPIKey(apiKey) {
    return this.apiKeys.has(apiKey);
  }

  // Métodos de logging
  logRequest(requestId, url, options) {
    const logEntry = {
      id: requestId,
      type: 'request',
      url: url,
      method: options?.method || 'GET',
      headers: options?.headers || {},
      body: options?.body || null,
      timestamp: Date.now(),
      userId: this.getCurrentUserId(),
    };

    this.saveRequestLog(logEntry);
  }

  logResponse(requestId, response, responseTime) {
    const logEntry = {
      id: requestId,
      type: 'response',
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
      responseTime: responseTime,
      timestamp: Date.now(),
    };

    this.saveResponseLog(logEntry);
  }

  logError(requestId, error, responseTime) {
    const logEntry = {
      id: requestId,
      type: 'error',
      error: error.message,
      stack: error.stack,
      responseTime: responseTime,
      timestamp: Date.now(),
    };

    this.saveErrorLog(logEntry);
  }

  // Métodos de monitoreo
  async performHealthCheck(endpoint) {
    try {
      const startTime = performance.now();
      const response = await fetch(endpoint, {
        method: 'GET',
        timeout: 5000,
      });
      const endTime = performance.now();

      const healthStatus = {
        endpoint: endpoint,
        status: response.ok ? 'healthy' : 'unhealthy',
        responseTime: endTime - startTime,
        timestamp: Date.now(),
      };

      this.updateUptimeMetrics(healthStatus);
      return healthStatus;
    } catch (error) {
      const healthStatus = {
        endpoint: endpoint,
        status: 'unhealthy',
        error: error.message,
        timestamp: Date.now(),
      };

      this.updateUptimeMetrics(healthStatus);
      return healthStatus;
    }
  }

  updateUptimeMetrics(healthStatus) {
    if (healthStatus.status === 'healthy') {
      this.uptimeMetrics.totalUptime++;
    } else {
      this.uptimeMetrics.totalDowntime++;
    }

    const total = this.uptimeMetrics.totalUptime + this.uptimeMetrics.totalDowntime;
    this.uptimeMetrics.uptimePercentage = (this.uptimeMetrics.totalUptime / total) * 100;
    this.uptimeMetrics.lastCheck = Date.now();
  }

  // Métodos de caché
  getCachedResponse(key) {
    if (!this.apiSettings.enableCaching) return null;

    const cached = this.cacheStore.get(key);
    if (cached && Date.now() - cached.timestamp < this.apiSettings.cacheTimeout * 1000) {
      return cached.data;
    }

    return null;
  }

  setCachedResponse(key, data) {
    if (!this.apiSettings.enableCaching) return;

    this.cacheStore.set(key, {
      data: data,
      timestamp: Date.now(),
    });
  }

  // Métodos de webhooks
  async triggerWebhook(event, data) {
    try {
      const webhooks = Array.from(this.webhooks.values()).filter((webhook) => webhook.events.includes(event));

      for (const webhook of webhooks) {
        await this.executeWebhook(webhook, event, data);
      }
    } catch (error) {
      console.error('❌ Error ejecutando webhook:', error);
    }
  }

  async executeWebhook(webhook, event, data) {
    try {
      const payload = {
        event: event,
        data: data,
        timestamp: Date.now(),
        webhookId: webhook.name,
      };

      const response = await fetch(webhook.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Event': event,
          'X-Webhook-Signature': this.generateWebhookSignature(payload),
        },
        body: JSON.stringify(payload),
        timeout: webhook.timeout,
      });

      if (response.ok) {
        this.apiMetrics.successfulWebhooks++;
        console.log(`✅ Webhook ejecutado exitosamente: ${webhook.name}`);
      } else {
        this.apiMetrics.failedWebhooks++;
        console.error(`❌ Webhook falló: ${webhook.name}`);

        // Reintentar webhook
        await this.retryWebhook(webhook, event, data);
      }
    } catch (error) {
      console.error(`❌ Error ejecutando webhook ${webhook.name}:`, error);
      this.apiMetrics.failedWebhooks++;

      // Reintentar webhook
      await this.retryWebhook(webhook, event, data);
    }
  }

  async retryWebhook(webhook, event, data) {
    if (webhook.retryAttempts <= 0) return;

    webhook.retryAttempts--;

    setTimeout(async () => {
      try {
        await this.executeWebhook(webhook, event, data);
      } catch (error) {
        console.error(`❌ Error en reintento de webhook ${webhook.name}:`, error);
      }
    }, webhook.retryDelay || 5000);
  }

  generateWebhookSignature(payload) {
    // Implementar firma de webhook
    const crypto = require('crypto');
    const secret = this.apiSettings.webhookSecret || 'axyra-webhook-secret';
    const signature = crypto.createHmac('sha256', secret).update(JSON.stringify(payload)).digest('hex');
    return signature;
  }

  // Métodos de utilidad
  generateRequestId() {
    return 'REQ_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  generateEncryptionKey() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let key = '';
    for (let i = 0; i < 32; i++) {
      key += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return key;
  }

  getCurrentUserId() {
    try {
      const sessionData = localStorage.getItem('axyra_user_session');
      if (sessionData) {
        const session = JSON.parse(sessionData);
        return session.userId;
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  // Métodos de guardado
  saveRequestLog(logEntry) {
    try {
      const logs = JSON.parse(localStorage.getItem('axyra_api_request_logs') || '[]');
      logs.push(logEntry);

      // Mantener solo los últimos 1000 logs
      if (logs.length > 1000) {
        logs.splice(0, logs.length - 1000);
      }

      localStorage.setItem('axyra_api_request_logs', JSON.stringify(logs));
    } catch (error) {
      console.error('❌ Error guardando log de request:', error);
    }
  }

  saveResponseLog(logEntry) {
    try {
      const logs = JSON.parse(localStorage.getItem('axyra_api_response_logs') || '[]');
      logs.push(logEntry);

      // Mantener solo los últimos 1000 logs
      if (logs.length > 1000) {
        logs.splice(0, logs.length - 1000);
      }

      localStorage.setItem('axyra_api_response_logs', JSON.stringify(logs));
    } catch (error) {
      console.error('❌ Error guardando log de response:', error);
    }
  }

  saveErrorLog(logEntry) {
    try {
      const logs = JSON.parse(localStorage.getItem('axyra_api_error_logs') || '[]');
      logs.push(logEntry);

      // Mantener solo los últimos 1000 logs
      if (logs.length > 1000) {
        logs.splice(0, logs.length - 1000);
      }

      localStorage.setItem('axyra_api_error_logs', JSON.stringify(logs));
    } catch (error) {
      console.error('❌ Error guardando log de error:', error);
    }
  }

  // Métodos de exportación
  exportAPIReport() {
    const data = {
      metrics: this.apiMetrics,
      settings: this.apiSettings,
      endpoints: Array.from(this.apiEndpoints.entries()),
      webhooks: Array.from(this.webhooks.entries()),
      timestamp: new Date().toISOString(),
      device: this.getCurrentDeviceInfo(),
    };

    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });

    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `axyra_api_report_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  }

  getCurrentDeviceInfo() {
    return {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      screenResolution: `${screen.width}x${screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      language: navigator.language,
    };
  }

  // Métodos de limpieza
  destroy() {
    this.apiEndpoints.clear();
    this.webhooks.clear();
    this.rateLimitStore.clear();
    this.cacheStore.clear();
    this.apiMetrics = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      rateLimitedRequests: 0,
      cachedRequests: 0,
      averageResponseTime: 0,
      totalWebhooks: 0,
      successfulWebhooks: 0,
      failedWebhooks: 0,
    };
  }
}

// Inicializar sistema de gestión de APIs
document.addEventListener('DOMContentLoaded', function () {
  try {
    window.axyraAPIManagement = new AxyraAPIManagementSystem();
    console.log('✅ Sistema de Gestión de APIs AXYRA cargado');
  } catch (error) {
    console.error('❌ Error cargando sistema de gestión de APIs:', error);
  }
});

// Exportar para uso global
window.AxyraAPIManagementSystem = AxyraAPIManagementSystem;
