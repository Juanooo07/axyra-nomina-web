// ========================================
// AXYRA SECURITY AUDIT SYSTEM
// Sistema de auditoría de seguridad
// ========================================

class AxyraSecurityAuditSystem {
  constructor() {
    this.auditLogs = [];
    this.auditSettings = {
      enableAuditLogging: true,
      enableRealTimeAudit: true,
      enableAuditAlerts: true,
      enableAuditReports: true,
      auditRetentionDays: 90,
      auditLogLevel: 'info', // debug, info, warn, error, critical
      auditCategories: [
        'authentication',
        'authorization',
        'data_access',
        'data_modification',
        'system_changes',
        'security_events',
        'user_actions',
        'admin_actions',
      ],
    };

    this.auditMetrics = {
      totalLogs: 0,
      criticalLogs: 0,
      warningLogs: 0,
      infoLogs: 0,
      debugLogs: 0,
      lastAuditTime: null,
      auditErrors: 0,
    };

    this.init();
  }

  async init() {
    console.log('🔍 Inicializando Sistema de Auditoría de Seguridad AXYRA...');

    try {
      await this.loadAuditSettings();
      this.setupAuditLogging();
      this.setupAuditMonitoring();
      this.setupAuditAlerts();
      this.setupAuditReports();
      this.setupAuditCleanup();
      console.log('✅ Sistema de Auditoría de Seguridad AXYRA inicializado');
    } catch (error) {
      console.error('❌ Error inicializando sistema de auditoría:', error);
    }
  }

  async loadAuditSettings() {
    try {
      const settings = localStorage.getItem('axyra_audit_settings');
      if (settings) {
        const parsedSettings = JSON.parse(settings);
        this.auditSettings = { ...this.auditSettings, ...parsedSettings };
      }

      const logs = localStorage.getItem('axyra_audit_logs');
      if (logs) {
        this.auditLogs = JSON.parse(logs);
      }

      const metrics = localStorage.getItem('axyra_audit_metrics');
      if (metrics) {
        this.auditMetrics = { ...this.auditMetrics, ...JSON.parse(metrics) };
      }
    } catch (error) {
      console.error('❌ Error cargando configuración de auditoría:', error);
    }
  }

  setupAuditLogging() {
    if (!this.auditSettings.enableAuditLogging) return;

    // Configurar logging de auditoría
    this.setupAuthenticationAudit();
    this.setupAuthorizationAudit();
    this.setupDataAccessAudit();
    this.setupDataModificationAudit();
    this.setupSystemChangesAudit();
    this.setupSecurityEventsAudit();
    this.setupUserActionsAudit();
    this.setupAdminActionsAudit();
  }

  setupAuthenticationAudit() {
    // Auditar eventos de autenticación
    document.addEventListener('authSuccess', (event) => {
      this.logAuditEvent('authentication', 'info', 'auth_success', {
        userId: event.detail.userId,
        timestamp: Date.now(),
        device: this.getCurrentDeviceInfo(),
        ipAddress: this.getCurrentIPAddress(),
        userAgent: navigator.userAgent,
      });
    });

    document.addEventListener('authFailure', (event) => {
      this.logAuditEvent('authentication', 'warn', 'auth_failure', {
        userId: event.detail.userId,
        reason: event.detail.reason,
        timestamp: Date.now(),
        device: this.getCurrentDeviceInfo(),
        ipAddress: this.getCurrentIPAddress(),
        userAgent: navigator.userAgent,
      });
    });

    document.addEventListener('authLogout', (event) => {
      this.logAuditEvent('authentication', 'info', 'auth_logout', {
        userId: event.detail.userId,
        timestamp: Date.now(),
        device: this.getCurrentDeviceInfo(),
        ipAddress: this.getCurrentIPAddress(),
        userAgent: navigator.userAgent,
      });
    });
  }

  setupAuthorizationAudit() {
    // Auditar eventos de autorización
    document.addEventListener('permissionCheck', (event) => {
      this.logAuditEvent('authorization', 'info', 'permission_check', {
        permission: event.detail.permission,
        result: event.detail.result,
        userId: event.detail.userId,
        timestamp: Date.now(),
        device: this.getCurrentDeviceInfo(),
      });
    });

    document.addEventListener('roleChange', (event) => {
      this.logAuditEvent('authorization', 'info', 'role_change', {
        userId: event.detail.userId,
        oldRole: event.detail.oldRole,
        newRole: event.detail.newRole,
        changedBy: event.detail.changedBy,
        timestamp: Date.now(),
        device: this.getCurrentDeviceInfo(),
      });
    });

    document.addEventListener('accessDenied', (event) => {
      this.logAuditEvent('authorization', 'warn', 'access_denied', {
        resource: event.detail.resource,
        permission: event.detail.permission,
        userId: event.detail.userId,
        timestamp: Date.now(),
        device: this.getCurrentDeviceInfo(),
      });
    });
  }

  setupDataAccessAudit() {
    // Auditar acceso a datos
    this.auditLocalStorageAccess();
    this.auditSessionStorageAccess();
    this.auditAPIAccess();
    this.auditFileAccess();
  }

  auditLocalStorageAccess() {
    const originalGetItem = localStorage.getItem;
    const originalSetItem = localStorage.setItem;
    const originalRemoveItem = localStorage.removeItem;

    localStorage.getItem = (key) => {
      this.logAuditEvent('data_access', 'debug', 'localStorage_get', {
        key: key,
        timestamp: Date.now(),
        userId: this.getCurrentUserId(),
        device: this.getCurrentDeviceInfo(),
      });
      return originalGetItem.call(localStorage, key);
    };

    localStorage.setItem = (key, value) => {
      this.logAuditEvent('data_access', 'debug', 'localStorage_set', {
        key: key,
        valueLength: value.length,
        timestamp: Date.now(),
        userId: this.getCurrentUserId(),
        device: this.getCurrentDeviceInfo(),
      });
      return originalSetItem.call(localStorage, key, value);
    };

    localStorage.removeItem = (key) => {
      this.logAuditEvent('data_access', 'debug', 'localStorage_remove', {
        key: key,
        timestamp: Date.now(),
        userId: this.getCurrentUserId(),
        device: this.getCurrentDeviceInfo(),
      });
      return originalRemoveItem.call(localStorage, key);
    };
  }

  auditSessionStorageAccess() {
    const originalGetItem = sessionStorage.getItem;
    const originalSetItem = sessionStorage.setItem;
    const originalRemoveItem = sessionStorage.removeItem;

    sessionStorage.getItem = (key) => {
      this.logAuditEvent('data_access', 'debug', 'sessionStorage_get', {
        key: key,
        timestamp: Date.now(),
        userId: this.getCurrentUserId(),
        device: this.getCurrentDeviceInfo(),
      });
      return originalGetItem.call(sessionStorage, key);
    };

    sessionStorage.setItem = (key, value) => {
      this.logAuditEvent('data_access', 'debug', 'sessionStorage_set', {
        key: key,
        valueLength: value.length,
        timestamp: Date.now(),
        userId: this.getCurrentUserId(),
        device: this.getCurrentDeviceInfo(),
      });
      return originalSetItem.call(sessionStorage, key, value);
    };

    sessionStorage.removeItem = (key) => {
      this.logAuditEvent('data_access', 'debug', 'sessionStorage_remove', {
        key: key,
        timestamp: Date.now(),
        userId: this.getCurrentUserId(),
        device: this.getCurrentDeviceInfo(),
      });
      return originalRemoveItem.call(sessionStorage, key);
    };
  }

  auditAPIAccess() {
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const url = args[0];
      const options = args[1] || {};

      this.logAuditEvent('data_access', 'info', 'api_request', {
        url: url,
        method: options.method || 'GET',
        timestamp: Date.now(),
        userId: this.getCurrentUserId(),
        device: this.getCurrentDeviceInfo(),
      });

      try {
        const response = await originalFetch(...args);

        this.logAuditEvent('data_access', 'info', 'api_response', {
          url: url,
          status: response.status,
          timestamp: Date.now(),
          userId: this.getCurrentUserId(),
          device: this.getCurrentDeviceInfo(),
        });

        return response;
      } catch (error) {
        this.logAuditEvent('data_access', 'error', 'api_error', {
          url: url,
          error: error.message,
          timestamp: Date.now(),
          userId: this.getCurrentUserId(),
          device: this.getCurrentDeviceInfo(),
        });
        throw error;
      }
    };
  }

  auditFileAccess() {
    // Auditar acceso a archivos
    document.addEventListener('fileUpload', (event) => {
      this.logAuditEvent('data_access', 'info', 'file_upload', {
        fileName: event.detail.fileName,
        fileSize: event.detail.fileSize,
        fileType: event.detail.fileType,
        timestamp: Date.now(),
        userId: this.getCurrentUserId(),
        device: this.getCurrentDeviceInfo(),
      });
    });

    document.addEventListener('fileDownload', (event) => {
      this.logAuditEvent('data_access', 'info', 'file_download', {
        fileName: event.detail.fileName,
        fileSize: event.detail.fileSize,
        fileType: event.detail.fileType,
        timestamp: Date.now(),
        userId: this.getCurrentUserId(),
        device: this.getCurrentDeviceInfo(),
      });
    });
  }

  setupDataModificationAudit() {
    // Auditar modificaciones de datos
    this.auditDataCreation();
    this.auditDataUpdate();
    this.auditDataDeletion();
    this.auditDataExport();
    this.auditDataImport();
  }

  auditDataCreation() {
    document.addEventListener('dataCreated', (event) => {
      this.logAuditEvent('data_modification', 'info', 'data_created', {
        dataType: event.detail.dataType,
        dataId: event.detail.dataId,
        timestamp: Date.now(),
        userId: this.getCurrentUserId(),
        device: this.getCurrentDeviceInfo(),
      });
    });
  }

  auditDataUpdate() {
    document.addEventListener('dataUpdated', (event) => {
      this.logAuditEvent('data_modification', 'info', 'data_updated', {
        dataType: event.detail.dataType,
        dataId: event.detail.dataId,
        changes: event.detail.changes,
        timestamp: Date.now(),
        userId: this.getCurrentUserId(),
        device: this.getCurrentDeviceInfo(),
      });
    });
  }

  auditDataDeletion() {
    document.addEventListener('dataDeleted', (event) => {
      this.logAuditEvent('data_modification', 'warn', 'data_deleted', {
        dataType: event.detail.dataType,
        dataId: event.detail.dataId,
        timestamp: Date.now(),
        userId: this.getCurrentUserId(),
        device: this.getCurrentDeviceInfo(),
      });
    });
  }

  auditDataExport() {
    document.addEventListener('dataExported', (event) => {
      this.logAuditEvent('data_modification', 'info', 'data_exported', {
        dataType: event.detail.dataType,
        exportFormat: event.detail.exportFormat,
        recordCount: event.detail.recordCount,
        timestamp: Date.now(),
        userId: this.getCurrentUserId(),
        device: this.getCurrentDeviceInfo(),
      });
    });
  }

  auditDataImport() {
    document.addEventListener('dataImported', (event) => {
      this.logAuditEvent('data_modification', 'info', 'data_imported', {
        dataType: event.detail.dataType,
        importFormat: event.detail.importFormat,
        recordCount: event.detail.recordCount,
        timestamp: Date.now(),
        userId: this.getCurrentUserId(),
        device: this.getCurrentDeviceInfo(),
      });
    });
  }

  setupSystemChangesAudit() {
    // Auditar cambios del sistema
    this.auditConfigurationChanges();
    this.auditSystemUpdates();
    this.auditSystemRestarts();
    this.auditSystemErrors();
  }

  auditConfigurationChanges() {
    document.addEventListener('configChanged', (event) => {
      this.logAuditEvent('system_changes', 'info', 'config_changed', {
        configKey: event.detail.configKey,
        oldValue: event.detail.oldValue,
        newValue: event.detail.newValue,
        timestamp: Date.now(),
        userId: this.getCurrentUserId(),
        device: this.getCurrentDeviceInfo(),
      });
    });
  }

  auditSystemUpdates() {
    document.addEventListener('systemUpdated', (event) => {
      this.logAuditEvent('system_changes', 'info', 'system_updated', {
        version: event.detail.version,
        updateType: event.detail.updateType,
        timestamp: Date.now(),
        userId: this.getCurrentUserId(),
        device: this.getCurrentDeviceInfo(),
      });
    });
  }

  auditSystemRestarts() {
    document.addEventListener('systemRestarted', (event) => {
      this.logAuditEvent('system_changes', 'info', 'system_restarted', {
        reason: event.detail.reason,
        timestamp: Date.now(),
        userId: this.getCurrentUserId(),
        device: this.getCurrentDeviceInfo(),
      });
    });
  }

  auditSystemErrors() {
    window.addEventListener('error', (event) => {
      this.logAuditEvent('system_changes', 'error', 'system_error', {
        error: event.error?.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        timestamp: Date.now(),
        userId: this.getCurrentUserId(),
        device: this.getCurrentDeviceInfo(),
      });
    });
  }

  setupSecurityEventsAudit() {
    // Auditar eventos de seguridad
    this.auditSecurityAlerts();
    this.auditSecurityViolations();
    this.auditSecurityIncidents();
    this.auditSecurityThreats();
  }

  auditSecurityAlerts() {
    document.addEventListener('securityAlert', (event) => {
      this.logAuditEvent('security_events', 'warn', 'security_alert', {
        alertType: event.detail.alertType,
        severity: event.detail.severity,
        message: event.detail.message,
        timestamp: Date.now(),
        userId: this.getCurrentUserId(),
        device: this.getCurrentDeviceInfo(),
      });
    });
  }

  auditSecurityViolations() {
    document.addEventListener('securityViolation', (event) => {
      this.logAuditEvent('security_events', 'error', 'security_violation', {
        violationType: event.detail.violationType,
        severity: event.detail.severity,
        message: event.detail.message,
        timestamp: Date.now(),
        userId: this.getCurrentUserId(),
        device: this.getCurrentDeviceInfo(),
      });
    });
  }

  auditSecurityIncidents() {
    document.addEventListener('securityIncident', (event) => {
      this.logAuditEvent('security_events', 'critical', 'security_incident', {
        incidentType: event.detail.incidentType,
        severity: event.detail.severity,
        message: event.detail.message,
        timestamp: Date.now(),
        userId: this.getCurrentUserId(),
        device: this.getCurrentDeviceInfo(),
      });
    });
  }

  auditSecurityThreats() {
    document.addEventListener('securityThreat', (event) => {
      this.logAuditEvent('security_events', 'critical', 'security_threat', {
        threatType: event.detail.threatType,
        severity: event.detail.severity,
        message: event.detail.message,
        timestamp: Date.now(),
        userId: this.getCurrentUserId(),
        device: this.getCurrentDeviceInfo(),
      });
    });
  }

  setupUserActionsAudit() {
    // Auditar acciones del usuario
    this.auditUserNavigation();
    this.auditUserInteractions();
    this.auditUserSessions();
    this.auditUserPreferences();
  }

  auditUserNavigation() {
    // Auditar navegación del usuario
    let lastNavigationTime = Date.now();

    window.addEventListener('popstate', () => {
      const now = Date.now();
      const timeDiff = now - lastNavigationTime;

      this.logAuditEvent('user_actions', 'debug', 'navigation', {
        url: window.location.href,
        timeDiff: timeDiff,
        timestamp: now,
        userId: this.getCurrentUserId(),
        device: this.getCurrentDeviceInfo(),
      });

      lastNavigationTime = now;
    });
  }

  auditUserInteractions() {
    // Auditar interacciones del usuario
    document.addEventListener('click', (event) => {
      this.logAuditEvent('user_actions', 'debug', 'click', {
        target: event.target.tagName,
        id: event.target.id,
        className: event.target.className,
        timestamp: Date.now(),
        userId: this.getCurrentUserId(),
        device: this.getCurrentDeviceInfo(),
      });
    });

    document.addEventListener('keydown', (event) => {
      this.logAuditEvent('user_actions', 'debug', 'keydown', {
        key: event.key,
        code: event.code,
        timestamp: Date.now(),
        userId: this.getCurrentUserId(),
        device: this.getCurrentDeviceInfo(),
      });
    });
  }

  auditUserSessions() {
    // Auditar sesiones del usuario
    document.addEventListener('sessionStarted', (event) => {
      this.logAuditEvent('user_actions', 'info', 'session_started', {
        sessionId: event.detail.sessionId,
        timestamp: Date.now(),
        userId: this.getCurrentUserId(),
        device: this.getCurrentDeviceInfo(),
      });
    });

    document.addEventListener('sessionEnded', (event) => {
      this.logAuditEvent('user_actions', 'info', 'session_ended', {
        sessionId: event.detail.sessionId,
        duration: event.detail.duration,
        timestamp: Date.now(),
        userId: this.getCurrentUserId(),
        device: this.getCurrentDeviceInfo(),
      });
    });
  }

  auditUserPreferences() {
    // Auditar preferencias del usuario
    document.addEventListener('preferenceChanged', (event) => {
      this.logAuditEvent('user_actions', 'info', 'preference_changed', {
        preference: event.detail.preference,
        oldValue: event.detail.oldValue,
        newValue: event.detail.newValue,
        timestamp: Date.now(),
        userId: this.getCurrentUserId(),
        device: this.getCurrentDeviceInfo(),
      });
    });
  }

  setupAdminActionsAudit() {
    // Auditar acciones de administrador
    this.auditAdminLogins();
    this.auditAdminChanges();
    this.auditAdminExports();
    this.auditAdminImports();
  }

  auditAdminLogins() {
    document.addEventListener('adminLogin', (event) => {
      this.logAuditEvent('admin_actions', 'info', 'admin_login', {
        adminId: event.detail.adminId,
        timestamp: Date.now(),
        device: this.getCurrentDeviceInfo(),
        ipAddress: this.getCurrentIPAddress(),
      });
    });
  }

  auditAdminChanges() {
    document.addEventListener('adminChange', (event) => {
      this.logAuditEvent('admin_actions', 'info', 'admin_change', {
        adminId: event.detail.adminId,
        changeType: event.detail.changeType,
        targetId: event.detail.targetId,
        changes: event.detail.changes,
        timestamp: Date.now(),
        device: this.getCurrentDeviceInfo(),
      });
    });
  }

  auditAdminExports() {
    document.addEventListener('adminExport', (event) => {
      this.logAuditEvent('admin_actions', 'info', 'admin_export', {
        adminId: event.detail.adminId,
        exportType: event.detail.exportType,
        recordCount: event.detail.recordCount,
        timestamp: Date.now(),
        device: this.getCurrentDeviceInfo(),
      });
    });
  }

  auditAdminImports() {
    document.addEventListener('adminImport', (event) => {
      this.logAuditEvent('admin_actions', 'info', 'admin_import', {
        adminId: event.detail.adminId,
        importType: event.detail.importType,
        recordCount: event.detail.recordCount,
        timestamp: Date.now(),
        device: this.getCurrentDeviceInfo(),
      });
    });
  }

  setupAuditMonitoring() {
    if (!this.auditSettings.enableRealTimeAudit) return;

    // Monitorear auditoría en tiempo real
    this.monitorAuditLogs();
    this.monitorAuditMetrics();
    this.monitorAuditErrors();
  }

  monitorAuditLogs() {
    // Monitorear logs de auditoría
    setInterval(() => {
      this.analyzeAuditLogs();
    }, 60 * 1000); // Cada minuto
  }

  monitorAuditMetrics() {
    // Monitorear métricas de auditoría
    setInterval(() => {
      this.updateAuditMetrics();
    }, 5 * 60 * 1000); // Cada 5 minutos
  }

  monitorAuditErrors() {
    // Monitorear errores de auditoría
    setInterval(() => {
      this.checkAuditErrors();
    }, 30 * 1000); // Cada 30 segundos
  }

  setupAuditAlerts() {
    if (!this.auditSettings.enableAuditAlerts) return;

    // Configurar alertas de auditoría
    this.setupCriticalAlerts();
    this.setupWarningAlerts();
    this.setupInfoAlerts();
  }

  setupCriticalAlerts() {
    // Alertas críticas
    this.criticalAlerts = {
      securityIncident: true,
      securityThreat: true,
      dataBreach: true,
      unauthorizedAccess: true,
      systemCompromise: true,
    };
  }

  setupWarningAlerts() {
    // Alertas de advertencia
    this.warningAlerts = {
      securityAlert: true,
      securityViolation: true,
      accessDenied: true,
      dataModification: true,
      systemError: true,
    };
  }

  setupInfoAlerts() {
    // Alertas informativas
    this.infoAlerts = {
      authSuccess: false,
      authFailure: false,
      roleChange: false,
      dataExport: false,
      dataImport: false,
    };
  }

  setupAuditReports() {
    if (!this.auditSettings.enableAuditReports) return;

    // Configurar reportes de auditoría
    this.setupDailyReports();
    this.setupWeeklyReports();
    this.setupMonthlyReports();
  }

  setupDailyReports() {
    // Reportes diarios
    setInterval(() => {
      this.generateDailyReport();
    }, 24 * 60 * 60 * 1000); // Cada 24 horas
  }

  setupWeeklyReports() {
    // Reportes semanales
    setInterval(() => {
      this.generateWeeklyReport();
    }, 7 * 24 * 60 * 60 * 1000); // Cada 7 días
  }

  setupMonthlyReports() {
    // Reportes mensuales
    setInterval(() => {
      this.generateMonthlyReport();
    }, 30 * 24 * 60 * 60 * 1000); // Cada 30 días
  }

  setupAuditCleanup() {
    // Limpiar logs de auditoría
    setInterval(() => {
      this.cleanupAuditLogs();
    }, 24 * 60 * 60 * 1000); // Cada 24 horas
  }

  // Métodos de logging
  logAuditEvent(category, level, eventType, details) {
    try {
      if (!this.shouldLogEvent(level)) {
        return;
      }

      const auditEvent = {
        id: this.generateAuditId(),
        category: category,
        level: level,
        eventType: eventType,
        details: details,
        timestamp: Date.now(),
        sessionId: this.getCurrentSessionId(),
        userId: this.getCurrentUserId(),
        device: this.getCurrentDeviceInfo(),
        ipAddress: this.getCurrentIPAddress(),
        userAgent: navigator.userAgent,
      };

      this.auditLogs.push(auditEvent);
      this.updateAuditMetrics(auditEvent);

      // Mantener solo los últimos 10000 logs
      if (this.auditLogs.length > 10000) {
        this.auditLogs.splice(0, this.auditLogs.length - 10000);
      }

      // Guardar logs
      this.saveAuditLogs();

      // Verificar alertas
      this.checkAuditAlerts(auditEvent);

      console.log(`📝 Audit Log: ${category}.${eventType} [${level}]`);
    } catch (error) {
      console.error('❌ Error registrando evento de auditoría:', error);
      this.auditMetrics.auditErrors++;
    }
  }

  shouldLogEvent(level) {
    const levelOrder = ['debug', 'info', 'warn', 'error', 'critical'];
    const currentLevelIndex = levelOrder.indexOf(this.auditSettings.auditLogLevel);
    const eventLevelIndex = levelOrder.indexOf(level);

    return eventLevelIndex >= currentLevelIndex;
  }

  generateAuditId() {
    return 'audit_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  updateAuditMetrics(auditEvent) {
    this.auditMetrics.totalLogs++;
    this.auditMetrics.lastAuditTime = auditEvent.timestamp;

    switch (auditEvent.level) {
      case 'critical':
        this.auditMetrics.criticalLogs++;
        break;
      case 'error':
        this.auditMetrics.errorLogs++;
        break;
      case 'warn':
        this.auditMetrics.warningLogs++;
        break;
      case 'info':
        this.auditMetrics.infoLogs++;
        break;
      case 'debug':
        this.auditMetrics.debugLogs++;
        break;
    }

    this.saveAuditMetrics();
  }

  checkAuditAlerts(auditEvent) {
    if (auditEvent.level === 'critical') {
      this.triggerCriticalAlert(auditEvent);
    } else if (auditEvent.level === 'error') {
      this.triggerErrorAlert(auditEvent);
    } else if (auditEvent.level === 'warn') {
      this.triggerWarningAlert(auditEvent);
    }
  }

  triggerCriticalAlert(auditEvent) {
    console.error('🚨 ALERTA CRÍTICA DE AUDITORÍA:', auditEvent);

    if (this.criticalAlerts[auditEvent.eventType]) {
      this.showAuditAlert('Alerta Crítica de Auditoría', auditEvent.eventType, 'error');
    }
  }

  triggerErrorAlert(auditEvent) {
    console.error('❌ ALERTA DE ERROR DE AUDITORÍA:', auditEvent);

    if (this.warningAlerts[auditEvent.eventType]) {
      this.showAuditAlert('Alerta de Error de Auditoría', auditEvent.eventType, 'error');
    }
  }

  triggerWarningAlert(auditEvent) {
    console.warn('⚠️ ALERTA DE ADVERTENCIA DE AUDITORÍA:', auditEvent);

    if (this.warningAlerts[auditEvent.eventType]) {
      this.showAuditAlert('Alerta de Advertencia de Auditoría', auditEvent.eventType, 'warning');
    }
  }

  showAuditAlert(title, message, type) {
    if (window.axyraNotifications) {
      window.axyraNotifications.showWarning(message, {
        title: title,
        persistent: true,
        type: type,
      });
    }
  }

  // Métodos de análisis
  analyzeAuditLogs() {
    try {
      // Analizar logs de auditoría
      this.analyzeSecurityPatterns();
      this.analyzeAccessPatterns();
      this.analyzeErrorPatterns();
      this.analyzePerformancePatterns();
    } catch (error) {
      console.error('❌ Error analizando logs de auditoría:', error);
    }
  }

  analyzeSecurityPatterns() {
    // Analizar patrones de seguridad
    const securityEvents = this.auditLogs.filter(
      (log) => log.category === 'security_events' && log.timestamp > Date.now() - 24 * 60 * 60 * 1000 // Últimas 24 horas
    );

    if (securityEvents.length > 10) {
      this.logAuditEvent('security_events', 'warn', 'security_pattern_anomaly', {
        eventCount: securityEvents.length,
        timeWindow: '24h',
        timestamp: Date.now(),
      });
    }
  }

  analyzeAccessPatterns() {
    // Analizar patrones de acceso
    const accessEvents = this.auditLogs.filter(
      (log) => log.category === 'data_access' && log.timestamp > Date.now() - 60 * 60 * 1000 // Última hora
    );

    if (accessEvents.length > 100) {
      this.logAuditEvent('data_access', 'warn', 'access_pattern_anomaly', {
        eventCount: accessEvents.length,
        timeWindow: '1h',
        timestamp: Date.now(),
      });
    }
  }

  analyzeErrorPatterns() {
    // Analizar patrones de errores
    const errorEvents = this.auditLogs.filter(
      (log) => log.level === 'error' && log.timestamp > Date.now() - 60 * 60 * 1000 // Última hora
    );

    if (errorEvents.length > 20) {
      this.logAuditEvent('system_changes', 'warn', 'error_pattern_anomaly', {
        eventCount: errorEvents.length,
        timeWindow: '1h',
        timestamp: Date.now(),
      });
    }
  }

  analyzePerformancePatterns() {
    // Analizar patrones de rendimiento
    const performanceEvents = this.auditLogs.filter(
      (log) => log.eventType === 'api_request' && log.timestamp > Date.now() - 60 * 60 * 1000 // Última hora
    );

    if (performanceEvents.length > 50) {
      this.logAuditEvent('data_access', 'info', 'performance_pattern_anomaly', {
        eventCount: performanceEvents.length,
        timeWindow: '1h',
        timestamp: Date.now(),
      });
    }
  }

  // Métodos de reportes
  generateDailyReport() {
    try {
      const report = this.createAuditReport('daily');
      this.saveAuditReport(report);
      console.log('📊 Reporte diario de auditoría generado');
    } catch (error) {
      console.error('❌ Error generando reporte diario:', error);
    }
  }

  generateWeeklyReport() {
    try {
      const report = this.createAuditReport('weekly');
      this.saveAuditReport(report);
      console.log('📊 Reporte semanal de auditoría generado');
    } catch (error) {
      console.error('❌ Error generando reporte semanal:', error);
    }
  }

  generateMonthlyReport() {
    try {
      const report = this.createAuditReport('monthly');
      this.saveAuditReport(report);
      console.log('📊 Reporte mensual de auditoría generado');
    } catch (error) {
      console.error('❌ Error generando reporte mensual:', error);
    }
  }

  createAuditReport(period) {
    const now = Date.now();
    let startTime;

    switch (period) {
      case 'daily':
        startTime = now - 24 * 60 * 60 * 1000;
        break;
      case 'weekly':
        startTime = now - 7 * 24 * 60 * 60 * 1000;
        break;
      case 'monthly':
        startTime = now - 30 * 24 * 60 * 60 * 1000;
        break;
      default:
        startTime = now - 24 * 60 * 60 * 1000;
    }

    const periodLogs = this.auditLogs.filter((log) => log.timestamp >= startTime);

    const report = {
      period: period,
      startTime: startTime,
      endTime: now,
      totalLogs: periodLogs.length,
      criticalLogs: periodLogs.filter((log) => log.level === 'critical').length,
      errorLogs: periodLogs.filter((log) => log.level === 'error').length,
      warningLogs: periodLogs.filter((log) => log.level === 'warn').length,
      infoLogs: periodLogs.filter((log) => log.level === 'info').length,
      debugLogs: periodLogs.filter((log) => log.level === 'debug').length,
      categories: this.analyzeCategories(periodLogs),
      events: this.analyzeEvents(periodLogs),
      users: this.analyzeUsers(periodLogs),
      devices: this.analyzeDevices(periodLogs),
      timestamp: now,
    };

    return report;
  }

  analyzeCategories(logs) {
    const categories = {};
    logs.forEach((log) => {
      if (!categories[log.category]) {
        categories[log.category] = 0;
      }
      categories[log.category]++;
    });
    return categories;
  }

  analyzeEvents(logs) {
    const events = {};
    logs.forEach((log) => {
      if (!events[log.eventType]) {
        events[log.eventType] = 0;
      }
      events[log.eventType]++;
    });
    return events;
  }

  analyzeUsers(logs) {
    const users = {};
    logs.forEach((log) => {
      if (log.userId) {
        if (!users[log.userId]) {
          users[log.userId] = 0;
        }
        users[log.userId]++;
      }
    });
    return users;
  }

  analyzeDevices(logs) {
    const devices = {};
    logs.forEach((log) => {
      if (log.device) {
        const deviceKey = `${log.device.userAgent}_${log.device.platform}`;
        if (!devices[deviceKey]) {
          devices[deviceKey] = 0;
        }
        devices[deviceKey]++;
      }
    });
    return devices;
  }

  // Métodos de limpieza
  cleanupAuditLogs() {
    try {
      const retentionTime = Date.now() - this.auditSettings.auditRetentionDays * 24 * 60 * 60 * 1000;
      const originalLength = this.auditLogs.length;

      this.auditLogs = this.auditLogs.filter((log) => log.timestamp >= retentionTime);

      if (this.auditLogs.length < originalLength) {
        this.saveAuditLogs();
        console.log(`🧹 Logs de auditoría limpiados: ${originalLength - this.auditLogs.length} eliminados`);
      }
    } catch (error) {
      console.error('❌ Error limpiando logs de auditoría:', error);
    }
  }

  // Métodos de utilidad
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

  getCurrentSessionId() {
    try {
      const sessionData = localStorage.getItem('axyra_user_session');
      if (sessionData) {
        const session = JSON.parse(sessionData);
        return session.sessionId;
      }
      return null;
    } catch (error) {
      return null;
    }
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

  getCurrentIPAddress() {
    // Implementar obtención de IP (requiere servicio externo)
    return 'unknown';
  }

  // Métodos de guardado
  saveAuditLogs() {
    try {
      localStorage.setItem('axyra_audit_logs', JSON.stringify(this.auditLogs));
    } catch (error) {
      console.error('❌ Error guardando logs de auditoría:', error);
    }
  }

  saveAuditMetrics() {
    try {
      localStorage.setItem('axyra_audit_metrics', JSON.stringify(this.auditMetrics));
    } catch (error) {
      console.error('❌ Error guardando métricas de auditoría:', error);
    }
  }

  saveAuditReport(report) {
    try {
      const reports = JSON.parse(localStorage.getItem('axyra_audit_reports') || '[]');
      reports.push(report);

      // Mantener solo los últimos 100 reportes
      if (reports.length > 100) {
        reports.splice(0, reports.length - 100);
      }

      localStorage.setItem('axyra_audit_reports', JSON.stringify(reports));
    } catch (error) {
      console.error('❌ Error guardando reporte de auditoría:', error);
    }
  }

  // Métodos de exportación
  exportAuditLogs() {
    const data = {
      logs: this.auditLogs,
      metrics: this.auditMetrics,
      settings: this.auditSettings,
      timestamp: new Date().toISOString(),
      device: this.getCurrentDeviceInfo(),
    };

    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });

    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `axyra_audit_logs_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  }

  exportAuditReport(period) {
    const report = this.createAuditReport(period);
    const dataStr = JSON.stringify(report, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });

    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `axyra_audit_report_${period}_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  }

  // Métodos de limpieza
  clearAuditLogs() {
    this.auditLogs = [];
    this.auditMetrics = {
      totalLogs: 0,
      criticalLogs: 0,
      warningLogs: 0,
      infoLogs: 0,
      debugLogs: 0,
      lastAuditTime: null,
      auditErrors: 0,
    };

    this.saveAuditLogs();
    this.saveAuditMetrics();
  }

  // Métodos de limpieza
  destroy() {
    this.auditLogs = [];
    this.auditMetrics = {
      totalLogs: 0,
      criticalLogs: 0,
      warningLogs: 0,
      infoLogs: 0,
      debugLogs: 0,
      lastAuditTime: null,
      auditErrors: 0,
    };
  }
}

// Inicializar sistema de auditoría de seguridad
document.addEventListener('DOMContentLoaded', function () {
  try {
    window.axyraSecurityAudit = new AxyraSecurityAuditSystem();
    console.log('✅ Sistema de Auditoría de Seguridad AXYRA cargado');
  } catch (error) {
    console.error('❌ Error cargando sistema de auditoría de seguridad:', error);
  }
});

// Exportar para uso global
window.AxyraSecurityAuditSystem = AxyraSecurityAuditSystem;
