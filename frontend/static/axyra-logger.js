/**
 * AXYRA - Logger Centralizado
 * Registra logs solo en modo desarrollo, no en producción
 */

class AxyraLogger {
  constructor() {
    this.isDevelopment = !window.location.hostname.includes('axyra.vercel.app') && 
                         !window.location.hostname.includes('axyra-sistema-gestion.vercel.app') &&
                         window.location.hostname !== 'axyra.io';
    this.maxLogs = 1000;
    this.logs = [];
  }

  /**
   * Registra un log - solo se muestra en desarrollo
   */
  log(category, message, data = null) {
    if (!this.isDevelopment) return;
    
    const logEntry = {
      timestamp: new Date().toISOString(),
      category,
      message,
      data
    };

    this.logs.push(logEntry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    // Mostrar en consola solo en desarrollo
    if (data) {
      console.log(`[${category}] ${message}`, data);
    } else {
      console.log(`[${category}] ${message}`);
    }
  }

  /**
   * Registra un error
   */
  error(category, message, error = null) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      category,
      level: 'error',
      message,
      error: error?.message || error
    };

    this.logs.push(logEntry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    console.error(`[${category}] ❌ ${message}`, error);
  }

  /**
   * Registra un warning
   */
  warn(category, message, data = null) {
    if (!this.isDevelopment) return;

    const logEntry = {
      timestamp: new Date().toISOString(),
      category,
      level: 'warn',
      message,
      data
    };

    this.logs.push(logEntry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    console.warn(`[${category}] ⚠️ ${message}`, data);
  }

  /**
   * Registra información
   */
  info(category, message, data = null) {
    if (!this.isDevelopment) return;

    const logEntry = {
      timestamp: new Date().toISOString(),
      category,
      level: 'info',
      message,
      data
    };

    this.logs.push(logEntry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    console.info(`[${category}] ℹ️ ${message}`, data);
  }

  /**
   * Obtiene todos los logs registrados
   */
  getLogs() {
    return [...this.logs];
  }

  /**
   * Limpia todos los logs
   */
  clear() {
    this.logs = [];
  }

  /**
   * Exporta logs en formato JSON
   */
  exportLogs() {
    return JSON.stringify(this.logs, null, 2);
  }

  /**
   * Envía logs al servidor para análisis
   */
  async sendToServer(endpoint = '/api/logs') {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          logs: this.logs,
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString()
        })
      });

      if (!response.ok) {
        console.error('Error enviando logs al servidor');
      }
    } catch (error) {
      console.error('Error enviando logs:', error);
    }
  }
}

// Instancia global
window.axyraLogger = new AxyraLogger();

// Exportar para uso en módulos
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AxyraLogger;
}
