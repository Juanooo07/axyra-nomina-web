// ========================================
// AXYRA CDN SYSTEM
// Sistema de CDN y optimización de recursos
// ========================================

class AxyraCDNSystem {
  constructor() {
    this.cdnConfig = {
      primary: 'https://cdn.axyra.com',
      fallback: 'https://cdnjs.cloudflare.com',
      local: '/static',
      enabled: true,
      cacheTime: 24 * 60 * 60 * 1000, // 24 horas
      compression: true,
      versioning: true,
    };

    this.resourceCache = new Map();
    this.loadingResources = new Set();
    this.failedResources = new Set();
    this.cdnStats = {
      hits: 0,
      misses: 0,
      errors: 0,
      totalSize: 0,
      loadTime: 0,
    };

    this.init();
  }

  async init() {
    console.log('🌐 Inicializando Sistema CDN AXYRA...');

    try {
      await this.detectBestCDN();
      this.setupResourceOptimization();
      this.setupCDNFallback();
      this.setupResourcePreloading();
      this.setupCDNMonitoring();
      console.log('✅ Sistema CDN AXYRA inicializado');
    } catch (error) {
      console.error('❌ Error inicializando sistema CDN:', error);
    }
  }

  async detectBestCDN() {
    // Detectar el mejor CDN basado en latencia
    const cdns = [
      { name: 'primary', url: this.cdnConfig.primary },
      { name: 'fallback', url: this.cdnConfig.fallback },
      { name: 'local', url: this.cdnConfig.local },
    ];

    const latencies = await Promise.all(
      cdns.map(async (cdn) => {
        try {
          const start = performance.now();
          await fetch(`${cdn.url}/ping`, { method: 'HEAD' });
          const latency = performance.now() - start;
          return { ...cdn, latency };
        } catch (error) {
          return { ...cdn, latency: Infinity };
        }
      })
    );

    // Seleccionar CDN con menor latencia
    const bestCDN = latencies.reduce((best, current) => (current.latency < best.latency ? current : best));

    this.cdnConfig.active = bestCDN.name;
    console.log(`🌐 CDN activo: ${bestCDN.name} (${bestCDN.latency.toFixed(2)}ms)`);
  }

  setupResourceOptimization() {
    // Optimizar recursos existentes
    this.optimizeExistingResources();

    // Interceptar requests para usar CDN
    this.interceptRequests();
  }

  optimizeExistingResources() {
    // Optimizar scripts
    this.optimizeScripts();

    // Optimizar estilos
    this.optimizeStyles();

    // Optimizar imágenes
    this.optimizeImages();

    // Optimizar fuentes
    this.optimizeFonts();
  }

  optimizeScripts() {
    const scripts = document.querySelectorAll('script[src]');
    scripts.forEach((script) => {
      this.optimizeScript(script);
    });
  }

  optimizeScript(script) {
    const src = script.src;
    if (this.shouldUseCDN(src)) {
      const cdnSrc = this.getCDNUrl(src);
      script.src = cdnSrc;
      script.dataset.originalSrc = src;
      script.dataset.cdn = 'true';
    }
  }

  optimizeStyles() {
    const links = document.querySelectorAll('link[rel="stylesheet"]');
    links.forEach((link) => {
      this.optimizeStyle(link);
    });
  }

  optimizeStyle(link) {
    const href = link.href;
    if (this.shouldUseCDN(href)) {
      const cdnHref = this.getCDNUrl(href);
      link.href = cdnHref;
      link.dataset.originalHref = href;
      link.dataset.cdn = 'true';
    }
  }

  optimizeImages() {
    const images = document.querySelectorAll('img[src]');
    images.forEach((img) => {
      this.optimizeImage(img);
    });
  }

  optimizeImage(img) {
    const src = img.src;
    if (this.shouldUseCDN(src)) {
      const cdnSrc = this.getCDNUrl(src);
      img.src = cdnSrc;
      img.dataset.originalSrc = src;
      img.dataset.cdn = 'true';
    }
  }

  optimizeFonts() {
    const links = document.querySelectorAll('link[href*="font"]');
    links.forEach((link) => {
      this.optimizeFont(link);
    });
  }

  optimizeFont(link) {
    const href = link.href;
    if (this.shouldUseCDN(href)) {
      const cdnHref = this.getCDNUrl(href);
      link.href = cdnHref;
      link.dataset.originalHref = href;
      link.dataset.cdn = 'true';
    }
  }

  setupCDNFallback() {
    // Configurar fallback para recursos CDN
    this.setupScriptFallback();
    this.setupStyleFallback();
    this.setupImageFallback();
  }

  setupScriptFallback() {
    const scripts = document.querySelectorAll('script[data-cdn="true"]');
    scripts.forEach((script) => {
      script.onerror = () => {
        this.handleCDNError(script, 'script');
      };
    });
  }

  setupStyleFallback() {
    const links = document.querySelectorAll('link[data-cdn="true"]');
    links.forEach((link) => {
      link.onerror = () => {
        this.handleCDNError(link, 'style');
      };
    });
  }

  setupImageFallback() {
    const images = document.querySelectorAll('img[data-cdn="true"]');
    images.forEach((img) => {
      img.onerror = () => {
        this.handleCDNError(img, 'image');
      };
    });
  }

  handleCDNError(element, type) {
    const originalSrc = element.dataset.originalSrc || element.dataset.originalHref;
    if (originalSrc) {
      console.warn(`⚠️ CDN fallback para ${type}:`, originalSrc);

      if (type === 'script') {
        element.src = originalSrc;
      } else if (type === 'style') {
        element.href = originalSrc;
      } else if (type === 'image') {
        element.src = originalSrc;
      }

      element.dataset.cdn = 'false';
      this.cdnStats.errors++;
    }
  }

  setupResourcePreloading() {
    // Precargar recursos críticos
    this.preloadCriticalResources();

    // Precargar recursos de módulos
    this.preloadModuleResources();
  }

  preloadCriticalResources() {
    const criticalResources = [
      'js/axyra-config.js',
      'js/axyra-auth.js',
      'js/axyra-notifications.js',
      'css/axyra-styles.css',
    ];

    criticalResources.forEach((resource) => {
      this.preloadResource(resource);
    });
  }

  preloadModuleResources() {
    const moduleResources = [
      'js/modulos/gestion-personal.js',
      'js/modulos/inventario.js',
      'js/modulos/cuadre-caja.js',
      'css/modulos/gestion-personal.css',
      'css/modulos/inventario.css',
    ];

    moduleResources.forEach((resource) => {
      this.preloadResource(resource, { priority: 'low' });
    });
  }

  async preloadResource(resource, options = {}) {
    const priority = options.priority || 'high';
    const cdnUrl = this.getCDNUrl(resource);

    try {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = cdnUrl;
      link.as = this.getResourceType(resource);
      link.crossOrigin = 'anonymous';

      if (priority === 'high') {
        link.setAttribute('fetchpriority', 'high');
      }

      document.head.appendChild(link);

      console.log(`📦 Recurso precargado: ${resource}`);
    } catch (error) {
      console.error(`❌ Error precargando recurso ${resource}:`, error);
    }
  }

  setupCDNMonitoring() {
    // Monitorear rendimiento del CDN
    this.monitorCDNPerformance();

    // Monitorear errores del CDN
    this.monitorCDNErrors();
  }

  monitorCDNPerformance() {
    // Monitorear tiempo de carga
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.entryType === 'resource' && entry.name.includes('cdn')) {
          this.cdnStats.loadTime += entry.duration;
          this.cdnStats.totalSize += entry.transferSize || 0;
        }
      });
    });

    observer.observe({ entryTypes: ['resource'] });
  }

  monitorCDNErrors() {
    // Monitorear errores de CDN
    window.addEventListener('error', (event) => {
      if (event.target.src && event.target.src.includes('cdn')) {
        this.cdnStats.errors++;
        console.error('❌ Error de CDN:', event.target.src);
      }
    });
  }

  // Métodos de utilidad
  shouldUseCDN(url) {
    // Determinar si un recurso debe usar CDN
    const cdnPatterns = [
      /\.js$/,
      /\.css$/,
      /\.png$/,
      /\.jpg$/,
      /\.jpeg$/,
      /\.gif$/,
      /\.svg$/,
      /\.woff$/,
      /\.woff2$/,
      /\.ttf$/,
      /\.eot$/,
    ];

    return cdnPatterns.some((pattern) => pattern.test(url));
  }

  getCDNUrl(originalUrl) {
    const cdnBase = this.getCDNBase();
    const resourcePath = this.extractResourcePath(originalUrl);
    const versionedPath = this.addVersioning(resourcePath);

    return `${cdnBase}/${versionedPath}`;
  }

  getCDNBase() {
    switch (this.cdnConfig.active) {
      case 'primary':
        return this.cdnConfig.primary;
      case 'fallback':
        return this.cdnConfig.fallback;
      case 'local':
        return this.cdnConfig.local;
      default:
        return this.cdnConfig.primary;
    }
  }

  extractResourcePath(url) {
    // Extraer ruta del recurso
    const urlObj = new URL(url, window.location.origin);
    return urlObj.pathname;
  }

  addVersioning(path) {
    if (this.cdnConfig.versioning) {
      const version = this.getResourceVersion(path);
      return `${path}?v=${version}`;
    }
    return path;
  }

  getResourceVersion(path) {
    // Obtener versión del recurso
    const versionMap = {
      'js/axyra-config.js': '1.0.0',
      'js/axyra-auth.js': '1.0.0',
      'js/axyra-notifications.js': '1.0.0',
      'css/axyra-styles.css': '1.0.0',
    };

    return versionMap[path] || '1.0.0';
  }

  getResourceType(resource) {
    if (resource.endsWith('.js')) return 'script';
    if (resource.endsWith('.css')) return 'style';
    if (resource.match(/\.(png|jpg|jpeg|gif|svg)$/)) return 'image';
    if (resource.match(/\.(woff|woff2|ttf|eot)$/)) return 'font';
    return 'fetch';
  }

  // Métodos de interceptación
  interceptRequests() {
    // Interceptar fetch requests
    const originalFetch = window.fetch;
    window.fetch = async (url, options) => {
      const cdnUrl = this.getCDNUrl(url);
      return originalFetch(cdnUrl, options);
    };
  }

  // Métodos de cache
  async cacheResource(url, data) {
    const cacheKey = this.generateCacheKey(url);
    this.resourceCache.set(cacheKey, {
      data: data,
      timestamp: Date.now(),
      ttl: this.cdnConfig.cacheTime,
    });
  }

  async getCachedResource(url) {
    const cacheKey = this.generateCacheKey(url);
    const cached = this.resourceCache.get(cacheKey);

    if (cached && !this.isExpired(cached)) {
      this.cdnStats.hits++;
      return cached.data;
    }

    this.cdnStats.misses++;
    return null;
  }

  generateCacheKey(url) {
    return btoa(url).replace(/[^a-zA-Z0-9]/g, '');
  }

  isExpired(cached) {
    return Date.now() - cached.timestamp > cached.ttl;
  }

  // Métodos de estadísticas
  getCDNStats() {
    return {
      ...this.cdnStats,
      hitRate: (this.cdnStats.hits / (this.cdnStats.hits + this.cdnStats.misses)) * 100,
      averageLoadTime: this.cdnStats.loadTime / (this.cdnStats.hits + this.cdnStats.misses),
      totalResources: this.resourceCache.size,
    };
  }

  // Métodos de optimización
  async optimizeCDN() {
    // Optimizar configuración de CDN
    await this.detectBestCDN();
    this.optimizeResourceLoading();
    this.optimizeCacheStrategy();
  }

  optimizeResourceLoading() {
    // Optimizar carga de recursos
    const scripts = document.querySelectorAll('script[data-cdn="true"]');
    scripts.forEach((script) => {
      script.async = true;
      script.defer = true;
    });
  }

  optimizeCacheStrategy() {
    // Optimizar estrategia de cache
    const criticalResources = ['js/axyra-config.js', 'js/axyra-auth.js', 'js/axyra-notifications.js'];

    criticalResources.forEach((resource) => {
      this.cacheResource(resource, { priority: 'high' });
    });
  }

  // Métodos de limpieza
  clearCache() {
    this.resourceCache.clear();
    this.loadingResources.clear();
    this.failedResources.clear();
  }

  destroy() {
    this.clearCache();
    this.cdnStats = {
      hits: 0,
      misses: 0,
      errors: 0,
      totalSize: 0,
      loadTime: 0,
    };
  }
}

// Inicializar sistema CDN
document.addEventListener('DOMContentLoaded', function () {
  try {
    window.axyraCDN = new AxyraCDNSystem();
    console.log('✅ Sistema CDN AXYRA cargado');
  } catch (error) {
    console.error('❌ Error cargando sistema CDN:', error);
  }
});

// Exportar para uso global
window.AxyraCDNSystem = AxyraCDNSystem;
