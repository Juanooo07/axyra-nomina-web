// ========================================
// SISTEMA DE MEMBRESÍAS PROFESIONAL AXYRA
// ========================================

console.log('💎 Inicializando sistema de membresías...');

class AxyraMembershipSystem {
  constructor() {
    this.memberships = {
      free: {
        name: 'Gratis',
        price: 0,
        features: [
          'Acceso básico al sistema',
          'Hasta 5 empleados',
          'Reportes básicos',
          'Soporte por email'
        ],
        limitations: {
          maxEmployees: 5,
          maxReports: 10,
          advancedFeatures: false,
          prioritySupport: false
        }
      },
      basic: {
        name: 'Básico',
        price: 29.99,
        features: [
          'Hasta 25 empleados',
          'Reportes avanzados',
          'Dashboard completo',
          'Gestión de horas',
          'Soporte prioritario'
        ],
        limitations: {
          maxEmployees: 25,
          maxReports: 100,
          advancedFeatures: true,
          prioritySupport: true
        }
      },
      professional: {
        name: 'Profesional',
        price: 59.99,
        features: [
          'Empleados ilimitados',
          'Todas las funcionalidades',
          'Nómina avanzada',
          'Reportes personalizados',
          'Soporte 24/7',
          'API personalizada'
        ],
        limitations: {
          maxEmployees: -1, // Ilimitado
          maxReports: -1, // Ilimitado
          advancedFeatures: true,
          prioritySupport: true,
          apiAccess: true
        }
      },
      enterprise: {
        name: 'Empresarial',
        price: 99.99,
        features: [
          'Todo lo anterior',
          'Múltiples sucursales',
          'Integración personalizada',
          'Soporte dedicado',
          'Capacitación incluida',
          'SLA garantizado'
        ],
        limitations: {
          maxEmployees: -1,
          maxReports: -1,
          advancedFeatures: true,
          prioritySupport: true,
          apiAccess: true,
          multiBranch: true,
          customIntegration: true
        }
      }
    };
    
    this.currentMembership = this.getCurrentMembership();
    this.init();
  }

  init() {
    this.setupMembershipUI();
    this.checkFeatureAccess();
    console.log('✅ Sistema de membresías inicializado');
  }

  getCurrentMembership() {
    const saved = localStorage.getItem('axyra_membership');
    return saved ? JSON.parse(saved) : this.memberships.free;
  }

  setMembership(membershipType) {
    if (this.memberships[membershipType]) {
      this.currentMembership = this.memberships[membershipType];
      localStorage.setItem('axyra_membership', JSON.stringify(this.currentMembership));
      this.checkFeatureAccess();
      this.updateUI();
      console.log(`💎 Membresía actualizada a: ${this.currentMembership.name}`);
    }
  }

  checkFeatureAccess() {
    const user = localStorage.getItem('axyra_isolated_user');
    if (!user) {
      this.showMembershipModal();
      return false;
    }

    // Verificar límites de empleados
    const employees = JSON.parse(localStorage.getItem('axyra_employees') || '[]');
    if (this.currentMembership.limitations.maxEmployees > 0 && 
        employees.length >= this.currentMembership.limitations.maxEmployees) {
      this.showUpgradeModal('employees');
      return false;
    }

    return true;
  }

  canAccessFeature(feature) {
    switch(feature) {
      case 'dashboard':
        return this.currentMembership.limitations.advancedFeatures;
      case 'employees':
        return this.checkEmployeeLimit();
      case 'nomina':
        return this.currentMembership.limitations.advancedFeatures;
      case 'reportes':
        return this.currentMembership.limitations.advancedFeatures;
      case 'configuracion':
        return this.currentMembership.limitations.advancedFeatures;
      default:
        return true;
    }
  }

  checkEmployeeLimit() {
    const employees = JSON.parse(localStorage.getItem('axyra_employees') || '[]');
    return this.currentMembership.limitations.maxEmployees === -1 || 
           employees.length < this.currentMembership.limitations.maxEmployees;
  }

  showMembershipModal() {
    const modal = document.createElement('div');
    modal.className = 'axyra-modal axyra-membership-modal';
    modal.style.display = 'flex';
    modal.innerHTML = `
      <div class="axyra-modal-content axyra-membership-content">
        <div class="axyra-modal-header">
          <h3>💎 Elige tu Plan AXYRA</h3>
          <button class="axyra-modal-close" onclick="this.closest('.axyra-modal').remove()">&times;</button>
        </div>
        <div class="axyra-modal-body">
          <div class="axyra-membership-grid">
            ${Object.entries(this.memberships).map(([key, plan]) => `
              <div class="axyra-membership-card ${key === 'professional' ? 'featured' : ''}">
                <div class="axyra-membership-header">
                  <h4>${plan.name}</h4>
                  <div class="axyra-membership-price">
                    <span class="axyra-price-currency">$</span>
                    <span class="axyra-price-amount">${plan.price}</span>
                    <span class="axyra-price-period">/mes</span>
                  </div>
                </div>
                <div class="axyra-membership-features">
                  ${plan.features.map(feature => `
                    <div class="axyra-feature-item">
                      <span class="axyra-feature-icon">✅</span>
                      <span class="axyra-feature-text">${feature}</span>
                    </div>
                  `).join('')}
                </div>
                <button class="axyra-btn axyra-btn-primary axyra-membership-btn" 
                        onclick="axyraMembership.selectPlan('${key}')">
                  ${plan.price === 0 ? 'Comenzar Gratis' : 'Seleccionar Plan'}
                </button>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  }

  showUpgradeModal(feature) {
    const modal = document.createElement('div');
    modal.className = 'axyra-modal axyra-upgrade-modal';
    modal.style.display = 'flex';
    modal.innerHTML = `
      <div class="axyra-modal-content">
        <div class="axyra-modal-header">
          <h3>🚀 Actualiza tu Plan</h3>
          <button class="axyra-modal-close" onclick="this.closest('.axyra-modal').remove()">&times;</button>
        </div>
        <div class="axyra-modal-body">
          <div class="axyra-upgrade-content">
            <div class="axyra-upgrade-icon">💎</div>
            <h4>¡Necesitas actualizar tu plan!</h4>
            <p>Esta funcionalidad está disponible en planes superiores.</p>
            <div class="axyra-upgrade-actions">
              <button class="axyra-btn axyra-btn-primary" onclick="axyraMembership.showMembershipModal()">
                Ver Planes
              </button>
              <button class="axyra-btn axyra-btn-secondary" onclick="this.closest('.axyra-modal').remove()">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  }

  selectPlan(planType) {
    // Redirigir a la página de membresías detallada
    window.location.href = 'membresias.html';
  }

  showSuccessMessage(message) {
    const notification = document.createElement('div');
    notification.className = 'axyra-notification axyra-notification-success';
    notification.innerHTML = `
      <div class="axyra-notification-content">
        <span class="axyra-notification-icon">✅</span>
        <span class="axyra-notification-text">${message}</span>
      </div>
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.classList.add('show');
    }, 100);
    
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }

  setupMembershipUI() {
    const styles = document.createElement('style');
    styles.textContent = `
      .axyra-membership-modal .axyra-modal-content {
        max-width: 1200px;
        width: 90%;
      }

      .axyra-membership-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: 20px;
        margin-top: 20px;
      }

      .axyra-membership-card {
        background: white;
        border-radius: 12px;
        padding: 24px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.1);
        transition: all 0.3s ease;
        border: 2px solid transparent;
        position: relative;
        overflow: hidden;
      }

      .axyra-membership-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 8px 30px rgba(0,0,0,0.15);
      }

      .axyra-membership-card.featured {
        border-color: #667eea;
        transform: scale(1.05);
      }

      .axyra-membership-card.featured::before {
        content: 'MÁS POPULAR';
        position: absolute;
        top: 0;
        right: 0;
        background: linear-gradient(135deg, #667eea, #764ba2);
        color: white;
        padding: 8px 16px;
        font-size: 12px;
        font-weight: bold;
        border-radius: 0 12px 0 12px;
      }

      .axyra-membership-header {
        text-align: center;
        margin-bottom: 20px;
      }

      .axyra-membership-header h4 {
        font-size: 24px;
        font-weight: bold;
        color: #333;
        margin: 0 0 10px 0;
      }

      .axyra-membership-price {
        display: flex;
        align-items: baseline;
        justify-content: center;
        gap: 4px;
      }

      .axyra-price-currency {
        font-size: 20px;
        color: #667eea;
        font-weight: bold;
      }

      .axyra-price-amount {
        font-size: 48px;
        color: #667eea;
        font-weight: bold;
      }

      .axyra-price-period {
        font-size: 16px;
        color: #666;
      }

      .axyra-membership-features {
        margin-bottom: 24px;
      }

      .axyra-feature-item {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 12px;
        padding: 8px 0;
      }

      .axyra-feature-icon {
        font-size: 16px;
        color: #4CAF50;
      }

      .axyra-feature-text {
        color: #333;
        font-size: 14px;
      }

      .axyra-membership-btn {
        width: 100%;
        padding: 12px 24px;
        font-size: 16px;
        font-weight: bold;
        border-radius: 8px;
        transition: all 0.3s ease;
      }

      .axyra-upgrade-content {
        text-align: center;
        padding: 40px 20px;
      }

      .axyra-upgrade-icon {
        font-size: 64px;
        margin-bottom: 20px;
      }

      .axyra-upgrade-content h4 {
        font-size: 24px;
        color: #333;
        margin-bottom: 16px;
      }

      .axyra-upgrade-content p {
        font-size: 16px;
        color: #666;
        margin-bottom: 24px;
      }

      .axyra-upgrade-actions {
        display: flex;
        gap: 16px;
        justify-content: center;
      }

      .axyra-notification {
        position: fixed;
        top: 20px;
        right: 20px;
        background: #4CAF50;
        color: white;
        padding: 16px 24px;
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.2);
        transform: translateX(400px);
        transition: transform 0.3s ease;
        z-index: 10001;
      }

      .axyra-notification.show {
        transform: translateX(0);
      }

      .axyra-notification-content {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .axyra-notification-icon {
        font-size: 20px;
      }

      .axyra-notification-text {
        font-weight: bold;
      }
    `;
    document.head.appendChild(styles);
  }

  updateUI() {
    // Actualizar indicadores de membresía en la UI
    const membershipIndicator = document.getElementById('axyra-membership-indicator');
    if (membershipIndicator) {
      membershipIndicator.textContent = this.currentMembership.name;
    }
  }
}

// Inicializar sistema de membresías
window.axyraMembership = new AxyraMembershipSystem();

console.log('✅ Sistema de membresías cargado');
