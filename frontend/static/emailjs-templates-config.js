/**
 * AXYRA - Configuración de Plantillas EmailJS
 * Configuración para las plantillas de correo electrónico
 */

// Configuración de plantillas EmailJS
const EMAILJS_TEMPLATES = {
  // IDs de las plantillas (debes reemplazarlos con los reales de tu cuenta EmailJS)
  WELCOME: 'template_welcome',
  LOGIN_CODE: 'template_login_code', 
  PASSWORD_RESET: 'template_password_reset',
  PAYMENT_SUMMARY: 'template_payment_summary',
  PAYROLL_NOTIFICATION: 'template_payroll_notification',
  
  // Configuración del servicio
  SERVICE_ID: 'service_dvqt6fd', // Tu Service ID
  USER_ID: 'YOUR_USER_ID', // Necesitas reemplazar esto con tu User ID
  
  // Configuración de correos
  FROM_NAME: 'AXYRA',
  FROM_EMAIL: 'noreply@axyra.com',
  SUPPORT_EMAIL: 'soporte@axyra.com',
  HR_EMAIL: 'rrhh@axyra.com'
};

// Plantillas HTML para EmailJS
const EMAIL_TEMPLATES = {
  // Plantilla de Bienvenida
  WELCOME: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
      <div style="background: linear-gradient(135deg, #007bff 0%, #0056b3 100%); color: white; padding: 30px; text-align: center;">
        <h1 style="margin: 0; font-size: 28px;">🎉 ¡Bienvenido a AXYRA!</h1>
        <p style="margin: 10px 0 0 0; font-size: 16px;">Sistema de Gestión Empresarial</p>
      </div>
      
      <div style="padding: 30px;">
        <h2 style="color: #333; margin-bottom: 20px;">Hola {{to_name}},</h2>
        
        <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
          ¡Nos complace darte la bienvenida a <strong>AXYRA</strong>! Tu cuenta ha sido creada exitosamente.
        </p>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #007bff; margin-bottom: 15px;">🚀 ¿Qué puedes hacer ahora?</h3>
          <ul style="color: #666; line-height: 1.8;">
            <li>Gestionar empleados y nóminas</li>
            <li>Controlar inventario y caja</li>
            <li>Generar reportes automáticos</li>
            <li>Acceder a todas las funcionalidades premium</li>
          </ul>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="{{login_url}}" style="background: #007bff; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">
            Acceder a mi cuenta
          </a>
        </div>
        
        <p style="color: #666; font-size: 14px; margin-top: 30px;">
          Si tienes alguna pregunta, no dudes en contactarnos:<br>
          📧 {{support_email}}
        </p>
      </div>
      
      <div style="background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 12px;">
        <p>© {{current_year}} AXYRA - Sistema de Gestión Empresarial</p>
      </div>
    </div>
  `,

  // Plantilla de Código de Inicio
  LOGIN_CODE: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
      <div style="background: linear-gradient(135deg, #007bff 0%, #0056b3 100%); color: white; padding: 30px; text-align: center;">
        <h1 style="margin: 0; font-size: 28px;">🔐 Código de Inicio de Sesión</h1>
        <p style="margin: 10px 0 0 0; font-size: 16px;">AXYRA - Acceso Seguro</p>
      </div>
      
      <div style="padding: 30px;">
        <h2 style="color: #333; margin-bottom: 20px;">Hola {{to_name}},</h2>
        
        <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
          Has solicitado iniciar sesión en <strong>AXYRA</strong>. Usa el siguiente código para acceder:
        </p>
        
        <div style="background: #f8f9fa; padding: 30px; text-align: center; border-radius: 8px; margin: 30px 0;">
          <h2 style="color: #007bff; font-size: 36px; margin: 0; letter-spacing: 5px; font-family: monospace;">{{login_code}}</h2>
        </div>
        
        <p style="color: #ff6b6b; font-weight: bold; text-align: center; margin: 20px 0;">
          ⏰ Este código expira en {{code_expires}}
        </p>
        
        <p style="color: #666; font-size: 14px; margin-top: 30px;">
          Si no solicitaste este código, ignora este correo.
        </p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="{{login_url}}" style="background: #007bff; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">
            Iniciar Sesión
          </a>
        </div>
      </div>
      
      <div style="background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 12px;">
        <p>© {{current_year}} AXYRA - Sistema de Gestión Empresarial</p>
      </div>
    </div>
  `,

  // Plantilla de Reinicio de Contraseña
  PASSWORD_RESET: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
      <div style="background: linear-gradient(135deg, #007bff 0%, #0056b3 100%); color: white; padding: 30px; text-align: center;">
        <h1 style="margin: 0; font-size: 28px;">🔑 Reiniciar Contraseña</h1>
        <p style="margin: 10px 0 0 0; font-size: 16px;">AXYRA - Recuperación de Acceso</p>
      </div>
      
      <div style="padding: 30px;">
        <h2 style="color: #333; margin-bottom: 20px;">Hola {{to_name}},</h2>
        
        <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
          Has solicitado reiniciar tu contraseña en <strong>AXYRA</strong>.
        </p>
        
        <p style="color: #666; line-height: 1.6; margin-bottom: 30px;">
          Haz clic en el siguiente enlace para crear una nueva contraseña:
        </p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="{{reset_url}}" style="background: #007bff; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">
            Reiniciar Contraseña
          </a>
        </div>
        
        <p style="color: #ff6b6b; font-weight: bold; text-align: center; margin: 20px 0;">
          ⏰ Este enlace expira en {{token_expires}}
        </p>
        
        <p style="color: #666; font-size: 14px; margin-top: 30px;">
          Si no solicitaste este cambio, ignora este correo. Tu contraseña actual seguirá siendo válida.
        </p>
        
        <p style="color: #666; font-size: 14px; margin-top: 20px;">
          ¿Necesitas ayuda? Contáctanos: {{support_email}}
        </p>
      </div>
      
      <div style="background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 12px;">
        <p>© {{current_year}} AXYRA - Sistema de Gestión Empresarial</p>
      </div>
    </div>
  `,

  // Plantilla de Resumen de Pago
  PAYMENT_SUMMARY: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
      <div style="background: linear-gradient(135deg, #007bff 0%, #0056b3 100%); color: white; padding: 30px; text-align: center;">
        <h1 style="margin: 0; font-size: 28px;">💳 Resumen de Pago</h1>
        <p style="margin: 10px 0 0 0; font-size: 16px;">AXYRA - Confirmación de Pago</p>
      </div>
      
      <div style="padding: 30px;">
        <h2 style="color: #333; margin-bottom: 20px;">Hola {{to_name}},</h2>
        
        <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
          Hemos recibido tu pago exitosamente. Aquí está el resumen:
        </p>
        
        <div style="background: #f8f9fa; padding: 25px; border-radius: 8px; margin: 25px 0;">
          <h3 style="color: #007bff; margin-bottom: 20px;">📋 Detalles del Pago</h3>
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
              <td style="padding: 8px 0; color: #666; font-weight: bold;">ID de Transacción:</td>
              <td style="padding: 8px 0; color: #333; font-family: monospace;">{{transaction_id}}</td>
            </tr>
          </table>
        </div>
        
        <p style="color: #666; line-height: 1.6; margin: 25px 0;">
          <strong>🔄 Próximo Pago:</strong> {{next_payment}}
        </p>
        
        <p style="color: #666; line-height: 1.6; margin: 25px 0;">
          ¡Gracias por confiar en AXYRA! Tu suscripción está activa y puedes acceder a todas las funcionalidades.
        </p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="{{login_url}}" style="background: #007bff; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">
            Acceder a mi cuenta
          </a>
        </div>
        
        <p style="color: #666; font-size: 14px; margin-top: 30px;">
          ¿Preguntas sobre tu pago? Contáctanos: {{support_email}}
        </p>
      </div>
      
      <div style="background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 12px;">
        <p>© {{current_year}} AXYRA - Sistema de Gestión Empresarial</p>
      </div>
    </div>
  `,

  // Plantilla de Notificación de Nómina
  PAYROLL_NOTIFICATION: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
      <div style="background: linear-gradient(135deg, #007bff 0%, #0056b3 100%); color: white; padding: 30px; text-align: center;">
        <h1 style="margin: 0; font-size: 28px;">💰 Notificación de Nómina</h1>
        <p style="margin: 10px 0 0 0; font-size: 16px;">AXYRA - Recursos Humanos</p>
      </div>
      
      <div style="padding: 30px;">
        <h2 style="color: #333; margin-bottom: 20px;">Hola {{to_name}},</h2>
        
        <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
          Tu nómina para el período <strong>{{payroll_period}}</strong> está lista.
        </p>
        
        <div style="background: #f8f9fa; padding: 25px; border-radius: 8px; margin: 25px 0;">
          <h3 style="color: #007bff; margin-bottom: 20px;">📊 Resumen de Nómina</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #666; font-weight: bold;">Período:</td>
              <td style="padding: 8px 0; color: #333;">{{payroll_period}}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #666; font-weight: bold;">Total Horas:</td>
              <td style="padding: 8px 0; color: #333;">{{total_hours}}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #666; font-weight: bold;">Salario Bruto:</td>
              <td style="padding: 8px 0; color: #333;">{{gross_salary}}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #666; font-weight: bold;">Deducciones:</td>
              <td style="padding: 8px 0; color: #333;">{{deductions}}</td>
            </tr>
            <tr style="border-top: 2px solid #007bff;">
              <td style="padding: 8px 0; color: #007bff; font-weight: bold; font-size: 16px;">Salario Neto:</td>
              <td style="padding: 8px 0; color: #007bff; font-weight: bold; font-size: 18px;">{{net_salary}}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #666; font-weight: bold;">Fecha de Pago:</td>
              <td style="padding: 8px 0; color: #333;">{{payment_date}}</td>
            </tr>
          </table>
        </div>
        
        <p style="color: #666; line-height: 1.6; margin: 25px 0;">
          Tu pago será procesado según el método de pago configurado.
        </p>
        
        <p style="color: #666; font-size: 14px; margin-top: 30px;">
          ¿Preguntas sobre tu nómina? Contáctanos: {{hr_email}}
        </p>
      </div>
      
      <div style="background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 12px;">
        <p>© {{current_year}} AXYRA - Sistema de Gestión Empresarial</p>
      </div>
    </div>
  `
};

// Exportar configuración
window.EMAILJS_TEMPLATES = EMAILJS_TEMPLATES;
window.EMAIL_TEMPLATES = EMAIL_TEMPLATES;
