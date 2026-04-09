/**
 * AXYRA - Configuración Simplificada de EmailJS
 * Solo 2 templates: Login Code y Payment Summary
 */

// Configuración simplificada para 2 templates
const EMAILJS_SIMPLE_CONFIG = {
  // IDs de los 2 templates más importantes
  TEMPLATES: {
    LOGIN_CODE: 'template_login_code', // Template #1 - MÁS IMPORTANTE
    PAYMENT_SUMMARY: 'template_payment_summary' // Template #2 - SEGUNDO MÁS IMPORTANTE
  },
  
  // Configuración del servicio
  SERVICE_ID: 'service_dvqt6fd', // Tu Service ID
  USER_ID: 'YOUR_USER_ID', // Necesitas reemplazar esto con tu User ID
  
  // Configuración de correos
  FROM_NAME: 'AXYRA',
  FROM_EMAIL: 'noreply@axyra.com',
  SUPPORT_EMAIL: 'soporte@axyra.com',
  HR_EMAIL: 'rrhh@axyra.com'
};

// Plantillas HTML simplificadas para los 2 templates
const SIMPLE_EMAIL_TEMPLATES = {
  // Template #1: Código de Inicio de Sesión
  LOGIN_CODE: `
    <div style="font-family: system-ui, sans-serif, Arial; font-size: 16px; background-color: #fff8f1">
      <div style="max-width: 600px; margin: auto; padding: 16px">
        <a style="text-decoration: none; outline: none" href="{{login_url}}" target="_blank">
          <img
            style="height: 32px; vertical-align: middle"
            height="32px"
            src="cid:logo.png"
            alt="AXYRA Logo"
          />
        </a>
        <h2 style="color: #007bff; margin: 20px 0;">🔐 Código de Acceso AXYRA</h2>
        <p>Hola {{to_name}},</p>
        <p>Has solicitado iniciar sesión en <strong>AXYRA</strong>. Usa el siguiente código:</p>
        
        <div style="background: #f8f9fa; padding: 30px; text-align: center; border-radius: 8px; margin: 20px 0;">
          <h1 style="color: #007bff; font-size: 36px; margin: 0; letter-spacing: 5px; font-family: monospace;">{{login_code}}</h1>
        </div>
        
        <p style="color: #ff6b6b; font-weight: bold; text-align: center;">
          ⏰ Este código expira en {{code_expires}}
        </p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a
            style="
              display: inline-block;
              text-decoration: none;
              outline: none;
              color: #fff;
              background-color: #007bff;
              padding: 12px 24px;
              border-radius: 6px;
              font-weight: bold;
            "
            href="{{login_url}}"
            target="_blank"
          >
            Iniciar Sesión
          </a>
        </div>
        
        <p style="color: #666; font-size: 14px;">
          Si no solicitaste este código, ignora este correo.
        </p>
        
        <p style="color: #666; font-size: 14px; margin-top: 20px;">
          ¿Necesitas ayuda? Contáctanos: {{support_email}}
        </p>
        
        <p style="color: #666; font-size: 12px; margin-top: 30px; text-align: center;">
          © {{current_year}} AXYRA - Sistema de Gestión Empresarial
        </p>
      </div>
    </div>
  `,

  // Template #2: Resumen de Pagos
  PAYMENT_SUMMARY: `
    <div style="font-family: system-ui, sans-serif, Arial; font-size: 16px; background-color: #fff8f1">
      <div style="max-width: 600px; margin: auto; padding: 16px">
        <a style="text-decoration: none; outline: none" href="{{login_url}}" target="_blank">
          <img
            style="height: 32px; vertical-align: middle"
            height="32px"
            src="cid:logo.png"
            alt="AXYRA Logo"
          />
        </a>
        <h2 style="color: #007bff; margin: 20px 0;">💳 Confirmación de Pago AXYRA</h2>
        <p>Hola {{to_name}},</p>
        <p>Hemos recibido tu pago exitosamente. Aquí está el resumen:</p>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #007bff; margin-bottom: 15px;">📋 Detalles del Pago</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #666; font-weight: bold;">Plan:</td>
              <td style="padding: 8px 0; color: #333;">{{plan_name}}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #666; font-weight: bold;">Duración:</td>
              <td style="padding: 8px 0; color: #333;">{{plan_duration}}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #666; font-weight: bold;">Monto:</td>
              <td style="padding: 8px 0; color: #333; font-weight: bold; font-size: 18px;">{{payment_amount}}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #666; font-weight: bold;">Método:</td>
              <td style="padding: 8px 0; color: #333;">{{payment_method}}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #666; font-weight: bold;">Fecha:</td>
              <td style="padding: 8px 0; color: #333;">{{payment_date}}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #666; font-weight: bold;">ID Transacción:</td>
              <td style="padding: 8px 0; color: #333; font-family: monospace;">{{transaction_id}}</td>
            </tr>
          </table>
        </div>
        
        <p style="color: #666; line-height: 1.6;">
          <strong>🔄 Próximo Pago:</strong> {{next_payment}}
        </p>
        
        <p style="color: #666; line-height: 1.6;">
          ¡Gracias por confiar en AXYRA! Tu suscripción está activa.
        </p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a
            style="
              display: inline-block;
              text-decoration: none;
              outline: none;
              color: #fff;
              background-color: #007bff;
              padding: 12px 24px;
              border-radius: 6px;
              font-weight: bold;
            "
            href="{{login_url}}"
            target="_blank"
          >
            Acceder a mi cuenta
          </a>
        </div>
        
        <p style="color: #666; font-size: 14px;">
          ¿Preguntas sobre tu pago? Contáctanos: {{support_email}}
        </p>
        
        <p style="color: #666; font-size: 12px; margin-top: 30px; text-align: center;">
          © {{current_year}} AXYRA - Sistema de Gestión Empresarial
        </p>
      </div>
    </div>
  `
};

// Exportar configuración simplificada
window.EMAILJS_SIMPLE_CONFIG = EMAILJS_SIMPLE_CONFIG;
window.SIMPLE_EMAIL_TEMPLATES = SIMPLE_EMAIL_TEMPLATES;
