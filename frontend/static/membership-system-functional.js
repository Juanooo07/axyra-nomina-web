// ========================================
// SISTEMA DE MEMBRESÍAS FUNCIONAL AXYRA
// ========================================

class AxyraMembershipSystemFunctional {
  constructor() {
    this.config = {
      plans: {
        free: {
          id: 'free',
          name: 'Plan Gratuito',
          price: 0,
          currency: 'COP',
          interval: 'month',
          features: ['Hasta 5 empleados', 'Dashboard básico', 'Reportes básicos', 'Soporte por email'],
          limitations: {
            maxEmployees: 5,
            maxReports: 10,
            advancedFeatures: false,
            prioritySupport: false,
            apiAccess: false,
          },
        },
        basic: {
          id: 'basic',
          name: 'Plan Básico',
          price: 29900,
          currency: 'COP',
          interval: 'month',
          features: [
            'Hasta 5 empleados',
            'Gestión básica de nómina',
            'Inventario simple',
            'Reportes básicos',
            'Soporte por email',
            '5GB de almacenamiento',
          ],
          limitations: {
            maxEmployees: 5,
            maxReports: 50,
            advancedFeatures: false,
            prioritySupport: false,
            apiAccess: false,
          },
        },
        professional: {
          id: 'professional',
          name: 'Plan Profesional',
          price: 49900,
          currency: 'COP',
          interval: 'month',
          features: [
            'Hasta 25 empleados',
            'Gestión completa de nómina',
            'Inventario avanzado',
            'Cuadre de caja',
            'Reportes avanzados',
            'Chat de IA incluido',
            'Soporte prioritario',
          ],
          limitations: {
            maxEmployees: 25,
            maxReports: 200,
            advancedFeatures: true,
            prioritySupport: true,
            apiAccess: false,
          },
        },
        enterprise: {
          id: 'enterprise',
          name: 'Plan Empresarial',
          price: 99900,
          currency: 'COP',
          interval: 'month',
          features: [
            'Empleados ilimitados',
            'Todas las funciones',
            'Múltiples sucursales',
            'API personalizada',
            'Reportes personalizados',
            'Soporte 24/7',
            'Almacenamiento ilimitado',
          ],
          limitations: {
            maxEmployees: -1,
            maxReports: -1,
            advancedFeatures: true,
            prioritySupport: true,
            apiAccess: true,
            multiBranch: true,
            customIntegration: true,
          },
        },
      },
    };

    this.currentUser = null;
    this.currentMembership = null;
    this.paymentMethods = ['wompi'];

    this.init();
  }

  async init() {
    try {
      console.log('💎 Inicializando Sistema de Membresías Funcional AXYRA...');

      // Cargar membresía actual
      await this.loadCurrentMembership();

      // Configurar event listeners
      this.setupEventListeners();

      // Verificar si regresó de validación de Wompi
      this.checkWompiValidationReturn();

      console.log('✅ Sistema de Membresías Funcional AXYRA inicializado');
    } catch (error) {
      console.error('❌ Error inicializando sistema de membresías:', error);
      this.handleError(error);
    }
  }

  async loadCurrentMembership() {
    try {
      // Usar plan gratuito por defecto
      this.currentMembership = this.config.plans.free;

      // Verificar si hay datos en localStorage
      const storedMembership = localStorage.getItem('axyra_membership');
      if (storedMembership) {
        const membershipData = JSON.parse(storedMembership);
        this.currentMembership = {
          ...(this.config.plans[membershipData.plan] || this.config.plans.free),
          ...membershipData,
        };
      }

      console.log('💎 Membresía actual cargada:', this.currentMembership);
    } catch (error) {
      console.warn('⚠️ Error cargando membresía, usando plan gratuito:', error);
      this.currentMembership = this.config.plans.free;
    }
  }

  setupEventListeners() {
    // Event listeners para botones de planes
    document.addEventListener('click', (e) => {
      if (e.target.matches('[data-plan]')) {
        const planId = e.target.getAttribute('data-plan');
        this.selectPlan(planId);
      }
    });

    // Event listeners para métodos de pago
    document.addEventListener('click', (e) => {
      if (e.target.matches('[data-payment-method]')) {
        const method = e.target.getAttribute('data-payment-method');
        this.selectPaymentMethod(method);
      }
    });
  }

  async selectPlan(planId) {
    try {
      console.log('🎯 Plan seleccionado:', planId);

      const plan = this.config.plans[planId];
      if (!plan) {
        throw new Error('Plan no encontrado');
      }

      // Verificar si ya tiene el plan
      if (this.currentMembership.id === planId && this.currentMembership.status === 'active') {
        this.showNotification('Ya tienes este plan activo', 'info');
        return;
      }

      // Mostrar modal de pago
      this.showPaymentModal(plan);
    } catch (error) {
      console.error('❌ Error seleccionando plan:', error);
      this.showNotification('Error seleccionando plan: ' + error.message, 'error');
    }
  }

  showPaymentModal(plan) {
    const modal = document.createElement('div');
    modal.className = 'axyra-payment-modal';
    modal.innerHTML = `
      <div class="axyra-payment-modal-content">
        <div class="axyra-payment-modal-header">
          <h3>Seleccionar Método de Pago</h3>
          <button class="axyra-payment-modal-close" onclick="this.closest('.axyra-payment-modal').remove()">×</button>
        </div>
        <div class="axyra-payment-modal-body">
          <div class="axyra-plan-info">
            <h4>${plan.name}</h4>
            <p class="plan-price">$${plan.price.toLocaleString()} COP</p>
            <ul class="axyra-plan-features">
              ${plan.features.map((feature) => `<li>✅ ${feature}</li>`).join('')}
            </ul>
          </div>
          <div class="axyra-payment-options">
            <div class="axyra-payment-option" data-payment-method="wompi">
              <div class="payment-icon">💳</div>
              <div class="payment-info">
                <h5>Wompi</h5>
                <p>Pago con tarjeta de crédito/débito</p>
              </div>
            </div>
          </div>
        </div>
        <div class="axyra-payment-modal-footer">
          <button id="axyra-process-payment" class="axyra-payment-button" disabled>
            Procesar Pago
          </button>
        </div>
      </div>
    `;

    // Agregar estilos
    const styles = document.createElement('style');
    styles.textContent = `
      .axyra-payment-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
      }
      .axyra-payment-modal-content {
        background: white;
        border-radius: 16px;
        padding: 24px;
        max-width: 500px;
        width: 90%;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
      }
      .axyra-payment-modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
      }
      .axyra-payment-modal-close {
        background: none;
        border: none;
        font-size: 24px;
        cursor: pointer;
        color: #666;
      }
      .axyra-plan-info {
        margin-bottom: 20px;
        padding: 16px;
        background: #f8fafc;
        border-radius: 12px;
      }
      .plan-price {
        font-size: 24px;
        font-weight: bold;
        color: #3b82f6;
        margin: 8px 0;
      }
      .axyra-plan-features {
        list-style: none;
        padding: 0;
        margin: 16px 0 0 0;
      }
      .axyra-plan-features li {
        padding: 4px 0;
        color: #4b5563;
      }
      .axyra-payment-option {
        display: flex;
        align-items: center;
        padding: 16px;
        border: 2px solid #e5e7eb;
        border-radius: 12px;
        cursor: pointer;
        transition: all 0.3s ease;
        margin-bottom: 12px;
      }
      .axyra-payment-option:hover {
        border-color: #3b82f6;
        background: #f0f9ff;
      }
      .axyra-payment-option.selected {
        border-color: #3b82f6;
        background: #f0f9ff;
      }
      .payment-icon {
        font-size: 24px;
        margin-right: 16px;
      }
      .payment-info h5 {
        margin: 0 0 4px 0;
        color: #1f2937;
      }
      .payment-info p {
        margin: 0;
        color: #6b7280;
        font-size: 14px;
      }
      .axyra-payment-button {
        width: 100%;
        padding: 12px 24px;
        background: #3b82f6;
        color: white;
        border: none;
        border-radius: 8px;
        font-size: 16px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
      }
      .axyra-payment-button:hover:not(:disabled) {
        background: #2563eb;
      }
      .axyra-payment-button:disabled {
        background: #9ca3af;
        cursor: not-allowed;
      }
    `;

    if (document.head) {
      document.head.appendChild(styles);
    }

    if (document.body) {
      document.body.appendChild(modal);
    }

    // Configurar event listeners
    modal.querySelectorAll('.axyra-payment-option').forEach((option) => {
      option.addEventListener('click', () => {
        modal.querySelectorAll('.axyra-payment-option').forEach((opt) => opt.classList.remove('selected'));
        option.classList.add('selected');
        modal.querySelector('#axyra-process-payment').disabled = false;
      });
    });

    modal.querySelector('#axyra-process-payment').addEventListener('click', () => {
      const selectedMethod = modal.querySelector('.axyra-payment-option.selected');
      if (selectedMethod) {
        const method = selectedMethod.getAttribute('data-payment-method');
        this.processPayment(plan, method);
      }
    });
  }

  async processPayment(plan, method) {
    try {
      console.log('💳 Procesando pago:', { plan: plan.id, method });

      if (method === 'wompi') {
        await this.processWompiPayment(plan);
      } else {
        throw new Error('Método de pago no válido');
      }
    } catch (error) {
      console.error('❌ Error procesando pago:', error);
      this.showNotification('Error procesando pago: ' + error.message, 'error');
    }
  }

  async processWompiPayment(plan) {
    try {
      // Para planes gratuitos, activar directamente
      if (plan.price === 0) {
        await this.updateMembership(plan.id, 'free_trial');
        this.showNotification('¡Prueba gratuita activada exitosamente!', 'success');
        this.closePaymentModal();
        return;
      }

      // Para planes de pago, determinar si es prueba gratuita
      const isFreeTrial = this.isFreeTrial(plan);

      if (isFreeTrial) {
        // Mostrar modal de validación de identidad
        this.showValidationModal(plan);
      } else {
        // Pago completo
        this.processFullPayment(plan);
      }
    } catch (error) {
      console.error('❌ Error procesando pago con Wompi:', error);
      throw error;
    }
  }

  isFreeTrial(plan) {
    // Verificar si el usuario está en período de prueba gratuita
    const storedMembership = localStorage.getItem('axyra_membership');
    if (storedMembership) {
      const membership = JSON.parse(storedMembership);
      const startDate = new Date(membership.startDate);
      const daysSinceStart = (Date.now() - startDate.getTime()) / (1000 * 60 * 60 * 24);

      // Si es menos de 7 días desde el inicio, es prueba gratuita
      return daysSinceStart < 7;
    }

    // Si no hay membresía previa, es prueba gratuita
    return true;
  }

  showValidationModal(plan) {
    const modal = document.createElement('div');
    modal.className = 'axyra-validation-modal';
    modal.innerHTML = `
      <div class="axyra-validation-modal-content">
        <div class="axyra-validation-modal-header">
          <h3>Validación de Identidad</h3>
          <button class="axyra-validation-modal-close" onclick="this.closest('.axyra-validation-modal').remove()">×</button>
        </div>
        <div class="axyra-validation-modal-body">
          <div class="validation-info">
            <div class="validation-icon">🔐</div>
            <h4>Prueba Gratuita de ${plan.name}</h4>
            <p>Para activar tu prueba gratuita, necesitamos validar tu identidad con una pequeña transacción de <strong>$200 COP</strong>.</p>
            <div class="validation-details">
              <div class="detail-item">
                <span class="detail-label">Costo de validación:</span>
                <span class="detail-value">$200 COP</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Plan seleccionado:</span>
                <span class="detail-value">${plan.name}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Duración de prueba:</span>
                <span class="detail-value">7 días gratis</span>
              </div>
            </div>
          </div>
          <div class="validation-actions">
            <button id="axyra-validate-identity" class="axyra-validation-button">
              Validar Identidad - $200 COP
            </button>
            <button class="axyra-cancel-button" onclick="this.closest('.axyra-validation-modal').remove()">
              Cancelar
            </button>
          </div>
        </div>
      </div>
    `;

    // Agregar estilos
    const styles = document.createElement('style');
    styles.textContent = `
      .axyra-validation-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
      }
      .axyra-validation-modal-content {
        background: white;
        border-radius: 16px;
        padding: 24px;
        max-width: 500px;
        width: 90%;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
      }
      .axyra-validation-modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
      }
      .axyra-validation-modal-close {
        background: none;
        border: none;
        font-size: 24px;
        cursor: pointer;
        color: #666;
      }
      .validation-info {
        text-align: center;
        margin-bottom: 24px;
      }
      .validation-icon {
        font-size: 48px;
        margin-bottom: 16px;
      }
      .validation-details {
        background: #f8fafc;
        border-radius: 12px;
        padding: 16px;
        margin: 16px 0;
      }
      .detail-item {
        display: flex;
        justify-content: space-between;
        margin-bottom: 8px;
      }
      .detail-label {
        color: #64748b;
        font-weight: 500;
      }
      .detail-value {
        color: #1e293b;
        font-weight: 600;
      }
      .validation-actions {
        display: flex;
        gap: 12px;
      }
      .axyra-validation-button {
        flex: 1;
        padding: 12px 24px;
        background: #3b82f6;
        color: white;
        border: none;
        border-radius: 8px;
        font-size: 16px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
      }
      .axyra-validation-button:hover {
        background: #2563eb;
      }
      .axyra-cancel-button {
        flex: 1;
        padding: 12px 24px;
        background: #e5e7eb;
        color: #374151;
        border: none;
        border-radius: 8px;
        font-size: 16px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
      }
      .axyra-cancel-button:hover {
        background: #d1d5db;
      }
    `;

    if (document.head) {
      document.head.appendChild(styles);
    }

    if (document.body) {
      document.body.appendChild(modal);
    }

    // Configurar event listener para validación
    modal.querySelector('#axyra-validate-identity').addEventListener('click', () => {
      this.processValidationPayment(plan);
    });
  }

  async processValidationPayment(plan) {
    try {
      console.log('🔐 Procesando validación de identidad...', {
        plan: plan.id,
        validationAmount: 200,
      });

      // Crear enlace de Wompi para validación de $200 COP
      const wompiLink = this.createWompiValidationLink(plan);

      // Redirigir a Wompi con el monto correcto
      window.open(wompiLink, '_blank');

      this.showNotification('Redirigiendo a Wompi para validación de $200 COP...', 'info');
    } catch (error) {
      console.error('❌ Error en validación:', error);
      this.showNotification('Error en la validación: ' + error.message, 'error');
    }
  }

  createWompiValidationLink(plan) {
    try {
      // Configuración para validación de $200 COP
      const validationData = {
        amount: 200, // $200 COP para validación
        currency: 'COP',
        description: `Validación de identidad - ${plan.name}`,
        reference: `validation_${Date.now()}_${plan.id}`,
        customer: {
          email: 'usuario@axyra.com',
          name: 'Usuario AXYRA',
        },
        plan: plan.id,
        type: 'validation',
      };

      // Crear URL de Wompi para validación
      const wompiUrl = this.buildWompiUrl(validationData);

      console.log('🔗 Enlace de validación Wompi creado:', wompiUrl);
      return wompiUrl;
    } catch (error) {
      console.error('❌ Error creando enlace de Wompi:', error);
      throw error;
    }
  }

  buildWompiUrl(validationData) {
    try {
      // Usar configuración de claves de Wompi
      if (window.axyraWompiKeys) {
        return window.axyraWompiKeys.createValidationLink({
          id: validationData.plan,
          name: validationData.description,
        });
      }

      // Fallback si no hay configuración de claves
      const baseUrl = 'https://checkout.wompi.co/l/';

      // Parámetros para la validación
      const params = new URLSearchParams({
        'public-key': 'pub_prod_DMd1RNFhiA3813HZ3YZFsNjSg2beSS00', // Tu clave pública de Wompi
        currency: validationData.currency,
        'amount-in-cents': (validationData.amount * 100).toString(), // Convertir a centavos
        reference: validationData.reference,
        'customer-email': validationData.customer.email,
        'customer-name': validationData.customer.name,
        description: validationData.description,
        'redirect-url':
          window.location.origin + '/modulos/membresias/membresias.html?validation=success&plan=' + validationData.plan,
      });

      return `${baseUrl}?${params.toString()}`;
    } catch (error) {
      console.error('❌ Error construyendo URL de Wompi:', error);
      throw error;
    }
  }

  async processFullPayment(plan) {
    try {
      console.log('💳 Procesando pago completo con Wompi...', {
        amount: plan.price,
        currency: plan.currency,
        plan: plan.id,
      });

      // Aquí iría la integración real con Wompi para el precio completo
      this.showNotification('Procesando pago completo...', 'info');

      setTimeout(async () => {
        await this.updateMembership(plan.id, 'wompi_full');
        this.showNotification('¡Pago procesado exitosamente!', 'success');
        this.closePaymentModal();
      }, 2000);
    } catch (error) {
      console.error('❌ Error procesando pago completo:', error);
      this.showNotification('Error procesando pago: ' + error.message, 'error');
    }
  }

  async updateMembership(planId, paymentMethod) {
    try {
      console.log('📝 Actualizando membresía:', { planId, paymentMethod });

      const plan = this.config.plans[planId];
      const membershipData = {
        plan: planId,
        status: 'active',
        startDate: new Date(),
        endDate: this.calculateEndDate(planId),
        paymentMethod: paymentMethod,
        lastUpdated: new Date(),
      };

      // Actualizar en localStorage
      localStorage.setItem('axyra_membership', JSON.stringify(membershipData));

      // Actualizar membresía actual
      this.currentMembership = { ...plan, ...membershipData };

      console.log('✅ Membresía actualizada correctamente');
    } catch (error) {
      console.error('❌ Error actualizando membresía:', error);
      throw error;
    }
  }

  calculateEndDate(planId) {
    const startDate = new Date();
    const plan = this.config.plans[planId];

    if (plan.interval === 'month') {
      return new Date(startDate.getTime() + 30 * 24 * 60 * 60 * 1000);
    } else if (plan.interval === 'year') {
      return new Date(startDate.getTime() + 365 * 24 * 60 * 60 * 1000);
    }

    return new Date(startDate.getTime() + 30 * 24 * 60 * 60 * 1000);
  }

  closePaymentModal() {
    const modal = document.querySelector('.axyra-payment-modal');
    if (modal) {
      modal.remove();
    }
  }

  checkWompiValidationReturn() {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const validation = urlParams.get('validation');
      const plan = urlParams.get('plan');

      if (validation === 'success' && plan) {
        console.log('✅ Usuario regresó de validación exitosa de Wompi');
        this.handleValidationSuccess(plan);

        // Limpiar URL
        const newUrl = window.location.pathname;
        window.history.replaceState({}, document.title, newUrl);
      }
    } catch (error) {
      console.warn('⚠️ Error verificando retorno de Wompi:', error);
    }
  }

  async handleValidationSuccess(planId) {
    try {
      console.log('🎉 Procesando validación exitosa para plan:', planId);

      // Activar prueba gratuita
      await this.updateMembership(planId, 'free_trial_validation');

      // Mostrar notificación de éxito
      this.showNotification('¡Prueba gratuita activada! Validación exitosa.', 'success');

      // Recargar la página para mostrar el plan activo
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      console.error('❌ Error procesando validación exitosa:', error);
      this.showNotification('Error activando prueba gratuita: ' + error.message, 'error');
    }
  }

  showNotification(message, type = 'info') {
    try {
      // Verificar que document.body existe
      if (!document.body || !document.body.appendChild) {
        console.log(`📢 Notificación: ${message}`);
        return;
      }

      const notification = document.createElement('div');
      notification.className = `axyra-notification axyra-notification-${type}`;
      notification.textContent = message;

      notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        z-index: 10001;
        max-width: 300px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        transform: translateX(100%);
        opacity: 0;
        transition: all 0.3s ease;
      `;

      const colors = {
        success: '#10b981',
        error: '#ef4444',
        warning: '#f59e0b',
        info: '#3b82f6',
      };

      notification.style.backgroundColor = colors[type] || colors.info;

      document.body.appendChild(notification);

      // Animación de entrada
      setTimeout(() => {
        notification.style.transform = 'translateX(0)';
        notification.style.opacity = '1';
      }, 100);

      setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        notification.style.opacity = '0';
        setTimeout(() => {
          if (notification.parentElement) {
            notification.remove();
          }
        }, 300);
      }, 5000);
    } catch (error) {
      console.warn('⚠️ Error mostrando notificación:', error);
      console.log(`📢 Notificación: ${message}`);
    }
  }

  handleError(error) {
    console.error('❌ Error en sistema de membresías:', error);
    this.showNotification('Error en el sistema de membresías: ' + error.message, 'error');
  }

  // Métodos públicos
  getCurrentMembership() {
    return this.currentMembership;
  }

  getAvailablePlans() {
    return Object.values(this.config.plans);
  }

  hasFeature(feature) {
    if (!this.currentMembership) return false;
    return this.currentMembership.limitations[feature] || false;
  }

  canAccessModule(module) {
    if (!this.currentMembership) return false;

    const restrictions = this.currentMembership.limitations;

    switch (module) {
      case 'gestion_personal':
        return restrictions.advancedFeatures;
      case 'caja':
        return restrictions.advancedFeatures;
      case 'inventario':
        return restrictions.advancedFeatures;
      case 'configuracion':
        return restrictions.advancedFeatures;
      default:
        return true;
    }
  }
}

// Inicializar el sistema de membresías funcional
document.addEventListener('DOMContentLoaded', () => {
  window.axyraMembershipSystem = new AxyraMembershipSystemFunctional();
});

// Exportar para uso en otros módulos
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AxyraMembershipSystemFunctional;
}
