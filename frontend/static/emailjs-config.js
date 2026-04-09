/**
 * AXYRA - Configuración de EmailJS
 * Sistema de correos electrónicos para notificaciones automáticas
 */

class AxyraEmailService {
  constructor() {
    this.serviceId = 'service_dvqt6fd'; // Tu Service ID de EmailJS
    this.userId = '1heyO_r8WJOhBOBYs'; // Tu Public Key de EmailJS
    this.templates = {
      loginCode: 'template_axyra_login', // Template para códigos de login
      paymentSummary: 'template_axyra_payment', // Template para resúmenes de pago
      welcome: 'template_axyra_welcome', // Template para bienvenida
    };

    this.init();
  }

  init() {
    // Cargar EmailJS SDK
    if (typeof emailjs === 'undefined') {
      this.loadEmailJSSDK();
    } else {
      this.initializeEmailJS();
    }
  }

  loadEmailJSSDK() {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js';
    script.onload = () => {
      this.initializeEmailJS();
    };
    document.head.appendChild(script);
  }

  initializeEmailJS() {
    try {
      emailjs.init(this.userId);
      console.log('✅ EmailJS inicializado correctamente');
    } catch (error) {
      console.error('❌ Error inicializando EmailJS:', error);
    }
  }

  // ========================================
  // CORREO DE BIENVENIDA (USANDO TEMPLATE DE LOGIN)
  // ========================================
  async sendWelcomeEmail(userData) {
    try {
      // Usar el template de login para bienvenida (más simple)
      const templateParams = {
        to_name: userData.nombre || userData.email,
        to_email: userData.email,
        company_name: 'AXYRA',
        login_url: window.location.origin + '/login.html',
        support_email: 'soporte@axyra.com',
        current_year: new Date().getFullYear(),
      };

      // Usar template de login como fallback para bienvenida
      const response = await emailjs.send(this.serviceId, this.templates.loginCode, templateParams);

      console.log('✅ Correo de bienvenida enviado:', response);
      return { success: true, message: 'Correo de bienvenida enviado correctamente' };
    } catch (error) {
      console.error('❌ Error enviando correo de bienvenida:', error);
      return { success: false, message: 'Error enviando correo de bienvenida' };
    }
  }

  // ========================================
  // CORREO DE CÓDIGO DE INICIO DE SESIÓN
  // ========================================
  async sendLoginCodeEmail(userData, loginCode) {
    try {
      const templateParams = {
        to_name: userData.nombre || userData.email,
        to_email: userData.email,
        login_code: loginCode,
        company_name: 'AXYRA',
        login_url: window.location.origin + '/login.html',
        code_expires: '10 minutos',
        current_year: new Date().getFullYear(),
      };

      const response = await emailjs.send(this.serviceId, this.templates.loginCode, templateParams);

      console.log('✅ Código de inicio enviado:', response);
      return { success: true, message: 'Código de inicio enviado correctamente' };
    } catch (error) {
      console.error('❌ Error enviando código de inicio:', error);
      return { success: false, message: 'Error enviando código de inicio' };
    }
  }

  // ========================================
  // CORREO DE REINICIO DE CONTRASEÑA (USANDO TEMPLATE DE LOGIN)
  // ========================================
  async sendPasswordResetEmail(userData, resetToken) {
    try {
      const resetUrl = `${window.location.origin}/reset-password.html?token=${resetToken}`;

      // Usar template de login para reinicio (más simple)
      const templateParams = {
        to_name: userData.nombre || userData.email,
        to_email: userData.email,
        login_url: resetUrl, // Usar reset_url como login_url
        company_name: 'AXYRA',
        support_email: 'soporte@axyra.com',
        current_year: new Date().getFullYear(),
      };

      // Usar template de login como fallback para reinicio
      const response = await emailjs.send(this.serviceId, this.templates.loginCode, templateParams);

      console.log('✅ Correo de reinicio enviado:', response);
      return { success: true, message: 'Correo de reinicio enviado correctamente' };
    } catch (error) {
      console.error('❌ Error enviando correo de reinicio:', error);
      return { success: false, message: 'Error enviando correo de reinicio' };
    }
  }

  // ========================================
  // CORREO DE RESUMEN DE PAGOS
  // ========================================
  async sendPaymentSummaryEmail(userData, paymentData) {
    try {
      const templateParams = {
        to_name: userData.nombre || userData.email,
        to_email: userData.email,
        company_name: 'AXYRA',
        payment_date: new Date().toLocaleDateString('es-CO'),
        payment_amount: this.formatCurrency(paymentData.amount),
        payment_method: paymentData.method || 'Wompi',
        transaction_id: paymentData.transactionId || 'N/A',
        plan_name: paymentData.planName || 'Plan Básico',
        plan_duration: paymentData.duration || '1 mes',
        next_payment: paymentData.nextPayment || 'N/A',
        support_email: 'soporte@axyra.com',
        current_year: new Date().getFullYear(),
      };

      const response = await emailjs.send(this.serviceId, this.templates.paymentSummary, templateParams);

      console.log('✅ Resumen de pago enviado:', response);
      return { success: true, message: 'Resumen de pago enviado correctamente' };
    } catch (error) {
      console.error('❌ Error enviando resumen de pago:', error);
      return { success: false, message: 'Error enviando resumen de pago' };
    }
  }

  // ========================================
  // CORREO DE NOTIFICACIÓN DE NÓMINA (USANDO TEMPLATE DE PAGOS)
  // ========================================
  async sendPayrollNotificationEmail(employeeData, payrollData) {
    try {
      // Usar template de pagos para nómina (más simple)
      const templateParams = {
        to_name: employeeData.nombre,
        to_email: employeeData.email,
        company_name: 'AXYRA',
        plan_name: `Nómina - ${payrollData.period}`,
        plan_duration: '1 período',
        payment_amount: this.formatCurrency(payrollData.netSalary),
        payment_method: 'Transferencia bancaria',
        payment_date: payrollData.paymentDate,
        transaction_id: `NOMINA_${Date.now()}`,
        next_payment: 'Próximo período',
        support_email: 'rrhh@axyra.com',
        current_year: new Date().getFullYear(),
      };

      // Usar template de pagos como fallback para nómina
      const response = await emailjs.send(this.serviceId, this.templates.paymentSummary, templateParams);

      console.log('✅ Notificación de nómina enviada:', response);
      return { success: true, message: 'Notificación de nómina enviada correctamente' };
    } catch (error) {
      console.error('❌ Error enviando notificación de nómina:', error);
      return { success: false, message: 'Error enviando notificación de nómina' };
    }
  }

  // ========================================
  // FUNCIONES AUXILIARES
  // ========================================
  formatCurrency(amount) {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }

  generateLoginCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  generateResetToken() {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  // ========================================
  // VALIDACIÓN DE EMAIL
  // ========================================
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}

// Inicializar servicio de correos
document.addEventListener('DOMContentLoaded', () => {
  window.axyraEmailService = new AxyraEmailService();
  console.log('✅ Servicio de correos AXYRA inicializado');
});

// Exportar para uso global
window.AxyraEmailService = AxyraEmailService;
