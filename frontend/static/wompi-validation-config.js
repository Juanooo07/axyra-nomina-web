// ========================================
// CONFIGURACIÓN DE VALIDACIÓN WOMPI AXYRA
// ========================================

class AxyraWompiValidation {
  constructor() {
    this.config = {
      // Configuración para validación de identidad
      validationAmount: 200, // $200 COP para validación
      currency: 'COP',
      description: 'Validación de identidad - Prueba gratuita AXYRA',

      // Configuración de Wompi
      wompiConfig: {
        publicKey: 'pub_prod_DMd1RNFhiA3813HZ3YZFsNjSg2beSS00', // Clave pública de Wompi
        environment: 'production', // 'test' o 'production'
        redirectUrl: window.location.origin + '/modulos/membresias/membresias.html?success=true',
      },

      // Configuración de pruebas gratuitas
      freeTrialConfig: {
        duration: 7, // días
        maxValidations: 1, // máximo 1 validación por usuario
        validationRequired: true, // requiere validación para activar
      },
    };

    this.init();
  }

  init() {
    console.log('🔐 Inicializando validación Wompi AXYRA...');
    this.loadWompiSDK();
  }

  loadWompiSDK() {
    try {
      // Cargar SDK de Wompi si no está cargado
      if (typeof window.WompiWidget === 'undefined') {
        const script = document.createElement('script');
        script.src = 'https://checkout.wompi.co/widget.js';
        script.async = true;
        script.onload = () => {
          console.log('✅ SDK de Wompi cargado');
          this.setupWompiWidget();
        };
        document.head.appendChild(script);
      } else {
        this.setupWompiWidget();
      }
    } catch (error) {
      console.error('❌ Error cargando SDK de Wompi:', error);
    }
  }

  setupWompiWidget() {
    try {
      if (window.WompiWidget) {
        console.log('🔧 Configurando widget de Wompi...');
        // Configurar widget de Wompi para validaciones
        window.axyraWompiValidation = this;
      }
    } catch (error) {
      console.error('❌ Error configurando widget de Wompi:', error);
    }
  }

  // Procesar validación de identidad
  async processIdentityValidation(plan, userInfo = {}) {
    try {
      console.log('🔐 Procesando validación de identidad...', {
        plan: plan.id,
        amount: this.config.validationAmount,
        userInfo,
      });

      // Verificar si el usuario ya tiene una validación previa
      if (this.hasPreviousValidation()) {
        throw new Error('Ya tienes una validación de identidad activa');
      }

      // Crear transacción de validación
      const validationTransaction = {
        amount: this.config.validationAmount,
        currency: this.config.currency,
        description: this.config.description,
        reference: `validation_${Date.now()}_${plan.id}`,
        customer: {
          email: userInfo.email || 'usuario@axyra.com',
          name: userInfo.name || 'Usuario AXYRA',
        },
        plan: plan.id,
        type: 'validation',
      };

      // Procesar con Wompi
      return await this.processWompiValidation(validationTransaction);
    } catch (error) {
      console.error('❌ Error en validación de identidad:', error);
      throw error;
    }
  }

  // Verificar si tiene validación previa
  hasPreviousValidation() {
    try {
      const storedValidation = localStorage.getItem('axyra_validation');
      if (storedValidation) {
        const validation = JSON.parse(storedValidation);
        const validationDate = new Date(validation.date);
        const daysSinceValidation = (Date.now() - validationDate.getTime()) / (1000 * 60 * 60 * 24);

        // Si la validación es menor a 30 días, es válida
        return daysSinceValidation < 30;
      }
      return false;
    } catch (error) {
      console.warn('⚠️ Error verificando validación previa:', error);
      return false;
    }
  }

  // Procesar validación con Wompi
  async processWompiValidation(transaction) {
    try {
      console.log('💳 Procesando validación con Wompi...', transaction);

      // Aquí iría la integración real con Wompi
      // Por ahora simulamos el proceso

      return new Promise((resolve, reject) => {
        // Simular procesamiento de Wompi
        setTimeout(() => {
          // Simular respuesta exitosa de Wompi
          const wompiResponse = {
            success: true,
            transactionId: `wompi_${Date.now()}`,
            amount: transaction.amount,
            currency: transaction.currency,
            status: 'APPROVED',
            reference: transaction.reference,
          };

          // Guardar validación en localStorage
          this.saveValidation(transaction.plan, wompiResponse);

          resolve(wompiResponse);
        }, 2000);
      });
    } catch (error) {
      console.error('❌ Error procesando validación con Wompi:', error);
      throw error;
    }
  }

  // Guardar validación
  saveValidation(planId, wompiResponse) {
    try {
      const validationData = {
        planId: planId,
        date: new Date().toISOString(),
        amount: wompiResponse.amount,
        transactionId: wompiResponse.transactionId,
        status: wompiResponse.status,
        reference: wompiResponse.reference,
      };

      localStorage.setItem('axyra_validation', JSON.stringify(validationData));
      console.log('✅ Validación guardada:', validationData);
    } catch (error) {
      console.error('❌ Error guardando validación:', error);
    }
  }

  // Obtener información de validación
  getValidationInfo() {
    try {
      const storedValidation = localStorage.getItem('axyra_validation');
      if (storedValidation) {
        return JSON.parse(storedValidation);
      }
      return null;
    } catch (error) {
      console.warn('⚠️ Error obteniendo información de validación:', error);
      return null;
    }
  }

  // Verificar si la validación es válida
  isValidationValid() {
    const validation = this.getValidationInfo();
    if (!validation) return false;

    const validationDate = new Date(validation.date);
    const daysSinceValidation = (Date.now() - validationDate.getTime()) / (1000 * 60 * 60 * 24);

    return daysSinceValidation < 30; // Válida por 30 días
  }

  // Limpiar validación (para testing)
  clearValidation() {
    localStorage.removeItem('axyra_validation');
    console.log('🧹 Validación limpiada');
  }
}

// Inicializar validación Wompi
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.axyraWompiValidation = new AxyraWompiValidation();
  });
} else {
  window.axyraWompiValidation = new AxyraWompiValidation();
}

// Exportar para uso en otros módulos
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AxyraWompiValidation;
}
