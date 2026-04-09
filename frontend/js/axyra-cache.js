// ========================================
// AXYRA CACHE SYSTEM
// Sistema de cache avanzado y optimizado
// ========================================

class AxyraCacheSystem {
  constructor() {
    this.cache = new Map();
    this.memoryCache = new Map();
    this.diskCache = new Map();
    this.cacheStats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      size: 0,
      maxSize: 50 * 1024 * 1024, // 50MB
      ttl: 24 * 60 * 60 * 1000, // 24 horas
    };

    this.init();
  }

  async init() {
    console.log('💾 Inicializando Sistema de Cache AXYRA...');

    try {
      await this.loadCacheFromStorage();
      this.setupCacheCleanup();
      this.setupCacheMonitoring();
      this.setupCacheStrategies();
      console.log('✅ Sistema de Cache AXYRA inicializado');
    } catch (error) {
      console.error('❌ Error inicializando sistema de cache:', error);
    }
  }

  async loadCacheFromStorage() {
    try {
      // Cargar cache desde localStorage
      const cacheData = localStorage.getItem('axyra_cache');
      if (cacheData) {
        const parsedCache = JSON.parse(cacheData);
        this.diskCache = new Map(parsedCache);
        console.log(`📦 Cache cargado: ${this.diskCache.size} elementos`);
      }
    } catch (error) {
      console.error('❌ Error cargando cache:', error);
    }
  }

  setupCacheCleanup() {
    // Limpiar cache expirado cada hora
    setInterval(() => {
      this.cleanupExpiredCache();
    }, 60 * 60 * 1000);

    // Limpiar cache por tamaño cada 30 minutos
    setInterval(() => {
      this.cleanupBySize();
    }, 30 * 60 * 1000);
  }

  setupCacheMonitoring() {
    // Monitorear uso de memoria
    this.memoryMonitor = setInterval(() => {
      this.monitorMemoryUsage();
    }, 5 * 60 * 1000); // Cada 5 minutos
  }

  setupCacheStrategies() {
    // Estrategias de cache por tipo de dato
    this.strategies = {
      'user-data': {
        ttl: 60 * 60 * 1000, // 1 hora
        priority: 'high',
        storage: 'memory',
      },
      'employee-data': {
        ttl: 30 * 60 * 1000, // 30 minutos
        priority: 'high',
        storage: 'memory',
      },
      'inventory-data': {
        ttl: 15 * 60 * 1000, // 15 minutos
        priority: 'medium',
        storage: 'disk',
      },
      reports: {
        ttl: 2 * 60 * 60 * 1000, // 2 horas
        priority: 'low',
        storage: 'disk',
      },
      config: {
        ttl: 24 * 60 * 60 * 1000, // 24 horas
        priority: 'high',
        storage: 'memory',
      },
    };
  }

  // Métodos principales de cache
  async get(key, options = {}) {
    const strategy = this.getStrategy(key, options);
    const cacheKey = this.generateCacheKey(key, strategy);

    // Intentar obtener de memoria primero
    if (strategy.storage === 'memory' && this.memoryCache.has(cacheKey)) {
      const item = this.memoryCache.get(cacheKey);
      if (!this.isExpired(item)) {
        this.cacheStats.hits++;
        return item.data;
      } else {
        this.memoryCache.delete(cacheKey);
      }
    }

    // Intentar obtener de disco
    if (this.diskCache.has(cacheKey)) {
      const item = this.diskCache.get(cacheKey);
      if (!this.isExpired(item)) {
        this.cacheStats.hits++;

        // Mover a memoria si es de alta prioridad
        if (strategy.priority === 'high') {
          this.memoryCache.set(cacheKey, item);
        }

        return item.data;
      } else {
        this.diskCache.delete(cacheKey);
      }
    }

    this.cacheStats.misses++;
    return null;
  }

  async set(key, data, options = {}) {
    const strategy = this.getStrategy(key, options);
    const cacheKey = this.generateCacheKey(key, strategy);

    const item = {
      data: data,
      timestamp: Date.now(),
      ttl: strategy.ttl,
      priority: strategy.priority,
      size: this.calculateSize(data),
    };

    // Guardar en memoria si es de alta prioridad
    if (strategy.priority === 'high' && strategy.storage === 'memory') {
      this.memoryCache.set(cacheKey, item);
    }

    // Guardar en disco
    this.diskCache.set(cacheKey, item);

    // Persistir en localStorage
    await this.persistCache();

    this.cacheStats.sets++;
    this.cacheStats.size += item.size;
  }

  async delete(key, options = {}) {
    const strategy = this.getStrategy(key, options);
    const cacheKey = this.generateCacheKey(key, strategy);

    this.memoryCache.delete(cacheKey);
    this.diskCache.delete(cacheKey);

    await this.persistCache();
    this.cacheStats.deletes++;
  }

  async clear() {
    this.memoryCache.clear();
    this.diskCache.clear();
    await this.persistCache();

    this.cacheStats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      size: 0,
      maxSize: this.cacheStats.maxSize,
      ttl: this.cacheStats.ttl,
    };
  }

  // Métodos de utilidad
  getStrategy(key, options) {
    const defaultStrategy = {
      ttl: this.cacheStats.ttl,
      priority: 'medium',
      storage: 'disk',
    };

    // Determinar estrategia por tipo de clave
    for (const [pattern, strategy] of Object.entries(this.strategies)) {
      if (key.includes(pattern)) {
        return { ...defaultStrategy, ...strategy, ...options };
      }
    }

    return { ...defaultStrategy, ...options };
  }

  generateCacheKey(key, strategy) {
    return `${strategy.priority}_${strategy.storage}_${key}`;
  }

  isExpired(item) {
    return Date.now() - item.timestamp > item.ttl;
  }

  calculateSize(data) {
    return JSON.stringify(data).length * 2; // Aproximación en bytes
  }

  // Métodos de limpieza
  cleanupExpiredCache() {
    const now = Date.now();
    let cleaned = 0;

    // Limpiar memoria
    for (const [key, item] of this.memoryCache.entries()) {
      if (now - item.timestamp > item.ttl) {
        this.memoryCache.delete(key);
        cleaned++;
      }
    }

    // Limpiar disco
    for (const [key, item] of this.diskCache.entries()) {
      if (now - item.timestamp > item.ttl) {
        this.diskCache.delete(key);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      this.persistCache();
      console.log(`🧹 Cache limpiado: ${cleaned} elementos expirados`);
    }
  }

  cleanupBySize() {
    if (this.cacheStats.size <= this.cacheStats.maxSize) return;

    // Ordenar por prioridad y timestamp
    const items = Array.from(this.diskCache.entries())
      .map(([key, item]) => ({ key, ...item }))
      .sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        }
        return b.timestamp - a.timestamp;
      });

    // Eliminar elementos de menor prioridad
    let removedSize = 0;
    const targetSize = this.cacheStats.maxSize * 0.8; // Reducir al 80%

    for (const item of items) {
      if (this.cacheStats.size - removedSize <= targetSize) break;

      this.diskCache.delete(item.key);
      removedSize += item.size;
    }

    this.cacheStats.size -= removedSize;
    this.persistCache();

    console.log(`🧹 Cache optimizado: ${removedSize} bytes liberados`);
  }

  monitorMemoryUsage() {
    const memoryUsage = performance.memory;
    if (memoryUsage) {
      const usedMB = memoryUsage.usedJSHeapSize / 1024 / 1024;
      const totalMB = memoryUsage.totalJSHeapSize / 1024 / 1024;

      if (usedMB / totalMB > 0.8) {
        console.warn('⚠️ Uso de memoria alto, limpiando cache...');
        this.cleanupBySize();
      }
    }
  }

  async persistCache() {
    try {
      const cacheData = Array.from(this.diskCache.entries());
      localStorage.setItem('axyra_cache', JSON.stringify(cacheData));
    } catch (error) {
      console.error('❌ Error persistiendo cache:', error);
    }
  }

  // Métodos específicos para AXYRA
  async cacheUserData(userId, data) {
    await this.set(`user-data_${userId}`, data, {
      ttl: 60 * 60 * 1000, // 1 hora
      priority: 'high',
      storage: 'memory',
    });
  }

  async cacheEmployeeData(employeeId, data) {
    await this.set(`employee-data_${employeeId}`, data, {
      ttl: 30 * 60 * 1000, // 30 minutos
      priority: 'high',
      storage: 'memory',
    });
  }

  async cacheInventoryData(inventoryId, data) {
    await this.set(`inventory-data_${inventoryId}`, data, {
      ttl: 15 * 60 * 1000, // 15 minutos
      priority: 'medium',
      storage: 'disk',
    });
  }

  async cacheReportData(reportId, data) {
    await this.set(`report-data_${reportId}`, data, {
      ttl: 2 * 60 * 60 * 1000, // 2 horas
      priority: 'low',
      storage: 'disk',
    });
  }

  // Métodos de estadísticas
  getCacheStats() {
    return {
      ...this.cacheStats,
      hitRate: (this.cacheStats.hits / (this.cacheStats.hits + this.cacheStats.misses)) * 100,
      memoryItems: this.memoryCache.size,
      diskItems: this.diskCache.size,
      totalItems: this.memoryCache.size + this.diskCache.size,
    };
  }

  getCacheSize() {
    return {
      memory: Array.from(this.memoryCache.values()).reduce((sum, item) => sum + item.size, 0),
      disk: Array.from(this.diskCache.values()).reduce((sum, item) => sum + item.size, 0),
      total: this.cacheStats.size,
    };
  }

  // Métodos de optimización
  async preloadCriticalData() {
    const criticalKeys = ['user-data', 'config', 'membership'];

    for (const key of criticalKeys) {
      const data = await this.get(key);
      if (!data) {
        // Cargar datos críticos si no están en cache
        console.log(`📦 Precargando datos críticos: ${key}`);
      }
    }
  }

  async warmupCache() {
    // Calentar cache con datos frecuentemente accedidos
    const warmupKeys = ['dashboard-stats', 'recent-employees', 'inventory-summary'];

    for (const key of warmupKeys) {
      const data = await this.get(key);
      if (!data) {
        console.log(`🔥 Calentando cache: ${key}`);
      }
    }
  }

  // Métodos de limpieza específicos
  clearUserCache(userId) {
    this.delete(`user-data_${userId}`);
    this.delete(`user-session_${userId}`);
  }

  clearEmployeeCache(employeeId) {
    this.delete(`employee-data_${employeeId}`);
    this.delete(`employee-hours_${employeeId}`);
  }

  clearInventoryCache(inventoryId) {
    this.delete(`inventory-data_${inventoryId}`);
    this.delete(`inventory-movements_${inventoryId}`);
  }

  // Métodos de exportación
  exportCache() {
    const cacheData = {
      memory: Array.from(this.memoryCache.entries()),
      disk: Array.from(this.diskCache.entries()),
      stats: this.getCacheStats(),
      timestamp: new Date().toISOString(),
    };

    const dataStr = JSON.stringify(cacheData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });

    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `axyra_cache_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  }

  // Métodos de limpieza
  destroy() {
    if (this.memoryMonitor) {
      clearInterval(this.memoryMonitor);
    }
    this.clear();
  }
}

// Inicializar sistema de cache
document.addEventListener('DOMContentLoaded', function () {
  try {
    window.axyraCache = new AxyraCacheSystem();
    console.log('✅ Sistema de Cache AXYRA cargado');
  } catch (error) {
    console.error('❌ Error cargando sistema de cache:', error);
  }
});

// Exportar para uso global
window.AxyraCacheSystem = AxyraCacheSystem;
