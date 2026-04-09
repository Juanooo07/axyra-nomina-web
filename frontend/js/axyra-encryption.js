// ========================================
// AXYRA ENCRYPTION SYSTEM
// Sistema de encriptación y seguridad de datos
// ========================================

class AxyraEncryptionSystem {
  constructor() {
    this.encryptionKey = null;
    this.algorithm = 'AES-GCM';
    this.keyLength = 256;
    this.ivLength = 12;
    this.tagLength = 16;
    this.encryptionSettings = {
      keyDerivation: 'PBKDF2',
      iterations: 100000,
      saltLength: 32,
      hashAlgorithm: 'SHA-256',
    };

    this.init();
  }

  async init() {
    console.log('🔐 Inicializando Sistema de Encriptación AXYRA...');

    try {
      await this.loadEncryptionKey();
      this.setupEncryptionStrategies();
      this.setupDataProtection();
      this.setupKeyManagement();
      console.log('✅ Sistema de Encriptación AXYRA inicializado');
    } catch (error) {
      console.error('❌ Error inicializando sistema de encriptación:', error);
    }
  }

  async loadEncryptionKey() {
    try {
      const storedKey = localStorage.getItem('axyra_encryption_key');
      if (storedKey) {
        this.encryptionKey = await this.importKey(storedKey);
      } else {
        await this.generateNewKey();
      }
    } catch (error) {
      console.error('❌ Error cargando clave de encriptación:', error);
      await this.generateNewKey();
    }
  }

  async generateNewKey() {
    try {
      this.encryptionKey = await crypto.subtle.generateKey(
        {
          name: this.algorithm,
          length: this.keyLength,
        },
        true,
        ['encrypt', 'decrypt']
      );

      const exportedKey = await crypto.subtle.exportKey('raw', this.encryptionKey);
      const keyString = this.arrayBufferToBase64(exportedKey);
      localStorage.setItem('axyra_encryption_key', keyString);

      console.log('✅ Nueva clave de encriptación generada');
    } catch (error) {
      console.error('❌ Error generando clave de encriptación:', error);
      throw error;
    }
  }

  async importKey(keyString) {
    try {
      const keyBuffer = this.base64ToArrayBuffer(keyString);
      return await crypto.subtle.importKey('raw', keyBuffer, { name: this.algorithm }, false, ['encrypt', 'decrypt']);
    } catch (error) {
      console.error('❌ Error importando clave:', error);
      throw error;
    }
  }

  setupEncryptionStrategies() {
    this.strategies = {
      'user-data': {
        algorithm: 'AES-GCM',
        keyLength: 256,
        ivLength: 12,
        tagLength: 16,
      },
      'sensitive-data': {
        algorithm: 'AES-GCM',
        keyLength: 256,
        ivLength: 12,
        tagLength: 16,
      },
      communication: {
        algorithm: 'AES-CBC',
        keyLength: 256,
        ivLength: 16,
      },
      storage: {
        algorithm: 'AES-GCM',
        keyLength: 256,
        ivLength: 12,
        tagLength: 16,
      },
    };
  }

  setupDataProtection() {
    // Proteger datos sensibles
    this.protectSensitiveData();

    // Interceptar requests para encriptar datos
    this.interceptDataTransmission();

    // Proteger localStorage
    this.protectLocalStorage();
  }

  setupKeyManagement() {
    // Rotar claves periódicamente
    this.setupKeyRotation();

    // Gestionar claves de sesión
    this.setupSessionKeys();

    // Gestionar claves de respaldo
    this.setupBackupKeys();
  }

  // Métodos de encriptación
  async encrypt(data, options = {}) {
    try {
      const strategy = this.getEncryptionStrategy(options.type);
      const key = await this.getEncryptionKey(options.type);
      const iv = this.generateIV(strategy.ivLength);

      const dataBuffer = this.stringToArrayBuffer(JSON.stringify(data));
      const encryptedData = await crypto.subtle.encrypt(
        {
          name: strategy.algorithm,
          iv: iv,
          tagLength: strategy.tagLength || 0,
        },
        key,
        dataBuffer
      );

      const result = {
        data: this.arrayBufferToBase64(encryptedData),
        iv: this.arrayBufferToBase64(iv),
        algorithm: strategy.algorithm,
        timestamp: Date.now(),
      };

      if (strategy.tagLength) {
        result.tag = this.arrayBufferToBase64(encryptedData.slice(-strategy.tagLength));
      }

      return result;
    } catch (error) {
      console.error('❌ Error encriptando datos:', error);
      throw error;
    }
  }

  async decrypt(encryptedData, options = {}) {
    try {
      const strategy = this.getEncryptionStrategy(options.type);
      const key = await this.getEncryptionKey(options.type);

      const dataBuffer = this.base64ToArrayBuffer(encryptedData.data);
      const iv = this.base64ToArrayBuffer(encryptedData.iv);

      const decryptedData = await crypto.subtle.decrypt(
        {
          name: strategy.algorithm,
          iv: iv,
          tagLength: strategy.tagLength || 0,
        },
        key,
        dataBuffer
      );

      const decryptedString = this.arrayBufferToString(decryptedData);
      return JSON.parse(decryptedString);
    } catch (error) {
      console.error('❌ Error desencriptando datos:', error);
      throw error;
    }
  }

  // Métodos de protección de datos
  protectSensitiveData() {
    // Proteger datos de usuario
    this.protectUserData();

    // Proteger datos de empleados
    this.protectEmployeeData();

    // Proteger datos financieros
    this.protectFinancialData();
  }

  protectUserData() {
    // Interceptar acceso a datos de usuario
    const originalGetItem = localStorage.getItem;
    localStorage.getItem = (key) => {
      if (key.startsWith('axyra_user_')) {
        const encryptedData = originalGetItem.call(localStorage, key);
        if (encryptedData) {
          try {
            const parsed = JSON.parse(encryptedData);
            if (parsed.data && parsed.iv) {
              return this.decrypt(parsed, { type: 'user-data' });
            }
          } catch (error) {
            console.error('❌ Error desencriptando datos de usuario:', error);
          }
        }
      }
      return originalGetItem.call(localStorage, key);
    };

    // Interceptar guardado de datos de usuario
    const originalSetItem = localStorage.setItem;
    localStorage.setItem = (key, value) => {
      if (key.startsWith('axyra_user_')) {
        this.encrypt(value, { type: 'user-data' }).then((encrypted) => {
          originalSetItem.call(localStorage, key, JSON.stringify(encrypted));
        });
      } else {
        originalSetItem.call(localStorage, key, value);
      }
    };
  }

  protectEmployeeData() {
    // Proteger datos de empleados
    const employeeDataKeys = ['axyra_employee_', 'axyra_payroll_', 'axyra_hours_'];

    employeeDataKeys.forEach((prefix) => {
      this.protectDataWithPrefix(prefix, 'sensitive-data');
    });
  }

  protectFinancialData() {
    // Proteger datos financieros
    const financialDataKeys = ['axyra_payment_', 'axyra_transaction_', 'axyra_financial_'];

    financialDataKeys.forEach((prefix) => {
      this.protectDataWithPrefix(prefix, 'sensitive-data');
    });
  }

  protectDataWithPrefix(prefix, encryptionType) {
    const originalGetItem = localStorage.getItem;
    const originalSetItem = localStorage.setItem;

    localStorage.getItem = (key) => {
      if (key.startsWith(prefix)) {
        const encryptedData = originalGetItem.call(localStorage, key);
        if (encryptedData) {
          try {
            const parsed = JSON.parse(encryptedData);
            if (parsed.data && parsed.iv) {
              return this.decrypt(parsed, { type: encryptionType });
            }
          } catch (error) {
            console.error(`❌ Error desencriptando datos ${prefix}:`, error);
          }
        }
      }
      return originalGetItem.call(localStorage, key);
    };

    localStorage.setItem = (key, value) => {
      if (key.startsWith(prefix)) {
        this.encrypt(value, { type: encryptionType }).then((encrypted) => {
          originalSetItem.call(localStorage, key, JSON.stringify(encrypted));
        });
      } else {
        originalSetItem.call(localStorage, key, value);
      }
    };
  }

  // Métodos de interceptación
  interceptDataTransmission() {
    // Interceptar fetch requests
    const originalFetch = window.fetch;
    window.fetch = async (url, options) => {
      if (this.shouldEncryptRequest(url, options)) {
        options = await this.encryptRequest(options);
      }

      const response = await originalFetch(url, options);

      if (this.shouldDecryptResponse(response)) {
        return await this.decryptResponse(response);
      }

      return response;
    };
  }

  shouldEncryptRequest(url, options) {
    // Determinar si el request debe ser encriptado
    const sensitiveEndpoints = ['/api/employees', '/api/payroll', '/api/financial', '/api/user-data'];

    return sensitiveEndpoints.some((endpoint) => url.includes(endpoint));
  }

  async encryptRequest(options) {
    if (options.body) {
      try {
        const bodyData = JSON.parse(options.body);
        const encrypted = await this.encrypt(bodyData, { type: 'communication' });
        options.body = JSON.stringify(encrypted);
        options.headers = {
          ...options.headers,
          'Content-Type': 'application/json',
          'X-Encrypted': 'true',
        };
      } catch (error) {
        console.error('❌ Error encriptando request:', error);
      }
    }

    return options;
  }

  shouldDecryptResponse(response) {
    return response.headers.get('X-Encrypted') === 'true';
  }

  async decryptResponse(response) {
    try {
      const encryptedData = await response.json();
      const decryptedData = await this.decrypt(encryptedData, { type: 'communication' });

      return new Response(JSON.stringify(decryptedData), {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
      });
    } catch (error) {
      console.error('❌ Error desencriptando response:', error);
      return response;
    }
  }

  // Métodos de gestión de claves
  setupKeyRotation() {
    // Rotar claves cada 30 días
    setInterval(() => {
      this.rotateEncryptionKey();
    }, 30 * 24 * 60 * 60 * 1000);
  }

  async rotateEncryptionKey() {
    try {
      const oldKey = this.encryptionKey;
      await this.generateNewKey();

      // Re-encriptar datos existentes con nueva clave
      await this.reencryptExistingData(oldKey);

      console.log('✅ Clave de encriptación rotada');
    } catch (error) {
      console.error('❌ Error rotando clave de encriptación:', error);
    }
  }

  async reencryptExistingData(oldKey) {
    // Re-encriptar datos existentes
    const keys = Object.keys(localStorage);
    const encryptedKeys = keys.filter((key) => key.startsWith('axyra_'));

    for (const key of encryptedKeys) {
      try {
        const encryptedData = localStorage.getItem(key);
        if (encryptedData) {
          const parsed = JSON.parse(encryptedData);
          if (parsed.data && parsed.iv) {
            // Desencriptar con clave antigua
            const decryptedData = await this.decryptWithKey(parsed, oldKey);

            // Encriptar con nueva clave
            const reencrypted = await this.encrypt(decryptedData, { type: 'storage' });
            localStorage.setItem(key, JSON.stringify(reencrypted));
          }
        }
      } catch (error) {
        console.error(`❌ Error re-encriptando ${key}:`, error);
      }
    }
  }

  async decryptWithKey(encryptedData, key) {
    try {
      const dataBuffer = this.base64ToArrayBuffer(encryptedData.data);
      const iv = this.base64ToArrayBuffer(encryptedData.iv);

      const decryptedData = await crypto.subtle.decrypt(
        {
          name: encryptedData.algorithm,
          iv: iv,
          tagLength: encryptedData.tag ? 16 : 0,
        },
        key,
        dataBuffer
      );

      const decryptedString = this.arrayBufferToString(decryptedData);
      return JSON.parse(decryptedString);
    } catch (error) {
      console.error('❌ Error desencriptando con clave específica:', error);
      throw error;
    }
  }

  setupSessionKeys() {
    // Generar claves de sesión
    this.sessionKeys = new Map();

    // Limpiar claves de sesión expiradas
    setInterval(() => {
      this.cleanupExpiredSessionKeys();
    }, 60 * 60 * 1000); // Cada hora
  }

  async generateSessionKey(sessionId) {
    try {
      const key = await crypto.subtle.generateKey(
        {
          name: this.algorithm,
          length: this.keyLength,
        },
        true,
        ['encrypt', 'decrypt']
      );

      this.sessionKeys.set(sessionId, {
        key: key,
        createdAt: Date.now(),
        expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 horas
      });

      return key;
    } catch (error) {
      console.error('❌ Error generando clave de sesión:', error);
      throw error;
    }
  }

  cleanupExpiredSessionKeys() {
    const now = Date.now();
    for (const [sessionId, sessionKey] of this.sessionKeys.entries()) {
      if (now > sessionKey.expiresAt) {
        this.sessionKeys.delete(sessionId);
      }
    }
  }

  setupBackupKeys() {
    // Generar claves de respaldo
    this.backupKeys = new Map();

    // Rotar claves de respaldo
    setInterval(() => {
      this.rotateBackupKeys();
    }, 7 * 24 * 60 * 60 * 1000); // Cada semana
  }

  async generateBackupKey() {
    try {
      const key = await crypto.subtle.generateKey(
        {
          name: this.algorithm,
          length: this.keyLength,
        },
        true,
        ['encrypt', 'decrypt']
      );

      const keyId = this.generateKeyId();
      this.backupKeys.set(keyId, {
        key: key,
        createdAt: Date.now(),
        expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 días
      });

      return keyId;
    } catch (error) {
      console.error('❌ Error generando clave de respaldo:', error);
      throw error;
    }
  }

  rotateBackupKeys() {
    // Eliminar claves de respaldo expiradas
    const now = Date.now();
    for (const [keyId, backupKey] of this.backupKeys.entries()) {
      if (now > backupKey.expiresAt) {
        this.backupKeys.delete(keyId);
      }
    }

    // Generar nueva clave de respaldo
    this.generateBackupKey();
  }

  // Métodos de utilidad
  getEncryptionStrategy(type) {
    return this.strategies[type] || this.strategies['storage'];
  }

  async getEncryptionKey(type) {
    if (type === 'session') {
      const sessionId = this.getCurrentSessionId();
      const sessionKey = this.sessionKeys.get(sessionId);
      if (sessionKey) {
        return sessionKey.key;
      }
      return await this.generateSessionKey(sessionId);
    }

    return this.encryptionKey;
  }

  getCurrentSessionId() {
    return localStorage.getItem('axyra_session_id') || 'default';
  }

  generateIV(length) {
    return crypto.getRandomValues(new Uint8Array(length));
  }

  generateKeyId() {
    return 'key_' + Math.random().toString(36).substr(2, 9);
  }

  // Métodos de conversión
  stringToArrayBuffer(str) {
    const encoder = new TextEncoder();
    return encoder.encode(str);
  }

  arrayBufferToString(buffer) {
    const decoder = new TextDecoder();
    return decoder.decode(buffer);
  }

  arrayBufferToBase64(buffer) {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  base64ToArrayBuffer(base64) {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
  }

  // Métodos de protección de localStorage
  protectLocalStorage() {
    // Interceptar acceso a localStorage
    this.interceptLocalStorageAccess();

    // Proteger contra ataques XSS
    this.protectAgainstXSS();

    // Proteger contra acceso no autorizado
    this.protectAgainstUnauthorizedAccess();
  }

  interceptLocalStorageAccess() {
    const originalGetItem = localStorage.getItem;
    const originalSetItem = localStorage.setItem;
    const originalRemoveItem = localStorage.removeItem;

    localStorage.getItem = (key) => {
      if (this.isProtectedKey(key)) {
        this.logAccessAttempt('get', key);
      }
      return originalGetItem.call(localStorage, key);
    };

    localStorage.setItem = (key, value) => {
      if (this.isProtectedKey(key)) {
        this.logAccessAttempt('set', key);
      }
      return originalSetItem.call(localStorage, key, value);
    };

    localStorage.removeItem = (key) => {
      if (this.isProtectedKey(key)) {
        this.logAccessAttempt('remove', key);
      }
      return originalRemoveItem.call(localStorage, key);
    };
  }

  isProtectedKey(key) {
    const protectedPrefixes = [
      'axyra_user_',
      'axyra_employee_',
      'axyra_payroll_',
      'axyra_financial_',
      'axyra_encryption_',
    ];

    return protectedPrefixes.some((prefix) => key.startsWith(prefix));
  }

  logAccessAttempt(operation, key) {
    const logEntry = {
      operation: operation,
      key: key,
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    };

    const logs = JSON.parse(localStorage.getItem('axyra_access_logs') || '[]');
    logs.push(logEntry);

    // Mantener solo los últimos 1000 logs
    if (logs.length > 1000) {
      logs.splice(0, logs.length - 1000);
    }

    localStorage.setItem('axyra_access_logs', JSON.stringify(logs));
  }

  protectAgainstXSS() {
    // Sanitizar datos antes de guardar
    const originalSetItem = localStorage.setItem;
    localStorage.setItem = (key, value) => {
      if (typeof value === 'string') {
        value = this.sanitizeString(value);
      }
      return originalSetItem.call(localStorage, key, value);
    };
  }

  sanitizeString(str) {
    // Eliminar caracteres peligrosos
    return str
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '');
  }

  protectAgainstUnauthorizedAccess() {
    // Verificar origen de acceso
    const allowedOrigins = [window.location.origin, 'https://axyra.com', 'https://app.axyra.com'];

    if (!allowedOrigins.includes(window.location.origin)) {
      console.warn('⚠️ Acceso desde origen no autorizado:', window.location.origin);
      this.clearSensitiveData();
    }
  }

  clearSensitiveData() {
    const sensitiveKeys = Object.keys(localStorage).filter(
      (key) => key.startsWith('axyra_') && !key.startsWith('axyra_public_')
    );

    sensitiveKeys.forEach((key) => {
      localStorage.removeItem(key);
    });

    console.log('🧹 Datos sensibles eliminados por seguridad');
  }

  // Métodos de exportación
  exportEncryptionLogs() {
    const logs = JSON.parse(localStorage.getItem('axyra_access_logs') || '[]');
    const data = {
      logs: logs,
      timestamp: new Date().toISOString(),
      device: this.getCurrentDeviceInfo(),
    };

    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });

    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `axyra_encryption_logs_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  }

  getCurrentDeviceInfo() {
    return {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      screenResolution: `${screen.width}x${screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      language: navigator.language,
    };
  }

  // Métodos de limpieza
  destroy() {
    this.sessionKeys.clear();
    this.backupKeys.clear();
  }
}

// Inicializar sistema de encriptación
document.addEventListener('DOMContentLoaded', function () {
  try {
    window.axyraEncryption = new AxyraEncryptionSystem();
    console.log('✅ Sistema de Encriptación AXYRA cargado');
  } catch (error) {
    console.error('❌ Error cargando sistema de encriptación:', error);
  }
});

// Exportar para uso global
window.AxyraEncryptionSystem = AxyraEncryptionSystem;
