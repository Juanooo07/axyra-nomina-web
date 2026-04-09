// ========================================
// SISTEMA DE INTEGRACIÓN WOMPI - AXYRA
// ========================================
// Sistema para procesar pagos con Wompi (Colombia)

class AxyraWompiIntegration {
  constructor() {
    this.config = {
      publicKey: 'pub_prod_DMd1RNFhiA3813HZ3YZFsNjSg2beSS00',
      privateKey: 'prv_prod_aka7VAtItpCAF3qhVuD8zvt7FUWXduPY',
      integritySecret: 'prod_integrity_qQz4LLXZep6Vs2OqAamNccOayPhi7NTV',
      eventsSecret: 'prod_events_4ob12JL0RXAolocztVa9GThpUrGfy8Dn',
      environment: 'production', // PRODUCCIÓN REAL
      baseUrl: 'https://production.wompi.co/v1',
      testBaseUrl: 'https://sandbox.wompi.co/v1',
    };

    this.isLoaded = false;
    this.currentTransaction = null;

    this.init();
  }

  /**
   * Inicializa el sistema de Wompi
   */
  async init() {
    try {
      this.setupEventListeners();
      this.createPaymentUI();
      console.log('✅ Sistema Wompi inicializado correctamente');
    } catch (error) {
      console.error('❌ Error inicializando Wompi:', error);
    }
  }

  /**
   * Configura los event listeners
   */
  setupEventListeners() {
    // Escuchar clics en botones de pago Wompi
    document.addEventListener('click', (e) => {
      if (e.target.matches('[data-wompi-payment]')) {
        e.preventDefault();
        this.handlePaymentClick(e.target);
      }
    });

    // Escuchar eventos de actualización de plan
    window.addEventListener('plan-updated', (event) => {
      console.log('Plan actualizado:', event.detail);
    });
  }

  /**
   * Maneja el clic en botón de pago
   */
  async handlePaymentClick(button) {
    try {
      const amount = parseFloat(button.dataset.amount);
      const description = button.dataset.description;
      const planType = button.dataset.planType;
      const userId = button.dataset.userId;

      if (!amount || !description || !planType || !userId) {
        throw new Error('Faltan datos requeridos para el pago');
      }

      // Crear transacción en Wompi
      await this.createWompiTransaction({
        amount: amount * 100, // Wompi usa centavos
        currency: 'COP',
        description: description,
        planType: planType,
        userId: userId,
      });
    } catch (error) {
      console.error('Error procesando pago Wompi:', error);
      this.showError('Error procesando el pago: ' + error.message);
    }
  }

  /**
   * Crea una transacción en Wompi
   */
  async createWompiTransaction(paymentData) {
    try {
      console.log('🔄 Creando transacción Wompi:', paymentData);

      // Redirigir directamente al checkout de Wompi
      await this.processWompiPayment(paymentData);
      
    } catch (error) {
      console.error('Error creando transacción Wompi:', error);
      throw error;
    }
  }

  /**
   * Muestra el modal de pago de Wompi
   */
  showWompiPaymentModal(transaction) {
    // Crear modal de pago
    const modal = document.createElement('div');
    modal.id = 'wompi-payment-modal';
    modal.className = 'wompi-payment-modal';
    modal.innerHTML = `
      <div class="wompi-modal-content">
        <div class="wompi-header">
          <h2>💳 Pago con Wompi</h2>
          <button class="close-wompi-modal">&times;</button>
        </div>
        
        <div class="wompi-body">
          <div class="payment-info">
            <p><strong>Monto:</strong> $${(transaction.amount_in_cents / 100).toLocaleString()} COP</p>
            <p><strong>Referencia:</strong> ${transaction.reference}</p>
            <p><strong>Estado:</strong> ${transaction.status}</p>
          </div>
          
          <div class="payment-methods">
            <h3>Métodos de Pago Disponibles:</h3>
            <div class="method-grid">
              <div class="payment-method" data-method="CARD">
                <div class="method-icon">💳</div>
                <span>Tarjeta de Crédito/Débito</span>
              </div>
              <div class="payment-method" data-method="NEQUI">
                <div class="method-icon">📱</div>
                <span>Nequi</span>
              </div>
              <div class="payment-method" data-method="BANCOLOMBIA_TRANSFER">
                <div class="method-icon">🏦</div>
                <span>Transferencia Bancolombia</span>
              </div>
              <div class="payment-method" data-method="BANCOLOMBIA_QR">
                <div class="method-icon">📱</div>
                <span>QR Bancolombia</span>
              </div>
            </div>
          </div>
          
          <div class="wompi-actions">
            <button class="btn-pay-wompi" data-transaction-id="${transaction.id}">
              Proceder al Pago
            </button>
            <button class="btn-cancel-wompi">
              Cancelar
            </button>
          </div>
        </div>
      </div>
    `;

    // Estilos del modal
    const styles = document.createElement('style');
    styles.textContent = `
      .wompi-payment-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.95);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
        backdrop-filter: blur(10px);
      }
      
      .wompi-modal-content {
        background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
        border-radius: 20px;
        padding: 40px;
        max-width: 600px;
        width: 95%;
        max-height: 90vh;
        overflow-y: auto;
        position: relative;
        border: 1px solid #333;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.8);
      }
      
      .wompi-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 30px;
        border-bottom: 2px solid #333;
        padding-bottom: 20px;
      }
      
      .wompi-header h2 {
        color: white;
        font-size: 28px;
        font-weight: bold;
        margin: 0;
      }
      
      .close-wompi-modal {
        background: none;
        border: none;
        font-size: 28px;
        cursor: pointer;
        color: #aaa;
        transition: color 0.3s;
      }
      
      .close-wompi-modal:hover {
        color: white;
      }
      
      .payment-info {
        background: #2a2a2a;
        padding: 20px;
        border-radius: 12px;
        margin-bottom: 30px;
        color: white;
      }
      
      .payment-info p {
        margin: 10px 0;
        font-size: 16px;
      }
      
      .payment-methods h3 {
        color: white;
        margin-bottom: 20px;
        font-size: 20px;
      }
      
      .method-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 15px;
        margin-bottom: 30px;
      }
      
      .payment-method {
        background: #2a2a2a;
        border: 2px solid #333;
        border-radius: 12px;
        padding: 20px;
        text-align: center;
        cursor: pointer;
        transition: all 0.3s;
        color: white;
      }
      
      .payment-method:hover {
        border-color: #00d4aa;
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(0, 212, 170, 0.3);
      }
      
      .payment-method.selected {
        border-color: #00d4aa;
        background: rgba(0, 212, 170, 0.1);
      }
      
      .method-icon {
        font-size: 32px;
        margin-bottom: 10px;
      }
      
      .wompi-actions {
        display: flex;
        gap: 15px;
        justify-content: center;
      }
      
      .btn-pay-wompi, .btn-cancel-wompi {
        padding: 15px 30px;
        border: none;
        border-radius: 8px;
        font-size: 16px;
        font-weight: bold;
        cursor: pointer;
        transition: all 0.3s;
        min-width: 150px;
      }
      
      .btn-pay-wompi {
        background: linear-gradient(135deg, #00d4aa, #00b894);
        color: white;
      }
      
      .btn-pay-wompi:hover {
        background: linear-gradient(135deg, #00b894, #00a085);
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(0, 212, 170, 0.4);
      }
      
      .btn-cancel-wompi {
        background: #666;
        color: white;
      }
      
      .btn-cancel-wompi:hover {
        background: #777;
      }
    `;

    document.head.appendChild(styles);
    document.body.appendChild(modal);

    // Event listeners
    modal.querySelector('.close-wompi-modal').addEventListener('click', () => {
      this.hideWompiPaymentModal();
    });

    modal.querySelector('.btn-cancel-wompi').addEventListener('click', () => {
      this.hideWompiPaymentModal();
    });

    modal.querySelector('.btn-pay-wompi').addEventListener('click', () => {
      this.processWompiPayment(transaction);
    });

    // Selección de método de pago
    modal.querySelectorAll('.payment-method').forEach((method) => {
      method.addEventListener('click', () => {
        modal.querySelectorAll('.payment-method').forEach((m) => m.classList.remove('selected'));
        method.classList.add('selected');
      });
    });

    // Cerrar al hacer clic fuera del modal
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        this.hideWompiPaymentModal();
      }
    });
  }

  /**
   * Procesa el pago de Wompi usando el link de checkout específico del plan
   */
  async processWompiPayment(paymentData) {
    try {
      console.log('🔄 Redirigiendo a Wompi checkout:', paymentData);
      
      // Mapeo de planes a sus links específicos de Wompi
      const planLinks = {
        basic: 'https://checkout.wompi.co/l/dJSIja',      // Plan Básico
        professional: 'https://checkout.wompi.co/l/Lk65dP', // Plan Profesional
        enterprise: 'https://checkout.wompi.co/l/Hg5RaQ'    // Plan Empresarial
      };

      // URLs de redirección para cada plan
      const redirectUrls = {
        basic: `${window.location.origin}/membresias.html?payment=success&plan=basic`,
        professional: `${window.location.origin}/membresias.html?payment=success&plan=professional`,
        enterprise: `${window.location.origin}/membresias.html?payment=success&plan=enterprise`
      };
      
      // Obtener el link específico del plan
      const wompiCheckoutUrl = planLinks[paymentData.planType];
      
      if (!wompiCheckoutUrl) {
        throw new Error(`No se encontró link de checkout para el plan: ${paymentData.planType}`);
      }
      
      console.log('🌐 Link de checkout específico:', wompiCheckoutUrl);
      console.log('📋 Plan seleccionado:', paymentData.planType);

      // Abrir en nueva ventana
      const paymentWindow = window.open(
        wompiCheckoutUrl,
        'wompi-payment',
        'width=800,height=600,scrollbars=yes,resizable=yes'
      );

      if (!paymentWindow) {
        throw new Error('No se pudo abrir la ventana de pago. Verifica que los popups estén permitidos.');
      }

      // Cerrar el modal actual
      this.hideWompiPaymentModal();
      
    } catch (error) {
      console.error('Error procesando pago Wompi:', error);
      this.showError('Error procesando el pago: ' + error.message);
    }
  }

  /**
   * Monitorea el estado del pago
   */
  async monitorPaymentStatus(transactionId, paymentWindow) {
    const checkStatus = async () => {
      try {
        const response = await fetch(`${this.getBaseUrl()}/transactions/${transactionId}`, {
          headers: {
            Authorization: `Bearer ${this.config.privateKey}`,
          },
        });

        if (response.ok) {
          const result = await response.json();
          const status = result.data.status;

          if (status === 'APPROVED') {
            // Pago exitoso
            paymentWindow.close();
            this.hideWompiPaymentModal();
            this.handlePaymentSuccess(result.data);
          } else if (status === 'DECLINED' || status === 'VOIDED') {
            // Pago fallido
            paymentWindow.close();
            this.hideWompiPaymentModal();
            this.handlePaymentError('Pago rechazado');
          }
        }
      } catch (error) {
        console.error('Error verificando estado del pago:', error);
      }
    };

    // Verificar cada 3 segundos
    const interval = setInterval(checkStatus, 3000);

    // Limpiar intervalo cuando se cierre la ventana
    const checkClosed = setInterval(() => {
      if (paymentWindow.closed) {
        clearInterval(interval);
        clearInterval(checkClosed);
      }
    }, 1000);
  }

  /**
   * Maneja el éxito del pago
   */
  async handlePaymentSuccess(transaction) {
    try {
      // Actualizar plan del usuario
      const response = await fetch('/api/processWompiPayment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transactionId: transaction.id,
          reference: transaction.reference,
          amount: transaction.amount_in_cents,
          status: transaction.status,
          userId: this.getCurrentUserId(),
        }),
      });

      if (response.ok) {
        const result = await response.json();

        // Emitir evento de actualización de plan
        window.dispatchEvent(
          new CustomEvent('plan-updated', {
            detail: {
              plan: result.plan,
              status: 'active',
              hasAccess: true,
              transactionId: transaction.id,
            },
          })
        );

        this.showSuccess('¡Pago exitoso! Tu plan ha sido actualizado');
      } else {
        throw new Error('Error actualizando el plan');
      }
    } catch (error) {
      console.error('Error manejando éxito del pago:', error);
      this.showError('Error actualizando el plan');
    }
  }

  /**
   * Maneja el error del pago
   */
  handlePaymentError(message) {
    this.showError(message);
  }

  /**
   * Oculta el modal de pago
   */
  hideWompiPaymentModal() {
    const modal = document.getElementById('wompi-payment-modal');
    if (modal) {
      modal.remove();
    }
  }

  /**
   * Crea la UI de pagos
   */
  createPaymentUI() {
    // Esta función se puede expandir para crear elementos de UI específicos
    console.log('UI de Wompi creada');
  }

  /**
   * Obtiene la URL base según el entorno
   */
  getBaseUrl() {
    return this.config.environment === 'production' ? this.config.baseUrl : this.config.testBaseUrl;
  }

  /**
   * Obtiene el email del usuario actual
   */
  getCurrentUserEmail() {
    const user = firebase.auth().currentUser;
    return user ? user.email : '';
  }

  /**
   * Obtiene el ID del usuario actual
   */
  getCurrentUserId() {
    const user = firebase.auth().currentUser;
    return user ? user.uid : '';
  }

  /**
   * Muestra mensaje de éxito
   */
  showSuccess(message) {
    alert('✅ ' + message);
  }

  /**
   * Muestra mensaje de error
   */
  showError(message) {
    alert('❌ ' + message);
  }
}

// ========================================
// INICIALIZACIÓN AUTOMÁTICA
// ========================================
document.addEventListener('DOMContentLoaded', () => {
  window.axyraWompiIntegration = new AxyraWompiIntegration();
});

// ========================================
// FUNCIONES GLOBALES
// ========================================

/**
 * Crea botón de pago Wompi
 */
function createWompiPaymentButton(planType, amount, description, userId) {
  const button = document.createElement('button');
  button.className = 'btn btn-wompi';
  button.dataset.wompiPayment = 'true';
  button.dataset.amount = amount;
  button.dataset.description = description;
  button.dataset.planType = planType;
  button.dataset.userId = userId;

  button.innerHTML = `
    <i class="fas fa-credit-card"></i>
    Pagar con Wompi $${amount.toLocaleString()} COP
  `;

  return button;
}

// ========================================
// EXPORTACIONES
// ========================================
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { AxyraWompiIntegration, createWompiPaymentButton };
}
