// ========================================
// AXYRA PUSH NOTIFICATIONS SYSTEM
// Sistema de notificaciones push con Service Workers
// ========================================

class AxyraPushNotificationSystem {
  constructor() {
    this.registration = null;
    this.isSupported = 'Notification' in window && 'serviceWorker' in navigator;
    this.permission = Notification.permission;
    this.subscription = null;

    this.init();
  }

  async init() {
    if (!this.isSupported) {
      console.warn('⚠️ Notificaciones push no soportadas en este navegador');
      return;
    }

    console.log('🔔 Inicializando Sistema de Notificaciones Push AXYRA...');

    try {
      await this.registerServiceWorker();
      await this.requestPermission();
      await this.subscribeToPush();
      this.setupEventListeners();
      console.log('✅ Sistema de Notificaciones Push AXYRA inicializado');
    } catch (error) {
      console.error('❌ Error inicializando notificaciones push:', error);
    }
  }

  async registerServiceWorker() {
    try {
      this.registration = await navigator.serviceWorker.register('/sw.js');
      console.log('✅ Service Worker registrado:', this.registration);
    } catch (error) {
      console.error('❌ Error registrando Service Worker:', error);
      throw error;
    }
  }

  async requestPermission() {
    if (this.permission === 'granted') {
      console.log('✅ Permisos de notificación ya concedidos');
      return true;
    }

    if (this.permission === 'denied') {
      console.warn('⚠️ Permisos de notificación denegados');
      return false;
    }

    try {
      this.permission = await Notification.requestPermission();
      console.log('🔔 Permiso de notificación:', this.permission);
      return this.permission === 'granted';
    } catch (error) {
      console.error('❌ Error solicitando permisos:', error);
      return false;
    }
  }

  async subscribeToPush() {
    if (!this.registration || this.permission !== 'granted') {
      return;
    }

    try {
      const response = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          endpoint: this.registration.pushManager.getSubscription(),
        }),
      });

      if (response.ok) {
        console.log('✅ Suscripción a push registrada');
      }
    } catch (error) {
      console.error('❌ Error suscribiéndose a push:', error);
    }
  }

  setupEventListeners() {
    // Escuchar mensajes del Service Worker
    navigator.serviceWorker.addEventListener('message', (event) => {
      this.handleServiceWorkerMessage(event.data);
    });

    // Escuchar cambios en la visibilidad de la página
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.scheduleBackgroundNotification();
      }
    });
  }

  handleServiceWorkerMessage(data) {
    switch (data.type) {
      case 'NOTIFICATION_CLICKED':
        this.handleNotificationClick(data.payload);
        break;
      case 'NOTIFICATION_CLOSED':
        this.handleNotificationClose(data.payload);
        break;
      default:
        console.log('📨 Mensaje del Service Worker:', data);
    }
  }

  handleNotificationClick(payload) {
    console.log('👆 Notificación clickeada:', payload);

    // Enfocar la ventana si está minimizada
    if (window.focus) {
      window.focus();
    }

    // Navegar a la página relevante
    if (payload.url) {
      window.location.href = payload.url;
    }
  }

  handleNotificationClose(payload) {
    console.log('❌ Notificación cerrada:', payload);
  }

  // Métodos de notificación
  async showNotification(title, options = {}) {
    if (!this.registration || this.permission !== 'granted') {
      console.warn('⚠️ No se pueden mostrar notificaciones');
      return;
    }

    const notificationOptions = {
      body: options.body || '',
      icon: options.icon || '/logo.png',
      badge: options.badge || '/logo.png',
      tag: options.tag || 'axyra-notification',
      data: options.data || {},
      actions: options.actions || [],
      requireInteraction: options.requireInteraction || false,
      silent: options.silent || false,
      timestamp: Date.now(),
    };

    try {
      await this.registration.showNotification(title, notificationOptions);
      console.log('🔔 Notificación mostrada:', title);
    } catch (error) {
      console.error('❌ Error mostrando notificación:', error);
    }
  }

  async showRealtimeNotification(data) {
    const title = data.title || 'AXYRA';
    const options = {
      body: data.message,
      icon: '/logo.png',
      tag: `realtime-${data.type}`,
      data: {
        url: data.url || '/dashboard',
        type: data.type,
        timestamp: Date.now(),
      },
      requireInteraction: data.important || false,
    };

    await this.showNotification(title, options);
  }

  async showSystemAlert(data) {
    const title = '⚠️ Alerta del Sistema';
    const options = {
      body: data.message,
      icon: '/logo.png',
      tag: `alert-${Date.now()}`,
      data: {
        url: '/configuracion',
        type: 'system-alert',
        timestamp: Date.now(),
      },
      requireInteraction: true,
    };

    await this.showNotification(title, options);
  }

  scheduleBackgroundNotification() {
    // Programar notificación para cuando la página esté en segundo plano
    setTimeout(() => {
      if (document.hidden) {
        this.showNotification('AXYRA', {
          body: 'Tienes actualizaciones pendientes',
          tag: 'background-reminder',
          data: { url: '/dashboard' },
        });
      }
    }, 30000); // 30 segundos
  }

  // Métodos de utilidad
  async getSubscription() {
    if (!this.registration) return null;

    try {
      return await this.registration.pushManager.getSubscription();
    } catch (error) {
      console.error('❌ Error obteniendo suscripción:', error);
      return null;
    }
  }

  async unsubscribe() {
    const subscription = await this.getSubscription();
    if (subscription) {
      try {
        await subscription.unsubscribe();
        console.log('✅ Suscripción cancelada');
      } catch (error) {
        console.error('❌ Error cancelando suscripción:', error);
      }
    }
  }

  isNotificationSupported() {
    return this.isSupported;
  }

  getPermissionStatus() {
    return this.permission;
  }

  // Métodos de configuración
  async updateNotificationSettings(settings) {
    try {
      const response = await fetch('/api/notifications/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        console.log('✅ Configuración de notificaciones actualizada');
        return true;
      }
    } catch (error) {
      console.error('❌ Error actualizando configuración:', error);
    }
    return false;
  }
}

// Inicializar sistema de notificaciones push
document.addEventListener('DOMContentLoaded', function () {
  try {
    window.axyraPushNotifications = new AxyraPushNotificationSystem();
    console.log('✅ Sistema de Notificaciones Push AXYRA cargado');
  } catch (error) {
    console.error('❌ Error cargando sistema de notificaciones push:', error);
  }
});

// Exportar para uso global
window.AxyraPushNotificationSystem = AxyraPushNotificationSystem;
