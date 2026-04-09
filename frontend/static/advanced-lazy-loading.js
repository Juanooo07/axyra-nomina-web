// ========================================
// LAZY LOADING AVANZADO AXYRA - FASE 3
// ========================================

class AxyraLazyLoader {
  constructor() {
    this.loadedModules = new Set();
    this.loadingPromises = new Map();
    this.observers = new Map();
    this.config = {
      rootMargin: '50px',
      threshold: 0.1,
      delay: 100
    };
  }

  // Cargar módulo de forma lazy
  async loadModule(moduleName, modulePath) {
    if (this.loadedModules.has(moduleName)) {
      return Promise.resolve();
    }

    if (this.loadingPromises.has(moduleName)) {
      return this.loadingPromises.get(moduleName);
    }

    const promise = this.loadModuleScript(moduleName, modulePath);
    this.loadingPromises.set(moduleName, promise);

    try {
      await promise;
      this.loadedModules.add(moduleName);
      this.loadingPromises.delete(moduleName);
      console.log(`✅ Módulo ${moduleName} cargado lazy`);
    } catch (error) {
      console.error(`❌ Error cargando módulo ${moduleName}:`, error);
      this.loadingPromises.delete(moduleName);
      throw error;
    }

    return promise;
  }

  // Cargar script del módulo
  loadModuleScript(moduleName, modulePath) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = modulePath;
      script.async = true;
      script.defer = true;
      
      script.onload = () => {
        // Verificar que el módulo se registró globalmente
        const moduleClass = window[`Axyra${moduleName}`];
        if (moduleClass) {
          resolve(moduleClass);
        } else {
          reject(new Error(`Módulo ${moduleName} no se registró correctamente`));
        }
      };
      
      script.onerror = () => {
        reject(new Error(`Error cargando script ${modulePath}`));
      };
      
      document.head.appendChild(script);
    });
  }

  // Observar elementos para lazy loading
  observeElement(element, callback) {
    if (!('IntersectionObserver' in window)) {
      // Fallback para navegadores sin soporte
      callback();
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          callback();
          observer.unobserve(entry.target);
        }
      });
    }, this.config);

    observer.observe(element);
    this.observers.set(element, observer);
  }

  // Cargar imagen de forma lazy
  loadImageLazy(imgElement, src) {
    this.observeElement(imgElement, () => {
      imgElement.src = src;
      imgElement.classList.add('loaded');
    });
  }

  // Cargar CSS de forma lazy
  loadCSSLazy(href) {
    if (document.querySelector(`link[href="${href}"]`)) {
      return;
    }

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    link.media = 'print';
    link.onload = () => {
      link.media = 'all';
    };
    
    document.head.appendChild(link);
  }

  // Preload de módulos críticos
  preloadCriticalModules() {
    const criticalModules = [
      { name: 'AuthService', path: 'src/services/AxyraAuthService.js' },
      { name: 'FirebaseService', path: 'src/services/AxyraFirebaseService.js' },
      { name: 'BaseModule', path: 'src/modules/BaseModule.js' }
    ];

    criticalModules.forEach(module => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = module.path;
      link.as = 'script';
      document.head.appendChild(link);
    });
  }

  // Limpiar observadores
  cleanup() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers.clear();
  }
}

// Instancia global
window.axyraLazyLoader = new AxyraLazyLoader();

// Preload de módulos críticos
document.addEventListener('DOMContentLoaded', () => {
  window.axyraLazyLoader.preloadCriticalModules();
});

console.log('✅ Lazy loading avanzado AXYRA inicializado');
