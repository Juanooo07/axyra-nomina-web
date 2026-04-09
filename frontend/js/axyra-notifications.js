// ========================================
// SISTEMA DE NOTIFICACIONES AXYRA
// Sistema robusto de notificaciones
// ========================================

class AxyraNotificationSystem {
  constructor() {
    this.notifications = [];
    this.maxNotifications = 5;
    this.defaultDuration = 5000;
    this.container = null;

    this.init();
  }

  init() {
    console.log('🔔 Inicializando Sistema de Notificaciones AXYRA...');
    this.createContainer();
    this.setupStyles();
    console.log('✅ Sistema de Notificaciones AXYRA inicializado');
  }

  createContainer() {
    this.container = document.createElement('div');
    this.container.id = 'axyra-notifications-container';
    this.container.className = 'axyra-notifications-container';
    document.body.appendChild(this.container);
  }

  setupStyles() {
    if (document.getElementById('axyra-notifications-styles')) return;

    const style = document.createElement('style');
    style.id = 'axyra-notifications-styles';
    style.textContent = `
      .axyra-notifications-container {
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 10000;
        display: flex;
        flex-direction: column;
        gap: 10px;
        max-width: 400px;
        pointer-events: none;
      }

      .axyra-notification {
        background: white;
        border-radius: 12px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        border: 1px solid #e9ecef;
        min-width: 300px;
        max-width: 400px;
        transform: translateX(100%);
        transition: all 0.3s ease;
        pointer-events: auto;
        overflow: hidden;
      }

      .axyra-notification.show {
        transform: translateX(0);
      }

      .axyra-notification.hide {
        transform: translateX(100%);
        opacity: 0;
      }

      .axyra-notification-content {
        display: flex;
        align-items: flex-start;
        padding: 16px;
        gap: 12px;
      }

      .axyra-notification-icon {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 18px;
        flex-shrink: 0;
      }

      .axyra-notification-success .axyra-notification-icon {
        background: #d1fae5;
        color: #065f46;
      }

      .axyra-notification-error .axyra-notification-icon {
        background: #fee2e2;
        color: #991b1b;
      }

      .axyra-notification-warning .axyra-notification-icon {
        background: #fef3c7;
        color: #92400e;
      }

      .axyra-notification-info .axyra-notification-icon {
        background: #dbeafe;
        color: #1e40af;
      }

      .axyra-notification-message {
        flex: 1;
        min-width: 0;
      }

      .axyra-notification-title {
        font-size: 14px;
        font-weight: 600;
        color: #1f2937;
        margin: 0 0 4px 0;
        line-height: 1.4;
      }

      .axyra-notification-text {
        font-size: 13px;
        color: #6b7280;
        margin: 0;
        line-height: 1.4;
      }

      .axyra-notification-close {
        background: none;
        border: none;
        color: #9ca3af;
        cursor: pointer;
        padding: 4px;
        border-radius: 4px;
        transition: all 0.2s ease;
        flex-shrink: 0;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .axyra-notification-close:hover {
        background: #f3f4f6;
        color: #374151;
      }

      .axyra-notification-progress {
        height: 3px;
        background: rgba(0, 0, 0, 0.1);
        position: relative;
        overflow: hidden;
      }

      .axyra-notification-progress-bar {
        height: 100%;
        background: #3b82f6;
        transition: width linear;
        transform-origin: left;
      }

      .axyra-notification-success .axyra-notification-progress-bar {
        background: #10b981;
      }

      .axyra-notification-error .axyra-notification-progress-bar {
        background: #ef4444;
      }

      .axyra-notification-warning .axyra-notification-progress-bar {
        background: #f59e0b;
      }

      .axyra-notification-info .axyra-notification-progress-bar {
        background: #3b82f6;
      }

      @media (max-width: 768px) {
        .axyra-notifications-container {
          top: 10px;
          right: 10px;
          left: 10px;
          max-width: none;
        }

        .axyra-notification {
          min-width: auto;
          max-width: none;
        }
      }
    `;
    document.head.appendChild(style);
  }

  show(message, type = 'info', options = {}) {
    const notification = {
      id: this.generateId(),
      message: message,
      type: type,
      title: options.title || this.getDefaultTitle(type),
      duration: options.duration || this.defaultDuration,
      persistent: options.persistent || false,
      actions: options.actions || [],
      timestamp: Date.now(),
    };

    this.notifications.push(notification);
    this.renderNotification(notification);
    this.cleanupOldNotifications();

    return notification.id;
  }

  showSuccess(message, options = {}) {
    return this.show(message, 'success', { ...options, title: 'Éxito' });
  }

  showError(message, options = {}) {
    return this.show(message, 'error', { ...options, title: 'Error' });
  }

  showWarning(message, options = {}) {
    return this.show(message, 'warning', { ...options, title: 'Advertencia' });
  }

  showInfo(message, options = {}) {
    return this.show(message, 'info', { ...options, title: 'Información' });
  }

  renderNotification(notification) {
    const element = document.createElement('div');
    element.className = `axyra-notification axyra-notification-${notification.type}`;
    element.dataset.id = notification.id;

    const icon = this.getIcon(notification.type);
    const progressBar = notification.persistent
      ? ''
      : `
      <div class="axyra-notification-progress">
        <div class="axyra-notification-progress-bar" style="width: 100%;"></div>
      </div>
    `;

    element.innerHTML = `
      <div class="axyra-notification-content">
        <div class="axyra-notification-icon">
          <i class="fas fa-${icon}"></i>
        </div>
        <div class="axyra-notification-message">
          <div class="axyra-notification-title">${notification.title}</div>
          <div class="axyra-notification-text">${notification.message}</div>
        </div>
        <button class="axyra-notification-close" onclick="axyraNotifications.hide('${notification.id}')">
          <i class="fas fa-times"></i>
        </button>
      </div>
      ${progressBar}
    `;

    this.container.appendChild(element);

    // Mostrar con animación
    setTimeout(() => {
      element.classList.add('show');
    }, 100);

    // Auto-hide si no es persistente
    if (!notification.persistent) {
      this.autoHide(notification.id, notification.duration);
    }
  }

  autoHide(notificationId, duration) {
    const element = this.container.querySelector(`[data-id="${notificationId}"]`);
    if (!element) return;

    const progressBar = element.querySelector('.axyra-notification-progress-bar');
    if (progressBar) {
      progressBar.style.transition = `width ${duration}ms linear`;
      progressBar.style.width = '0%';
    }

    setTimeout(() => {
      this.hide(notificationId);
    }, duration);
  }

  hide(notificationId) {
    const element = this.container.querySelector(`[data-id="${notificationId}"]`);
    if (!element) return;

    element.classList.add('hide');

    setTimeout(() => {
      if (element.parentNode) {
        element.parentNode.removeChild(element);
      }
      this.notifications = this.notifications.filter((n) => n.id !== notificationId);
    }, 300);
  }

  hideAll() {
    this.notifications.forEach((notification) => {
      this.hide(notification.id);
    });
  }

  cleanupOldNotifications() {
    if (this.notifications.length > this.maxNotifications) {
      const oldest = this.notifications.shift();
      this.hide(oldest.id);
    }
  }

  getDefaultTitle(type) {
    const titles = {
      success: 'Éxito',
      error: 'Error',
      warning: 'Advertencia',
      info: 'Información',
    };
    return titles[type] || 'Notificación';
  }

  getIcon(type) {
    const icons = {
      success: 'check-circle',
      error: 'exclamation-circle',
      warning: 'exclamation-triangle',
      info: 'info-circle',
    };
    return icons[type] || 'info-circle';
  }

  generateId() {
    return 'notif_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  // Métodos de utilidad
  getNotifications() {
    return this.notifications;
  }

  getNotificationCount() {
    return this.notifications.length;
  }

  clearAll() {
    this.hideAll();
  }
}

// Inicializar sistema de notificaciones
document.addEventListener('DOMContentLoaded', function () {
  try {
    window.axyraNotifications = new AxyraNotificationSystem();
    console.log('✅ Sistema de Notificaciones AXYRA cargado');
  } catch (error) {
    console.error('❌ Error cargando sistema de notificaciones:', error);
  }
});

// Exportar para uso global
window.AxyraNotificationSystem = AxyraNotificationSystem;
