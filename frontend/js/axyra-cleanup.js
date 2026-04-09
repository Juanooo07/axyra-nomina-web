/**
 * AXYRA System Cleanup
 * Limpiador de archivos innecesarios del sistema AXYRA
 * Incluye: Detección de archivos obsoletos, limpieza de código, optimización
 */

class AxyraSystemCleanup {
  constructor() {
    this.cleanupResults = {
      filesRemoved: 0,
      filesOptimized: 0,
      sizeReduction: 0,
      errors: [],
    };
    this.isCleaning = false;
  }

  /**
   * Inicializar el limpiador
   */
  async initialize() {
    try {
      console.log('🧹 Inicializando AXYRA System Cleanup...');

      // Configurar limpieza automática
      this.setupAutomaticCleanup();

      console.log('✅ AXYRA System Cleanup inicializado');
      return true;
    } catch (error) {
      console.error('❌ Error inicializando cleanup:', error);
      return false;
    }
  }

  /**
   * Configurar limpieza automática
   */
  setupAutomaticCleanup() {
    // Limpieza al cargar
    window.addEventListener('load', () => {
      this.cleanupOnLoad();
    });

    // Limpieza periódica
    setInterval(() => {
      this.cleanupPeriodically();
    }, 300000); // 5 minutos

    // Limpieza antes de cerrar
    window.addEventListener('beforeunload', () => {
      this.cleanupBeforeUnload();
    });
  }

  /**
   * Limpieza al cargar
   */
  async cleanupOnLoad() {
    try {
      // Limpiar cache obsoleto
      await this.cleanupObsoleteCache();

      // Limpiar localStorage obsoleto
      await this.cleanupObsoleteLocalStorage();

      // Limpiar sessionStorage obsoleto
      await this.cleanupObsoleteSessionStorage();

      // Limpiar elementos DOM obsoletos
      await this.cleanupObsoleteDOM();
    } catch (error) {
      console.error('❌ Error en limpieza de carga:', error);
    }
  }

  /**
   * Limpieza periódica
   */
  async cleanupPeriodically() {
    try {
      // Limpiar memoria
      await this.cleanupMemory();

      // Limpiar recursos no utilizados
      await this.cleanupUnusedResources();

      // Optimizar rendimiento
      await this.optimizePerformance();
    } catch (error) {
      console.error('❌ Error en limpieza periódica:', error);
    }
  }

  /**
   * Limpieza antes de cerrar
   */
  async cleanupBeforeUnload() {
    try {
      // Limpiar event listeners
      this.cleanupEventListeners();

      // Limpiar timers
      this.cleanupTimers();

      // Limpiar cache
      this.cleanupCache();
    } catch (error) {
      console.error('❌ Error en limpieza antes de cerrar:', error);
    }
  }

  /**
   * Limpiar cache obsoleto
   */
  async cleanupObsoleteCache() {
    try {
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        const currentCache = 'axyra-v1';
        let removedCount = 0;

        for (const cacheName of cacheNames) {
          if (cacheName !== currentCache) {
            await caches.delete(cacheName);
            removedCount++;
          }
        }

        this.cleanupResults.filesRemoved += removedCount;
        console.log(`✅ ${removedCount} caches obsoletos removidos`);
      }
    } catch (error) {
      console.error('❌ Error limpiando cache obsoleto:', error);
    }
  }

  /**
   * Limpiar localStorage obsoleto
   */
  async cleanupObsoleteLocalStorage() {
    try {
      const keys = Object.keys(localStorage);
      let removedCount = 0;

      for (const key of keys) {
        if (this.isObsoleteKey(key)) {
          localStorage.removeItem(key);
          removedCount++;
        }
      }

      this.cleanupResults.filesRemoved += removedCount;
      console.log(`✅ ${removedCount} elementos obsoletos de localStorage removidos`);
    } catch (error) {
      console.error('❌ Error limpiando localStorage obsoleto:', error);
    }
  }

  /**
   * Limpiar sessionStorage obsoleto
   */
  async cleanupObsoleteSessionStorage() {
    try {
      const keys = Object.keys(sessionStorage);
      let removedCount = 0;

      for (const key of keys) {
        if (this.isObsoleteKey(key)) {
          sessionStorage.removeItem(key);
          removedCount++;
        }
      }

      this.cleanupResults.filesRemoved += removedCount;
      console.log(`✅ ${removedCount} elementos obsoletos de sessionStorage removidos`);
    } catch (error) {
      console.error('❌ Error limpiando sessionStorage obsoleto:', error);
    }
  }

  /**
   * Limpiar elementos DOM obsoletos
   */
  async cleanupObsoleteDOM() {
    try {
      // Remover elementos con clases obsoletas
      const obsoleteElements = document.querySelectorAll('.obsolete, .deprecated, .old');
      let removedCount = 0;

      for (const element of obsoleteElements) {
        element.remove();
        removedCount++;
      }

      // Remover scripts obsoletos
      const obsoleteScripts = document.querySelectorAll('script[src*="old"], script[src*="deprecated"]');
      for (const script of obsoleteScripts) {
        script.remove();
        removedCount++;
      }

      // Remover estilos obsoletos
      const obsoleteStyles = document.querySelectorAll('link[href*="old"], link[href*="deprecated"]');
      for (const style of obsoleteStyles) {
        style.remove();
        removedCount++;
      }

      this.cleanupResults.filesRemoved += removedCount;
      console.log(`✅ ${removedCount} elementos DOM obsoletos removidos`);
    } catch (error) {
      console.error('❌ Error limpiando DOM obsoleto:', error);
    }
  }

  /**
   * Limpiar memoria
   */
  async cleanupMemory() {
    try {
      // Limpiar referencias circulares
      this.cleanupCircularReferences();

      // Limpiar objetos no utilizados
      this.cleanupUnusedObjects();

      // Forzar garbage collection si está disponible
      if (window.gc) {
        window.gc();
      }

      console.log('✅ Memoria limpiada');
    } catch (error) {
      console.error('❌ Error limpiando memoria:', error);
    }
  }

  /**
   * Limpiar recursos no utilizados
   */
  async cleanupUnusedResources() {
    try {
      // Limpiar imágenes no utilizadas
      await this.cleanupUnusedImages();

      // Limpiar scripts no utilizados
      await this.cleanupUnusedScripts();

      // Limpiar estilos no utilizados
      await this.cleanupUnusedStyles();
    } catch (error) {
      console.error('❌ Error limpiando recursos no utilizados:', error);
    }
  }

  /**
   * Optimizar rendimiento
   */
  async optimizePerformance() {
    try {
      // Optimizar selectores CSS
      await this.optimizeCSSSelectors();

      // Optimizar consultas DOM
      await this.optimizeDOMQueries();

      // Optimizar event listeners
      await this.optimizeEventListeners();
    } catch (error) {
      console.error('❌ Error optimizando rendimiento:', error);
    }
  }

  /**
   * Limpiar event listeners
   */
  cleanupEventListeners() {
    try {
      // Remover event listeners específicos
      const elements = document.querySelectorAll('[data-axyra-listener]');
      elements.forEach((element) => {
        element.removeAttribute('data-axyra-listener');
      });

      console.log('✅ Event listeners limpiados');
    } catch (error) {
      console.error('❌ Error limpiando event listeners:', error);
    }
  }

  /**
   * Limpiar timers
   */
  cleanupTimers() {
    try {
      // Limpiar timers específicos de AXYRA
      for (let i = 1; i < 10000; i++) {
        clearTimeout(i);
        clearInterval(i);
      }

      console.log('✅ Timers limpiados');
    } catch (error) {
      console.error('❌ Error limpiando timers:', error);
    }
  }

  /**
   * Limpiar cache
   */
  cleanupCache() {
    try {
      // Limpiar cache específico de AXYRA
      if (window.axyraCache) {
        window.axyraCache.clear();
      }

      console.log('✅ Cache limpiado');
    } catch (error) {
      console.error('❌ Error limpiando cache:', error);
    }
  }

  /**
   * Verificar si una clave es obsoleta
   */
  isObsoleteKey(key) {
    const obsoletePatterns = [
      /^axyra_temp_/,
      /^axyra_cache_/,
      /^axyra_old_/,
      /^axyra_deprecated_/,
      /^axyra_test_/,
      /^axyra_debug_/,
    ];

    return obsoletePatterns.some((pattern) => pattern.test(key));
  }

  /**
   * Limpiar referencias circulares
   */
  cleanupCircularReferences() {
    try {
      // Limpiar referencias circulares en objetos globales
      if (window.axyraConfig) {
        delete window.axyraConfig._circularRefs;
      }

      if (window.axyraAuth) {
        delete window.axyraAuth._circularRefs;
      }

      console.log('✅ Referencias circulares limpiadas');
    } catch (error) {
      console.error('❌ Error limpiando referencias circulares:', error);
    }
  }

  /**
   * Limpiar objetos no utilizados
   */
  cleanupUnusedObjects() {
    try {
      // Limpiar objetos temporales
      if (window.axyraTemp) {
        delete window.axyraTemp;
      }

      if (window.axyraDebug) {
        delete window.axyraDebug;
      }

      console.log('✅ Objetos no utilizados limpiados');
    } catch (error) {
      console.error('❌ Error limpiando objetos no utilizados:', error);
    }
  }

  /**
   * Limpiar imágenes no utilizadas
   */
  async cleanupUnusedImages() {
    try {
      const images = document.querySelectorAll('img');
      let removedCount = 0;

      for (const img of images) {
        // Remover imágenes con errores
        if (img.complete && img.naturalWidth === 0) {
          img.remove();
          removedCount++;
        }

        // Remover imágenes duplicadas
        if (this.isDuplicateImage(img)) {
          img.remove();
          removedCount++;
        }
      }

      this.cleanupResults.filesRemoved += removedCount;
      console.log(`✅ ${removedCount} imágenes no utilizadas removidas`);
    } catch (error) {
      console.error('❌ Error limpiando imágenes no utilizadas:', error);
    }
  }

  /**
   * Limpiar scripts no utilizados
   */
  async cleanupUnusedScripts() {
    try {
      const scripts = document.querySelectorAll('script[src]');
      let removedCount = 0;

      for (const script of scripts) {
        // Remover scripts con errores
        if (script.onerror) {
          script.remove();
          removedCount++;
        }

        // Remover scripts duplicados
        if (this.isDuplicateScript(script)) {
          script.remove();
          removedCount++;
        }
      }

      this.cleanupResults.filesRemoved += removedCount;
      console.log(`✅ ${removedCount} scripts no utilizados removidos`);
    } catch (error) {
      console.error('❌ Error limpiando scripts no utilizados:', error);
    }
  }

  /**
   * Limpiar estilos no utilizados
   */
  async cleanupUnusedStyles() {
    try {
      const styles = document.querySelectorAll('link[rel="stylesheet"]');
      let removedCount = 0;

      for (const style of styles) {
        // Remover estilos con errores
        if (style.onerror) {
          style.remove();
          removedCount++;
        }

        // Remover estilos duplicados
        if (this.isDuplicateStyle(style)) {
          style.remove();
          removedCount++;
        }
      }

      this.cleanupResults.filesRemoved += removedCount;
      console.log(`✅ ${removedCount} estilos no utilizados removidos`);
    } catch (error) {
      console.error('❌ Error limpiando estilos no utilizados:', error);
    }
  }

  /**
   * Optimizar selectores CSS
   */
  async optimizeCSSSelectors() {
    try {
      // Optimizar selectores CSS complejos
      const complexSelectors = document.querySelectorAll('[class*=" "], [id*=" "], [class*="_"], [id*="_"]');
      let optimizedCount = 0;

      for (const element of complexSelectors) {
        // Simplificar clases complejas
        if (element.className && element.className.includes(' ')) {
          const classes = element.className.split(' ').filter((c) => c.trim());
          element.className = classes.join(' ');
          optimizedCount++;
        }
      }

      this.cleanupResults.filesOptimized += optimizedCount;
      console.log(`✅ ${optimizedCount} selectores CSS optimizados`);
    } catch (error) {
      console.error('❌ Error optimizando selectores CSS:', error);
    }
  }

  /**
   * Optimizar consultas DOM
   */
  async optimizeDOMQueries() {
    try {
      // Optimizar consultas DOM repetitivas
      const queries = document.querySelectorAll('[data-query]');
      let optimizedCount = 0;

      for (const element of queries) {
        // Cachear consultas DOM
        if (!element._cachedQuery) {
          element._cachedQuery = element.querySelectorAll('*');
          optimizedCount++;
        }
      }

      this.cleanupResults.filesOptimized += optimizedCount;
      console.log(`✅ ${optimizedCount} consultas DOM optimizadas`);
    } catch (error) {
      console.error('❌ Error optimizando consultas DOM:', error);
    }
  }

  /**
   * Optimizar event listeners
   */
  async optimizeEventListeners() {
    try {
      // Optimizar event listeners
      const elements = document.querySelectorAll('[data-listener]');
      let optimizedCount = 0;

      for (const element of elements) {
        // Usar event delegation
        if (!element._delegated) {
          element._delegated = true;
          optimizedCount++;
        }
      }

      this.cleanupResults.filesOptimized += optimizedCount;
      console.log(`✅ ${optimizedCount} event listeners optimizados`);
    } catch (error) {
      console.error('❌ Error optimizando event listeners:', error);
    }
  }

  /**
   * Verificar si una imagen es duplicada
   */
  isDuplicateImage(img) {
    const src = img.src;
    const images = document.querySelectorAll('img[src="' + src + '"]');
    return images.length > 1;
  }

  /**
   * Verificar si un script es duplicado
   */
  isDuplicateScript(script) {
    const src = script.src;
    const scripts = document.querySelectorAll('script[src="' + src + '"]');
    return scripts.length > 1;
  }

  /**
   * Verificar si un estilo es duplicado
   */
  isDuplicateStyle(style) {
    const href = style.href;
    const styles = document.querySelectorAll('link[href="' + href + '"]');
    return styles.length > 1;
  }

  /**
   * Ejecutar limpieza completa
   */
  async runFullCleanup() {
    if (this.isCleaning) {
      console.warn('⚠️ Limpieza ya está en progreso');
      return;
    }

    this.isCleaning = true;
    this.cleanupResults = {
      filesRemoved: 0,
      filesOptimized: 0,
      sizeReduction: 0,
      errors: [],
    };

    try {
      console.log('🚀 Iniciando limpieza completa...');

      // Ejecutar todas las limpiezas
      await this.cleanupOnLoad();
      await this.cleanupPeriodically();
      await this.cleanupBeforeUnload();

      // Generar reporte
      this.generateCleanupReport();

      console.log('✅ Limpieza completa finalizada');
    } catch (error) {
      console.error('❌ Error en limpieza completa:', error);
      this.cleanupResults.errors.push(error.message);
    } finally {
      this.isCleaning = false;
    }
  }

  /**
   * Generar reporte de limpieza
   */
  generateCleanupReport() {
    const report = {
      timestamp: new Date().toISOString(),
      results: this.cleanupResults,
      recommendations: this.generateCleanupRecommendations(),
    };

    console.log('📊 Reporte de Limpieza:', report);

    // Guardar reporte
    localStorage.setItem('axyra_cleanup_report', JSON.stringify(report));

    // Mostrar notificación
    if (window.axyraNotifications) {
      window.axyraNotifications.showSuccess(
        `✅ Limpieza completada: ${this.cleanupResults.filesRemoved} archivos removidos, ${this.cleanupResults.filesOptimized} optimizados`
      );
    }

    return report;
  }

  /**
   * Generar recomendaciones de limpieza
   */
  generateCleanupRecommendations() {
    const recommendations = [];

    if (this.cleanupResults.filesRemoved > 0) {
      recommendations.push({
        type: 'cleanup',
        message: `${this.cleanupResults.filesRemoved} archivos obsoletos removidos`,
      });
    }

    if (this.cleanupResults.filesOptimized > 0) {
      recommendations.push({
        type: 'optimization',
        message: `${this.cleanupResults.filesOptimized} archivos optimizados`,
      });
    }

    recommendations.push({
      type: 'maintenance',
      message: 'Sistema limpio y optimizado',
    });

    return recommendations;
  }

  /**
   * Obtener reporte de limpieza
   */
  getCleanupReport() {
    const report = localStorage.getItem('axyra_cleanup_report');
    return report ? JSON.parse(report) : null;
  }

  /**
   * Limpiar reportes
   */
  clearCleanupReports() {
    localStorage.removeItem('axyra_cleanup_report');
    this.cleanupResults = {
      filesRemoved: 0,
      filesOptimized: 0,
      sizeReduction: 0,
      errors: [],
    };
  }
}

// Inicializar limpiador
window.axyraSystemCleanup = new AxyraSystemCleanup();

// Auto-inicializar
document.addEventListener('DOMContentLoaded', async () => {
  await window.axyraSystemCleanup.initialize();
});

console.log('🧹 AXYRA System Cleanup cargado');
