// ========================================
// AXYRA LAZY LOADING SYSTEM
// Sistema de carga perezosa avanzado
// ========================================

class AxyraLazyLoadingSystem {
  constructor() {
    this.loadedModules = new Set();
    this.loadingModules = new Set();
    this.moduleCache = new Map();
    this.observers = new Map();
    this.performanceMetrics = {
      loadTimes: {},
      cacheHits: 0,
      cacheMisses: 0,
      totalLoads: 0,
    };

    this.init();
  }

  async init() {
    console.log('⚡ Inicializando Sistema de Lazy Loading AXYRA...');

    try {
      this.setupIntersectionObserver();
      this.setupModuleLoaders();
      this.setupPerformanceMonitoring();
      this.preloadCriticalModules();
      console.log('✅ Sistema de Lazy Loading AXYRA inicializado');
    } catch (error) {
      console.error('❌ Error inicializando lazy loading:', error);
    }
  }

  setupIntersectionObserver() {
    // Observer para elementos que necesitan lazy loading
    this.intersectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            this.loadElement(entry.target);
          }
        });
      },
      {
        rootMargin: '50px',
        threshold: 0.1,
      }
    );

    // Observer para módulos específicos
    this.moduleObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const moduleName = entry.target.dataset.module;
            if (moduleName) {
              this.loadModule(moduleName);
            }
          }
        });
      },
      {
        rootMargin: '100px',
        threshold: 0.1,
      }
    );
  }

  setupModuleLoaders() {
    // Configuración de módulos del sistema
    this.modules = {
      'gestion-personal': {
        path: 'modulos/gestion_personal/gestion_personal.html',
        scripts: ['js/modulos/gestion-personal.js', 'js/modulos/employee-management.js'],
        styles: ['css/modulos/gestion-personal.css'],
        priority: 'high',
        preload: true,
      },
      inventario: {
        path: 'modulos/inventario/inventario.html',
        scripts: ['js/modulos/inventario.js', 'js/modulos/inventory-management.js'],
        styles: ['css/modulos/inventario.css'],
        priority: 'high',
        preload: true,
      },
      'cuadre-caja': {
        path: 'modulos/cuadre_caja/cuadre_caja.html',
        scripts: ['js/modulos/cuadre-caja.js', 'js/modulos/cash-register.js'],
        styles: ['css/modulos/cuadre-caja.css'],
        priority: 'medium',
        preload: false,
      },
      configuracion: {
        path: 'modulos/configuracion/configuracion.html',
        scripts: ['js/modulos/configuracion.js', 'js/modulos/settings.js'],
        styles: ['css/modulos/configuracion.css'],
        priority: 'low',
        preload: false,
      },
      membresias: {
        path: 'membresias.html',
        scripts: ['js/modulos/membresias.js', 'js/modulos/membership.js'],
        styles: ['css/modulos/membresias.css'],
        priority: 'medium',
        preload: false,
      },
    };
  }

  setupPerformanceMonitoring() {
    // Monitorear rendimiento de carga
    this.performanceObserver = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.entryType === 'navigation') {
          this.performanceMetrics.loadTimes.navigation = entry.loadEventEnd - entry.loadEventStart;
        } else if (entry.entryType === 'resource') {
          this.performanceMetrics.loadTimes[entry.name] = entry.duration;
        }
      });
    });

    this.performanceObserver.observe({ entryTypes: ['navigation', 'resource'] });
  }

  async preloadCriticalModules() {
    // Precargar módulos críticos
    const criticalModules = Object.entries(this.modules)
      .filter(([name, config]) => config.priority === 'high' && config.preload)
      .map(([name, config]) => name);

    for (const moduleName of criticalModules) {
      await this.preloadModule(moduleName);
    }
  }

  async preloadModule(moduleName) {
    const module = this.modules[moduleName];
    if (!module) return;

    try {
      // Precargar scripts
      for (const scriptPath of module.scripts) {
        await this.preloadResource(scriptPath, 'script');
      }

      // Precargar estilos
      for (const stylePath of module.styles) {
        await this.preloadResource(stylePath, 'style');
      }

      console.log(`📦 Módulo ${moduleName} precargado`);
    } catch (error) {
      console.error(`❌ Error precargando módulo ${moduleName}:`, error);
    }
  }

  async preloadResource(path, type) {
    return new Promise((resolve, reject) => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = path;
      link.as = type;
      link.onload = resolve;
      link.onerror = reject;
      document.head.appendChild(link);
    });
  }

  async loadModule(moduleName) {
    if (this.loadedModules.has(moduleName)) {
      this.performanceMetrics.cacheHits++;
      return this.moduleCache.get(moduleName);
    }

    if (this.loadingModules.has(moduleName)) {
      // Esperar a que termine la carga actual
      return new Promise((resolve) => {
        const checkLoaded = () => {
          if (this.loadedModules.has(moduleName)) {
            resolve(this.moduleCache.get(moduleName));
          } else {
            setTimeout(checkLoaded, 100);
          }
        };
        checkLoaded();
      });
    }

    this.loadingModules.add(moduleName);
    this.performanceMetrics.cacheMisses++;
    this.performanceMetrics.totalLoads++;

    const startTime = performance.now();

    try {
      const module = this.modules[moduleName];
      if (!module) {
        throw new Error(`Módulo ${moduleName} no encontrado`);
      }

      // Cargar scripts
      await this.loadScripts(module.scripts);

      // Cargar estilos
      await this.loadStyles(module.styles);

      // Marcar como cargado
      this.loadedModules.add(moduleName);
      this.loadingModules.delete(moduleName);

      const loadTime = performance.now() - startTime;
      this.performanceMetrics.loadTimes[moduleName] = loadTime;

      // Cachear módulo
      this.moduleCache.set(moduleName, {
        loaded: true,
        loadTime: loadTime,
        timestamp: Date.now(),
      });

      console.log(`✅ Módulo ${moduleName} cargado en ${loadTime.toFixed(2)}ms`);

      // Emitir evento de módulo cargado
      this.emitModuleLoaded(moduleName);

      return this.moduleCache.get(moduleName);
    } catch (error) {
      this.loadingModules.delete(moduleName);
      console.error(`❌ Error cargando módulo ${moduleName}:`, error);
      throw error;
    }
  }

  async loadScripts(scripts) {
    const loadPromises = scripts.map((scriptPath) => this.loadScript(scriptPath));
    await Promise.all(loadPromises);
  }

  loadScript(src) {
    return new Promise((resolve, reject) => {
      // Verificar si ya está cargado
      if (document.querySelector(`script[src="${src}"]`)) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = src;
      script.async = true;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  async loadStyles(styles) {
    const loadPromises = styles.map((stylePath) => this.loadStyle(stylePath));
    await Promise.all(loadPromises);
  }

  loadStyle(href) {
    return new Promise((resolve, reject) => {
      // Verificar si ya está cargado
      if (document.querySelector(`link[href="${href}"]`)) {
        resolve();
        return;
      }

      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      link.onload = resolve;
      link.onerror = reject;
      document.head.appendChild(link);
    });
  }

  loadElement(element) {
    const elementType = element.dataset.lazyType;

    switch (elementType) {
      case 'image':
        this.loadImage(element);
        break;
      case 'iframe':
        this.loadIframe(element);
        break;
      case 'video':
        this.loadVideo(element);
        break;
      case 'module':
        const moduleName = element.dataset.module;
        if (moduleName) {
          this.loadModule(moduleName);
        }
        break;
      default:
        this.loadGenericElement(element);
    }
  }

  loadImage(img) {
    const src = img.dataset.src;
    if (src) {
      img.src = src;
      img.classList.remove('lazy');
      img.classList.add('loaded');
    }
  }

  loadIframe(iframe) {
    const src = iframe.dataset.src;
    if (src) {
      iframe.src = src;
      iframe.classList.remove('lazy');
      iframe.classList.add('loaded');
    }
  }

  loadVideo(video) {
    const src = video.dataset.src;
    if (src) {
      video.src = src;
      video.classList.remove('lazy');
      video.classList.add('loaded');
    }
  }

  loadGenericElement(element) {
    const content = element.dataset.content;
    if (content) {
      element.innerHTML = content;
      element.classList.remove('lazy');
      element.classList.add('loaded');
    }
  }

  // Métodos de utilidad
  observeElement(element) {
    this.intersectionObserver.observe(element);
  }

  observeModule(element) {
    this.moduleObserver.observe(element);
  }

  unobserveElement(element) {
    this.intersectionObserver.unobserve(element);
  }

  emitModuleLoaded(moduleName) {
    const event = new CustomEvent('moduleLoaded', {
      detail: { moduleName, timestamp: Date.now() },
    });
    document.dispatchEvent(event);
  }

  // Métodos de gestión de cache
  clearModuleCache(moduleName = null) {
    if (moduleName) {
      this.moduleCache.delete(moduleName);
      this.loadedModules.delete(moduleName);
    } else {
      this.moduleCache.clear();
      this.loadedModules.clear();
    }
  }

  getModuleStatus(moduleName) {
    return {
      loaded: this.loadedModules.has(moduleName),
      loading: this.loadingModules.has(moduleName),
      cached: this.moduleCache.has(moduleName),
    };
  }

  getPerformanceMetrics() {
    return {
      ...this.performanceMetrics,
      cacheHitRate:
        (this.performanceMetrics.cacheHits /
          (this.performanceMetrics.cacheHits + this.performanceMetrics.cacheMisses)) *
        100,
      averageLoadTime:
        Object.values(this.performanceMetrics.loadTimes).reduce((sum, time) => sum + time, 0) /
        Object.keys(this.performanceMetrics.loadTimes).length,
    };
  }

  // Métodos de optimización
  optimizeImages() {
    const images = document.querySelectorAll('img[data-src]');
    images.forEach((img) => {
      this.observeElement(img);
    });
  }

  optimizeModules() {
    const moduleElements = document.querySelectorAll('[data-module]');
    moduleElements.forEach((element) => {
      this.observeModule(element);
    });
  }

  // Métodos de limpieza
  destroy() {
    this.intersectionObserver?.disconnect();
    this.moduleObserver?.disconnect();
    this.performanceObserver?.disconnect();
    this.clearModuleCache();
  }
}

// Inicializar sistema de lazy loading
document.addEventListener('DOMContentLoaded', function () {
  try {
    window.axyraLazyLoading = new AxyraLazyLoadingSystem();
    console.log('✅ Sistema de Lazy Loading AXYRA cargado');
  } catch (error) {
    console.error('❌ Error cargando sistema de lazy loading:', error);
  }
});

// Exportar para uso global
window.AxyraLazyLoadingSystem = AxyraLazyLoadingSystem;
