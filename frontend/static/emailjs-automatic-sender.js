/**
 * AXYRA - Envío Automático de Correos
 * Sistema completo para envío automático de correos electrónicos
 */

class AxyraAutomaticEmailSender {
  constructor() {
    this.serviceId = 'service_dvqt6fd';
    this.userId = '1heyO_r8WJOhBOBYs';
    this.templates = {
      loginCode: 'template_login_code',
      paymentSummary: 'template_payment_summary',
    };

    this.init();
  }

  init() {
    // Cargar EmailJS SDK si no está disponible
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
  // ENVÍO AUTOMÁTICO DE CÓDIGO DE LOGIN
  // ========================================
  async sendLoginCode(email, userName = null) {
    try {
      console.log('📧 Enviando código de login a:', email);

      // Generar código de 6 dígitos
      const loginCode = this.generateLoginCode();

      // Guardar código temporalmente (10 minutos)
      this.saveLoginCode(email, loginCode);

      const templateParams = {
        to_name: userName || email.split('@')[0],
        to_email: email,
        login_code: loginCode,
        code_expires: '10 minutos',
        login_url: window.location.origin + '/login.html',
        support_email: 'soporte@axyra.com',
        company_name: 'AXYRA',
        current_year: new Date().getFullYear(),
      };

      const response = await emailjs.send(this.serviceId, this.templates.loginCode, templateParams);

      console.log('✅ Código de login enviado:', response);
      return {
        success: true,
        message: 'Código enviado correctamente',
        code: loginCode, // Para desarrollo - quitar en producción
      };
    } catch (error) {
      console.error('❌ Error enviando código de login:', error);
      return {
        success: false,
        message: 'Error enviando código de login',
        error: error.message,
      };
    }
  }

  // ========================================
  // ENVÍO AUTOMÁTICO DE CONFIRMACIÓN DE PAGO
  // ========================================
  async sendPaymentConfirmation(email, paymentData) {
    try {
      console.log('📧 Enviando confirmación de pago a:', email);

      const templateParams = {
        to_name: paymentData.userName || email.split('@')[0],
        to_email: email,
        plan_name: paymentData.planName || 'Plan Básico',
        plan_duration: paymentData.planDuration || '1 mes',
        payment_amount: this.formatCurrency(paymentData.amount),
        payment_method: paymentData.method || 'Wompi',
        payment_date: new Date().toLocaleDateString('es-CO'),
        transaction_id: paymentData.transactionId || this.generateTransactionId(),
        next_payment: this.calculateNextPayment(),
        login_url: window.location.origin + '/index.html',
        support_email: 'soporte@axyra.com',
        company_name: 'AXYRA',
        current_year: new Date().getFullYear(),
      };

      const response = await emailjs.send(this.serviceId, this.templates.paymentSummary, templateParams);

      console.log('✅ Confirmación de pago enviada:', response);
      return {
        success: true,
        message: 'Confirmación de pago enviada correctamente',
      };
    } catch (error) {
      console.error('❌ Error enviando confirmación de pago:', error);
      return {
        success: false,
        message: 'Error enviando confirmación de pago',
        error: error.message,
      };
    }
  }

  // ========================================
  // VERIFICACIÓN DE CÓDIGO DE LOGIN
  // ========================================
  verifyLoginCode(email, code) {
    try {
      const storedCode = this.getLoginCode(email);

      if (!storedCode) {
        return { valid: false, message: 'Código no encontrado' };
      }

      if (Date.now() > storedCode.expires) {
        this.removeLoginCode(email);
        return { valid: false, message: 'Código expirado' };
      }

      if (code !== storedCode.code) {
        return { valid: false, message: 'Código incorrecto' };
      }

      // Código válido - eliminar de almacenamiento
      this.removeLoginCode(email);
      return { valid: true, message: 'Código válido' };
    } catch (error) {
      console.error('❌ Error verificando código:', error);
      return { valid: false, message: 'Error verificando código' };
    }
  }

  // ========================================
  // FUNCIONES AUXILIARES
  // ========================================
  generateLoginCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  generateTransactionId() {
    return 'TXN_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  formatCurrency(amount) {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }

  calculateNextPayment() {
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    return nextMonth.toLocaleDateString('es-CO');
  }

  // ========================================
  // GESTIÓN DE CÓDIGOS TEMPORALES
  // ========================================
  saveLoginCode(email, code) {
    const codes = JSON.parse(localStorage.getItem('axyra_login_codes') || '{}');
    codes[email] = {
      code: code,
      timestamp: Date.now(),
      expires: Date.now() + 10 * 60 * 1000, // 10 minutos
    };
    localStorage.setItem('axyra_login_codes', JSON.stringify(codes));
  }

  getLoginCode(email) {
    const codes = JSON.parse(localStorage.getItem('axyra_login_codes') || '{}');
    return codes[email] || null;
  }

  removeLoginCode(email) {
    const codes = JSON.parse(localStorage.getItem('axyra_login_codes') || '{}');
    delete codes[email];
    localStorage.setItem('axyra_login_codes', JSON.stringify(codes));
  }

  // ========================================
  // FUNCIONES PÚBLICAS PARA USO DIRECTO
  // ========================================

  // Función para enviar código de login (llamar desde formulario)
  async sendLoginCodeToUser() {
    const email = document.getElementById('email')?.value;
    if (!email) {
      alert('Por favor ingresa un email');
      return;
    }

    const result = await this.sendLoginCode(email);

    if (result.success) {
      alert('Código enviado correctamente. Revisa tu email.');
      // Mostrar formulario de código
      this.showCodeForm(email);
    } else {
      alert('Error enviando código: ' + result.message);
    }
  }

  // Función para verificar código (llamar desde formulario)
  async verifyUserCode() {
    const email = document.getElementById('userEmail')?.value;
    const code = document.getElementById('loginCode')?.value;

    if (!email || !code) {
      alert('Por favor completa todos los campos');
      return;
    }

    const result = this.verifyLoginCode(email, code);

    if (result.valid) {
      alert('Código válido. Iniciando sesión...');
      // Redirigir al dashboard
      window.location.href = '/index.html';
    } else {
      alert('Error: ' + result.message);
    }
  }

  // Función para simular pago y enviar confirmación
  async simulatePayment(email, amount = 29000, planName = 'Plan Básico') {
    const paymentData = {
      userName: email.split('@')[0],
      planName: planName,
      planDuration: '1 mes',
      amount: amount,
      method: 'Wompi',
      transactionId: this.generateTransactionId(),
    };

    const result = await this.sendPaymentConfirmation(email, paymentData);

    if (result.success) {
      alert('Confirmación de pago enviada correctamente');
    } else {
      alert('Error enviando confirmación: ' + result.message);
    }
  }

  // Mostrar formulario de código
  showCodeForm(email) {
    const loginForm = document.getElementById('loginForm');
    const codeForm = document.getElementById('codeForm');

    if (loginForm) loginForm.style.display = 'none';
    if (codeForm) {
      codeForm.style.display = 'block';
      document.getElementById('userEmail').value = email;
    }
  }

  // Mostrar formulario de login
  showLoginForm() {
    const loginForm = document.getElementById('loginForm');
    const codeForm = document.getElementById('codeForm');

    if (loginForm) loginForm.style.display = 'block';
    if (codeForm) codeForm.style.display = 'none';
  }
}

// ========================================
// INICIALIZACIÓN Y FUNCIONES GLOBALES
// ========================================

// Inicializar el sistema
let axyraEmailSender;

document.addEventListener('DOMContentLoaded', () => {
  axyraEmailSender = new AxyraAutomaticEmailSender();
  console.log('✅ Sistema de envío automático de correos inicializado');
});

// Funciones globales para usar desde HTML
window.sendLoginCode = () => axyraEmailSender?.sendLoginCodeToUser();
window.verifyCode = () => axyraEmailSender?.verifyUserCode();
window.showLoginForm = () => axyraEmailSender?.showLoginForm();
window.simulatePayment = (email, amount, plan) => axyraEmailSender?.simulatePayment(email, amount, plan);

// Exportar para uso global
window.AxyraAutomaticEmailSender = AxyraAutomaticEmailSender;
