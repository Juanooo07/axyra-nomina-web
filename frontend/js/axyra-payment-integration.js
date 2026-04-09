// ========================================
// AXYRA PAYMENT INTEGRATION SYSTEM
// Sistema de integración de pagos
// ========================================

class AxyraPaymentIntegrationSystem {
  constructor() {
    this.paymentProviders = new Map();
    this.paymentMethods = new Map();
    this.paymentSettings = {
      enableWompi: true,
      enablePayPal: true,
      enableStripe: false,
      enableBankTransfer: true,
      enableCash: true,
      defaultCurrency: 'COP',
      supportedCurrencies: ['COP', 'USD', 'EUR'],
      webhookUrl: '/api/payments/webhook',
      retryAttempts: 3,
      timeout: 30000,
    };

    this.paymentMetrics = {
      totalTransactions: 0,
      successfulTransactions: 0,
      failedTransactions: 0,
      pendingTransactions: 0,
      totalAmount: 0,
      averageTransactionTime: 0,
    };

    this.init();
  }

  async init() {
    console.log('💳 Inicializando Sistema de Integración de Pagos AXYRA...');

    try {
      await this.loadPaymentSettings();
      this.setupPaymentProviders();
      this.setupPaymentMethods();
      this.setupPaymentWebhooks();
      this.setupPaymentMonitoring();
      this.setupPaymentRetry();
      console.log('✅ Sistema de Integración de Pagos AXYRA inicializado');
    } catch (error) {
      console.error('❌ Error inicializando sistema de pagos:', error);
    }
  }

  async loadPaymentSettings() {
    try {
      const settings = localStorage.getItem('axyra_payment_settings');
      if (settings) {
        const parsedSettings = JSON.parse(settings);
        this.paymentSettings = { ...this.paymentSettings, ...parsedSettings };
      }

      const metrics = localStorage.getItem('axyra_payment_metrics');
      if (metrics) {
        this.paymentMetrics = { ...this.paymentMetrics, ...JSON.parse(metrics) };
      }
    } catch (error) {
      console.error('❌ Error cargando configuración de pagos:', error);
    }
  }

  setupPaymentProviders() {
    // Configurar proveedores de pago
    this.paymentProviders.set('wompi', {
      name: 'Wompi',
      enabled: this.paymentSettings.enableWompi,
      apiKey: this.paymentSettings.wompiApiKey,
      publicKey: this.paymentSettings.wompiPublicKey,
      environment: this.paymentSettings.wompiEnvironment || 'sandbox',
      webhookUrl: this.paymentSettings.webhookUrl + '/wompi',
      supportedMethods: ['credit_card', 'debit_card', 'pse', 'nequi', 'daviplata'],
    });

    this.paymentProviders.set('paypal', {
      name: 'PayPal',
      enabled: this.paymentSettings.enablePayPal,
      clientId: this.paymentSettings.paypalClientId,
      clientSecret: this.paymentSettings.paypalClientSecret,
      environment: this.paymentSettings.paypalEnvironment || 'sandbox',
      webhookUrl: this.paymentSettings.webhookUrl + '/paypal',
      supportedMethods: ['paypal', 'credit_card'],
    });

    this.paymentProviders.set('stripe', {
      name: 'Stripe',
      enabled: this.paymentSettings.enableStripe,
      publishableKey: this.paymentSettings.stripePublishableKey,
      secretKey: this.paymentSettings.stripeSecretKey,
      environment: this.paymentSettings.stripeEnvironment || 'test',
      webhookUrl: this.paymentSettings.webhookUrl + '/stripe',
      supportedMethods: ['credit_card', 'debit_card', 'bank_transfer'],
    });
  }

  setupPaymentMethods() {
    // Configurar métodos de pago
    this.paymentMethods.set('credit_card', {
      name: 'Tarjeta de Crédito',
      enabled: true,
      providers: ['wompi', 'paypal', 'stripe'],
      fees: { percentage: 3.5, fixed: 0 },
      processingTime: 'instant',
    });

    this.paymentMethods.set('debit_card', {
      name: 'Tarjeta Débito',
      enabled: true,
      providers: ['wompi', 'stripe'],
      fees: { percentage: 2.5, fixed: 0 },
      processingTime: 'instant',
    });

    this.paymentMethods.set('pse', {
      name: 'PSE',
      enabled: true,
      providers: ['wompi'],
      fees: { percentage: 1.5, fixed: 0 },
      processingTime: 'instant',
    });

    this.paymentMethods.set('nequi', {
      name: 'Nequi',
      enabled: true,
      providers: ['wompi'],
      fees: { percentage: 1.0, fixed: 0 },
      processingTime: 'instant',
    });

    this.paymentMethods.set('daviplata', {
      name: 'Daviplata',
      enabled: true,
      providers: ['wompi'],
      fees: { percentage: 1.0, fixed: 0 },
      processingTime: 'instant',
    });

    this.paymentMethods.set('bank_transfer', {
      name: 'Transferencia Bancaria',
      enabled: this.paymentSettings.enableBankTransfer,
      providers: ['stripe'],
      fees: { percentage: 0, fixed: 0 },
      processingTime: '1-3 business days',
    });

    this.paymentMethods.set('cash', {
      name: 'Efectivo',
      enabled: this.paymentSettings.enableCash,
      providers: [],
      fees: { percentage: 0, fixed: 0 },
      processingTime: 'instant',
    });
  }

  setupPaymentWebhooks() {
    // Configurar webhooks de pago
    this.setupWompiWebhooks();
    this.setupPayPalWebhooks();
    this.setupStripeWebhooks();
  }

  setupWompiWebhooks() {
    if (!this.paymentSettings.enableWompi) return;

    // Configurar webhook de Wompi
    const wompiProvider = this.paymentProviders.get('wompi');
    if (wompiProvider && wompiProvider.enabled) {
      this.setupWompiScript();
    }
  }

  setupWompiScript() {
    // Cargar script de Wompi
    const script = document.createElement('script');
    script.src = 'https://checkout.wompi.co/widget.js';
    script.onload = () => {
      console.log('✅ Wompi script cargado');
      this.initializeWompi();
    };
    script.onerror = () => {
      console.error('❌ Error cargando script de Wompi');
    };
    document.head.appendChild(script);
  }

  initializeWompi() {
    if (typeof window.WompiWidget !== 'undefined') {
      window.WompiWidget.init({
        publicKey: this.paymentSettings.wompiPublicKey,
        environment: this.paymentSettings.wompiEnvironment || 'sandbox',
      });
      console.log('✅ Wompi inicializado');
    }
  }

  setupPayPalWebhooks() {
    if (!this.paymentSettings.enablePayPal) return;

    // Configurar webhook de PayPal
    const paypalProvider = this.paymentProviders.get('paypal');
    if (paypalProvider && paypalProvider.enabled) {
      this.setupPayPalScript();
    }
  }

  setupPayPalScript() {
    // Cargar script de PayPal
    const script = document.createElement('script');
    script.src = 'https://www.paypal.com/sdk/js?client-id=' + this.paymentSettings.paypalClientId;
    script.onload = () => {
      console.log('✅ PayPal script cargado');
      this.initializePayPal();
    };
    script.onerror = () => {
      console.error('❌ Error cargando script de PayPal');
    };
    document.head.appendChild(script);
  }

  initializePayPal() {
    if (typeof window.paypal !== 'undefined') {
      console.log('✅ PayPal inicializado');
    }
  }

  setupStripeWebhooks() {
    if (!this.paymentSettings.enableStripe) return;

    // Configurar webhook de Stripe
    const stripeProvider = this.paymentProviders.get('stripe');
    if (stripeProvider && stripeProvider.enabled) {
      this.setupStripeScript();
    }
  }

  setupStripeScript() {
    // Cargar script de Stripe
    const script = document.createElement('script');
    script.src = 'https://js.stripe.com/v3/';
    script.onload = () => {
      console.log('✅ Stripe script cargado');
      this.initializeStripe();
    };
    script.onerror = () => {
      console.error('❌ Error cargando script de Stripe');
    };
    document.head.appendChild(script);
  }

  initializeStripe() {
    if (typeof window.Stripe !== 'undefined') {
      window.stripe = window.Stripe(this.paymentSettings.stripePublishableKey);
      console.log('✅ Stripe inicializado');
    }
  }

  setupPaymentMonitoring() {
    // Monitorear transacciones
    this.monitorPaymentStatus();
    this.monitorPaymentErrors();
    this.monitorPaymentPerformance();
  }

  monitorPaymentStatus() {
    // Monitorear estado de pagos
    setInterval(() => {
      this.checkPendingPayments();
    }, 60 * 1000); // Cada minuto
  }

  monitorPaymentErrors() {
    // Monitorear errores de pago
    this.paymentErrorCount = 0;
    this.paymentErrorThreshold = 5;
  }

  monitorPaymentPerformance() {
    // Monitorear rendimiento de pagos
    this.paymentPerformanceMetrics = {
      averageResponseTime: 0,
      successRate: 0,
      errorRate: 0,
    };
  }

  setupPaymentRetry() {
    // Configurar reintentos de pago
    this.paymentRetryQueue = [];
    this.processPaymentRetryQueue();
  }

  processPaymentRetryQueue() {
    setInterval(() => {
      if (this.paymentRetryQueue.length > 0) {
        const payment = this.paymentRetryQueue.shift();
        this.retryPayment(payment);
      }
    }, 30 * 1000); // Cada 30 segundos
  }

  // Métodos de procesamiento de pagos
  async processPayment(paymentData) {
    try {
      const startTime = performance.now();

      // Validar datos de pago
      this.validatePaymentData(paymentData);

      // Seleccionar proveedor
      const provider = this.selectPaymentProvider(paymentData);

      // Procesar pago
      const result = await this.executePayment(provider, paymentData);

      const endTime = performance.now();
      const processingTime = endTime - startTime;

      // Actualizar métricas
      this.updatePaymentMetrics(result, processingTime);

      // Registrar transacción
      this.logPaymentTransaction(paymentData, result);

      return result;
    } catch (error) {
      console.error('❌ Error procesando pago:', error);
      this.handlePaymentError(paymentData, error);
      throw error;
    }
  }

  validatePaymentData(paymentData) {
    const requiredFields = ['amount', 'currency', 'method', 'description'];

    for (const field of requiredFields) {
      if (!paymentData[field]) {
        throw new Error(`Campo requerido faltante: ${field}`);
      }
    }

    if (paymentData.amount <= 0) {
      throw new Error('El monto debe ser mayor a 0');
    }

    if (!this.paymentSettings.supportedCurrencies.includes(paymentData.currency)) {
      throw new Error(`Moneda no soportada: ${paymentData.currency}`);
    }
  }

  selectPaymentProvider(paymentData) {
    const method = this.paymentMethods.get(paymentData.method);
    if (!method) {
      throw new Error(`Método de pago no soportado: ${paymentData.method}`);
    }

    const availableProviders = method.providers.filter((providerId) => {
      const provider = this.paymentProviders.get(providerId);
      return provider && provider.enabled;
    });

    if (availableProviders.length === 0) {
      throw new Error('No hay proveedores disponibles para este método de pago');
    }

    // Seleccionar el primer proveedor disponible
    return this.paymentProviders.get(availableProviders[0]);
  }

  async executePayment(provider, paymentData) {
    switch (provider.name.toLowerCase()) {
      case 'wompi':
        return await this.processWompiPayment(paymentData);
      case 'paypal':
        return await this.processPayPalPayment(paymentData);
      case 'stripe':
        return await this.processStripePayment(paymentData);
      default:
        throw new Error(`Proveedor no soportado: ${provider.name}`);
    }
  }

  async processWompiPayment(paymentData) {
    try {
      if (typeof window.WompiWidget === 'undefined') {
        throw new Error('Wompi no está inicializado');
      }

      const wompiData = {
        publicKey: this.paymentSettings.wompiPublicKey,
        currency: paymentData.currency,
        amountInCents: Math.round(paymentData.amount * 100),
        reference: paymentData.reference || this.generatePaymentReference(),
        customerEmail: paymentData.customerEmail,
        customerFullName: paymentData.customerFullName,
        customerMobile: paymentData.customerMobile,
        description: paymentData.description,
      };

      const result = await window.WompiWidget.createPayment(wompiData);

      return {
        success: true,
        provider: 'wompi',
        transactionId: result.transactionId,
        status: result.status,
        amount: paymentData.amount,
        currency: paymentData.currency,
        reference: wompiData.reference,
      };
    } catch (error) {
      console.error('❌ Error procesando pago con Wompi:', error);
      throw error;
    }
  }

  async processPayPalPayment(paymentData) {
    try {
      if (typeof window.paypal === 'undefined') {
        throw new Error('PayPal no está inicializado');
      }

      const paypalData = {
        amount: {
          currency_code: paymentData.currency,
          value: paymentData.amount.toString(),
        },
        description: paymentData.description,
      };

      const result = await window.paypal.Buttons({
        createOrder: (data, actions) => {
          return actions.order.create({
            purchase_units: [paypalData],
          });
        },
        onApprove: (data, actions) => {
          return actions.order.capture().then((details) => {
            return {
              success: true,
              provider: 'paypal',
              transactionId: details.id,
              status: details.status,
              amount: paymentData.amount,
              currency: paymentData.currency,
              reference: data.orderID,
            };
          });
        },
      });

      return result;
    } catch (error) {
      console.error('❌ Error procesando pago con PayPal:', error);
      throw error;
    }
  }

  async processStripePayment(paymentData) {
    try {
      if (typeof window.stripe === 'undefined') {
        throw new Error('Stripe no está inicializado');
      }

      const stripeData = {
        amount: Math.round(paymentData.amount * 100),
        currency: paymentData.currency,
        description: paymentData.description,
      };

      const result = await window.stripe.createPaymentMethod({
        type: 'card',
        card: paymentData.card,
      });

      if (result.error) {
        throw new Error(result.error.message);
      }

      const paymentIntent = await window.stripe.confirmCardPayment(paymentData.clientSecret, {
        payment_method: result.paymentMethod.id,
      });

      if (paymentIntent.error) {
        throw new Error(paymentIntent.error.message);
      }

      return {
        success: true,
        provider: 'stripe',
        transactionId: paymentIntent.paymentIntent.id,
        status: paymentIntent.paymentIntent.status,
        amount: paymentData.amount,
        currency: paymentData.currency,
        reference: paymentIntent.paymentIntent.id,
      };
    } catch (error) {
      console.error('❌ Error procesando pago con Stripe:', error);
      throw error;
    }
  }

  // Métodos de utilidad
  generatePaymentReference() {
    return 'PAY_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  updatePaymentMetrics(result, processingTime) {
    this.paymentMetrics.totalTransactions++;
    this.paymentMetrics.totalAmount += result.amount;

    if (result.success) {
      this.paymentMetrics.successfulTransactions++;
    } else {
      this.paymentMetrics.failedTransactions++;
    }

    this.paymentMetrics.averageTransactionTime = (this.paymentMetrics.averageTransactionTime + processingTime) / 2;

    this.savePaymentMetrics();
  }

  logPaymentTransaction(paymentData, result) {
    const transaction = {
      id: this.generatePaymentReference(),
      paymentData: paymentData,
      result: result,
      timestamp: Date.now(),
      userId: this.getCurrentUserId(),
    };

    this.savePaymentTransaction(transaction);
  }

  handlePaymentError(paymentData, error) {
    this.paymentMetrics.failedTransactions++;
    this.paymentErrorCount++;

    if (this.paymentErrorCount >= this.paymentErrorThreshold) {
      this.triggerPaymentErrorAlert(error);
    }

    // Agregar a cola de reintentos
    this.paymentRetryQueue.push({
      paymentData: paymentData,
      attempts: 0,
      maxAttempts: this.paymentSettings.retryAttempts,
    });
  }

  async retryPayment(payment) {
    if (payment.attempts >= payment.maxAttempts) {
      console.error('❌ Máximo de reintentos alcanzado para pago:', payment.paymentData);
      return;
    }

    payment.attempts++;

    try {
      await this.processPayment(payment.paymentData);
      console.log('✅ Pago reintentado exitosamente');
    } catch (error) {
      console.error('❌ Error en reintento de pago:', error);
      // Reagregar a la cola si no se ha alcanzado el máximo
      if (payment.attempts < payment.maxAttempts) {
        this.paymentRetryQueue.push(payment);
      }
    }
  }

  triggerPaymentErrorAlert(error) {
    if (window.axyraNotifications) {
      window.axyraNotifications.showError('Error de Pago', {
        message: `Error crítico en procesamiento de pagos: ${error.message}`,
        persistent: true,
      });
    }
  }

  // Métodos de verificación de pagos
  async verifyPayment(transactionId, provider) {
    try {
      switch (provider.toLowerCase()) {
        case 'wompi':
          return await this.verifyWompiPayment(transactionId);
        case 'paypal':
          return await this.verifyPayPalPayment(transactionId);
        case 'stripe':
          return await this.verifyStripePayment(transactionId);
        default:
          throw new Error(`Proveedor no soportado: ${provider}`);
      }
    } catch (error) {
      console.error('❌ Error verificando pago:', error);
      throw error;
    }
  }

  async verifyWompiPayment(transactionId) {
    // Implementar verificación de pago con Wompi
    const response = await fetch(`/api/payments/wompi/verify/${transactionId}`);
    const result = await response.json();
    return result;
  }

  async verifyPayPalPayment(transactionId) {
    // Implementar verificación de pago con PayPal
    const response = await fetch(`/api/payments/paypal/verify/${transactionId}`);
    const result = await response.json();
    return result;
  }

  async verifyStripePayment(transactionId) {
    // Implementar verificación de pago con Stripe
    const response = await fetch(`/api/payments/stripe/verify/${transactionId}`);
    const result = await response.json();
    return result;
  }

  // Métodos de reembolsos
  async processRefund(transactionId, amount, reason) {
    try {
      const transaction = await this.getPaymentTransaction(transactionId);
      if (!transaction) {
        throw new Error('Transacción no encontrada');
      }

      const refundData = {
        transactionId: transactionId,
        amount: amount,
        reason: reason,
        provider: transaction.result.provider,
      };

      switch (transaction.result.provider) {
        case 'wompi':
          return await this.processWompiRefund(refundData);
        case 'paypal':
          return await this.processPayPalRefund(refundData);
        case 'stripe':
          return await this.processStripeRefund(refundData);
        default:
          throw new Error(`Proveedor no soportado: ${transaction.result.provider}`);
      }
    } catch (error) {
      console.error('❌ Error procesando reembolso:', error);
      throw error;
    }
  }

  async processWompiRefund(refundData) {
    const response = await fetch('/api/payments/wompi/refund', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(refundData),
    });
    return await response.json();
  }

  async processPayPalRefund(refundData) {
    const response = await fetch('/api/payments/paypal/refund', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(refundData),
    });
    return await response.json();
  }

  async processStripeRefund(refundData) {
    const response = await fetch('/api/payments/stripe/refund', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(refundData),
    });
    return await response.json();
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

  async getPaymentTransaction(transactionId) {
    try {
      const response = await fetch(`/api/payments/transaction/${transactionId}`);
      return await response.json();
    } catch (error) {
      console.error('❌ Error obteniendo transacción:', error);
      return null;
    }
  }

  async checkPendingPayments() {
    try {
      const response = await fetch('/api/payments/pending');
      const pendingPayments = await response.json();

      for (const payment of pendingPayments) {
        await this.verifyPayment(payment.transactionId, payment.provider);
      }
    } catch (error) {
      console.error('❌ Error verificando pagos pendientes:', error);
    }
  }

  // Métodos de guardado
  savePaymentMetrics() {
    try {
      localStorage.setItem('axyra_payment_metrics', JSON.stringify(this.paymentMetrics));
    } catch (error) {
      console.error('❌ Error guardando métricas de pago:', error);
    }
  }

  savePaymentTransaction(transaction) {
    try {
      const transactions = JSON.parse(localStorage.getItem('axyra_payment_transactions') || '[]');
      transactions.push(transaction);

      // Mantener solo los últimos 1000 transacciones
      if (transactions.length > 1000) {
        transactions.splice(0, transactions.length - 1000);
      }

      localStorage.setItem('axyra_payment_transactions', JSON.stringify(transactions));
    } catch (error) {
      console.error('❌ Error guardando transacción:', error);
    }
  }

  // Métodos de exportación
  exportPaymentReport() {
    const data = {
      metrics: this.paymentMetrics,
      settings: this.paymentSettings,
      timestamp: new Date().toISOString(),
      device: this.getCurrentDeviceInfo(),
    };

    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });

    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `axyra_payment_report_${new Date().toISOString().split('T')[0]}.json`;
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
    this.paymentProviders.clear();
    this.paymentMethods.clear();
    this.paymentRetryQueue = [];
    this.paymentMetrics = {
      totalTransactions: 0,
      successfulTransactions: 0,
      failedTransactions: 0,
      pendingTransactions: 0,
      totalAmount: 0,
      averageTransactionTime: 0,
    };
  }
}

// Inicializar sistema de integración de pagos
document.addEventListener('DOMContentLoaded', function () {
  try {
    window.axyraPaymentIntegration = new AxyraPaymentIntegrationSystem();
    console.log('✅ Sistema de Integración de Pagos AXYRA cargado');
  } catch (error) {
    console.error('❌ Error cargando sistema de integración de pagos:', error);
  }
});

// Exportar para uso global
window.AxyraPaymentIntegrationSystem = AxyraPaymentIntegrationSystem;
