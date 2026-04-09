// ========================================
// SISTEMA DE INTEGRACIÓN PAYPAL - AXYRA
// ========================================
// Sistema completo para integración de pagos con PayPal

class AxyraPayPalIntegration {
  constructor() {
    this.config = {
      clientId: 'AfphhCNx415bpleyT1g5iPIN9IQLCGFGq4a21YpqZHO7zw', // Credenciales reales de PayPal
      currency: 'USD',
      locale: 'es_ES',
      environment: 'sandbox', // 'sandbox' para pruebas, 'production' para producción
    };

    this.isLoaded = false;
    this.isProcessing = false;
    this.currentOrder = null;

    // Capturar errores de extensiones del navegador
    this.setupErrorHandling();
    this.init();
  }

  /**
   * Configura el manejo de errores para evitar conflictos con extensiones
   */
  setupErrorHandling() {
    // Capturar errores de content scripts
    window.addEventListener('error', (event) => {
      if (event.message && event.message.includes('Cannot determine language')) {
        console.warn('⚠️ Error de extensión del navegador ignorado:', event.message);
        event.preventDefault();
        event.stopPropagation();
        return false;
      }
    });

    // Capturar errores no manejados
    window.addEventListener('unhandledrejection', (event) => {
      if (event.reason && event.reason.message && event.reason.message.includes('Cannot determine language')) {
        console.warn('⚠️ Promise rejection de extensión ignorada:', event.reason.message);
        event.preventDefault();
        return false;
      }
    });
  }

  /**
   * Inicializa el sistema de PayPal
   */
  async init() {
    try {
      // Verificar si PayPal está desactivado temporalmente
      if (localStorage.getItem('paypal-disabled') === 'true') {
        console.log('⚠️ PayPal desactivado temporalmente');
        this.setupEventListeners();
        this.createPaymentUI();
        return;
      }

      // Verificar si ya existe PayPal en el contexto global
      if (window.paypal) {
        this.isLoaded = true;
        console.log('✅ PayPal SDK ya está disponible');
      } else {
        await this.loadPayPalSDK();
      }
      this.setupEventListeners();
      this.createPaymentUI();
      console.log('✅ Sistema PayPal inicializado correctamente');
    } catch (error) {
      console.error('❌ Error inicializando PayPal:', error);
      // Desactivar PayPal temporalmente después de 3 errores
      const errorCount = parseInt(localStorage.getItem('paypal-error-count') || '0') + 1;
      localStorage.setItem('paypal-error-count', errorCount.toString());
      
      if (errorCount >= 3) {
        localStorage.setItem('paypal-disabled', 'true');
        console.log('⚠️ PayPal desactivado después de múltiples errores');
      }
      
      // No mostrar error al usuario si es un problema de extensión
      if (!error.message.includes('Cannot determine language')) {
        this.showError('Error inicializando el sistema de pagos');
      }
    }
  }

  /**
   * Carga el SDK de PayPal dinámicamente
   */
  async loadPayPalSDK() {
    return new Promise((resolve, reject) => {
      if (this.isLoaded) {
        resolve();
        return;
      }

      // Cargar PayPal SDK silenciosamente
      const script = document.createElement('script');
      script.src = `https://www.sandbox.paypal.com/sdk/js?client-id=${this.config.clientId}`;
      script.async = true;
      script.defer = true;

      script.onload = () => {
        this.isLoaded = true;
        resolve();
      };

      script.onerror = (error) => {
        // Fallback silencioso
        setTimeout(() => {
          const fallbackScript = document.createElement('script');
          fallbackScript.src = `https://www.paypal.com/sdk/js?client-id=${this.config.clientId}`;
          fallbackScript.async = true;
          fallbackScript.defer = true;
        
        fallbackScript.onload = () => {
          this.isLoaded = true;
          console.log('✅ PayPal SDK cargado con fallback');
          resolve();
        };
        
        fallbackScript.onerror = (fallbackError) => {
          console.warn('⚠️ Fallback también falló, intentando sin parámetros...', fallbackError);
          // Último intento: con intent capture
          const lastScript = document.createElement('script');
          lastScript.src = `https://www.sandbox.paypal.com/sdk/js?client-id=${this.config.clientId}&intent=capture`;
          lastScript.async = true;
          lastScript.defer = true;
          
          lastScript.onload = () => {
            this.isLoaded = true;
            console.log('✅ PayPal SDK cargado con último intento');
            resolve();
          };
          
          lastScript.onerror = () => {
            reject(new Error('Error cargando PayPal SDK - Todos los intentos fallaron'));
          };
          
          document.head.appendChild(lastScript);
        };
        
        document.head.appendChild(fallbackScript);
        }, 1000); // Esperar 1 segundo antes del fallback
      };

      document.head.appendChild(script);
    });
  }

  /**
   * Configura los event listeners
   */
  setupEventListeners() {
    // Event listeners para botones de pago
    document.addEventListener('click', (e) => {
      if (e.target.matches('[data-paypal-payment]')) {
        e.preventDefault();
        this.handlePaymentClick(e.target);
      }

      if (e.target.matches('[data-paypal-subscription]')) {
        e.preventDefault();
        this.handleSubscriptionClick(e.target);
      }
    });

    // Event listeners para webhooks (simulados)
    window.addEventListener('message', (e) => {
      if (e.data.type === 'PAYPAL_PAYMENT_SUCCESS') {
        this.handlePaymentSuccess(e.data);
      }
    });
  }

  /**
   * Crea la interfaz de usuario para pagos
   */
  createPaymentUI() {
    // Crear contenedor principal
    const container = document.createElement('div');
    container.id = 'paypal-payment-container';
    container.className = 'paypal-payment-container';
    container.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.8);
      display: none;
      justify-content: center;
      align-items: center;
      z-index: 10000;
    `;

    // Crear modal de pago
    const modal = document.createElement('div');
    modal.className = 'paypal-payment-modal';
    modal.style.cssText = `
      background: white;
      border-radius: 12px;
      padding: 30px;
      max-width: 500px;
      width: 90%;
      max-height: 80vh;
      overflow-y: auto;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    `;

    modal.innerHTML = `
      <div class="paypal-header" style="text-align: center; margin-bottom: 20px;">
        <h3 style="margin: 0; color: #333; font-size: 24px;">💳 Procesar Pago</h3>
        <p style="margin: 10px 0 0 0; color: #666;">Selecciona tu método de pago preferido</p>
      </div>
      
      <div class="paypal-content">
        <div id="paypal-button-container" style="margin-bottom: 20px;"></div>
        
        <div class="payment-details" style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
          <h4 style="margin: 0 0 10px 0; color: #333;">Detalles del Pago</h4>
          <div id="payment-summary"></div>
        </div>
        
        <div class="payment-actions" style="display: flex; gap: 10px; justify-content: center;">
          <button id="cancel-payment" class="btn btn-secondary" style="padding: 10px 20px; border: none; border-radius: 6px; background: #6c757d; color: white; cursor: pointer;">
            Cancelar
          </button>
        </div>
      </div>
    `;

    container.appendChild(modal);
    document.body.appendChild(container);

    // Event listeners para el modal
    document.getElementById('cancel-payment').addEventListener('click', () => {
      this.hidePaymentModal();
    });

    container.addEventListener('click', (e) => {
      if (e.target === container) {
        this.hidePaymentModal();
      }
    });
  }

  /**
   * Maneja el clic en botones de pago
   */
  async handlePaymentClick(button) {
    if (this.isProcessing) {
      this.showError('Ya hay un pago en proceso');
      return;
    }

    try {
      const paymentData = this.extractPaymentData(button);
      await this.showPaymentModal(paymentData);
    } catch (error) {
      console.error('Error procesando pago:', error);
      this.showError('Error procesando el pago');
    }
  }

  /**
   * Extrae los datos del pago del botón
   */
  extractPaymentData(button) {
    return {
      amount: parseFloat(button.dataset.amount) || 0,
      description: button.dataset.description || 'Pago AXYRA',
      orderId: button.dataset.orderId || this.generateOrderId(),
      currency: button.dataset.currency || 'COP',
      items: JSON.parse(button.dataset.items || '[]'),
    };
  }

  /**
   * Muestra el modal de pago
   */
  async showPaymentModal(paymentData) {
    this.currentOrder = paymentData;
    this.isProcessing = true;

    // Mostrar modal
    const container = document.getElementById('paypal-payment-container');
    container.style.display = 'flex';

    // Actualizar detalles del pago
    this.updatePaymentSummary(paymentData);

    // Renderizar botón de PayPal
    await this.renderPayPalButton(paymentData);

    // Mostrar loading
    this.showLoading('Inicializando PayPal...');
  }

  /**
   * Actualiza el resumen del pago
   */
  updatePaymentSummary(paymentData) {
    const summary = document.getElementById('payment-summary');
    summary.innerHTML = `
      <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
        <span>Descripción:</span>
        <span>${paymentData.description}</span>
      </div>
      <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
        <span>Moneda:</span>
        <span>${paymentData.currency}</span>
      </div>
      <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 18px; color: #0070ba; border-top: 1px solid #ddd; padding-top: 10px;">
        <span>Total:</span>
        <span>$${paymentData.amount.toLocaleString()}</span>
      </div>
    `;
  }

  /**
   * Renderiza el botón de PayPal
   */
  async renderPayPalButton(paymentData) {
    try {
      const container = document.getElementById('paypal-button-container');
      container.innerHTML = '';

      if (!window.paypal) {
        throw new Error('PayPal SDK no está cargado');
      }

      await window.paypal
        .Buttons({
          style: {
            layout: 'vertical',
            color: 'blue',
            shape: 'rect',
            label: 'paypal',
            height: 45,
          },
          createOrder: (data, actions) => {
            return this.createOrder(paymentData, actions);
          },
          onApprove: (data, actions) => {
            return this.onApprove(data, actions);
          },
          onError: (error) => {
            this.onError(error);
          },
          onCancel: (data) => {
            this.onCancel(data);
          },
        })
        .render('#paypal-button-container');

      this.hideLoading();
    } catch (error) {
      console.error('Error renderizando botón PayPal:', error);
      this.showError('Error cargando PayPal');
    }
  }

  /**
   * Crea la orden de pago
   */
  createOrder(paymentData, actions) {
    return actions.order.create({
      purchase_units: [
        {
          amount: {
            currency_code: paymentData.currency,
            value: paymentData.amount.toString(),
          },
          description: paymentData.description,
          custom_id: paymentData.orderId,
        },
      ],
      application_context: {
        brand_name: 'AXYRA Sistema de Gestión',
        landing_page: 'BILLING',
        user_action: 'PAY_NOW',
        return_url: window.location.origin + '/payment/success',
        cancel_url: window.location.origin + '/payment/cancel',
      },
    });
  }

  /**
   * Maneja la aprobación del pago
   */
  async onApprove(data, actions) {
    try {
      this.showLoading('Procesando pago...');

      const order = await actions.order.capture();

      if (order.status === 'COMPLETED') {
        await this.handlePaymentSuccess(order);
      } else {
        throw new Error('El pago no se completó correctamente');
      }
    } catch (error) {
      console.error('Error capturando pago:', error);
      this.showError('Error procesando el pago');
    }
  }

  /**
   * Maneja errores de PayPal
   */
  onError(error) {
    console.error('Error PayPal:', error);
    this.showError('Error en el proceso de pago');
    this.hideLoading();
  }

  /**
   * Maneja la cancelación del pago
   */
  onCancel(data) {
    console.log('Pago cancelado:', data);
    this.showMessage('Pago cancelado', 'info');
    this.hidePaymentModal();
  }

  /**
   * Maneja el éxito del pago
   */
  async handlePaymentSuccess(order) {
    try {
      this.hideLoading();

      // Mostrar mensaje de éxito
      this.showMessage('¡Pago procesado exitosamente!', 'success');

      // Enviar datos al servidor
      await this.sendPaymentToServer(order);

      // Cerrar modal
      this.hidePaymentModal();

      // Emitir evento personalizado
      this.emitPaymentEvent('success', order);
    } catch (error) {
      console.error('Error procesando pago exitoso:', error);
      this.showError('Error guardando el pago');
    }
  }

  /**
   * Envía los datos del pago al servidor
   */
  async sendPaymentToServer(order) {
    try {
      // Obtener datos del usuario actual
      const user = firebase.auth().currentUser;
      if (!user) {
        throw new Error('Usuario no autenticado');
      }

      // Obtener tipo de plan del botón
      const planType = this.currentOrder?.planType || 'basic';

      const response = await fetch('/api/processPayPalPayment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: order.id,
          userId: user.uid,
          planType: planType,
          status: order.status,
          amount: order.purchase_units[0].amount.value,
          currency: order.purchase_units[0].amount.currency_code,
          payer: order.payer,
          createTime: order.create_time,
          updateTime: order.update_time,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error enviando pago al servidor');
      }

      const result = await response.json();

      // Emitir evento de actualización de plan
      window.dispatchEvent(
        new CustomEvent('plan-updated', {
          detail: {
            plan: planType,
            status: 'active',
            hasAccess: true,
          },
        })
      );

      return result;
    } catch (error) {
      console.error('Error enviando pago:', error);
      throw error;
    }
  }

  /**
   * Emite eventos personalizados
   */
  emitPaymentEvent(type, data) {
    const event = new CustomEvent('paypal-payment', {
      detail: { type, data },
    });
    window.dispatchEvent(event);
  }

  /**
   * Muestra el modal de pago
   */
  showPaymentModal(paymentData) {
    const container = document.getElementById('paypal-payment-container');
    container.style.display = 'flex';
    this.updatePaymentSummary(paymentData);
  }

  /**
   * Oculta el modal de pago
   */
  hidePaymentModal() {
    const container = document.getElementById('paypal-payment-container');
    container.style.display = 'none';
    this.isProcessing = false;
    this.currentOrder = null;
  }

  /**
   * Muestra loading
   */
  showLoading(message = 'Cargando...') {
    const container = document.getElementById('paypal-button-container');
    container.innerHTML = `
      <div style="text-align: center; padding: 20px;">
        <div style="display: inline-block; width: 40px; height: 40px; border: 4px solid #f3f3f3; border-top: 4px solid #0070ba; border-radius: 50%; animation: spin 1s linear infinite;"></div>
        <p style="margin-top: 15px; color: #666;">${message}</p>
      </div>
      <style>
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      </style>
    `;
  }

  /**
   * Oculta loading
   */
  hideLoading() {
    // El loading se oculta cuando se renderiza el botón de PayPal
  }

  /**
   * Muestra mensaje de error
   */
  showError(message) {
    this.showMessage(message, 'error');
  }

  /**
   * Muestra mensaje
   */
  showMessage(message, type = 'info') {
    const colors = {
      success: '#28a745',
      error: '#dc3545',
      info: '#17a2b8',
      warning: '#ffc107',
    };

    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${colors[type]};
      color: white;
      padding: 15px 20px;
      border-radius: 6px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
      z-index: 10001;
      max-width: 300px;
    `;
    notification.textContent = message;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.remove();
    }, 5000);
  }

  /**
   * Genera ID de orden único
   */
  generateOrderId() {
    return 'AXY_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  /**
   * Maneja suscripciones (para futuras implementaciones)
   */
  async handleSubscriptionClick(button) {
    this.showMessage('Funcionalidad de suscripciones próximamente', 'info');
  }
}

// ========================================
// INICIALIZACIÓN AUTOMÁTICA
// ========================================
document.addEventListener('DOMContentLoaded', () => {
  window.axyraPayPal = new AxyraPayPalIntegration();
});

// ========================================
// FUNCIONES GLOBALES DE UTILIDAD
// ========================================

/**
 * Crea un botón de pago PayPal
 */
function createPayPalButton(options = {}) {
  const button = document.createElement('button');
  button.className = 'btn btn-paypal';
  button.dataset.paypalPayment = 'true';
  button.dataset.amount = options.amount || 0;
  button.dataset.description = options.description || 'Pago AXYRA';
  button.dataset.currency = options.currency || 'COP';
  button.dataset.items = JSON.stringify(options.items || []);
  button.dataset.orderId = options.orderId || '';

  button.innerHTML = `
    <i class="fab fa-paypal"></i>
    Pagar con PayPal
  `;

  button.style.cssText = `
    background: #0070ba;
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 16px;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    transition: background 0.3s;
  `;

  button.addEventListener('mouseenter', () => {
    button.style.background = '#005ea6';
  });

  button.addEventListener('mouseleave', () => {
    button.style.background = '#0070ba';
  });

  return button;
}

/**
 * Crea un botón de suscripción PayPal
 */
function createPayPalSubscriptionButton(options = {}) {
  const button = document.createElement('button');
  button.className = 'btn btn-paypal-subscription';
  button.dataset.paypalSubscription = 'true';
  button.dataset.planId = options.planId || '';
  button.dataset.amount = options.amount || 0;
  button.dataset.description = options.description || 'Suscripción AXYRA';

  button.innerHTML = `
    <i class="fas fa-sync-alt"></i>
    Suscribirse con PayPal
  `;

  button.style.cssText = `
    background: #28a745;
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 16px;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    transition: background 0.3s;
  `;

  return button;
}

// ========================================
// EXPORTACIONES
// ========================================
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { AxyraPayPalIntegration, createPayPalButton, createPayPalSubscriptionButton };
}
