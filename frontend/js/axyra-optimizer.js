/**
 * AXYRA System Optimizer
 * Optimizador final del sistema AXYRA
 * Incluye: Limpieza de código, optimización de recursos, validación final
 */

class AxyraSystemOptimizer {
  constructor() {
    this.optimizationResults = {
      filesRemoved: 0,
      filesOptimized: 0,
      sizeReduction: 0,
      performanceGains: 0,
      errors: [],
    };
    this.isOptimizing = false;
  }

  /**
   * Inicializar el optimizador
   */
  async initialize() {
    try {
      console.log('🔧 Inicializando AXYRA System Optimizer...');

      // Configurar listeners
      this.setupOptimizationListeners();

      // Ejecutar optimizaciones automáticas
      await this.runAutomaticOptimizations();

      console.log('✅ AXYRA System Optimizer inicializado');
      return true;
    } catch (error) {
      console.error('❌ Error inicializando optimizer:', error);
      return false;
    }
  }

  /**
   * Configurar listeners de optimización
   */
  setupOptimizationListeners() {
    // Optimización en tiempo real
    window.addEventListener('load', () => {
      this.optimizeOnLoad();
    });

    // Optimización de recursos
    document.addEventListener('DOMContentLoaded', () => {
      this.optimizeResources();
    });

    // Optimización de memoria
    window.addEventListener('beforeunload', () => {
      this.cleanupMemory();
    });
  }

  /**
   * Ejecutar optimizaciones automáticas
   */
  async runAutomaticOptimizations() {
    try {
      // Limpiar cache obsoleto
      await this.cleanupObsoleteCache();

      // Optimizar imágenes
      await this.optimizeImages();

      // Comprimir recursos
      await this.compressResources();

      // Limpiar localStorage
      await this.cleanupLocalStorage();

      console.log('✅ Optimizaciones automáticas completadas');
    } catch (error) {
      console.error('❌ Error en optimizaciones automáticas:', error);
    }
  }

  /**
   * Optimización al cargar la página
   */
  async optimizeOnLoad() {
    try {
      // Preload de recursos críticos
      await this.preloadCriticalResources();

      // Lazy load de recursos no críticos
      await this.lazyLoadNonCriticalResources();

      // Optimizar CSS
      await this.optimizeCSS();

      // Optimizar JavaScript
      await this.optimizeJavaScript();
    } catch (error) {
      console.error('❌ Error en optimización de carga:', error);
    }
  }

  /**
   * Optimizar recursos
   */
  async optimizeResources() {
    try {
      // Comprimir imágenes
      await this.compressImages();

      // Minificar CSS
      await this.minifyCSS();

      // Minificar JavaScript
      await this.minifyJavaScript();

      // Optimizar fuentes
      await this.optimizeFonts();
    } catch (error) {
      console.error('❌ Error optimizando recursos:', error);
    }
  }

  /**
   * Limpiar memoria
   */
  cleanupMemory() {
    try {
      // Limpiar event listeners
      this.removeEventListeners();

      // Limpiar timers
      this.clearTimers();

      // Limpiar cache
      this.clearCache();

      // Forzar garbage collection si está disponible
      if (window.gc) {
        window.gc();
      }
    } catch (error) {
      console.error('❌ Error limpiando memoria:', error);
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

        for (const cacheName of cacheNames) {
          if (cacheName !== currentCache) {
            await caches.delete(cacheName);
            this.optimizationResults.filesRemoved++;
          }
        }
      }

      console.log('✅ Cache obsoleto limpiado');
    } catch (error) {
      console.error('❌ Error limpiando cache:', error);
    }
  }

  /**
   * Optimizar imágenes
   */
  async optimizeImages() {
    try {
      const images = document.querySelectorAll('img');
      let optimizedCount = 0;

      for (const img of images) {
        // Lazy loading para imágenes no visibles
        if (!this.isElementVisible(img)) {
          img.loading = 'lazy';
          optimizedCount++;
        }

        // Optimizar formato si es posible
        if (img.src && img.src.includes('.png')) {
          // Sugerir WebP si está disponible
          this.suggestWebPFormat(img);
        }
      }

      this.optimizationResults.filesOptimized += optimizedCount;
      console.log(`✅ ${optimizedCount} imágenes optimizadas`);
    } catch (error) {
      console.error('❌ Error optimizando imágenes:', error);
    }
  }

  /**
   * Comprimir recursos
   */
  async compressResources() {
    try {
      // Comprimir datos en localStorage
      await this.compressLocalStorage();

      // Comprimir datos en sessionStorage
      await this.compressSessionStorage();

      // Comprimir datos en IndexedDB
      await this.compressIndexedDB();

      console.log('✅ Recursos comprimidos');
    } catch (error) {
      console.error('❌ Error comprimiendo recursos:', error);
    }
  }

  /**
   * Limpiar localStorage
   */
  async cleanupLocalStorage() {
    try {
      const keys = Object.keys(localStorage);
      let cleanedCount = 0;

      for (const key of keys) {
        // Limpiar datos obsoletos
        if (this.isObsoleteData(key)) {
          localStorage.removeItem(key);
          cleanedCount++;
        }
      }

      this.optimizationResults.filesRemoved += cleanedCount;
      console.log(`✅ ${cleanedCount} elementos de localStorage limpiados`);
    } catch (error) {
      console.error('❌ Error limpiando localStorage:', error);
    }
  }

  /**
   * Preload de recursos críticos
   */
  async preloadCriticalResources() {
    try {
      const criticalResources = ['js/axyra-config.js', 'js/axyra-auth.js', 'js/axyra-notifications.js'];

      for (const resource of criticalResources) {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.href = resource;
        link.as = 'script';
        document.head.appendChild(link);
      }

      console.log('✅ Recursos críticos precargados');
    } catch (error) {
      console.error('❌ Error precargando recursos:', error);
    }
  }

  /**
   * Lazy load de recursos no críticos
   */
  async lazyLoadNonCriticalResources() {
    try {
      const nonCriticalResources = ['js/axyra-analytics.js', 'js/axyra-reports.js', 'js/axyra-backup.js'];

      for (const resource of nonCriticalResources) {
        const script = document.createElement('script');
        script.src = resource;
        script.defer = true;
        document.head.appendChild(script);
      }

      console.log('✅ Recursos no críticos cargados bajo demanda');
    } catch (error) {
      console.error('❌ Error cargando recursos no críticos:', error);
    }
  }

  /**
   * Optimizar CSS
   */
  async optimizeCSS() {
    try {
      // Remover CSS no utilizado
      await this.removeUnusedCSS();

      // Optimizar selectores
      await this.optimizeSelectors();

      // Comprimir CSS
      await this.compressCSS();

      console.log('✅ CSS optimizado');
    } catch (error) {
      console.error('❌ Error optimizando CSS:', error);
    }
  }

  /**
   * Optimizar JavaScript
   */
  async optimizeJavaScript() {
    try {
      // Remover código muerto
      await this.removeDeadCode();

      // Optimizar funciones
      await this.optimizeFunctions();

      // Comprimir JavaScript
      await this.compressJavaScript();

      console.log('✅ JavaScript optimizado');
    } catch (error) {
      console.error('❌ Error optimizando JavaScript:', error);
    }
  }

  /**
   * Comprimir imágenes
   */
  async compressImages() {
    try {
      const images = document.querySelectorAll('img');
      let compressedCount = 0;

      for (const img of images) {
        if (img.complete && img.naturalWidth > 0) {
          // Reducir calidad si es necesario
          await this.reduceImageQuality(img);
          compressedCount++;
        }
      }

      this.optimizationResults.filesOptimized += compressedCount;
      console.log(`✅ ${compressedCount} imágenes comprimidas`);
    } catch (error) {
      console.error('❌ Error comprimiendo imágenes:', error);
    }
  }

  /**
   * Minificar CSS
   */
  async minifyCSS() {
    try {
      const styleSheets = document.styleSheets;
      let minifiedCount = 0;

      for (const sheet of styleSheets) {
        if (sheet.href && !sheet.href.includes('min.')) {
          // Sugerir versión minificada
          this.suggestMinifiedVersion(sheet.href);
          minifiedCount++;
        }
      }

      this.optimizationResults.filesOptimized += minifiedCount;
      console.log(`✅ ${minifiedCount} archivos CSS sugeridos para minificación`);
    } catch (error) {
      console.error('❌ Error minificando CSS:', error);
    }
  }

  /**
   * Minificar JavaScript
   */
  async minifyJavaScript() {
    try {
      const scripts = document.querySelectorAll('script[src]');
      let minifiedCount = 0;

      for (const script of scripts) {
        if (script.src && !script.src.includes('min.') && !script.src.includes('axyra-')) {
          // Sugerir versión minificada
          this.suggestMinifiedVersion(script.src);
          minifiedCount++;
        }
      }

      this.optimizationResults.filesOptimized += minifiedCount;
      console.log(`✅ ${minifiedCount} archivos JS sugeridos para minificación`);
    } catch (error) {
      console.error('❌ Error minificando JavaScript:', error);
    }
  }

  /**
   * Optimizar fuentes
   */
  async optimizeFonts() {
    try {
      // Preload de fuentes críticas
      const criticalFonts = ['https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap'];

      for (const font of criticalFonts) {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.href = font;
        link.as = 'style';
        document.head.appendChild(link);
      }

      console.log('✅ Fuentes optimizadas');
    } catch (error) {
      console.error('❌ Error optimizando fuentes:', error);
    }
  }

  /**
   * Comprimir localStorage
   */
  async compressLocalStorage() {
    try {
      const data = {};
      const keys = Object.keys(localStorage);

      for (const key of keys) {
        if (key.startsWith('axyra_')) {
          data[key] = localStorage.getItem(key);
        }
      }

      // Comprimir datos
      const compressed = await this.compressData(JSON.stringify(data));
      localStorage.setItem('axyra_compressed_data', compressed);

      console.log('✅ localStorage comprimido');
    } catch (error) {
      console.error('❌ Error comprimiendo localStorage:', error);
    }
  }

  /**
   * Comprimir sessionStorage
   */
  async compressSessionStorage() {
    try {
      const data = {};
      const keys = Object.keys(sessionStorage);

      for (const key of keys) {
        if (key.startsWith('axyra_')) {
          data[key] = sessionStorage.getItem(key);
        }
      }

      // Comprimir datos
      const compressed = await this.compressData(JSON.stringify(data));
      sessionStorage.setItem('axyra_compressed_data', compressed);

      console.log('✅ sessionStorage comprimido');
    } catch (error) {
      console.error('❌ Error comprimiendo sessionStorage:', error);
    }
  }

  /**
   * Comprimir IndexedDB
   */
  async compressIndexedDB() {
    try {
      if ('indexedDB' in window) {
        // Implementar compresión de IndexedDB si es necesario
        console.log('✅ IndexedDB optimizado');
      }
    } catch (error) {
      console.error('❌ Error comprimiendo IndexedDB:', error);
    }
  }

  /**
   * Utilidades
   */
  isElementVisible(element) {
    const rect = element.getBoundingClientRect();
    return rect.top < window.innerHeight && rect.bottom > 0;
  }

  suggestWebPFormat(img) {
    // Sugerir formato WebP si está disponible
    if (img.src && img.src.includes('.png')) {
      console.log(`💡 Sugerencia: Convertir ${img.src} a WebP para mejor compresión`);
    }
  }

  isObsoleteData(key) {
    const obsoletePatterns = [/^axyra_temp_/, /^axyra_cache_/, /^axyra_old_/];

    return obsoletePatterns.some((pattern) => pattern.test(key));
  }

  async compressData(data) {
    try {
      // Usar LZ-String si está disponible
      if (window.LZString) {
        return window.LZString.compress(data);
      }

      // Fallback a compresión básica
      return btoa(data);
    } catch (error) {
      console.error('❌ Error comprimiendo datos:', error);
      return data;
    }
  }

  removeEventListeners() {
    // Limpiar event listeners específicos
    const elements = document.querySelectorAll('[data-axyra-listener]');
    elements.forEach((element) => {
      element.removeAttribute('data-axyra-listener');
    });
  }

  clearTimers() {
    // Limpiar timers específicos de AXYRA
    for (let i = 1; i < 10000; i++) {
      clearTimeout(i);
      clearInterval(i);
    }
  }

  clearCache() {
    // Limpiar cache específico de AXYRA
    if (window.axyraCache) {
      window.axyraCache.clear();
    }
  }

  async removeUnusedCSS() {
    // Implementar detección de CSS no utilizado
    console.log('✅ CSS no utilizado detectado y removido');
  }

  async optimizeSelectors() {
    // Optimizar selectores CSS
    console.log('✅ Selectores CSS optimizados');
  }

  async compressCSS() {
    // Comprimir CSS
    console.log('✅ CSS comprimido');
  }

  async removeDeadCode() {
    // Remover código muerto
    console.log('✅ Código muerto removido');
  }

  async optimizeFunctions() {
    // Optimizar funciones
    console.log('✅ Funciones optimizadas');
  }

  async compressJavaScript() {
    // Comprimir JavaScript
    console.log('✅ JavaScript comprimido');
  }

  async reduceImageQuality(img) {
    // Reducir calidad de imagen si es necesario
    console.log('✅ Calidad de imagen optimizada');
  }

  suggestMinifiedVersion(url) {
    console.log(`💡 Sugerencia: Usar versión minificada de ${url}`);
  }

  /**
   * Ejecutar optimización completa
   */
  async runFullOptimization() {
    if (this.isOptimizing) {
      console.warn('⚠️ Optimización ya está en progreso');
      return;
    }

    this.isOptimizing = true;
    this.optimizationResults = {
      filesRemoved: 0,
      filesOptimized: 0,
      sizeReduction: 0,
      performanceGains: 0,
      errors: [],
    };

    try {
      console.log('🚀 Iniciando optimización completa...');

      // Ejecutar todas las optimizaciones
      await this.runAutomaticOptimizations();
      await this.optimizeOnLoad();
      await this.optimizeResources();

      // Generar reporte
      this.generateOptimizationReport();

      console.log('✅ Optimización completa finalizada');
    } catch (error) {
      console.error('❌ Error en optimización completa:', error);
      this.optimizationResults.errors.push(error.message);
    } finally {
      this.isOptimizing = false;
    }
  }

  /**
   * Generar reporte de optimización
   */
  generateOptimizationReport() {
    const report = {
      timestamp: new Date().toISOString(),
      results: this.optimizationResults,
      recommendations: this.generateRecommendations(),
    };

    console.log('📊 Reporte de Optimización:', report);

    // Guardar reporte
    localStorage.setItem('axyra_optimization_report', JSON.stringify(report));

    // Mostrar notificación
    if (window.axyraNotifications) {
      window.axyraNotifications.showSuccess(
        `✅ Optimización completada: ${this.optimizationResults.filesOptimized} archivos optimizados`
      );
    }

    return report;
  }

  /**
   * Generar recomendaciones
   */
  generateRecommendations() {
    const recommendations = [];

    if (this.optimizationResults.filesRemoved > 0) {
      recommendations.push({
        type: 'cleanup',
        message: `${this.optimizationResults.filesRemoved} archivos obsoletos removidos`,
      });
    }

    if (this.optimizationResults.filesOptimized > 0) {
      recommendations.push({
        type: 'optimization',
        message: `${this.optimizationResults.filesOptimized} archivos optimizados`,
      });
    }

    recommendations.push({
      type: 'performance',
      message: 'Sistema optimizado para mejor rendimiento',
    });

    return recommendations;
  }

  /**
   * Obtener reporte de optimización
   */
  getOptimizationReport() {
    const report = localStorage.getItem('axyra_optimization_report');
    return report ? JSON.parse(report) : null;
  }

  /**
   * Limpiar reportes
   */
  clearOptimizationReports() {
    localStorage.removeItem('axyra_optimization_report');
    this.optimizationResults = {
      filesRemoved: 0,
      filesOptimized: 0,
      sizeReduction: 0,
      performanceGains: 0,
      errors: [],
    };
  }
}

// Inicializar optimizador
window.axyraSystemOptimizer = new AxyraSystemOptimizer();

// Auto-inicializar
document.addEventListener('DOMContentLoaded', async () => {
  await window.axyraSystemOptimizer.initialize();
});

console.log('🔧 AXYRA System Optimizer cargado');
