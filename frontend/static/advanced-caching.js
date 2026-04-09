// ========================================
// SISTEMA DE CACHÉ AVANZADO AXYRA - FASE 3
// ========================================

class AxyraCache {
  constructor() {
    this.cache = new Map();
    this.maxSize = 100;
    this.ttl = 5 * 60 * 1000; // 5 minutos
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0
    };
  }

  // Obtener del caché
  get(key) {
    const item = this.cache.get(key);
    
    if (!item) {
      this.stats.misses++;
      return null;
    }
    
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      this.stats.misses++;
      return null;
    }
    
    this.stats.hits++;
    return item.value;
  }

  // Establecer en caché
  set(key, value, ttl = this.ttl) {
    // Limpiar caché si está lleno
    if (this.cache.size >= this.maxSize) {
      this.cleanup();
    }
    
    const item = {
      value,
      expiry: Date.now() + ttl,
      created: Date.now()
    };
    
    this.cache.set(key, item);
    this.stats.sets++;
  }

  // Eliminar del caché
  delete(key) {
    const deleted = this.cache.delete(key);
    if (deleted) {
      this.stats.deletes++;
    }
    return deleted;
  }

  // Limpiar caché expirado
  cleanup() {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiry) {
        this.cache.delete(key);
      }
    }
  }

  // Limpiar todo el caché
  clear() {
    this.cache.clear();
  }

  // Obtener estadísticas
  getStats() {
    return {
      ...this.stats,
      size: this.cache.size,
      hitRate: this.stats.hits / (this.stats.hits + this.stats.misses) * 100
    };
  }
}

// Caché para consultas de Firebase
class AxyraFirebaseCache {
  constructor() {
    this.cache = new AxyraCache();
    this.queryCache = new Map();
  }

  // Caché de consultas
  async getCachedQuery(collection, query, ttl = 300000) { // 5 minutos
    const cacheKey = `${collection}:${JSON.stringify(query)}`;
    
    let result = this.cache.get(cacheKey);
    
    if (!result) {
      // Simular consulta a Firebase
      result = await this.executeQuery(collection, query);
      this.cache.set(cacheKey, result, ttl);
    }
    
    return result;
  }

  // Ejecutar consulta (simulado)
  async executeQuery(collection, query) {
    // Aquí iría la lógica real de Firebase
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({ data: [], timestamp: Date.now() });
      }, 100);
    });
  }

  // Invalidar caché por colección
  invalidateCollection(collection) {
    for (const [key, item] of this.cache.cache.entries()) {
      if (key.startsWith(`${collection}:`)) {
        this.cache.delete(key);
      }
    }
  }
}

// Caché para localStorage
class AxyraLocalStorageCache {
  constructor() {
    this.prefix = 'axyra_cache_';
    this.maxAge = 24 * 60 * 60 * 1000; // 24 horas
  }

  get(key) {
    try {
      const item = localStorage.getItem(this.prefix + key);
      if (!item) return null;
      
      const parsed = JSON.parse(item);
      if (Date.now() > parsed.expiry) {
        this.delete(key);
        return null;
      }
      
      return parsed.value;
    } catch (error) {
      console.error('Error getting from localStorage cache:', error);
      return null;
    }
  }

  set(key, value, ttl = this.maxAge) {
    try {
      const item = {
        value,
        expiry: Date.now() + ttl,
        created: Date.now()
      };
      
      localStorage.setItem(this.prefix + key, JSON.stringify(item));
    } catch (error) {
      console.error('Error setting to localStorage cache:', error);
    }
  }

  delete(key) {
    try {
      localStorage.removeItem(this.prefix + key);
    } catch (error) {
      console.error('Error deleting from localStorage cache:', error);
    }
  }

  clear() {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(this.prefix)) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error('Error clearing localStorage cache:', error);
    }
  }
}

// Instancias globales
window.axyraCache = new AxyraCache();
window.axyraFirebaseCache = new AxyraFirebaseCache();
window.axyraLocalStorageCache = new AxyraLocalStorageCache();

// Limpiar caché periódicamente
setInterval(() => {
  window.axyraCache.cleanup();
  window.axyraLocalStorageCache.clear();
}, 30 * 60 * 1000); // Cada 30 minutos

console.log('✅ Sistema de caché avanzado AXYRA inicializado');
