// ========================================
// SISTEMA DE AUTENTICACIÓN AXYRA
// Manejo robusto de autenticación y sesiones
// ========================================

class AxyraAuthSystem {
  constructor() {
    this.currentUser = null;
    this.isAuthenticated = false;
    this.sessionTimeout = null;
    this.maxLoginAttempts = 5;
    this.loginAttempts = 0;
    this.lockoutTime = null;
    this.lockoutDuration = 15 * 60 * 1000; // 15 minutos

    this.init();
  }

  async init() {
    console.log('🔐 Inicializando Sistema de Autenticación AXYRA...');

    try {
      // Inicializar Firebase
      await this.initializeFirebase();

      // Configurar listeners de autenticación
      this.setupAuthListeners();

      // Verificar sesión existente
      await this.checkExistingSession();

      // Configurar timeout de sesión
      this.setupSessionTimeout();

      console.log('✅ Sistema de Autenticación AXYRA inicializado');
    } catch (error) {
      console.error('❌ Error inicializando autenticación:', error);
      this.showError('Error inicializando sistema de autenticación');
    }
  }

  async initializeFirebase() {
    if (typeof firebase === 'undefined') {
      throw new Error('Firebase no está disponible');
    }

    // Usar configuración unificada
    const config = window.axyraUnifiedConfig ? window.axyraUnifiedConfig.getConfig() : window.getAxyraConfig();
    if (!config) {
      throw new Error('Configuración AXYRA no disponible');
    }

    if (!firebase.apps.length) {
      firebase.initializeApp(config.firebase);
    }

    this.auth = firebase.auth();
    this.db = firebase.firestore();

    console.log('🔥 Firebase inicializado correctamente');
  }

  setupAuthListeners() {
    // Listener de cambios de estado de autenticación
    this.auth.onAuthStateChanged(async (user) => {
      if (user) {
        this.currentUser = user;
        this.isAuthenticated = true;
        await this.loadUserData(user);
        this.resetLoginAttempts();
        this.showSuccess('Sesión iniciada correctamente');
      } else {
        this.currentUser = null;
        this.isAuthenticated = false;
        this.clearUserData();
        this.redirectToLogin();
      }
    });

    // Listener de errores de autenticación
    this.auth.onAuthStateChanged((user) => {
      if (!user && this.isAuthenticated) {
        this.showWarning('Sesión expirada. Por favor, inicia sesión nuevamente.');
      }
    });
  }

  async checkExistingSession() {
    const user = this.auth.currentUser;
    if (user) {
      this.currentUser = user;
      this.isAuthenticated = true;
      await this.loadUserData(user);
    }
  }

  setupSessionTimeout() {
    const timeoutMinutes = window.getAxyraConfig('system.sessionTimeout') || 30;
    const timeoutMs = timeoutMinutes * 60 * 1000;

    // Limpiar timeout anterior
    if (this.sessionTimeout) {
      clearTimeout(this.sessionTimeout);
    }

    // Configurar nuevo timeout
    this.sessionTimeout = setTimeout(() => {
      this.handleSessionTimeout();
    }, timeoutMs);

    // Resetear timeout en actividad del usuario
    this.setupActivityListeners();
  }

  setupActivityListeners() {
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];

    const resetTimeout = () => {
      this.setupSessionTimeout();
    };

    events.forEach((event) => {
      document.addEventListener(event, resetTimeout, true);
    });
  }

  async handleSessionTimeout() {
    console.log('⏰ Sesión expirada por inactividad');
    this.showWarning('Tu sesión ha expirado por inactividad. Serás redirigido al login.');

    setTimeout(() => {
      this.logout();
    }, 3000);
  }

  async login(email, password, rememberMe = false) {
    try {
      // Verificar si está bloqueado
      if (this.isLockedOut()) {
        const remainingTime = this.getRemainingLockoutTime();
        throw new Error(`Cuenta bloqueada. Intenta nuevamente en ${remainingTime} minutos.`);
      }

      // Verificar intentos de login
      if (this.loginAttempts >= this.maxLoginAttempts) {
        this.lockoutTime = Date.now();
        throw new Error('Demasiados intentos fallidos. Cuenta bloqueada por 15 minutos.');
      }

      // Configurar persistencia
      const persistence = rememberMe ? firebase.auth.Auth.Persistence.LOCAL : firebase.auth.Auth.Persistence.SESSION;

      await firebase.auth().setPersistence(persistence);

      // Intentar login
      const result = await firebase.auth().signInWithEmailAndPassword(email, password);

      // Resetear intentos de login
      this.resetLoginAttempts();

      // Cargar datos del usuario
      await this.loadUserData(result.user);

      return result;
    } catch (error) {
      this.handleLoginError(error);
      throw error;
    }
  }

  async register(email, password, userData) {
    try {
      // Crear usuario
      const result = await this.auth.createUserWithEmailAndPassword(email, password);

      // Actualizar perfil
      await result.user.updateProfile({
        displayName: userData.displayName,
      });

      // Guardar datos adicionales en Firestore
      await this.db
        .collection('users')
        .doc(result.user.uid)
        .set({
          uid: result.user.uid,
          email: email,
          displayName: userData.displayName,
          role: userData.role || 'user',
          isActive: true,
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
          lastLogin: null,
          companyId: userData.companyId || null,
        });

      return result;
    } catch (error) {
      this.handleLoginError(error);
      throw error;
    }
  }

  async logout() {
    try {
      console.log('🚪 Cerrando sesión...');
      
      // Limpiar datos del usuario usando el sistema de limpieza
      if (window.userDataCleaner) {
        window.userDataCleaner.forceCleanAll();
      } else {
        this.clearUserData();
      }
      
      // Cerrar sesión en Firebase
      await this.auth.signOut();
      
      console.log('✅ Sesión cerrada correctamente');
      this.redirectToLogin();
    } catch (error) {
      console.error('❌ Error al cerrar sesión:', error);
    }
  }

  async loadUserData(user) {
    try {
      const userDoc = await this.db.collection('users').doc(user.uid).get();
      if (userDoc.exists) {
        const userData = userDoc.data();
        localStorage.setItem('axyra_user_data', JSON.stringify(userData));

        // Actualizar último login
        await this.db.collection('users').doc(user.uid).update({
          lastLogin: firebase.firestore.FieldValue.serverTimestamp(),
        });
      }
    } catch (error) {
      console.error('Error cargando datos del usuario:', error);
    }
  }

  clearUserData() {
    localStorage.removeItem('axyra_user_data');
    localStorage.removeItem('axyra_session_data');
  }

  redirectToLogin() {
    if (window.location.pathname !== '/login-optimized.html' && !window.location.pathname.includes('login-optimized.html')) {
      console.log('🔄 Redirigiendo a login por sesión expirada...');
      if (window.sessionRedirectSystem) {
        window.sessionRedirectSystem.handleSessionExpired();
      } else {
        window.location.href = 'login-optimized.html';
      }
    }
  }

  handleLoginError(error) {
    this.loginAttempts++;

    let errorMessage = 'Error al iniciar sesión';

    switch (error.code) {
      case 'auth/user-not-found':
        errorMessage = 'No existe una cuenta con este correo electrónico';
        break;
      case 'auth/wrong-password':
        errorMessage = 'Contraseña incorrecta';
        break;
      case 'auth/invalid-email':
        errorMessage = 'Correo electrónico inválido';
        break;
      case 'auth/user-disabled':
        errorMessage = 'Esta cuenta ha sido deshabilitada';
        break;
      case 'auth/too-many-requests':
        errorMessage = 'Demasiados intentos fallidos. Intenta más tarde';
        this.lockoutTime = Date.now();
        break;
      default:
        errorMessage = error.message;
    }

    this.showError(errorMessage);
  }

  resetLoginAttempts() {
    this.loginAttempts = 0;
    this.lockoutTime = null;
  }

  isLockedOut() {
    if (!this.lockoutTime) return false;
    return Date.now() - this.lockoutTime < this.lockoutDuration;
  }

  getRemainingLockoutTime() {
    if (!this.lockoutTime) return 0;
    const remaining = this.lockoutDuration - (Date.now() - this.lockoutTime);
    return Math.ceil(remaining / (60 * 1000));
  }

  // Métodos de utilidad
  getCurrentUser() {
    return this.currentUser;
  }

  isUserAuthenticated() {
    return this.isAuthenticated;
  }

  getUserData() {
    const userData = localStorage.getItem('axyra_user_data');
    return userData ? JSON.parse(userData) : null;
  }

  hasRole(role) {
    const userData = this.getUserData();
    return userData && userData.role === role;
  }

  isAdmin() {
    return this.hasRole('admin');
  }

  // Métodos de notificación
  showSuccess(message) {
    if (window.axyraNotifications) {
      window.axyraNotifications.showSuccess(message);
    } else {
      console.log('✅', message);
    }
  }

  showError(message) {
    if (window.axyraNotifications) {
      window.axyraNotifications.showError(message);
    } else {
      console.error('❌', message);
    }
  }

  showWarning(message) {
    if (window.axyraNotifications) {
      window.axyraNotifications.showWarning(message);
    } else {
      console.warn('⚠️', message);
    }
  }
}

// Inicializar sistema de autenticación
document.addEventListener('DOMContentLoaded', function () {
  try {
    window.axyraAuth = new AxyraAuthSystem();
    console.log('✅ Sistema de Autenticación AXYRA cargado');
  } catch (error) {
    console.error('❌ Error cargando sistema de autenticación:', error);
  }
});

// Exportar para uso global
window.AxyraAuthSystem = AxyraAuthSystem;
