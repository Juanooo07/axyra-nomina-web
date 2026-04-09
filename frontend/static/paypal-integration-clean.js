// ========================================
// SISTEMA DE INTEGRACIÓN PAYPAL LIMPIO - AXYRA
// ========================================
// Sistema optimizado sin logs excesivos

class AxyraPayPalIntegrationClean {
  constructor() {
    this.config = {
      clientId: 'AfphhCNx415bpleyT1g5iPIN9IQLCGFGq4a21YpqZHO7zw',
      currency: 'USD',
      locale: 'es_ES',
      environment: 'sandbox',
    };

    this.isLoaded = false;
    this.isProcessing = false;
    this.currentOrder = null;

    this.setupErrorHandling();
    this.init();
  }

  setupErrorHandling() {
    // Capturar errores de extensiones silenciosamente
    window.addEventListener('error', (event) => {
      if (event.message && event.message.includes('Cannot determine language')) {
        event.preventDefault();
        event.stopPropagation();
        return false;
      }
    });

    window.addEventListener('unhandledrejection', (event) => {
      if (event.reason && event.reason.message && event.reason.message.includes('Cannot determine language')) {
        event.preventDefault();
        return false;
      }
    });
  }

  async init() {
    try {
      if (localStorage.getItem('paypal-disabled') === 'true') {
        this.setupEventListeners();
        this.createPaymentUI();
        return;
      }

      if (window.paypal) {
        this.isLoaded = true;
      } else {
        await this.loadPayPalSDK();
      }
      this.setupEventListeners();
      this.createPaymentUI();
    } catch (error) {
      // Desactivar PayPal silenciosamente después de errores
      const errorCount = parseInt(localStorage.getItem('paypal-error-count') || '0') + 1;
      localStorage.setItem('paypal-error-count', errorCount.toString());
      
      if (errorCount >= 3) {
        localStorage.setItem('paypal-disabled', 'true');
      }
    }
  }

  async loadPayPalSDK() {
    return new Promise((resolve) => {
      if (this.isLoaded) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = `https://www.sandbox.paypal.com/sdk/js?client-id=${this.config.clientId}`;
      script.async = true;
      script.defer = true;

      script.onload = () => {
        this.isLoaded = true;
        resolve();
      };

      script.onerror = () => {
        // Fallback silencioso
        setTimeout(() => {
          const fallbackScript = document.createElement('script');
          fallbackScript.src = `https://www.paypal.com/sdk/js?client-id=${this.config.clientId}`;
          fallbackScript.async = true;
          fallbackScript.defer = true;
        
          fallbackScript.onload = () => {
            this.isLoaded = true;
            resolve();
          };
          
          fallbackScript.onerror = () => {
            // PayPal desactivado silenciosamente
            this.isLoaded = false;
            resolve();
          };
          
          document.head.appendChild(fallbackScript);
        }, 1000);
      };

      document.head.appendChild(script);
    });
  }

  setupEventListeners() {
    document.addEventListener('click', (e) => {
      if (e.target.matches('[data-paypal-payment]')) {
        e.preventDefault();
        this.handlePaymentClick(e.target);
      }
    });

    window.addEventListener('plan-updated', (event) => {
      // Manejar actualización de plan silenciosamente
    });
  }

  async handlePaymentClick(button) {
    if (this.isProcessing) return;

    try {
      this.isProcessing = true;
      
      const amount = parseFloat(button.dataset.amount);
      const description = button.dataset.description;
      const planType = button.dataset.planType;
      const userId = button.dataset.userId;

      if (!amount || !description || !planType || !userId) {
        throw new Error('Datos de pago incompletos');
      }

      await this.createPayPalOrder({
        amount: amount,
        currency: this.config.currency,
        description: description,
        planType: planType,
        userId: userId
      });

    } catch (error) {
      this.showError('Error procesando el pago');
    } finally {
      this.isProcessing = false;
    }
  }

  async createPayPalOrder(paymentData) {
    try {
      const orderData = {
        intent: 'CAPTURE',
        purchase_units: [{
          amount: {
            currency_code: paymentData.currency,
            value: paymentData.amount.toString()
          },
          description: paymentData.description
        }],
        application_context: {
          brand_name: 'AXYRA',
          landing_page: 'NO_PREFERENCE',
          user_action: 'PAY_NOW',
          return_url: `${window.location.origin}/modulos/dashboard/dashboard.html?payment=success`,
          cancel_url: `${window.location.origin}/modulos/dashboard/dashboard.html?payment=cancelled`
        }
      };

      const response = await fetch('/api/processPayPalPayment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...orderData,
          planType: paymentData.planType,
          userId: paymentData.userId
        })
      });

      if (!response.ok) {
        throw new Error('Error creando orden de pago');
      }

      const result = await response.json();
      
      if (result.success && result.orderId) {
        this.currentOrder = result.orderId;
        this.approvePayPalOrder(result.orderId);
      } else {
        throw new Error('Error en la respuesta del servidor');
      }

    } catch (error) {
      throw error;
    }
  }

  async approvePayPalOrder(orderId) {
    try {
      if (!window.paypal || !this.isLoaded) {
        throw new Error('PayPal SDK no disponible');
      }

      const actions = await window.paypal.Buttons({
        createOrder: () => orderId,
        onApprove: async (data) => {
          try {
            await this.capturePayPalOrder(data.orderID);
          } catch (error) {
            this.showError('Error procesando el pago');
          }
        },
        onError: (error) => {
          this.showError('Error en el proceso de pago');
        },
        onCancel: () => {
          // Pago cancelado silenciosamente
        }
      });

      // Renderizar botón de PayPal
      const container = document.querySelector('.paypal-button-container');
      if (container) {
        actions.render(container);
      }

    } catch (error) {
      this.showError('Error inicializando PayPal');
    }
  }

  async capturePayPalOrder(orderId) {
    try {
      const response = await fetch('/api/processPayPalPayment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'capture',
          orderId: orderId
        })
      });

      if (!response.ok) {
        throw new Error('Error capturando pago');
      }

      const result = await response.json();
      
      if (result.success) {
        // Emitir evento de actualización de plan
        window.dispatchEvent(new CustomEvent('plan-updated', {
          detail: {
            plan: result.plan,
            status: 'active',
            hasAccess: true,
            orderId: orderId
          }
        }));

        this.showSuccess('¡Pago exitoso! Tu plan ha sido actualizado');
      } else {
        throw new Error('Error procesando el pago');
      }

    } catch (error) {
      throw error;
    }
  }

  createPaymentUI() {
    // UI básica sin logs excesivos
  }

  createPayPalPaymentButton(planType, amount, description, userId) {
    const button = document.createElement('button');
    button.className = 'btn btn-paypal';
    button.dataset.paypalPayment = 'true';
    button.dataset.amount = amount;
    button.dataset.description = description;
    button.dataset.planType = planType;
    button.dataset.userId = userId;

    button.innerHTML = `
      <i class="fab fa-paypal"></i>
      Pagar $${amount.toLocaleString()} USD
    `;

    return button;
  }

  showSuccess(message) {
    alert('✅ ' + message);
  }

  showError(message) {
    alert('❌ ' + message);
  }
}

// ========================================
// INICIALIZACIÓN AUTOMÁTICA
// ========================================
document.addEventListener('DOMContentLoaded', () => {
  window.axyraPayPalIntegration = new AxyraPayPalIntegrationClean();
});

// ========================================
// FUNCIONES GLOBALES
// ========================================
function createPayPalPaymentButton(planType, amount, description, userId) {
  if (window.axyraPayPalIntegration) {
    return window.axyraPayPalIntegration.createPayPalPaymentButton(planType, amount, description, userId);
  }
  return null;
}

// ========================================
// EXPORTACIONES
// ========================================
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { AxyraPayPalIntegrationClean, createPayPalPaymentButton };
}
