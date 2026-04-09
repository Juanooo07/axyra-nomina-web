/**
 * 🚀 AXYRA EmailJS Fallback System
 * Sistema de respaldo para envío de correos cuando EmailJS falla
 */

class AxyraEmailFallback {
  constructor() {
    this.isAvailable = false;
    this.init();
  }

  init() {
    console.log('🔄 AXYRA Email Fallback System inicializado');
    this.checkEmailJSAvailability();
  }

  checkEmailJSAvailability() {
    // Verificar si EmailJS está disponible
    if (typeof emailjs !== 'undefined' && window.AxyraEmailService) {
      this.isAvailable = true;
      console.log('✅ EmailJS disponible, usando servicio principal');
    } else {
      this.isAvailable = false;
      console.log('⚠️ EmailJS no disponible, usando modo fallback');
    }
  }

  async sendLoginCode(email, code) {
    try {
      console.log(`📧 [FALLBACK] Enviando código de login a: ${email}`);

      if (this.isAvailable && window.AxyraEmailService) {
        // Usar servicio principal si está disponible
        return await window.AxyraEmailService.sendLoginCode(email, code);
      } else {
        // Modo fallback: mostrar código en consola y alerta
        this.showFallbackCode(email, code);
        return { success: true, fallback: true };
      }
    } catch (error) {
      console.error('❌ Error en fallback de envío:', error);
      this.showFallbackCode(email, code);
      return { success: true, fallback: true };
    }
  }

  showFallbackCode(email, code) {
    // Mostrar código en consola
    console.log(`🔑 CÓDIGO DE ACCESO PARA ${email}: ${code}`);
    console.log('⏰ Este código expira en 10 minutos');

    // Mostrar alerta al usuario
    const message = `Código de acceso: ${code}\n\nEste código expira en 10 minutos.\n\nEn modo desarrollo, el código se muestra aquí.`;

    // Crear modal personalizado
    this.showCodeModal(email, code, message);
  }

  showCodeModal(email, code, message) {
    // Crear modal si no existe
    let modal = document.getElementById('axyra-code-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'axyra-code-modal';
      modal.innerHTML = `
        <div class="axyra-modal-overlay">
          <div class="axyra-modal-content">
            <div class="axyra-modal-header">
              <h3>🔑 Código de Acceso</h3>
              <button class="axyra-modal-close">&times;</button>
            </div>
            <div class="axyra-modal-body">
              <p><strong>Email:</strong> ${email}</p>
              <div class="axyra-code-display">
                <span class="axyra-code-number">${code}</span>
              </div>
              <p class="axyra-code-info">⏰ Este código expira en 10 minutos</p>
              <p class="axyra-code-note">💡 En modo desarrollo, el código se muestra aquí</p>
            </div>
            <div class="axyra-modal-footer">
              <button class="axyra-btn axyra-btn-primary" onclick="this.closest('.axyra-modal-overlay').style.display='none'">
                Entendido
              </button>
            </div>
          </div>
        </div>
      `;

      // Agregar estilos
      const styles = document.createElement('style');
      styles.textContent = `
        .axyra-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10000;
        }
        
        .axyra-modal-content {
          background: white;
          border-radius: 12px;
          max-width: 400px;
          width: 90%;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
          animation: axyra-modal-slide 0.3s ease;
        }
        
        @keyframes axyra-modal-slide {
          from { transform: translateY(-50px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        
        .axyra-modal-header {
          padding: 20px 20px 0;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .axyra-modal-header h3 {
          margin: 0;
          color: #2d3748;
          font-size: 18px;
        }
        
        .axyra-modal-close {
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
          color: #718096;
          padding: 0;
          width: 30px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .axyra-modal-body {
          padding: 20px;
          text-align: center;
        }
        
        .axyra-code-display {
          background: #f7fafc;
          border: 2px solid #e2e8f0;
          border-radius: 8px;
          padding: 20px;
          margin: 15px 0;
        }
        
        .axyra-code-number {
          font-size: 32px;
          font-weight: bold;
          color: #4f81bd;
          letter-spacing: 4px;
          font-family: 'Courier New', monospace;
        }
        
        .axyra-code-info {
          color: #4a5568;
          font-size: 14px;
          margin: 10px 0;
        }
        
        .axyra-code-note {
          color: #718096;
          font-size: 12px;
          font-style: italic;
        }
        
        .axyra-modal-footer {
          padding: 0 20px 20px;
          text-align: center;
        }
        
        .axyra-btn {
          padding: 10px 20px;
          border: none;
          border-radius: 6px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .axyra-btn-primary {
          background: #4f81bd;
          color: white;
        }
        
        .axyra-btn-primary:hover {
          background: #3d6ba3;
          transform: translateY(-1px);
        }
      `;

      document.head.appendChild(styles);
      document.body.appendChild(modal);
    }

    // Mostrar modal
    modal.style.display = 'flex';

    // Cerrar modal al hacer click en overlay
    modal.querySelector('.axyra-modal-overlay').addEventListener('click', (e) => {
      if (e.target === e.currentTarget) {
        modal.style.display = 'none';
      }
    });

    // Cerrar modal con botón X
    modal.querySelector('.axyra-modal-close').addEventListener('click', () => {
      modal.style.display = 'none';
    });
  }

  async sendWelcomeEmail(userData) {
    if (this.isAvailable && window.AxyraEmailService) {
      return await window.AxyraEmailService.sendWelcomeEmail(userData);
    } else {
      console.log('📧 [FALLBACK] Correo de bienvenida simulado');
      return { success: true, fallback: true };
    }
  }

  async sendPaymentSummary(paymentData) {
    if (this.isAvailable && window.AxyraEmailService) {
      return await window.AxyraEmailService.sendPaymentSummary(paymentData);
    } else {
      console.log('📧 [FALLBACK] Resumen de pago simulado');
      return { success: true, fallback: true };
    }
  }
}

// Inicializar sistema de fallback
window.AxyraEmailFallback = new AxyraEmailFallback();

console.log('✅ AXYRA Email Fallback System cargado');


