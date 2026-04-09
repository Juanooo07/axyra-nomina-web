// ========================================
// AXYRA EMAIL INTEGRATION SYSTEM
// Sistema de integración de email
// ========================================

class AxyraEmailIntegrationSystem {
  constructor() {
    this.emailProviders = new Map();
    this.emailTemplates = new Map();
    this.emailSettings = {
      enableSMTP: true,
      enableSendGrid: true,
      enableMailgun: false,
      enableAWS_SES: false,
      defaultProvider: 'smtp',
      smtpHost: 'smtp.gmail.com',
      smtpPort: 587,
      smtpSecure: false,
      smtpUser: '',
      smtpPass: '',
      fromEmail: 'noreply@axyra.com',
      fromName: 'AXYRA Sistema',
      replyTo: 'support@axyra.com',
      webhookUrl: '/api/email/webhook',
      retryAttempts: 3,
      timeout: 30000,
    };

    this.emailMetrics = {
      totalEmails: 0,
      sentEmails: 0,
      failedEmails: 0,
      pendingEmails: 0,
      bouncedEmails: 0,
      openedEmails: 0,
      clickedEmails: 0,
    };

    this.init();
  }

  async init() {
    console.log('📧 Inicializando Sistema de Integración de Email AXYRA...');

    try {
      await this.loadEmailSettings();
      this.setupEmailProviders();
      this.setupEmailTemplates();
      this.setupEmailWebhooks();
      this.setupEmailMonitoring();
      this.setupEmailRetry();
      console.log('✅ Sistema de Integración de Email AXYRA inicializado');
    } catch (error) {
      console.error('❌ Error inicializando sistema de email:', error);
    }
  }

  async loadEmailSettings() {
    try {
      const settings = localStorage.getItem('axyra_email_settings');
      if (settings) {
        const parsedSettings = JSON.parse(settings);
        this.emailSettings = { ...this.emailSettings, ...parsedSettings };
      }

      const metrics = localStorage.getItem('axyra_email_metrics');
      if (metrics) {
        this.emailMetrics = { ...this.emailMetrics, ...JSON.parse(metrics) };
      }
    } catch (error) {
      console.error('❌ Error cargando configuración de email:', error);
    }
  }

  setupEmailProviders() {
    // Configurar proveedores de email
    this.emailProviders.set('smtp', {
      name: 'SMTP',
      enabled: this.emailSettings.enableSMTP,
      host: this.emailSettings.smtpHost,
      port: this.emailSettings.smtpPort,
      secure: this.emailSettings.smtpSecure,
      user: this.emailSettings.smtpUser,
      pass: this.emailSettings.smtpPass,
      fromEmail: this.emailSettings.fromEmail,
      fromName: this.emailSettings.fromName,
    });

    this.emailProviders.set('sendgrid', {
      name: 'SendGrid',
      enabled: this.emailSettings.enableSendGrid,
      apiKey: this.emailSettings.sendGridApiKey,
      fromEmail: this.emailSettings.fromEmail,
      fromName: this.emailSettings.fromName,
      webhookUrl: this.emailSettings.webhookUrl + '/sendgrid',
    });

    this.emailProviders.set('mailgun', {
      name: 'Mailgun',
      enabled: this.emailSettings.enableMailgun,
      apiKey: this.emailSettings.mailgunApiKey,
      domain: this.emailSettings.mailgunDomain,
      fromEmail: this.emailSettings.fromEmail,
      fromName: this.emailSettings.fromName,
      webhookUrl: this.emailSettings.webhookUrl + '/mailgun',
    });

    this.emailProviders.set('aws_ses', {
      name: 'AWS SES',
      enabled: this.emailSettings.enableAWS_SES,
      accessKeyId: this.emailSettings.awsAccessKeyId,
      secretAccessKey: this.emailSettings.awsSecretAccessKey,
      region: this.emailSettings.awsRegion,
      fromEmail: this.emailSettings.fromEmail,
      fromName: this.emailSettings.fromName,
    });
  }

  setupEmailTemplates() {
    // Configurar plantillas de email
    this.emailTemplates.set('welcome', {
      name: 'Bienvenida',
      subject: 'Bienvenido a AXYRA',
      html: this.getWelcomeTemplate(),
      text: this.getWelcomeTextTemplate(),
    });

    this.emailTemplates.set('password_reset', {
      name: 'Restablecer Contraseña',
      subject: 'Restablecer Contraseña - AXYRA',
      html: this.getPasswordResetTemplate(),
      text: this.getPasswordResetTextTemplate(),
    });

    this.emailTemplates.set('payment_confirmation', {
      name: 'Confirmación de Pago',
      subject: 'Confirmación de Pago - AXYRA',
      html: this.getPaymentConfirmationTemplate(),
      text: this.getPaymentConfirmationTextTemplate(),
    });

    this.emailTemplates.set('invoice', {
      name: 'Factura',
      subject: 'Factura - AXYRA',
      html: this.getInvoiceTemplate(),
      text: this.getInvoiceTextTemplate(),
    });

    this.emailTemplates.set('notification', {
      name: 'Notificación',
      subject: 'Notificación - AXYRA',
      html: this.getNotificationTemplate(),
      text: this.getNotificationTextTemplate(),
    });
  }

  setupEmailWebhooks() {
    // Configurar webhooks de email
    this.setupSendGridWebhooks();
    this.setupMailgunWebhooks();
    this.setupAWS_SESWebhooks();
  }

  setupSendGridWebhooks() {
    if (!this.emailSettings.enableSendGrid) return;

    // Configurar webhook de SendGrid
    const sendGridProvider = this.emailProviders.get('sendgrid');
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
      window.sendgrid.setApiKey(this.emailSettings.sendGridApiKey);
      console.log('✅ SendGrid inicializado');
    }
  }

  setupMailgunWebhooks() {
    if (!this.emailSettings.enableMailgun) return;

    // Configurar webhook de Mailgun
    const mailgunProvider = this.emailProviders.get('mailgun');
    if (mailgunProvider && mailgunProvider.enabled) {
      this.setupMailgunScript();
    }
  }

  setupMailgunScript() {
    // Cargar script de Mailgun
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/mailgun-js@0.22.0/dist/mailgun.min.js';
    script.onload = () => {
      console.log('✅ Mailgun script cargado');
      this.initializeMailgun();
    };
    script.onerror = () => {
      console.error('❌ Error cargando script de Mailgun');
    };
    document.head.appendChild(script);
  }

  initializeMailgun() {
    if (typeof window.Mailgun !== 'undefined') {
      window.mailgun = window.Mailgun({
        apiKey: this.emailSettings.mailgunApiKey,
        domain: this.emailSettings.mailgunDomain,
      });
      console.log('✅ Mailgun inicializado');
    }
  }

  setupAWS_SESWebhooks() {
    if (!this.emailSettings.enableAWS_SES) return;

    // Configurar webhook de AWS SES
    const awsSESProvider = this.emailProviders.get('aws_ses');
    if (awsSESProvider && awsSESProvider.enabled) {
      this.setupAWS_SESScript();
    }
  }

  setupAWS_SESScript() {
    // Cargar script de AWS SES
    const script = document.createElement('script');
    script.src = 'https://sdk.amazonaws.com/js/aws-sdk-2.1000.0.min.js';
    script.onload = () => {
      console.log('✅ AWS SDK script cargado');
      this.initializeAWS_SES();
    };
    script.onerror = () => {
      console.error('❌ Error cargando script de AWS SDK');
    };
    document.head.appendChild(script);
  }

  initializeAWS_SES() {
    if (typeof window.AWS !== 'undefined') {
      window.AWS.config.update({
        accessKeyId: this.emailSettings.awsAccessKeyId,
        secretAccessKey: this.emailSettings.awsSecretAccessKey,
        region: this.emailSettings.awsRegion,
      });
      window.ses = new window.AWS.SES();
      console.log('✅ AWS SES inicializado');
    }
  }

  setupEmailMonitoring() {
    // Monitorear emails
    this.monitorEmailStatus();
    this.monitorEmailErrors();
    this.monitorEmailPerformance();
  }

  monitorEmailStatus() {
    // Monitorear estado de emails
    setInterval(() => {
      this.checkPendingEmails();
    }, 60 * 1000); // Cada minuto
  }

  monitorEmailErrors() {
    // Monitorear errores de email
    this.emailErrorCount = 0;
    this.emailErrorThreshold = 5;
  }

  monitorEmailPerformance() {
    // Monitorear rendimiento de emails
    this.emailPerformanceMetrics = {
      averageResponseTime: 0,
      successRate: 0,
      errorRate: 0,
    };
  }

  setupEmailRetry() {
    // Configurar reintentos de email
    this.emailRetryQueue = [];
    this.processEmailRetryQueue();
  }

  processEmailRetryQueue() {
    setInterval(() => {
      if (this.emailRetryQueue.length > 0) {
        const email = this.emailRetryQueue.shift();
        this.retryEmail(email);
      }
    }, 30 * 1000); // Cada 30 segundos
  }

  // Métodos de envío de emails
  async sendEmail(emailData) {
    try {
      const startTime = performance.now();

      // Validar datos de email
      this.validateEmailData(emailData);

      // Seleccionar proveedor
      const provider = this.selectEmailProvider(emailData);

      // Enviar email
      const result = await this.executeEmail(provider, emailData);

      const endTime = performance.now();
      const processingTime = endTime - startTime;

      // Actualizar métricas
      this.updateEmailMetrics(result, processingTime);

      // Registrar email
      this.logEmailTransaction(emailData, result);

      return result;
    } catch (error) {
      console.error('❌ Error enviando email:', error);
      this.handleEmailError(emailData, error);
      throw error;
    }
  }

  validateEmailData(emailData) {
    const requiredFields = ['to', 'subject', 'template'];

    for (const field of requiredFields) {
      if (!emailData[field]) {
        throw new Error(`Campo requerido faltante: ${field}`);
      }
    }

    if (!this.isValidEmail(emailData.to)) {
      throw new Error('Email de destino inválido');
    }
  }

  selectEmailProvider(emailData) {
    const availableProviders = Array.from(this.emailProviders.values()).filter((provider) => provider.enabled);

    if (availableProviders.length === 0) {
      throw new Error('No hay proveedores de email disponibles');
    }

    // Seleccionar el proveedor por defecto o el primero disponible
    const defaultProvider = this.emailProviders.get(this.emailSettings.defaultProvider);
    return defaultProvider && defaultProvider.enabled ? defaultProvider : availableProviders[0];
  }

  async executeEmail(provider, emailData) {
    switch (provider.name.toLowerCase()) {
      case 'smtp':
        return await this.sendSMTPEmail(emailData);
      case 'sendgrid':
        return await this.sendSendGridEmail(emailData);
      case 'mailgun':
        return await this.sendMailgunEmail(emailData);
      case 'aws ses':
        return await this.sendAWS_SESEmail(emailData);
      default:
        throw new Error(`Proveedor no soportado: ${provider.name}`);
    }
  }

  async sendSMTPEmail(emailData) {
    try {
      const response = await fetch('/api/email/smtp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: emailData.to,
          subject: emailData.subject,
          html: emailData.html,
          text: emailData.text,
          from: this.emailSettings.fromEmail,
          fromName: this.emailSettings.fromName,
        }),
      });

      const result = await response.json();

      return {
        success: true,
        provider: 'smtp',
        messageId: result.messageId,
        status: result.status,
        to: emailData.to,
        subject: emailData.subject,
      };
    } catch (error) {
      console.error('❌ Error enviando email con SMTP:', error);
      throw error;
    }
  }

  async sendSendGridEmail(emailData) {
    try {
      if (typeof window.sendgrid === 'undefined') {
        throw new Error('SendGrid no está inicializado');
      }

      const msg = {
        to: emailData.to,
        from: {
          email: this.emailSettings.fromEmail,
          name: this.emailSettings.fromName,
        },
        subject: emailData.subject,
        html: emailData.html,
        text: emailData.text,
      };

      const result = await window.sendgrid.send(msg);

      return {
        success: true,
        provider: 'sendgrid',
        messageId: result[0].headers['x-message-id'],
        status: result[0].statusCode === 202 ? 'sent' : 'failed',
        to: emailData.to,
        subject: emailData.subject,
      };
    } catch (error) {
      console.error('❌ Error enviando email con SendGrid:', error);
      throw error;
    }
  }

  async sendMailgunEmail(emailData) {
    try {
      if (typeof window.mailgun === 'undefined') {
        throw new Error('Mailgun no está inicializado');
      }

      const data = {
        from: `${this.emailSettings.fromName} <${this.emailSettings.fromEmail}>`,
        to: emailData.to,
        subject: emailData.subject,
        html: emailData.html,
        text: emailData.text,
      };

      const result = await window.mailgun.messages().send(data);

      return {
        success: true,
        provider: 'mailgun',
        messageId: result.id,
        status: 'sent',
        to: emailData.to,
        subject: emailData.subject,
      };
    } catch (error) {
      console.error('❌ Error enviando email con Mailgun:', error);
      throw error;
    }
  }

  async sendAWS_SESEmail(emailData) {
    try {
      if (typeof window.ses === 'undefined') {
        throw new Error('AWS SES no está inicializado');
      }

      const params = {
        Destination: {
          ToAddresses: [emailData.to],
        },
        Message: {
          Body: {
            Html: {
              Charset: 'UTF-8',
              Data: emailData.html,
            },
            Text: {
              Charset: 'UTF-8',
              Data: emailData.text,
            },
          },
          Subject: {
            Charset: 'UTF-8',
            Data: emailData.subject,
          },
        },
        Source: this.emailSettings.fromEmail,
      };

      const result = await window.ses.sendEmail(params).promise();

      return {
        success: true,
        provider: 'aws_ses',
        messageId: result.MessageId,
        status: 'sent',
        to: emailData.to,
        subject: emailData.subject,
      };
    } catch (error) {
      console.error('❌ Error enviando email con AWS SES:', error);
      throw error;
    }
  }

  // Métodos de plantillas
  getWelcomeTemplate() {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Bienvenido a AXYRA</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #2563eb;">¡Bienvenido a AXYRA!</h1>
          <p>Gracias por unirte a nuestro sistema de gestión empresarial.</p>
          <p>Tu cuenta ha sido creada exitosamente y ya puedes comenzar a usar todas las funcionalidades.</p>
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Próximos pasos:</h3>
            <ul>
              <li>Completa tu perfil</li>
              <li>Explora las funcionalidades disponibles</li>
              <li>Configura tus preferencias</li>
            </ul>
          </div>
          <p>Si tienes alguna pregunta, no dudes en contactarnos.</p>
          <p>Saludos,<br>El equipo de AXYRA</p>
        </div>
      </body>
      </html>
    `;
  }

  getWelcomeTextTemplate() {
    return `
      ¡Bienvenido a AXYRA!
      
      Gracias por unirte a nuestro sistema de gestión empresarial.
      
      Tu cuenta ha sido creada exitosamente y ya puedes comenzar a usar todas las funcionalidades.
      
      Próximos pasos:
      - Completa tu perfil
      - Explora las funcionalidades disponibles
      - Configura tus preferencias
      
      Si tienes alguna pregunta, no dudes en contactarnos.
      
      Saludos,
      El equipo de AXYRA
    `;
  }

  getPasswordResetTemplate() {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Restablecer Contraseña - AXYRA</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #2563eb;">Restablecer Contraseña</h1>
          <p>Has solicitado restablecer tu contraseña en AXYRA.</p>
          <p>Para continuar, haz clic en el siguiente enlace:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="{{resetLink}}" style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Restablecer Contraseña</a>
          </div>
          <p>Si no solicitaste este cambio, puedes ignorar este email.</p>
          <p>Este enlace expirará en 24 horas por seguridad.</p>
          <p>Saludos,<br>El equipo de AXYRA</p>
        </div>
      </body>
      </html>
    `;
  }

  getPasswordResetTextTemplate() {
    return `
      Restablecer Contraseña - AXYRA
      
      Has solicitado restablecer tu contraseña en AXYRA.
      
      Para continuar, visita el siguiente enlace:
      {{resetLink}}
      
      Si no solicitaste este cambio, puedes ignorar este email.
      
      Este enlace expirará en 24 horas por seguridad.
      
      Saludos,
      El equipo de AXYRA
    `;
  }

  getPaymentConfirmationTemplate() {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Confirmación de Pago - AXYRA</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #16a34a;">¡Pago Confirmado!</h1>
          <p>Tu pago ha sido procesado exitosamente.</p>
          <div style="background: #f0fdf4; border: 1px solid #bbf7d0; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Detalles del Pago:</h3>
            <p><strong>Monto:</strong> {{amount}} {{currency}}</p>
            <p><strong>Referencia:</strong> {{reference}}</p>
            <p><strong>Fecha:</strong> {{date}}</p>
            <p><strong>Método:</strong> {{method}}</p>
          </div>
          <p>Gracias por tu pago. Si tienes alguna pregunta, no dudes en contactarnos.</p>
          <p>Saludos,<br>El equipo de AXYRA</p>
        </div>
      </body>
      </html>
    `;
  }

  getPaymentConfirmationTextTemplate() {
    return `
      ¡Pago Confirmado! - AXYRA
      
      Tu pago ha sido procesado exitosamente.
      
      Detalles del Pago:
      - Monto: {{amount}} {{currency}}
      - Referencia: {{reference}}
      - Fecha: {{date}}
      - Método: {{method}}
      
      Gracias por tu pago. Si tienes alguna pregunta, no dudes en contactarnos.
      
      Saludos,
      El equipo de AXYRA
    `;
  }

  getInvoiceTemplate() {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Factura - AXYRA</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #2563eb;">Factura AXYRA</h1>
          <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Información de la Factura:</h3>
            <p><strong>Número:</strong> {{invoiceNumber}}</p>
            <p><strong>Fecha:</strong> {{date}}</p>
            <p><strong>Vencimiento:</strong> {{dueDate}}</p>
            <p><strong>Total:</strong> {{total}} {{currency}}</p>
          </div>
          <p>Adjunto encontrarás la factura en formato PDF.</p>
          <p>Si tienes alguna pregunta sobre esta factura, no dudes en contactarnos.</p>
          <p>Saludos,<br>El equipo de AXYRA</p>
        </div>
      </body>
      </html>
    `;
  }

  getInvoiceTextTemplate() {
    return `
      Factura AXYRA
      
      Información de la Factura:
      - Número: {{invoiceNumber}}
      - Fecha: {{date}}
      - Vencimiento: {{dueDate}}
      - Total: {{total}} {{currency}}
      
      Adjunto encontrarás la factura en formato PDF.
      
      Si tienes alguna pregunta sobre esta factura, no dudes en contactarnos.
      
      Saludos,
      El equipo de AXYRA
    `;
  }

  getNotificationTemplate() {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Notificación - AXYRA</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #2563eb;">Notificación AXYRA</h1>
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>{{title}}</h3>
            <p>{{message}}</p>
          </div>
          <p>Si tienes alguna pregunta, no dudes en contactarnos.</p>
          <p>Saludos,<br>El equipo de AXYRA</p>
        </div>
      </body>
      </html>
    `;
  }

  getNotificationTextTemplate() {
    return `
      Notificación AXYRA
      
      {{title}}
      
      {{message}}
      
      Si tienes alguna pregunta, no dudes en contactarnos.
      
      Saludos,
      El equipo de AXYRA
    `;
  }

  // Métodos de utilidad
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  updateEmailMetrics(result, processingTime) {
    this.emailMetrics.totalEmails++;

    if (result.success) {
      this.emailMetrics.sentEmails++;
    } else {
      this.emailMetrics.failedEmails++;
    }

    this.emailMetrics.averageResponseTime = (this.emailMetrics.averageResponseTime + processingTime) / 2;

    this.saveEmailMetrics();
  }

  logEmailTransaction(emailData, result) {
    const transaction = {
      id: this.generateEmailId(),
      emailData: emailData,
      result: result,
      timestamp: Date.now(),
      userId: this.getCurrentUserId(),
    };

    this.saveEmailTransaction(transaction);
  }

  handleEmailError(emailData, error) {
    this.emailMetrics.failedEmails++;
    this.emailErrorCount++;

    if (this.emailErrorCount >= this.emailErrorThreshold) {
      this.triggerEmailErrorAlert(error);
    }

    // Agregar a cola de reintentos
    this.emailRetryQueue.push({
      emailData: emailData,
      attempts: 0,
      maxAttempts: this.emailSettings.retryAttempts,
    });
  }

  async retryEmail(email) {
    if (email.attempts >= email.maxAttempts) {
      console.error('❌ Máximo de reintentos alcanzado para email:', email.emailData);
      return;
    }

    email.attempts++;

    try {
      await this.sendEmail(email.emailData);
      console.log('✅ Email reintentado exitosamente');
    } catch (error) {
      console.error('❌ Error en reintento de email:', error);
      // Reagregar a la cola si no se ha alcanzado el máximo
      if (email.attempts < email.maxAttempts) {
        this.emailRetryQueue.push(email);
      }
    }
  }

  triggerEmailErrorAlert(error) {
    if (window.axyraNotifications) {
      window.axyraNotifications.showError('Error de Email', {
        message: `Error crítico en envío de emails: ${error.message}`,
        persistent: true,
      });
    }
  }

  // Métodos de utilidad
  generateEmailId() {
    return 'EMAIL_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
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

  async checkPendingEmails() {
    try {
      const response = await fetch('/api/email/pending');
      const pendingEmails = await response.json();

      for (const email of pendingEmails) {
        await this.verifyEmailStatus(email.id);
      }
    } catch (error) {
      console.error('❌ Error verificando emails pendientes:', error);
    }
  }

  async verifyEmailStatus(emailId) {
    try {
      const response = await fetch(`/api/email/status/${emailId}`);
      const result = await response.json();

      if (result.status === 'delivered') {
        this.emailMetrics.sentEmails++;
      } else if (result.status === 'bounced') {
        this.emailMetrics.bouncedEmails++;
      }

      this.saveEmailMetrics();
    } catch (error) {
      console.error('❌ Error verificando estado de email:', error);
    }
  }

  // Métodos de guardado
  saveEmailMetrics() {
    try {
      localStorage.setItem('axyra_email_metrics', JSON.stringify(this.emailMetrics));
    } catch (error) {
      console.error('❌ Error guardando métricas de email:', error);
    }
  }

  saveEmailTransaction(transaction) {
    try {
      const transactions = JSON.parse(localStorage.getItem('axyra_email_transactions') || '[]');
      transactions.push(transaction);

      // Mantener solo los últimos 1000 transacciones
      if (transactions.length > 1000) {
        transactions.splice(0, transactions.length - 1000);
      }

      localStorage.setItem('axyra_email_transactions', JSON.stringify(transactions));
    } catch (error) {
      console.error('❌ Error guardando transacción de email:', error);
    }
  }

  // Métodos de exportación
  exportEmailReport() {
    const data = {
      metrics: this.emailMetrics,
      settings: this.emailSettings,
      timestamp: new Date().toISOString(),
      device: this.getCurrentDeviceInfo(),
    };

    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });

    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `axyra_email_report_${new Date().toISOString().split('T')[0]}.json`;
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
    this.emailProviders.clear();
    this.emailTemplates.clear();
    this.emailRetryQueue = [];
    this.emailMetrics = {
      totalEmails: 0,
      sentEmails: 0,
      failedEmails: 0,
      pendingEmails: 0,
      bouncedEmails: 0,
      openedEmails: 0,
      clickedEmails: 0,
    };
  }
}

// Inicializar sistema de integración de email
document.addEventListener('DOMContentLoaded', function () {
  try {
    window.axyraEmailIntegration = new AxyraEmailIntegrationSystem();
    console.log('✅ Sistema de Integración de Email AXYRA cargado');
  } catch (error) {
    console.error('❌ Error cargando sistema de integración de email:', error);
  }
});

// Exportar para uso global
window.AxyraEmailIntegrationSystem = AxyraEmailIntegrationSystem;
