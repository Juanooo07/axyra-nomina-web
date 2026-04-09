// ========================================
// SISTEMA DE LAZY LOADING AXYRA
// ========================================

class AxyraLazyLoadingSystem {
  constructor() {
    this.loadedModules = new Set();
    this.loadingModules = new Set();
    this.moduleCache = new Map();
    this.config = {
      timeout: 10000,
      retryAttempts: 3,
      retryDelay: 1000,
      preloadOnHover: true,
      preloadOnVisible: true,
    };
    
    this.init();
  }

  init() {
    console.log('🔄 Inicializando sistema de lazy loading...');
    this.setupIntersectionObserver();
    this.setupPreloadTriggers();
    this.setupErrorHandling();
  }

  setupIntersectionObserver() {
    if ('IntersectionObserver' in window) {
      this.observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const moduleName = entry.target.dataset.lazyModule;
            if (moduleName) {
              this.loadModule(moduleName);
              this.observer.unobserve(entry.target);
            }
          }
        });
      }, {
        rootMargin: '50px',
        threshold: 0.1,
      });
    }
  }

  setupPreloadTriggers() {
    if (this.config.preloadOnHover) {
      document.addEventListener('mouseover', (e) => {
        const lazyElement = e.target.closest('[data-lazy-module]');
        if (lazyElement) {
          const moduleName = lazyElement.dataset.lazyModule;
          if (moduleName && !this.loadedModules.has(moduleName)) {
            this.preloadModule(moduleName);
          }
        }
      });
    }
  }

  setupErrorHandling() {
    window.addEventListener('error', (e) => {
      if (e.filename && e.filename.includes('lazy-loaded')) {
        console.error('❌ Error en módulo lazy loaded:', e);
        this.handleModuleError(e.filename);
      }
    });
  }

  async loadModule(moduleName, options = {}) {
    if (this.loadedModules.has(moduleName)) {
      return this.moduleCache.get(moduleName);
    }
    
    if (this.loadingModules.has(moduleName)) {
      return this.waitForModule(moduleName);
    }
    
    this.loadingModules.add(moduleName);
    
    try {
      console.log(`🔄 Cargando módulo: ${moduleName}`);
      const module = await this.loadModuleScript(moduleName, options);
      
      this.loadedModules.add(moduleName);
      this.loadingModules.delete(moduleName);
      this.moduleCache.set(moduleName, module);
      
      console.log(`✅ Módulo cargado: ${moduleName}`);
      return module;
    } catch (error) {
      console.error(`❌ Error cargando módulo ${moduleName}:`, error);
      this.loadingModules.delete(moduleName);
      throw error;
    }
  }

  async loadModuleScript(moduleName, options = {}) {
    const scriptPath = this.getModulePath(moduleName);
    
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = scriptPath;
      script.async = true;
      script.defer = true;
      script.dataset.moduleName = moduleName;
      
      const timeout = setTimeout(() => {
        reject(new Error(`Timeout cargando módulo: ${moduleName}`));
        if (document.head.contains(script)) {
          document.head.removeChild(script);
        }
      }, this.config.timeout);
      
      script.onload = () => {
        clearTimeout(timeout);
        // Buscar tanto la clase como la instancia
        const className = this.getModuleGlobalName(moduleName);
        const instanceName = this.getModuleInstanceName(moduleName);
        
        let module = window[className] || window[instanceName];
        
        if (module) {
          resolve(module);
        } else {
          // Intentar buscar en diferentes formatos
          const altNames = [
            `Axyra${moduleName.charAt(0).toUpperCase() + moduleName.slice(1)}Module`,
            `axyra${moduleName.charAt(0).toUpperCase() + moduleName.slice(1)}Module`,
            `Axyra${moduleName.charAt(0).toUpperCase() + moduleName.slice(1)}`,
            `axyra${moduleName.charAt(0).toUpperCase() + moduleName.slice(1)}`
          ];
          
          for (const altName of altNames) {
            if (window[altName]) {
              module = window[altName];
              resolve(module);
              return;
            }
          }
          
          reject(new Error(`Módulo no encontrado en global: ${moduleName}`));
        }
      };
      
      script.onerror = () => {
        clearTimeout(timeout);
        reject(new Error(`Error cargando script: ${scriptPath}`));
      };
      
      document.head.appendChild(script);
    });
  }

  async preloadModule(moduleName) {
    if (this.loadedModules.has(moduleName) || this.loadingModules.has(moduleName)) {
      return;
    }
    
    try {
      console.log(`⚡ Preload módulo: ${moduleName}`);
      await this.loadModule(moduleName, { preload: true });
    } catch (error) {
      console.warn(`⚠️ Error en preload de ${moduleName}:`, error);
    }
  }

  async waitForModule(moduleName) {
    return new Promise((resolve, reject) => {
      const checkInterval = setInterval(() => {
        if (this.loadedModules.has(moduleName)) {
          clearInterval(checkInterval);
          resolve(this.moduleCache.get(moduleName));
        } else if (!this.loadingModules.has(moduleName)) {
          clearInterval(checkInterval);
          reject(new Error(`Módulo ${moduleName} falló al cargar`));
        }
      }, 100);
      
      setTimeout(() => {
        clearInterval(checkInterval);
        reject(new Error(`Timeout esperando módulo: ${moduleName}`));
      }, this.config.timeout);
    });
  }

  getModulePath(moduleName) {
    const moduleMap = {
      'dashboard': 'modulos/dashboard/dashboard.js',
      'empleados': 'modulos/gestion_personal/gestion_personal.js',
      'nomina': 'modulos/gestion_personal/gestion_personal.js',
      'horas': 'modulos/gestion_personal/gestion_personal.js',
      'inventario': 'modulos/inventario/inventario.js',
      'reportes': 'modulos/reportes/reportes-avanzados.js',
      'configuracion': 'modulos/configuracion/configuracion-avanzada.js',
      'cuadre-caja': 'modulos/cuadre_caja/cuadre_caja.js',
      'gestion-personal': 'modulos/gestion_personal/gestion_personal.js',
      'membresias': 'modulos/membresias/membresias.js',
    };
    
    return `${moduleMap[moduleName] || `${moduleName}.js`}`;
  }

  getModuleGlobalName(moduleName) {
    const globalMap = {
      'dashboard': 'AxyraDashboard',
      'empleados': 'AxyraEmpleados',
      'nomina': 'AxyraNomina',
      'horas': 'AxyraHoras',
      'inventario': 'AxyraInventario',
      'reportes': 'AxyraReportes',
      'configuracion': 'AxyraConfiguracion',
      'cuadre-caja': 'AxyraCuadreCaja',
      'gestion-personal': 'AxyraGestionPersonal',
      'membresias': 'AxyraMembresias',
    };
    
    return globalMap[moduleName] || `Axyra${moduleName.charAt(0).toUpperCase() + moduleName.slice(1)}`;
  }

  getModuleInstanceName(moduleName) {
    const instanceMap = {
      'dashboard': 'axyraDashboardModule',
      'empleados': 'axyraEmpleadosModule',
      'nomina': 'axyraNominaModule',
      'horas': 'axyraGestionHoras',
      'inventario': 'axyraInventarioModule',
      'reportes': 'axyraReportesModule',
      'configuracion': 'axyraConfiguracionModule',
      'cuadre-caja': 'axyraCuadreCajaModule',
      'gestion-personal': 'axyraGestionPersonalModule',
      'membresias': 'axyraMembresiasModule',
    };
    
    return instanceMap[moduleName] || `axyra${moduleName.charAt(0).toUpperCase() + moduleName.slice(1)}Module`;
  }

  handleModuleError(filename) {
    const moduleName = filename.split('/').pop().replace('.js', '');
    console.error(`❌ Error en módulo: ${moduleName}`);
    
    setTimeout(() => {
      if (this.loadingModules.has(moduleName)) {
        this.loadingModules.delete(moduleName);
        this.loadModule(moduleName);
      }
    }, this.config.retryDelay);
  }

  async loadCriticalModules() {
    const criticalModules = ['dashboard', 'empleados', 'nomina'];
    
    for (const module of criticalModules) {
      try {
        await this.loadModule(module);
      } catch (error) {
        console.error(`❌ Error cargando módulo crítico ${module}:`, error);
      }
    }
  }

  async loadBackgroundModules() {
    const backgroundModules = ['horas', 'inventario', 'reportes', 'configuracion'];
    
    for (const module of backgroundModules) {
      try {
        await this.preloadModule(module);
      } catch (error) {
        console.warn(`⚠️ Error en preload de ${module}:`, error);
      }
    }
  }

  getModuleStatus() {
    return {
      loaded: Array.from(this.loadedModules),
      loading: Array.from(this.loadingModules),
      cached: Array.from(this.moduleCache.keys()),
    };
  }

  clearModuleCache() {
    this.moduleCache.clear();
    this.loadedModules.clear();
    this.loadingModules.clear();
    console.log('🧹 Cache de módulos limpiado');
  }

  setupLazyElements() {
    const lazyElements = document.querySelectorAll('[data-lazy-module]');
    lazyElements.forEach((element) => {
      if (this.observer) {
        this.observer.observe(element);
      } else {
        const moduleName = element.dataset.lazyModule;
        if (moduleName) {
          this.loadModule(moduleName);
        }
      }
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.axyraLazyLoading = new AxyraLazyLoadingSystem();
  window.axyraLazyLoading.loadCriticalModules();
  window.axyraLazyLoading.setupLazyElements();
  
  setTimeout(() => {
    window.axyraLazyLoading.loadBackgroundModules();
  }, 2000);
});

window.AxyraLazyLoadingSystem = AxyraLazyLoadingSystem;