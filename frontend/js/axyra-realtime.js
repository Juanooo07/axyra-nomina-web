// ========================================
// AXYRA REALTIME SYSTEM
// Dashboard en tiempo real con WebSockets
// ========================================

class AxyraRealtimeSystem {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
    this.heartbeatInterval = null;
    this.subscribers = new Map();

    this.init();
  }

  init() {
    console.log('🔄 Inicializando Sistema de Tiempo Real AXYRA...');
    this.connect();
    this.setupEventListeners();
    console.log('✅ Sistema de Tiempo Real AXYRA inicializado');
  }

  connect() {
    try {
      // Configurar WebSocket (usando Socket.IO como fallback)
      if (typeof io !== 'undefined') {
        this.socket = io(process.env.VITE_WS_URL || 'ws://localhost:3001', {
          transports: ['websocket', 'polling'],
          timeout: 20000,
          forceNew: true,
        });
      } else {
        // Fallback a WebSocket nativo
        const wsUrl = process.env.VITE_WS_URL || 'ws://localhost:3001';
        this.socket = new WebSocket(wsUrl);
      }

      this.setupSocketEvents();
    } catch (error) {
      console.error('❌ Error conectando WebSocket:', error);
      this.handleConnectionError();
    }
  }

  setupSocketEvents() {
    if (this.socket) {
      // Eventos de conexión
      this.socket.on('connect', () => {
        console.log('🔗 WebSocket conectado');
        this.isConnected = true;
        this.reconnectAttempts = 0;
        this.startHeartbeat();
        this.notifySubscribers('connection', { status: 'connected' });
      });

      this.socket.on('disconnect', () => {
        console.log('🔌 WebSocket desconectado');
        this.isConnected = false;
        this.stopHeartbeat();
        this.notifySubscribers('connection', { status: 'disconnected' });
        this.handleReconnection();
      });

      // Eventos de datos en tiempo real
      this.socket.on('dashboard:stats', (data) => {
        this.updateDashboardStats(data);
      });

      this.socket.on('employees:update', (data) => {
        this.updateEmployeesData(data);
      });

      this.socket.on('inventory:update', (data) => {
        this.updateInventoryData(data);
      });

      this.socket.on('payroll:update', (data) => {
        this.updatePayrollData(data);
      });

      this.socket.on('notifications:new', (data) => {
        this.showRealtimeNotification(data);
      });

      this.socket.on('system:alert', (data) => {
        this.showSystemAlert(data);
      });

      // Eventos de error
      this.socket.on('error', (error) => {
        console.error('❌ Error WebSocket:', error);
        this.handleConnectionError();
      });
    }
  }

  setupEventListeners() {
    // Reconectar cuando se recupera la conexión
    window.addEventListener('online', () => {
      if (!this.isConnected) {
        this.connect();
      }
    });

    // Manejar pérdida de conexión
    window.addEventListener('offline', () => {
      this.isConnected = false;
      this.stopHeartbeat();
    });

    // Limpiar al cerrar la página
    window.addEventListener('beforeunload', () => {
      this.disconnect();
    });
  }

  startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      if (this.isConnected && this.socket) {
        this.socket.emit('ping', { timestamp: Date.now() });
      }
    }, 30000); // Ping cada 30 segundos
  }

  stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  handleReconnection() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

      console.log(
        `🔄 Reintentando conexión en ${delay}ms (intento ${this.reconnectAttempts}/${this.maxReconnectAttempts})`
      );

      setTimeout(() => {
        this.connect();
      }, delay);
    } else {
      console.error('❌ Máximo de intentos de reconexión alcanzado');
      this.notifySubscribers('connection', {
        status: 'failed',
        message: 'No se pudo conectar al servidor',
      });
    }
  }

  handleConnectionError() {
    this.isConnected = false;
    this.stopHeartbeat();
    this.notifySubscribers('connection', {
      status: 'error',
      message: 'Error de conexión',
    });
  }

  // Métodos de actualización de datos
  updateDashboardStats(data) {
    console.log('📊 Actualizando estadísticas del dashboard:', data);

    // Actualizar elementos del DOM
    if (data.totalEmpleados !== undefined) {
      const element = document.getElementById('totalEmpleados');
      if (element) {
        element.textContent = data.totalEmpleados;
        this.animateValue(element, data.totalEmpleados);
      }
    }

    if (data.totalHoras !== undefined) {
      const element = document.getElementById('totalHoras');
      if (element) {
        element.textContent = data.totalHoras.toFixed(1);
        this.animateValue(element, data.totalHoras);
      }
    }

    if (data.totalProductos !== undefined) {
      const element = document.getElementById('totalProductos');
      if (element) {
        element.textContent = data.totalProductos;
        this.animateValue(element, data.totalProductos);
      }
    }

    if (data.totalIngresos !== undefined) {
      const element = document.getElementById('totalIngresos');
      if (element) {
        element.textContent = this.formatCurrency(data.totalIngresos);
        this.animateValue(element, data.totalIngresos);
      }
    }

    // Notificar a suscriptores
    this.notifySubscribers('dashboard:stats', data);
  }

  updateEmployeesData(data) {
    console.log('👥 Actualizando datos de empleados:', data);

    // Actualizar tabla de empleados si existe
    const employeesTable = document.getElementById('employeesTable');
    if (employeesTable && data.employees) {
      this.renderEmployeesTable(data.employees);
    }

    this.notifySubscribers('employees:update', data);
  }

  updateInventoryData(data) {
    console.log('📦 Actualizando datos de inventario:', data);

    // Actualizar tabla de inventario si existe
    const inventoryTable = document.getElementById('inventoryTable');
    if (inventoryTable && data.products) {
      this.renderInventoryTable(data.products);
    }

    this.notifySubscribers('inventory:update', data);
  }

  updatePayrollData(data) {
    console.log('💰 Actualizando datos de nómina:', data);

    this.notifySubscribers('payroll:update', data);
  }

  showRealtimeNotification(data) {
    console.log('🔔 Notificación en tiempo real:', data);

    if (window.axyraNotifications) {
      window.axyraNotifications.showInfo(data.message, {
        title: data.title || 'Notificación',
        persistent: data.persistent || false,
      });
    }
  }

  showSystemAlert(data) {
    console.log('⚠️ Alerta del sistema:', data);

    if (window.axyraNotifications) {
      window.axyraNotifications.showWarning(data.message, {
        title: data.title || 'Alerta del Sistema',
        persistent: true,
      });
    }
  }

  // Métodos de utilidad
  animateValue(element, targetValue) {
    const startValue = parseInt(element.textContent) || 0;
    const duration = 1000;
    const startTime = performance.now();

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      const currentValue = Math.round(startValue + (targetValue - startValue) * progress);
      element.textContent = currentValue;

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }

  formatCurrency(value) {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  }

  // Sistema de suscripciones
  subscribe(event, callback) {
    if (!this.subscribers.has(event)) {
      this.subscribers.set(event, []);
    }
    this.subscribers.get(event).push(callback);
  }

  unsubscribe(event, callback) {
    if (this.subscribers.has(event)) {
      const callbacks = this.subscribers.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  notifySubscribers(event, data) {
    if (this.subscribers.has(event)) {
      this.subscribers.get(event).forEach((callback) => {
        try {
          callback(data);
        } catch (error) {
          console.error('❌ Error en callback:', error);
        }
      });
    }
  }

  // Métodos públicos
  emit(event, data) {
    if (this.isConnected && this.socket) {
      this.socket.emit(event, data);
    } else {
      console.warn('⚠️ WebSocket no conectado, no se puede emitir evento:', event);
    }
  }

  disconnect() {
    this.stopHeartbeat();
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.isConnected = false;
  }

  getConnectionStatus() {
    return {
      connected: this.isConnected,
      reconnectAttempts: this.reconnectAttempts,
      maxReconnectAttempts: this.maxReconnectAttempts,
    };
  }
}

// Inicializar sistema de tiempo real
document.addEventListener('DOMContentLoaded', function () {
  try {
    window.axyraRealtime = new AxyraRealtimeSystem();
    console.log('✅ Sistema de Tiempo Real AXYRA cargado');
  } catch (error) {
    console.error('❌ Error cargando sistema de tiempo real:', error);
  }
});

// Exportar para uso global
window.AxyraRealtimeSystem = AxyraRealtimeSystem;
