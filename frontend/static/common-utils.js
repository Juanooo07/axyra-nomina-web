// ========================================
// UTILIDADES COMUNES AXYRA - OPTIMIZADAS
// ========================================

/**
 * Utilidades comunes extraídas para evitar duplicación
 * Generado automáticamente por el optimizador de rendimiento
 */

// Utilidades de formato
const AxyraFormatters = {
  currency: (value) => new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP'
  }).format(value),
  
  date: (value) => new Intl.DateTimeFormat('es-CO').format(new Date(value)),
  
  number: (value) => new Intl.NumberFormat('es-CO').format(value)
};

// Utilidades de validación
const AxyraValidators = {
  email: (email) => /^[^s@]+@[^s@]+.[^s@]+$/.test(email),
  
  required: (value) => value !== null && value !== undefined && value !== '',
  
  minLength: (value, min) => value && value.length >= min,
  
  maxLength: (value, max) => value && value.length <= max
};

// Utilidades de almacenamiento
const AxyraStorage = {
  get: (key) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error('Error getting from localStorage:', error);
      return null;
    }
  },
  
  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error('Error setting to localStorage:', error);
      return false;
    }
  },
  
  remove: (key) => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Error removing from localStorage:', error);
      return false;
    }
  }
};

// Utilidades de DOM
const AxyraDOM = {
  createElement: (tag, className = '', content = '') => {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (content) element.textContent = content;
    return element;
  },
  
  querySelector: (selector) => document.querySelector(selector),
  
  querySelectorAll: (selector) => document.querySelectorAll(selector),
  
  addClass: (element, className) => element.classList.add(className),
  
  removeClass: (element, className) => element.classList.remove(className),
  
  toggleClass: (element, className) => element.classList.toggle(className)
};

// Utilidades de eventos
const AxyraEvents = {
  on: (element, event, handler) => {
    element.addEventListener(event, handler);
  },
  
  off: (element, event, handler) => {
    element.removeEventListener(event, handler);
  },
  
  emit: (eventName, data) => {
    const event = new CustomEvent(eventName, { detail: data });
    document.dispatchEvent(event);
  }
};

// Utilidades de notificaciones
const AxyraNotifications = {
  show: (message, type = 'info') => {
    const notification = AxyraDOM.createElement('div', `notification notification-${type}`, message);
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.remove();
    }, 3000);
  },
  
  success: (message) => AxyraNotifications.show(message, 'success'),
  
  error: (message) => AxyraNotifications.show(message, 'error'),
  
  warning: (message) => AxyraNotifications.show(message, 'warning'),
  
  info: (message) => AxyraNotifications.show(message, 'info')
};

// Exportar utilidades globalmente
window.AxyraFormatters = AxyraFormatters;
window.AxyraValidators = AxyraValidators;
window.AxyraStorage = AxyraStorage;
window.AxyraDOM = AxyraDOM;
window.AxyraEvents = AxyraEvents;
window.AxyraNotifications = AxyraNotifications;

console.log('✅ Utilidades comunes AXYRA cargadas');
