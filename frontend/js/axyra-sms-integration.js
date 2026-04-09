// ========================================
// AXYRA SMS INTEGRATION SYSTEM
// Sistema de integración de SMS
// ========================================

class AxyraSMSIntegrationSystem {
  constructor() {
    this.smsProviders = new Map();
    this.smsTemplates = new Map();
    this.smsSettings = {
      enableTwilio: true,
      enableAWS_SNS: false,
      enableSendGrid: false,
      defaultProvider: 'twilio',
      twilioAccountSid: '',
      twilioAuthToken: '',
      twilioFromNumber: '',
      awsAccessKeyId: '',
      awsSecretAccessKey: '',
      awsRegion: 'us-east-1',
      sendGridApiKey: '',
      webhookUrl: '/api/sms/webhook',
      retryAttempts: 3,
      timeout: 30000,
      maxMessageLength: 160,
      enableUnicode: true,
    };

    this.smsMetrics = {
      totalMessages: 0,
      sentMessages: 0,
      failedMessages: 0,
      pendingMessages: 0,
      deliveredMessages: 0,
      undeliveredMessages: 0,
      averageDeliveryTime: 0,
    };

    this.init();
  }

  async init() {
    console.log('📱 Inicializando Sistema de Integración de SMS AXYRA...');

    try {
      await this.loadSMSSettings();
      this.setupSMSProviders();
      this.setupSMSTemplates();
      this.setupSMSWebhooks();
      this.setupSMSMonitoring();
      this.setupSMSRetry();
      console.log('✅ Sistema de Integración de SMS AXYRA inicializado');
    } catch (error) {
      console.error('❌ Error inicializando sistema de SMS:', error);
    }
  }

  async loadSMSSettings() {
    try {
      const settings = localStorage.getItem('axyra_sms_settings');
      if (settings) {
        const parsedSettings = JSON.parse(settings);
        this.smsSettings = { ...this.smsSettings, ...parsedSettings };
      }

      const metrics = localStorage.getItem('axyra_sms_metrics');
      if (metrics) {
        this.smsMetrics = { ...this.smsMetrics, ...JSON.parse(metrics) };
      }
    } catch (error) {
      console.error('❌ Error cargando configuración de SMS:', error);
    }
  }

  setupSMSProviders() {
    // Configurar proveedores de SMS
    this.smsProviders.set('twilio', {
      name: 'Twilio',
      enabled: this.smsSettings.enableTwilio,
      accountSid: this.smsSettings.twilioAccountSid,
      authToken: this.smsSettings.twilioAuthToken,
      fromNumber: this.smsSettings.twilioFromNumber,
      webhookUrl: this.smsSettings.webhookUrl + '/twilio',
    });

    this.smsProviders.set('aws_sns', {
      name: 'AWS SNS',
      enabled: this.smsSettings.enableAWS_SNS,
      accessKeyId: this.smsSettings.awsAccessKeyId,
      secretAccessKey: this.smsSettings.awsSecretAccessKey,
      region: this.smsSettings.awsRegion,
      webhookUrl: this.smsSettings.webhookUrl + '/aws_sns',
    });

    this.smsProviders.set('sendgrid', {
      name: 'SendGrid',
      enabled: this.smsSettings.enableSendGrid,
      apiKey: this.smsSettings.sendGridApiKey,
      webhookUrl: this.smsSettings.webhookUrl + '/sendgrid',
    });
  }

  setupSMSTemplates() {
    // Configurar plantillas de SMS
    this.smsTemplates.set('welcome', {
      name: 'Bienvenida',
      message:
        '¡Bienvenido a AXYRA! Tu cuenta ha sido creada exitosamente. Accede a tu panel de control para comenzar.',
      maxLength: 160,
    });

    this.smsTemplates.set('password_reset', {
      name: 'Restablecer Contraseña',
      message: 'AXYRA: Tu código de restablecimiento es {{code}}. Válido por 10 minutos. No compartas este código.',
      maxLength: 160,
    });

    this.smsTemplates.set('payment_confirmation', {
      name: 'Confirmación de Pago',
      message: 'AXYRA: Pago confirmado por {{amount}} {{currency}}. Ref: {{reference}}. Gracias por tu pago.',
      maxLength: 160,
    });

    this.smsTemplates.set('notification', {
      name: 'Notificación',
      message: 'AXYRA: {{message}}',
      maxLength: 160,
    });

    this.smsTemplates.set('verification', {
      name: 'Verificación',
      message: 'AXYRA: Tu código de verificación es {{code}}. Válido por 5 minutos.',
      maxLength: 160,
    });

    this.smsTemplates.set('reminder', {
      name: 'Recordatorio',
      message: 'AXYRA: Recordatorio - {{message}}',
      maxLength: 160,
    });
  }

  setupSMSWebhooks() {
    // Configurar webhooks de SMS
    this.setupTwilioWebhooks();
    this.setupAWS_SNSWebhooks();
    this.setupSendGridWebhooks();
  }

  setupTwilioWebhooks() {
    if (!this.smsSettings.enableTwilio) return;

    // Configurar webhook de Twilio
    const twilioProvider = this.smsProviders.get('twilio');
    if (twilioProvider && twilioProvider.enabled) {
      this.setupTwilioScript();
    }
  }

  setupTwilioScript() {
    // Cargar script de Twilio
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/twilio@4.19.0/dist/twilio.min.js';
    script.onload = () => {
      console.log('✅ Twilio script cargado');
      this.initializeTwilio();
    };
    script.onerror = () => {
      console.error('❌ Error cargando script de Twilio');
    };
    document.head.appendChild(script);
  }

  initializeTwilio() {
    if (typeof window.Twilio !== 'undefined') {
      window.twilio = window.Twilio;
      console.log('✅ Twilio inicializado');
    }
  }

  setupAWS_SNSWebhooks() {
    if (!this.smsSettings.enableAWS_SNS) return;

    // Configurar webhook de AWS SNS
    const awsSNSProvider = this.smsProviders.get('aws_sns');
    if (awsSNSProvider && awsSNSProvider.enabled) {
      this.setupAWS_SNSScript();
    }
  }

  setupAWS_SNSScript() {
    // Cargar script de AWS SNS
    const script = document.createElement('script');
    script.src = 'https://sdk.amazonaws.com/js/aws-sdk-2.1000.0.min.js';
    script.onload = () => {
      console.log('✅ AWS SDK script cargado');
      this.initializeAWS_SNS();
    };
    script.onerror = () => {
      console.error('❌ Error cargando script de AWS SDK');
    };
    document.head.appendChild(script);
  }

  initializeAWS_SNS() {
    if (typeof window.AWS !== 'undefined') {
      window.AWS.config.update({
        accessKeyId: this.smsSettings.awsAccessKeyId,
        secretAccessKey: this.smsSettings.awsSecretAccessKey,
        region: this.smsSettings.awsRegion,
      });
      window.sns = new window.AWS.SNS();
      console.log('✅ AWS SNS inicializado');
    }
  }

  setupSendGridWebhooks() {
    if (!this.smsSettings.enableSendGrid) return;

    // Configurar webhook de SendGrid
    const sendGridProvider = this.smsProviders.get('sendgrid');
    if (sendGridProvider && sendGridProvider.enabled) {
      this.setupSendGridScript();
    }
  }

  setupSendGridScript() {
    // Cargar script de SendGrid
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/@sendgrid/mail@7.7.0/dist/index.min.js';
    script.onload = () => {
      console.log('✅ SendGrid script cargado');
      this.initializeSendGrid();
    };
    script.onerror = () => {
      console.error('❌ Error cargando script de SendGrid');
    };
    document.head.appendChild(script);
  }

  initializeSendGrid() {
    if (typeof window.SendGrid !== 'undefined') {
      window.sendgrid = window.SendGrid;
      window.sendgrid.setApiKey(this.smsSettings.sendGridApiKey);
      console.log('✅ SendGrid inicializado');
    }
  }

  setupSMSMonitoring() {
    // Monitorear SMS
    this.monitorSMSStatus();
    this.monitorSMSErrors();
    this.monitorSMSPerformance();
  }

  monitorSMSStatus() {
    // Monitorear estado de SMS
    setInterval(() => {
      this.checkPendingSMS();
    }, 60 * 1000); // Cada minuto
  }

  monitorSMSErrors() {
    // Monitorear errores de SMS
    this.smsErrorCount = 0;
    this.smsErrorThreshold = 5;
  }

  monitorSMSPerformance() {
    // Monitorear rendimiento de SMS
    this.smsPerformanceMetrics = {
      averageResponseTime: 0,
      successRate: 0,
      errorRate: 0,
    };
  }

  setupSMSRetry() {
    // Configurar reintentos de SMS
    this.smsRetryQueue = [];
    this.processSMSRetryQueue();
  }

  processSMSRetryQueue() {
    setInterval(() => {
      if (this.smsRetryQueue.length > 0) {
        const sms = this.smsRetryQueue.shift();
        this.retrySMS(sms);
      }
    }, 30 * 1000); // Cada 30 segundos
  }

  // Métodos de envío de SMS
  async sendSMS(smsData) {
    try {
      const startTime = performance.now();

      // Validar datos de SMS
      this.validateSMSData(smsData);

      // Seleccionar proveedor
      const provider = this.selectSMSProvider(smsData);

      // Enviar SMS
      const result = await this.executeSMS(provider, smsData);

      const endTime = performance.now();
      const processingTime = endTime - startTime;

      // Actualizar métricas
      this.updateSMSMetrics(result, processingTime);

      // Registrar SMS
      this.logSMSTransaction(smsData, result);

      return result;
    } catch (error) {
      console.error('❌ Error enviando SMS:', error);
      this.handleSMSError(smsData, error);
      throw error;
    }
  }

  validateSMSData(smsData) {
    const requiredFields = ['to', 'message'];

    for (const field of requiredFields) {
      if (!smsData[field]) {
        throw new Error(`Campo requerido faltante: ${field}`);
      }
    }

    if (!this.isValidPhoneNumber(smsData.to)) {
      throw new Error('Número de teléfono inválido');
    }

    if (smsData.message.length > this.smsSettings.maxMessageLength) {
      throw new Error(`Mensaje demasiado largo. Máximo ${this.smsSettings.maxMessageLength} caracteres`);
    }
  }

  selectSMSProvider(smsData) {
    const availableProviders = Array.from(this.smsProviders.values()).filter((provider) => provider.enabled);

    if (availableProviders.length === 0) {
      throw new Error('No hay proveedores de SMS disponibles');
    }

    // Seleccionar el proveedor por defecto o el primero disponible
    const defaultProvider = this.smsProviders.get(this.smsSettings.defaultProvider);
    return defaultProvider && defaultProvider.enabled ? defaultProvider : availableProviders[0];
  }

  async executeSMS(provider, smsData) {
    switch (provider.name.toLowerCase()) {
      case 'twilio':
        return await this.sendTwilioSMS(smsData);
      case 'aws sns':
        return await this.sendAWS_SNSSMS(smsData);
      case 'sendgrid':
        return await this.sendSendGridSMS(smsData);
      default:
        throw new Error(`Proveedor no soportado: ${provider.name}`);
    }
  }

  async sendTwilioSMS(smsData) {
    try {
      const response = await fetch('/api/sms/twilio/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: smsData.to,
          message: smsData.message,
          from: this.smsSettings.twilioFromNumber,
        }),
      });

      const result = await response.json();

      return {
        success: true,
        provider: 'twilio',
        messageId: result.sid,
        status: result.status,
        to: smsData.to,
        message: smsData.message,
      };
    } catch (error) {
      console.error('❌ Error enviando SMS con Twilio:', error);
      throw error;
    }
  }

  async sendAWS_SNSSMS(smsData) {
    try {
      if (typeof window.sns === 'undefined') {
        throw new Error('AWS SNS no está inicializado');
      }

      const params = {
        Message: smsData.message,
        PhoneNumber: smsData.to,
      };

      const result = await window.sns.publish(params).promise();

      return {
        success: true,
        provider: 'aws_sns',
        messageId: result.MessageId,
        status: 'sent',
        to: smsData.to,
        message: smsData.message,
      };
    } catch (error) {
      console.error('❌ Error enviando SMS con AWS SNS:', error);
      throw error;
    }
  }

  async sendSendGridSMS(smsData) {
    try {
      if (typeof window.sendgrid === 'undefined') {
        throw new Error('SendGrid no está inicializado');
      }

      const response = await fetch('/api/sms/sendgrid/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: smsData.to,
          message: smsData.message,
        }),
      });

      const result = await response.json();

      return {
        success: true,
        provider: 'sendgrid',
        messageId: result.messageId,
        status: result.status,
        to: smsData.to,
        message: smsData.message,
      };
    } catch (error) {
      console.error('❌ Error enviando SMS con SendGrid:', error);
      throw error;
    }
  }

  // Métodos de plantillas
  getWelcomeTemplate() {
    return '¡Bienvenido a AXYRA! Tu cuenta ha sido creada exitosamente. Accede a tu panel de control para comenzar.';
  }

  getPasswordResetTemplate(code) {
    return `AXYRA: Tu código de restablecimiento es ${code}. Válido por 10 minutos. No compartas este código.`;
  }

  getPaymentConfirmationTemplate(amount, currency, reference) {
    return `AXYRA: Pago confirmado por ${amount} ${currency}. Ref: ${reference}. Gracias por tu pago.`;
  }

  getNotificationTemplate(message) {
    return `AXYRA: ${message}`;
  }

  getVerificationTemplate(code) {
    return `AXYRA: Tu código de verificación es ${code}. Válido por 5 minutos.`;
  }

  getReminderTemplate(message) {
    return `AXYRA: Recordatorio - ${message}`;
  }

  // Métodos de utilidad
  isValidPhoneNumber(phoneNumber) {
    // Validar formato de número de teléfono
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    return phoneRegex.test(phoneNumber);
  }

  formatPhoneNumber(phoneNumber) {
    // Formatear número de teléfono
    let formatted = phoneNumber.replace(/\D/g, '');

    if (formatted.startsWith('57')) {
      // Número colombiano
      return '+' + formatted;
    } else if (formatted.startsWith('1')) {
      // Número estadounidense
      return '+' + formatted;
    } else if (!formatted.startsWith('+')) {
      // Agregar código de país por defecto
      return '+57' + formatted;
    }

    return phoneNumber;
  }

  updateSMSMetrics(result, processingTime) {
    this.smsMetrics.totalMessages++;

    if (result.success) {
      this.smsMetrics.sentMessages++;
    } else {
      this.smsMetrics.failedMessages++;
    }

    this.smsMetrics.averageDeliveryTime = (this.smsMetrics.averageDeliveryTime + processingTime) / 2;

    this.saveSMSMetrics();
  }

  logSMSTransaction(smsData, result) {
    const transaction = {
      id: this.generateSMSId(),
      smsData: smsData,
      result: result,
      timestamp: Date.now(),
      userId: this.getCurrentUserId(),
    };

    this.saveSMSTransaction(transaction);
  }

  handleSMSError(smsData, error) {
    this.smsMetrics.failedMessages++;
    this.smsErrorCount++;

    if (this.smsErrorCount >= this.smsErrorThreshold) {
      this.triggerSMSErrorAlert(error);
    }

    // Agregar a cola de reintentos
    this.smsRetryQueue.push({
      smsData: smsData,
      attempts: 0,
      maxAttempts: this.smsSettings.retryAttempts,
    });
  }

  async retrySMS(sms) {
    if (sms.attempts >= sms.maxAttempts) {
      console.error('❌ Máximo de reintentos alcanzado para SMS:', sms.smsData);
      return;
    }

    sms.attempts++;

    try {
      await this.sendSMS(sms.smsData);
      console.log('✅ SMS reintentado exitosamente');
    } catch (error) {
      console.error('❌ Error en reintento de SMS:', error);
      // Reagregar a la cola si no se ha alcanzado el máximo
      if (sms.attempts < sms.maxAttempts) {
        this.smsRetryQueue.push(sms);
      }
    }
  }

  triggerSMSErrorAlert(error) {
    if (window.axyraNotifications) {
      window.axyraNotifications.showError('Error de SMS', {
        message: `Error crítico en envío de SMS: ${error.message}`,
        persistent: true,
      });
    }
  }

  // Métodos de verificación de SMS
  async verifySMS(messageId, provider) {
    try {
      switch (provider.toLowerCase()) {
        case 'twilio':
          return await this.verifyTwilioSMS(messageId);
        case 'aws_sns':
          return await this.verifyAWS_SNSSMS(messageId);
        case 'sendgrid':
          return await this.verifySendGridSMS(messageId);
        default:
          throw new Error(`Proveedor no soportado: ${provider}`);
      }
    } catch (error) {
      console.error('❌ Error verificando SMS:', error);
      throw error;
    }
  }

  async verifyTwilioSMS(messageId) {
    const response = await fetch(`/api/sms/twilio/verify/${messageId}`);
    const result = await response.json();
    return result;
  }

  async verifyAWS_SNSSMS(messageId) {
    const response = await fetch(`/api/sms/aws_sns/verify/${messageId}`);
    const result = await response.json();
    return result;
  }

  async verifySendGridSMS(messageId) {
    const response = await fetch(`/api/sms/sendgrid/verify/${messageId}`);
    const result = await response.json();
    return result;
  }

  // Métodos de utilidad
  generateSMSId() {
    return 'SMS_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
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

  async checkPendingSMS() {
    try {
      const response = await fetch('/api/sms/pending');
      const pendingSMS = await response.json();

      for (const sms of pendingSMS) {
        await this.verifySMS(sms.messageId, sms.provider);
      }
    } catch (error) {
      console.error('❌ Error verificando SMS pendientes:', error);
    }
  }

  // Métodos de guardado
  saveSMSMetrics() {
    try {
      localStorage.setItem('axyra_sms_metrics', JSON.stringify(this.smsMetrics));
    } catch (error) {
      console.error('❌ Error guardando métricas de SMS:', error);
    }
  }

  saveSMSTransaction(transaction) {
    try {
      const transactions = JSON.parse(localStorage.getItem('axyra_sms_transactions') || '[]');
      transactions.push(transaction);

      // Mantener solo los últimos 1000 transacciones
      if (transactions.length > 1000) {
        transactions.splice(0, transactions.length - 1000);
      }

      localStorage.setItem('axyra_sms_transactions', JSON.stringify(transactions));
    } catch (error) {
      console.error('❌ Error guardando transacción de SMS:', error);
    }
  }

  // Métodos de exportación
  exportSMSReport() {
    const data = {
      metrics: this.smsMetrics,
      settings: this.smsSettings,
      timestamp: new Date().toISOString(),
      device: this.getCurrentDeviceInfo(),
    };

    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });

    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `axyra_sms_report_${new Date().toISOString().split('T')[0]}.json`;
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
    this.smsProviders.clear();
    this.smsTemplates.clear();
    this.smsRetryQueue = [];
    this.smsMetrics = {
      totalMessages: 0,
      sentMessages: 0,
      failedMessages: 0,
      pendingMessages: 0,
      deliveredMessages: 0,
      undeliveredMessages: 0,
      averageDeliveryTime: 0,
    };
  }
}

// Inicializar sistema de integración de SMS
document.addEventListener('DOMContentLoaded', function () {
  try {
    window.axyraSMSIntegration = new AxyraSMSIntegrationSystem();
    console.log('✅ Sistema de Integración de SMS AXYRA cargado');
  } catch (error) {
    console.error('❌ Error cargando sistema de integración de SMS:', error);
  }
});

// Exportar para uso global
window.AxyraSMSIntegrationSystem = AxyraSMSIntegrationSystem;
