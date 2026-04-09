// ========================================
// SISTEMA EMAILJS AXYRA
// ========================================

class AxyraEmailJSSystem {
  constructor() {
    this.config = {
      serviceId: 'service_dvqt6fd',
      templateId: 'template_welcome',
      publicKey: '1heyO_r8WJOhBOBYs',
      userId: 'not_required',
    };
    
    this.templates = {
      welcome: 'template_welcome',
      passwordReset: 'template_password_reset',
      notification: 'template_notification',
      invoice: 'template_invoice',
      report: 'template_report',
      alert: 'template_alert',
    };
    
    this.isInitialized = false;
    this.init();
  }

  init() {
    console.log('📧 Inicializando sistema EmailJS...');
    this.loadEmailJSScript();
  }

  loadEmailJSScript() {
    if (typeof emailjs !== 'undefined') {
      this.initializeEmailJS();
      return;
    }
    
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js';
    script.onload = () => {
      this.initializeEmailJS();
    };
    script.onerror = () => {
      console.error('❌ Error cargando EmailJS');
    };
    document.head.appendChild(script);
  }

  initializeEmailJS() {
    try {
      emailjs.init(this.config.publicKey);
      this.isInitialized = true;
      console.log('✅ EmailJS inicializado correctamente');
    } catch (error) {
      console.error('❌ Error inicializando EmailJS:', error);
    }
  }

  async sendEmail(templateId, templateParams, options = {}) {
    if (!this.isInitialized) {
      throw new Error('EmailJS no está inicializado');
    }
    
    try {
      const result = await emailjs.send(
        this.config.serviceId,
        templateId,
        templateParams,
        this.config.publicKey
      );
      console.log('✅ Email enviado:', result);
      return result;
    } catch (error) {
      console.error('❌ Error enviando email:', error);
      throw error;
    }
  }

  async sendWelcomeEmail(userEmail, userName, userRole = 'Usuario') {
    const templateParams = {
      to_email: userEmail,
      to_name: userName,
      user_role: userRole,
      app_name: 'AXYRA Sistema de Gestión',
      app_url: 'https://axyra-sistema-gestion.vercel.app',
      support_email: 'jfuran.va@gmail.com',
      current_date: new Date().toLocaleDateString('es-CO'),
    };
    
    return await this.sendEmail(this.templates.welcome, templateParams);
  }

  async sendPasswordResetEmail(userEmail, userName, resetLink) {
    const templateParams = {
      to_email: userEmail,
      to_name: userName,
      reset_link: resetLink,
      app_name: 'AXYRA Sistema de Gestión',
      support_email: 'jfuran.va@gmail.com',
      current_date: new Date().toLocaleDateString('es-CO'),
    };
    
    return await this.sendEmail(this.templates.passwordReset, templateParams);
  }

  async sendNotificationEmail(userEmail, userName, title, message, type = 'info') {
    const templateParams = {
      to_email: userEmail,
      to_name: userName,
      notification_title: title,
      notification_message: message,
      notification_type: type,
      app_name: 'AXYRA Sistema de Gestión',
      current_date: new Date().toLocaleDateString('es-CO'),
      current_time: new Date().toLocaleTimeString('es-CO'),
    };
    
    return await this.sendEmail(this.templates.notification, templateParams);
  }

  async sendInvoiceEmail(userEmail, userName, invoiceData) {
    const templateParams = {
      to_email: userEmail,
      to_name: userName,
      invoice_number: invoiceData.number,
      invoice_amount: invoiceData.amount,
      invoice_date: invoiceData.date,
      invoice_due_date: invoiceData.dueDate,
      invoice_items: invoiceData.items,
      app_name: 'AXYRA Sistema de Gestión',
      support_email: 'jfuran.va@gmail.com',
    };
    
    return await this.sendEmail(this.templates.invoice, templateParams);
  }

  async sendReportEmail(userEmail, userName, reportData) {
    const templateParams = {
      to_email: userEmail,
      to_name: userName,
      report_title: reportData.title,
      report_period: reportData.period,
      report_summary: reportData.summary,
      report_url: reportData.url,
      app_name: 'AXYRA Sistema de Gestión',
      current_date: new Date().toLocaleDateString('es-CO'),
    };
    
    return await this.sendEmail(this.templates.report, templateParams);
  }

  async sendAlertEmail(userEmail, userName, alertData) {
    const templateParams = {
      to_email: userEmail,
      to_name: userName,
      alert_title: alertData.title,
      alert_message: alertData.message,
      alert_level: alertData.level,
      alert_timestamp: new Date().toLocaleString('es-CO'),
      app_name: 'AXYRA Sistema de Gestión',
      support_email: 'jfuran.va@gmail.com',
    };
    
    return await this.sendEmail(this.templates.alert, templateParams);
  }

  async sendBulkEmail(recipients, templateId, templateParams) {
    const results = [];
    const errors = [];
    
    for (const recipient of recipients) {
      try {
        const result = await this.sendEmail(templateId, {
          ...templateParams,
          to_email: recipient.email,
          to_name: recipient.name,
        });
        results.push({ recipient, result });
      } catch (error) {
        errors.push({ recipient, error });
      }
    }
    
    return { results, errors };
  }

  validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  getAvailableTemplates() {
    return Object.keys(this.templates);
  }

  setCustomTemplate(name, templateId) {
    this.templates[name] = templateId;
  }

  getSystemStatus() {
    return {
      initialized: this.isInitialized,
      config: {
        serviceId: this.config.serviceId,
        publicKey: this.config.publicKey ? '***' + this.config.publicKey.slice(-4) : 'No configurado',
      },
      templates: this.templates,
      timestamp: new Date().toISOString(),
    };
  }

  async testConnection() {
    try {
      if (!this.isInitialized) {
        throw new Error('EmailJS no está inicializado');
      }
      
      const testResult = await this.sendEmail(this.templates.notification, {
        to_email: 'test@example.com',
        to_name: 'Usuario de Prueba',
        notification_title: 'Prueba de Conexión',
        notification_message: 'Este es un email de prueba del sistema AXYRA',
        notification_type: 'test',
        app_name: 'AXYRA Sistema de Gestión',
        current_date: new Date().toLocaleDateString('es-CO'),
      });
      
      return {
        success: true,
        message: 'Conexión exitosa',
        result: testResult,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Error en la conexión',
        error: error.message,
      };
    }
  }

  setupDefaultTemplates() {
    const defaultTemplates = {
      welcome: {
        id: 'template_welcome',
        name: 'Bienvenida a AXYRA',
        subject: 'Bienvenido a {{app_name}}',
        content: `
          <h2>¡Bienvenido a {{app_name}}!</h2>
          <p>Hola {{to_name}},</p>
          <p>Tu cuenta ha sido creada exitosamente con el rol de <strong>{{user_role}}</strong>.</p>
          <p>Puedes acceder al sistema en: <a href="{{app_url}}">{{app_url}}</a></p>
          <p>Si tienes alguna pregunta, contacta a: {{support_email}}</p>
          <p>Fecha: {{current_date}}</p>
        `,
      },
      passwordReset: {
        id: 'template_password_reset',
        name: 'Recuperación de Contraseña',
        subject: 'Recuperación de contraseña - {{app_name}}',
        content: `
          <h2>Recuperación de Contraseña</h2>
          <p>Hola {{to_name}},</p>
          <p>Has solicitado recuperar tu contraseña.</p>
          <p>Haz clic en el siguiente enlace para restablecer tu contraseña:</p>
          <p><a href="{{reset_link}}">Restablecer Contraseña</a></p>
          <p>Si no solicitaste este cambio, ignora este email.</p>
          <p>Fecha: {{current_date}}</p>
        `,
      },
      notification: {
        id: 'template_notification',
        name: 'Notificación General',
        subject: '{{notification_title}} - {{app_name}}',
        content: `
          <h2>{{notification_title}}</h2>
          <p>Hola {{to_name}},</p>
          <p>{{notification_message}}</p>
          <p>Tipo: {{notification_type}}</p>
          <p>Fecha: {{current_date}} - Hora: {{current_time}}</p>
        `,
      },
      invoice: {
        id: 'template_invoice',
        name: 'Factura',
        subject: 'Factura #{{invoice_number}} - {{app_name}}',
        content: `
          <h2>Factura #{{invoice_number}}</h2>
          <p>Hola {{to_name}},</p>
          <p>Adjunto encontrarás la factura por un monto de ${{invoice_amount}}.</p>
          <p>Fecha de emisión: {{invoice_date}}</p>
          <p>Fecha de vencimiento: {{invoice_due_date}}</p>
          <p>Items: {{invoice_items}}</p>
        `,
      },
      report: {
        id: 'template_report',
        name: 'Reporte',
        subject: '{{report_title}} - {{app_name}}',
        content: `
          <h2>{{report_title}}</h2>
          <p>Hola {{to_name}},</p>
          <p>Período: {{report_period}}</p>
          <p>Resumen: {{report_summary}}</p>
          <p>Ver reporte completo: <a href="{{report_url}}">{{report_url}}</a></p>
          <p>Fecha: {{current_date}}</p>
        `,
      },
      alert: {
        id: 'template_alert',
        name: 'Alerta del Sistema',
        subject: 'ALERTA: {{alert_title}} - {{app_name}}',
        content: `
          <h2 style="color: red;">🚨 ALERTA DEL SISTEMA</h2>
          <p>Hola {{to_name}},</p>
          <p><strong>{{alert_title}}</strong></p>
          <p>{{alert_message}}</p>
          <p>Nivel: {{alert_level}}</p>
          <p>Timestamp: {{alert_timestamp}}</p>
        `,
      },
    };
    
    return defaultTemplates;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.axyraEmailJS = new AxyraEmailJSSystem();
});

window.AxyraEmailJSSystem = AxyraEmailJSSystem;