/**
 * 🚀 AXYRA Auth Login System
 * Sistema de autenticación con contraseña y códigos de acceso
 */

class AxyraAuthLoginSystem {
  constructor() {
    this.currentUser = null;
    this.loginAttempts = 0;
    this.maxAttempts = 3;
    this.lockoutTime = 15 * 60 * 1000; // 15 minutos
    this.init();
  }

  init() {
    console.log('🚀 AXYRA Auth Login System inicializado');
    this.setupEventListeners();
    this.checkExistingSession();
  }

  setupEventListeners() {
    // Escuchar cambios en el formulario de login
    document.addEventListener('DOMContentLoaded', () => {
      this.initializeLoginForm();
    });
  }

  initializeLoginForm() {
    const loginForm = document.getElementById('loginForm');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const codeInput = document.getElementById('code');
    const loginBtn = document.getElementById('loginBtn');
    const sendCodeBtn = document.getElementById('sendCodeBtn');

    if (loginForm) {
      // Cambiar entre login con contraseña y código
      this.setupLoginModeToggle();

      // Configurar formulario de login
      loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleLogin();
      });

      // Configurar botón de envío de código
      if (sendCodeBtn) {
        sendCodeBtn.addEventListener('click', (e) => {
          e.preventDefault();
          this.sendLoginCode();
        });
      }
    }
  }

  setupLoginModeToggle() {
    const passwordTab = document.getElementById('passwordTab');
    const codeTab = document.getElementById('codeTab');
    const passwordForm = document.getElementById('passwordForm');
    const codeForm = document.getElementById('codeForm');

    if (passwordTab && codeTab) {
      passwordTab.addEventListener('click', () => {
        this.switchToPasswordMode();
      });

      codeTab.addEventListener('click', () => {
        this.switchToCodeMode();
      });
    }
  }

  switchToPasswordMode() {
    const passwordForm = document.getElementById('passwordForm');
    const codeForm = document.getElementById('codeForm');
    const passwordTab = document.getElementById('passwordTab');
    const codeTab = document.getElementById('codeTab');

    if (passwordForm) passwordForm.style.display = 'block';
    if (codeForm) codeForm.style.display = 'none';
    if (passwordTab) passwordTab.classList.add('active');
    if (codeTab) codeTab.classList.remove('active');
  }

  switchToCodeMode() {
    const passwordForm = document.getElementById('passwordForm');
    const codeForm = document.getElementById('codeForm');
    const passwordTab = document.getElementById('passwordTab');
    const codeTab = document.getElementById('codeTab');

    if (passwordForm) passwordForm.style.display = 'none';
    if (codeForm) codeForm.style.display = 'block';
    if (passwordTab) passwordTab.classList.remove('active');
    if (codeTab) codeTab.classList.add('active');
  }

  async handleLogin() {
    const email = document.getElementById('email')?.value;
    const password = document.getElementById('password')?.value;
    const code = document.getElementById('code')?.value;

    if (!email) {
      this.showError('Por favor ingresa tu email');
      return;
    }

    // Verificar si está en modo contraseña o código
    const isPasswordMode = document.getElementById('passwordForm')?.style.display !== 'none';

    if (isPasswordMode) {
      if (!password) {
        this.showError('Por favor ingresa tu contraseña');
        return;
      }
      await this.loginWithPassword(email, password);
    } else {
      if (!code) {
        this.showError('Por favor ingresa el código de acceso');
        return;
      }
      await this.loginWithCode(email, code);
    }
  }

  async loginWithPassword(email, password) {
    try {
      this.showLoading('Iniciando sesión...');

      // Simular verificación de contraseña (en producción usarías Firebase Auth)
      const userData = this.verifyPassword(email, password);

      if (userData) {
        await this.completeLogin(userData);
      } else {
        this.handleLoginError('Email o contraseña incorrectos');
      }
    } catch (error) {
      console.error('❌ Error en login con contraseña:', error);
      this.handleLoginError('Error al iniciar sesión. Intenta nuevamente.');
    }
  }

  async loginWithCode(email, code) {
    try {
      this.showLoading('Verificando código...');

      // Verificar código de acceso
      const isValidCode = this.verifyAccessCode(email, code);

      if (isValidCode) {
        // Obtener datos del usuario
        const userData = this.getUserByEmail(email);
        await this.completeLogin(userData);
      } else {
        this.handleLoginError('Código de acceso inválido o expirado');
      }
    } catch (error) {
      console.error('❌ Error en login con código:', error);
      this.handleLoginError('Error al verificar el código. Intenta nuevamente.');
    }
  }

  verifyPassword(email, password) {
    // En producción, esto se haría con Firebase Auth
    // Por ahora, simulamos con datos locales
    const users = this.getStoredUsers();
    const user = users.find((u) => u.email === email && u.password === password);

    if (user) {
      return {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role || 'user',
        membership: user.membership || 'free',
      };
    }

    return null;
  }

  verifyAccessCode(email, code) {
    // Verificar código en localStorage
    const storedCode = localStorage.getItem(`axyra_login_code_${email}`);
    const codeData = storedCode ? JSON.parse(storedCode) : null;

    if (!codeData) {
      return false;
    }

    // Verificar si el código no ha expirado (10 minutos)
    const now = new Date().getTime();
    const codeTime = new Date(codeData.timestamp).getTime();
    const isExpired = now - codeTime > 10 * 60 * 1000;

    if (isExpired) {
      localStorage.removeItem(`axyra_login_code_${email}`);
      return false;
    }

    // Verificar si el código coincide
    return codeData.code === code;
  }

  async sendLoginCode() {
    const email = document.getElementById('email')?.value;

    if (!email) {
      this.showError('Por favor ingresa tu email');
      return;
    }

    try {
      this.showLoading('Enviando código de acceso...');

      // Generar código de 6 dígitos
      const code = Math.floor(100000 + Math.random() * 900000).toString();

      // Guardar código con timestamp
      const codeData = {
        code: code,
        timestamp: new Date().toISOString(),
        email: email,
      };

      localStorage.setItem(`axyra_login_code_${email}`, JSON.stringify(codeData));

      // Enviar código por email con fallback
      try {
        if (window.AxyraEmailFallback) {
          await window.AxyraEmailFallback.sendLoginCode(email, code);
        } else if (window.AxyraAutomaticEmailSender) {
          await window.AxyraAutomaticEmailSender.sendLoginCode(email, code);
        } else if (window.AxyraEmailService && window.AxyraEmailService.sendLoginCode) {
          await window.AxyraEmailService.sendLoginCode(email, code);
        } else {
          // Fallback manual
          console.log(`🔑 Código de acceso para ${email}: ${code}`);
          console.log('⚠️ EmailJS no disponible, usando modo desarrollo');
        }
      } catch (error) {
        console.error('❌ Error enviando código:', error);
        // Continuar con el proceso aunque falle el envío
        console.log(`🔑 Código de acceso para ${email}: ${code}`);
      }

      this.showSuccess('Código de acceso enviado a tu email');

      // Cambiar a modo código
      this.switchToCodeMode();
    } catch (error) {
      console.error('❌ Error enviando código:', error);
      this.handleLoginError('Error enviando código. Intenta nuevamente.');
    }
  }

  async completeLogin(userData) {
    try {
      // Guardar sesión
      localStorage.setItem('axyra_isolated_user', JSON.stringify(userData));
      localStorage.setItem('axyra_membership_plan', userData.membership);
      localStorage.setItem('axyra_membership_status', 'active');
      localStorage.setItem('axyra_login_timestamp', new Date().toISOString());

      // Limpiar código usado
      localStorage.removeItem(`axyra_login_code_${userData.email}`);

      this.showSuccess('¡Inicio de sesión exitoso!');

      // Redirigir al dashboard
      setTimeout(() => {
        window.location.href = 'modulos/dashboard/dashboard.html';
      }, 1500);
    } catch (error) {
      console.error('❌ Error completando login:', error);
      this.handleLoginError('Error al completar el inicio de sesión');
    }
  }

  handleLoginError(message) {
    this.loginAttempts++;
    this.hideLoading();
    this.showError(message);

    if (this.loginAttempts >= this.maxAttempts) {
      this.lockAccount();
    }
  }

  lockAccount() {
    const lockoutUntil = new Date().getTime() + this.lockoutTime;
    localStorage.setItem('axyra_account_locked', lockoutUntil.toString());

    this.showError(`Cuenta bloqueada por ${this.maxAttempts} intentos fallidos. Intenta en 15 minutos.`);

    // Deshabilitar formulario
    const loginBtn = document.getElementById('loginBtn');
    if (loginBtn) {
      loginBtn.disabled = true;
      loginBtn.textContent = 'Cuenta Bloqueada';
    }
  }

  checkExistingSession() {
    const userData = localStorage.getItem('axyra_isolated_user');
    const lockoutTime = localStorage.getItem('axyra_account_locked');

    // Verificar si la cuenta está bloqueada
    if (lockoutTime) {
      const now = new Date().getTime();
      const lockout = parseInt(lockoutTime);

      if (now < lockout) {
        const remainingTime = Math.ceil((lockout - now) / 60000);
        this.showError(`Cuenta bloqueada. Intenta en ${remainingTime} minutos.`);
        return;
      } else {
        localStorage.removeItem('axyra_account_locked');
        this.loginAttempts = 0;
      }
    }

    // Si ya hay una sesión activa, redirigir
    if (userData) {
      const user = JSON.parse(userData);
      const loginTime = localStorage.getItem('axyra_login_timestamp');

      if (loginTime) {
        const sessionAge = new Date().getTime() - new Date(loginTime).getTime();
        const maxSessionAge = 24 * 60 * 60 * 1000; // 24 horas

        if (sessionAge < maxSessionAge) {
          window.location.href = 'modulos/dashboard/dashboard.html';
          return;
        }
      }
    }
  }

  getStoredUsers() {
    // En producción, esto vendría de Firebase
    // Por ahora, simulamos usuarios
    return [
      {
        id: '1',
        email: 'admin@axyra.com',
        password: 'admin123',
        name: 'Administrador',
        role: 'admin',
        membership: 'enterprise',
      },
      {
        id: '2',
        email: 'user@axyra.com',
        password: 'user123',
        name: 'Usuario',
        role: 'user',
        membership: 'basic',
      },
    ];
  }

  getUserByEmail(email) {
    const users = this.getStoredUsers();
    const user = users.find((u) => u.email === email);

    if (user) {
      return {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        membership: user.membership,
      };
    }

    return null;
  }

  showLoading(message) {
    const loadingDiv = document.getElementById('loadingDiv');
    if (loadingDiv) {
      loadingDiv.innerHTML = `
        <div class="axyra-loading">
          <div class="axyra-spinner"></div>
          <p>${message}</p>
        </div>
      `;
      loadingDiv.style.display = 'block';
    }
  }

  hideLoading() {
    const loadingDiv = document.getElementById('loadingDiv');
    if (loadingDiv) {
      loadingDiv.style.display = 'none';
    }
  }

  showError(message) {
    const errorDiv = document.getElementById('errorDiv');
    if (errorDiv) {
      errorDiv.innerHTML = `
        <div class="axyra-error">
          <i class="fas fa-exclamation-triangle"></i>
          <span>${message}</span>
        </div>
      `;
      errorDiv.style.display = 'block';

      setTimeout(() => {
        errorDiv.style.display = 'none';
      }, 5000);
    }
  }

  showSuccess(message) {
    const successDiv = document.getElementById('successDiv');
    if (successDiv) {
      successDiv.innerHTML = `
        <div class="axyra-success">
          <i class="fas fa-check-circle"></i>
          <span>${message}</span>
        </div>
      `;
      successDiv.style.display = 'block';

      setTimeout(() => {
        successDiv.style.display = 'none';
      }, 3000);
    }
  }
}

// Inicializar sistema de login
window.AxyraAuthLoginSystem = new AxyraAuthLoginSystem();

console.log('✅ AXYRA Auth Login System cargado correctamente');
