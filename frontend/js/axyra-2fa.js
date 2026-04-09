// ========================================
// AXYRA 2FA SYSTEM
// Sistema de autenticación de dos factores
// ========================================

class Axyra2FASystem {
  constructor() {
    this.isEnabled = false;
    this.secretKey = null;
    this.backupCodes = [];
    this.trustedDevices = new Map();
    this.securitySettings = {
      require2FA: false,
      backupCodesCount: 10,
      deviceTrustDays: 30,
      maxFailedAttempts: 5,
      lockoutDuration: 15 * 60 * 1000, // 15 minutos
    };

    this.init();
  }

  async init() {
    console.log('🔐 Inicializando Sistema 2FA AXYRA...');

    try {
      await this.loadSecuritySettings();
      this.setupEventListeners();
      this.setupSecurityMonitoring();
      console.log('✅ Sistema 2FA AXYRA inicializado');
    } catch (error) {
      console.error('❌ Error inicializando sistema 2FA:', error);
    }
  }

  async loadSecuritySettings() {
    try {
      const settings = localStorage.getItem('axyra_2fa_settings');
      if (settings) {
        const parsedSettings = JSON.parse(settings);
        this.securitySettings = { ...this.securitySettings, ...parsedSettings };
      }

      const enabled = localStorage.getItem('axyra_2fa_enabled');
      this.isEnabled = enabled === 'true';

      const secret = localStorage.getItem('axyra_2fa_secret');
      if (secret) {
        this.secretKey = this.decryptSecret(secret);
      }

      const codes = localStorage.getItem('axyra_2fa_backup_codes');
      if (codes) {
        this.backupCodes = JSON.parse(codes);
      }

      const devices = localStorage.getItem('axyra_2fa_trusted_devices');
      if (devices) {
        this.trustedDevices = new Map(JSON.parse(devices));
      }
    } catch (error) {
      console.error('❌ Error cargando configuración 2FA:', error);
    }
  }

  setupEventListeners() {
    // Escuchar eventos de seguridad
    document.addEventListener('securityAlert', (event) => {
      this.handleSecurityAlert(event.detail);
    });

    // Escuchar eventos de autenticación
    document.addEventListener('authRequired', (event) => {
      this.handleAuthRequired(event.detail);
    });
  }

  setupSecurityMonitoring() {
    // Monitorear intentos de acceso
    this.monitorAccessAttempts();

    // Monitorear dispositivos
    this.monitorDeviceChanges();

    // Monitorear actividad sospechosa
    this.monitorSuspiciousActivity();
  }

  // Métodos de configuración 2FA
  async enable2FA(userId) {
    try {
      // Generar clave secreta
      this.secretKey = this.generateSecretKey();

      // Generar códigos de respaldo
      this.backupCodes = this.generateBackupCodes();

      // Guardar configuración
      await this.save2FASettings();

      // Enviar notificación
      this.sendSecurityNotification(
        '2FA habilitado',
        'Se ha habilitado la autenticación de dos factores para tu cuenta.'
      );

      console.log('✅ 2FA habilitado para usuario:', userId);
      return { success: true, secretKey: this.secretKey, backupCodes: this.backupCodes };
    } catch (error) {
      console.error('❌ Error habilitando 2FA:', error);
      throw error;
    }
  }

  async disable2FA(userId) {
    try {
      // Verificar que el usuario tiene permisos
      if (!this.verifyUserPermissions(userId)) {
        throw new Error('No tienes permisos para deshabilitar 2FA');
      }

      // Limpiar configuración
      this.secretKey = null;
      this.backupCodes = [];
      this.trustedDevices.clear();

      // Guardar cambios
      await this.save2FASettings();

      // Enviar notificación
      this.sendSecurityNotification(
        '2FA deshabilitado',
        'Se ha deshabilitado la autenticación de dos factores para tu cuenta.'
      );

      console.log('✅ 2FA deshabilitado para usuario:', userId);
      return { success: true };
    } catch (error) {
      console.error('❌ Error deshabilitando 2FA:', error);
      throw error;
    }
  }

  // Métodos de verificación
  async verify2FACode(code, userId) {
    try {
      if (!this.isEnabled) {
        return { success: true, message: '2FA no está habilitado' };
      }

      // Verificar código TOTP
      const isValidTOTP = this.verifyTOTPCode(code);

      // Verificar código de respaldo
      const isValidBackup = this.verifyBackupCode(code);

      if (isValidTOTP || isValidBackup) {
        // Registrar acceso exitoso
        this.recordSuccessfulAccess(userId);

        // Si es código de respaldo, invalidarlo
        if (isValidBackup) {
          this.invalidateBackupCode(code);
        }

        return { success: true, message: 'Código 2FA válido' };
      } else {
        // Registrar intento fallido
        this.recordFailedAttempt(userId);
        return { success: false, message: 'Código 2FA inválido' };
      }
    } catch (error) {
      console.error('❌ Error verificando código 2FA:', error);
      return { success: false, message: 'Error verificando código 2FA' };
    }
  }

  verifyTOTPCode(code) {
    if (!this.secretKey) return false;

    const currentTime = Math.floor(Date.now() / 1000 / 30);
    const timeWindow = 1; // Ventana de tiempo de 1 minuto

    for (let i = -timeWindow; i <= timeWindow; i++) {
      const time = currentTime + i;
      const expectedCode = this.generateTOTPCode(this.secretKey, time);

      if (expectedCode === code) {
        return true;
      }
    }

    return false;
  }

  verifyBackupCode(code) {
    return this.backupCodes.includes(code);
  }

  // Métodos de generación
  generateSecretKey() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let secret = '';

    for (let i = 0; i < 32; i++) {
      secret += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    return secret;
  }

  generateTOTPCode(secret, time) {
    const key = this.base32Decode(secret);
    const timeBuffer = new ArrayBuffer(8);
    const timeView = new DataView(timeBuffer);
    timeView.setUint32(0, Math.floor(time / 0x100000000));
    timeView.setUint32(4, time);

    const hmac = this.hmacSHA1(key, timeBuffer);
    const offset = hmac[19] & 0xf;
    const code =
      ((hmac[offset] & 0x7f) << 24) |
      ((hmac[offset + 1] & 0xff) << 16) |
      ((hmac[offset + 2] & 0xff) << 8) |
      (hmac[offset + 3] & 0xff);

    return (code % 1000000).toString().padStart(6, '0');
  }

  generateBackupCodes() {
    const codes = [];
    for (let i = 0; i < this.securitySettings.backupCodesCount; i++) {
      codes.push(this.generateRandomCode());
    }
    return codes;
  }

  generateRandomCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  // Métodos de dispositivos de confianza
  async addTrustedDevice(deviceInfo) {
    const deviceId = this.generateDeviceId(deviceInfo);
    const trustExpiry = Date.now() + this.securitySettings.deviceTrustDays * 24 * 60 * 60 * 1000;

    this.trustedDevices.set(deviceId, {
      ...deviceInfo,
      addedAt: Date.now(),
      trustExpiry: trustExpiry,
      lastUsed: Date.now(),
    });

    await this.saveTrustedDevices();
    console.log('✅ Dispositivo de confianza agregado:', deviceId);
  }

  async removeTrustedDevice(deviceId) {
    this.trustedDevices.delete(deviceId);
    await this.saveTrustedDevices();
    console.log('✅ Dispositivo de confianza eliminado:', deviceId);
  }

  isDeviceTrusted(deviceInfo) {
    const deviceId = this.generateDeviceId(deviceInfo);
    const device = this.trustedDevices.get(deviceId);

    if (!device) return false;

    // Verificar si el dispositivo ha expirado
    if (Date.now() > device.trustExpiry) {
      this.trustedDevices.delete(deviceId);
      return false;
    }

    // Actualizar último uso
    device.lastUsed = Date.now();
    this.saveTrustedDevices();

    return true;
  }

  generateDeviceId(deviceInfo) {
    const deviceString = `${deviceInfo.userAgent}_${deviceInfo.platform}_${deviceInfo.screenResolution}`;
    return this.hashString(deviceString);
  }

  // Métodos de monitoreo de seguridad
  monitorAccessAttempts() {
    let failedAttempts = 0;
    let lastAttemptTime = 0;

    document.addEventListener('2FAFailed', () => {
      failedAttempts++;
      lastAttemptTime = Date.now();

      if (failedAttempts >= this.securitySettings.maxFailedAttempts) {
        this.lockoutUser();
      }
    });

    document.addEventListener('2FASuccess', () => {
      failedAttempts = 0;
    });
  }

  monitorDeviceChanges() {
    const currentDevice = this.getCurrentDeviceInfo();
    const storedDevice = localStorage.getItem('axyra_last_device');

    if (storedDevice) {
      const previousDevice = JSON.parse(storedDevice);

      if (!this.isSameDevice(currentDevice, previousDevice)) {
        this.handleDeviceChange(currentDevice, previousDevice);
      }
    }

    localStorage.setItem('axyra_last_device', JSON.stringify(currentDevice));
  }

  monitorSuspiciousActivity() {
    // Monitorear actividad sospechosa
    this.monitorUnusualLoginTimes();
    this.monitorGeographicAnomalies();
    this.monitorRapidRequests();
  }

  monitorUnusualLoginTimes() {
    const currentHour = new Date().getHours();
    const unusualHours = [0, 1, 2, 3, 4, 5, 22, 23]; // Horas inusuales

    if (unusualHours.includes(currentHour)) {
      this.sendSecurityAlert('Login en hora inusual', `Acceso detectado a las ${currentHour}:00`);
    }
  }

  monitorGeographicAnomalies() {
    // Implementar detección de anomalías geográficas
    // Esto requeriría integración con servicios de geolocalización
    console.log('🌍 Monitoreando anomalías geográficas...');
  }

  monitorRapidRequests() {
    let requestCount = 0;
    let lastRequestTime = Date.now();

    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const now = Date.now();

      if (now - lastRequestTime < 1000) {
        // Menos de 1 segundo
        requestCount++;

        if (requestCount > 10) {
          // Más de 10 requests por segundo
          this.sendSecurityAlert('Actividad sospechosa', 'Demasiadas requests en poco tiempo');
        }
      } else {
        requestCount = 0;
      }

      lastRequestTime = now;
      return originalFetch(...args);
    };
  }

  // Métodos de utilidad
  getCurrentDeviceInfo() {
    return {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      screenResolution: `${screen.width}x${screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      language: navigator.language,
    };
  }

  isSameDevice(device1, device2) {
    return (
      device1.userAgent === device2.userAgent &&
      device1.platform === device2.platform &&
      device1.screenResolution === device2.screenResolution
    );
  }

  async save2FASettings() {
    try {
      localStorage.setItem('axyra_2fa_enabled', this.isEnabled.toString());

      if (this.secretKey) {
        const encryptedSecret = this.encryptSecret(this.secretKey);
        localStorage.setItem('axyra_2fa_secret', encryptedSecret);
      }

      localStorage.setItem('axyra_2fa_backup_codes', JSON.stringify(this.backupCodes));
      localStorage.setItem('axyra_2fa_settings', JSON.stringify(this.securitySettings));
    } catch (error) {
      console.error('❌ Error guardando configuración 2FA:', error);
    }
  }

  async saveTrustedDevices() {
    try {
      const devicesArray = Array.from(this.trustedDevices.entries());
      localStorage.setItem('axyra_2fa_trusted_devices', JSON.stringify(devicesArray));
    } catch (error) {
      console.error('❌ Error guardando dispositivos de confianza:', error);
    }
  }

  // Métodos de encriptación
  encryptSecret(secret) {
    // Implementar encriptación simple (en producción usar librerías más robustas)
    return btoa(secret);
  }

  decryptSecret(encryptedSecret) {
    // Implementar desencriptación simple (en producción usar librerías más robustas)
    return atob(encryptedSecret);
  }

  // Métodos de hash
  hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convertir a 32bit integer
    }
    return hash.toString();
  }

  // Métodos de HMAC
  hmacSHA1(key, data) {
    // Implementación simplificada de HMAC-SHA1
    // En producción usar librerías criptográficas apropiadas
    const keyBytes = new Uint8Array(key);
    const dataBytes = new Uint8Array(data);

    // Implementación básica (no criptográficamente segura)
    const result = new Uint8Array(20);
    for (let i = 0; i < 20; i++) {
      result[i] = (keyBytes[i % keyBytes.length] + dataBytes[i % dataBytes.length]) % 256;
    }

    return result;
  }

  // Métodos de base32
  base32Decode(str) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let bits = 0;
    let value = 0;
    let index = 0;
    const output = [];

    for (let i = 0; i < str.length; i++) {
      const char = str.charAt(i).toUpperCase();
      const pos = chars.indexOf(char);

      if (pos === -1) continue;

      value = (value << 5) | pos;
      bits += 5;

      if (bits >= 8) {
        output[index++] = (value >>> (bits - 8)) & 255;
        bits -= 8;
      }
    }

    return new Uint8Array(output);
  }

  // Métodos de notificaciones
  sendSecurityNotification(title, message) {
    if (window.axyraNotifications) {
      window.axyraNotifications.showInfo(message, {
        title: title,
        persistent: true,
      });
    }
  }

  sendSecurityAlert(title, message) {
    if (window.axyraNotifications) {
      window.axyraNotifications.showWarning(message, {
        title: title,
        persistent: true,
      });
    }
  }

  // Métodos de registro
  recordSuccessfulAccess(userId) {
    const access = {
      userId: userId,
      timestamp: Date.now(),
      device: this.getCurrentDeviceInfo(),
      type: 'successful_2fa',
    };

    this.logSecurityEvent(access);
  }

  recordFailedAttempt(userId) {
    const access = {
      userId: userId,
      timestamp: Date.now(),
      device: this.getCurrentDeviceInfo(),
      type: 'failed_2fa',
    };

    this.logSecurityEvent(access);
  }

  logSecurityEvent(event) {
    const events = JSON.parse(localStorage.getItem('axyra_security_events') || '[]');
    events.push(event);

    // Mantener solo los últimos 100 eventos
    if (events.length > 100) {
      events.splice(0, events.length - 100);
    }

    localStorage.setItem('axyra_security_events', JSON.stringify(events));
  }

  // Métodos de limpieza
  invalidateBackupCode(code) {
    const index = this.backupCodes.indexOf(code);
    if (index > -1) {
      this.backupCodes.splice(index, 1);
      this.save2FASettings();
    }
  }

  lockoutUser() {
    const lockoutUntil = Date.now() + this.securitySettings.lockoutDuration;
    localStorage.setItem('axyra_2fa_lockout', lockoutUntil.toString());

    this.sendSecurityAlert('Cuenta bloqueada', 'Demasiados intentos fallidos. Cuenta bloqueada temporalmente.');
  }

  isUserLockedOut() {
    const lockoutUntil = localStorage.getItem('axyra_2fa_lockout');
    if (lockoutUntil && Date.now() < parseInt(lockoutUntil)) {
      return true;
    }
    return false;
  }

  // Métodos de verificación
  verifyUserPermissions(userId) {
    // Implementar verificación de permisos
    return true; // Simplificado para demo
  }

  handleSecurityAlert(detail) {
    console.log('🚨 Alerta de seguridad:', detail);
    this.sendSecurityAlert('Alerta de Seguridad', detail.message);
  }

  handleAuthRequired(detail) {
    console.log('🔐 Autenticación requerida:', detail);
    // Implementar lógica de autenticación requerida
  }

  handleDeviceChange(currentDevice, previousDevice) {
    console.log('📱 Cambio de dispositivo detectado');
    this.sendSecurityAlert('Cambio de dispositivo', 'Se detectó un cambio de dispositivo. Verifica que eres tú.');
  }

  // Métodos de exportación
  exportSecurityLogs() {
    const events = JSON.parse(localStorage.getItem('axyra_security_events') || '[]');
    const data = {
      events: events,
      timestamp: new Date().toISOString(),
      device: this.getCurrentDeviceInfo(),
    };

    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });

    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `axyra_security_logs_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  }

  // Métodos de limpieza
  destroy() {
    // Limpiar event listeners
    document.removeEventListener('securityAlert', this.handleSecurityAlert);
    document.removeEventListener('authRequired', this.handleAuthRequired);
  }
}

// Inicializar sistema 2FA
document.addEventListener('DOMContentLoaded', function () {
  try {
    window.axyra2FA = new Axyra2FASystem();
    console.log('✅ Sistema 2FA AXYRA cargado');
  } catch (error) {
    console.error('❌ Error cargando sistema 2FA:', error);
  }
});

// Exportar para uso global
window.Axyra2FASystem = Axyra2FASystem;
