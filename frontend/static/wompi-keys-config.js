// ========================================
// CONFIGURACIÓN DE CLAVES WOMPI AXYRA
// ========================================

class AxyraWompiKeys {
  constructor() {
    this.config = {
      // Claves de Wompi - CONFIGURADAS CON TUS CLAVES REALES
      publicKey: 'pub_prod_DMd1RNFhiA3813HZ3YZFsNjSg2beSS00', // Tu clave pública de Wompi
      privateKey: 'prv_prod_aka7VAtItpCAF3qhVuD8zvt7FUWXduPY', // Tu clave privada de Wompi

      // Configuración de entorno
      environment: 'production', // 'test' o 'production'

      // URLs de Wompi
      urls: {
        test: 'https://checkout.wompi.co/l/',
        production: 'https://checkout.wompi.co/l/',
      },

      // Configuración de validación
      validation: {
        amount: 200, // $200 COP para validación
        currency: 'COP',
        description: 'Validación de identidad - Prueba gratuita AXYRA',
      },
    };

    this.init();
  }

  init() {
    console.log('🔑 Inicializando configuración de claves Wompi...');
    this.loadEnvironmentKeys();
  }

  loadEnvironmentKeys() {
    try {
      // Intentar cargar claves desde variables de entorno
      if (typeof process !== 'undefined' && process.env) {
        this.config.publicKey = process.env.WOMPI_PUBLIC_KEY || this.config.publicKey;
        this.config.privateKey = process.env.WOMPI_PRIVATE_KEY || this.config.privateKey;
        this.config.environment = process.env.WOMPI_ENVIRONMENT || this.config.environment;
      }

      console.log('🔑 Claves Wompi configuradas:', {
        environment: this.config.environment,
        publicKey: this.config.publicKey.substring(0, 10) + '...',
      });
    } catch (error) {
      console.warn('⚠️ Error cargando claves de entorno:', error);
    }
  }

  // Obtener clave pública
  getPublicKey() {
    return this.config.publicKey;
  }

  // Obtener clave privada
  getPrivateKey() {
    return this.config.privateKey;
  }

  // Obtener entorno
  getEnvironment() {
    return this.config.environment;
  }

  // Obtener URL de Wompi
  getWompiUrl() {
    return this.config.urls[this.config.environment];
  }

  // Obtener configuración de validación
  getValidationConfig() {
    return this.config.validation;
  }

  // Crear enlace de validación
  createValidationLink(plan) {
    try {
      const validationConfig = this.getValidationConfig();
      const wompiUrl = this.getWompiUrl();

      const params = new URLSearchParams({
        'public-key': this.getPublicKey(),
        currency: validationConfig.currency,
        'amount-in-cents': (validationConfig.amount * 100).toString(),
        reference: `validation_${Date.now()}_${plan.id}`,
        'customer-email': 'usuario@axyra.com',
        'customer-name': 'Usuario AXYRA',
        description: `${validationConfig.description} - ${plan.name}`,
        'redirect-url':
          window.location.origin + '/modulos/membresias/membresias.html?validation=success&plan=' + plan.id,
      });

      return `${wompiUrl}?${params.toString()}`;
    } catch (error) {
      console.error('❌ Error creando enlace de validación:', error);
      throw error;
    }
  }

  // Crear enlace de pago completo
  createFullPaymentLink(plan) {
    try {
      const wompiUrl = this.getWompiUrl();

      const params = new URLSearchParams({
        'public-key': this.getPublicKey(),
        currency: 'COP',
        'amount-in-cents': (plan.price * 100).toString(),
        reference: `payment_${Date.now()}_${plan.id}`,
        'customer-email': 'usuario@axyra.com',
        'customer-name': 'Usuario AXYRA',
        description: `Pago completo - ${plan.name}`,
        'redirect-url': window.location.origin + '/modulos/membresias/membresias.html?payment=success&plan=' + plan.id,
      });

      return `${wompiUrl}?${params.toString()}`;
    } catch (error) {
      console.error('❌ Error creando enlace de pago completo:', error);
      throw error;
    }
  }
}

// Inicializar configuración de claves
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.axyraWompiKeys = new AxyraWompiKeys();
  });
} else {
  window.axyraWompiKeys = new AxyraWompiKeys();
}

// Exportar para uso en otros módulos
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AxyraWompiKeys;
}
