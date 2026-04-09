// ========================================
// SISTEMA DE OPTIMIZACIÓN AXYRA
// ========================================

class AxyraOptimizationSystem {
  constructor() {
    this.config = {
      minification: true,
      compression: true,
      lazyLoading: true,
      imageOptimization: true,
      bundleOptimization: true,
      cacheOptimization: true,
      performanceMonitoring: true,
    };
    
    this.metrics = {
      loadTime: 0,
      bundleSize: 0,
      imageSize: 0,
      cacheHitRate: 0,
      compressionRatio: 0,
    };
    
    this.init();
  }

  init() {
    console.log('⚡ Inicializando sistema de optimización AXYRA...');
    this.setupPerformanceMonitoring();
    this.optimizeImages();
    this.optimizeCSS();
    this.optimizeJavaScript();
    this.setupServiceWorker();
    this.optimizeFonts();
    this.setupPreloading();
  }

  setupPerformanceMonitoring() {
    if (this.config.performanceMonitoring) {
      window.addEventListener('load', () => {
        this.metrics.loadTime = performance.now();
        this.logPerformanceMetrics();
      });
      
      this.measureCoreWebVitals();
      this.monitorMemoryUsage();
      this.monitorNetworkPerformance();
    }
  }

  measureCoreWebVitals() {
    // LCP - Largest Contentful Paint
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      const lastEntry = entries[entries.length - 1];
      console.log('📊 LCP:', lastEntry.startTime);
    }).observe({ entryTypes: ['largest-contentful-paint'] });

    // FID - First Input Delay
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      entries.forEach((entry) => {
        console.log('📊 FID:', entry.processingStart - entry.startTime);
      });
    }).observe({ entryTypes: ['first-input'] });

    // CLS - Cumulative Layout Shift
    let clsValue = 0;
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      entries.forEach((entry) => {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
        }
      });
      console.log('📊 CLS:', clsValue);
    }).observe({ entryTypes: ['layout-shift'] });
  }

  monitorMemoryUsage() {
    if (performance.memory) {
      setInterval(() => {
        const memory = performance.memory;
        console.log('🧠 Memoria:', {
          used: this.formatBytes(memory.usedJSHeapSize),
          total: this.formatBytes(memory.totalJSHeapSize),
          limit: this.formatBytes(memory.jsHeapSizeLimit),
        });
      }, 30000);
    }
  }

  monitorNetworkPerformance() {
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.entryType === 'resource') {
          console.log('🌐 Recurso:', {
            name: entry.name,
            duration: entry.duration,
            size: entry.transferSize,
          });
        }
      });
    });
    observer.observe({ entryTypes: ['resource'] });
  }

  optimizeImages() {
    if (this.config.imageOptimization) {
      const images = document.querySelectorAll('img');
      images.forEach((img) => {
        if (!img.loading) {
          img.loading = 'lazy';
        }
        this.optimizeImageSrcset(img);
        this.convertToWebP(img);
      });
    }
  }

  optimizeImageSrcset(img) {
    const src = img.src;
    if (src && !img.srcset) {
      const baseName = src.replace(/\.[^/.]+$/, '');
      const extension = src.split('.').pop();
      img.srcset = `
        ${baseName}-320w.${extension} 320w,
        ${baseName}-640w.${extension} 640w,
        ${baseName}-1024w.${extension} 1024w,
        ${baseName}-1920w.${extension} 1920w
      `;
      img.sizes = '(max-width: 320px) 320px, (max-width: 640px) 640px, (max-width: 1024px) 1024px, 1920px';
    }
  }

  convertToWebP(img) {
    if (this.supportsWebP()) {
      const src = img.src;
      if (src && !src.includes('.webp')) {
        const webpSrc = src.replace(/\.(jpg|jpeg|png)$/i, '.webp');
        img.src = webpSrc;
      }
    }
  }

  supportsWebP() {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
  }

  optimizeCSS() {
    if (this.config.minification) {
      const styleSheets = document.styleSheets;
      for (let i = 0; i < styleSheets.length; i++) {
        const sheet = styleSheets[i];
        if (sheet.href && !sheet.href.includes('cdn')) {
          this.minifyCSS(sheet);
        }
      }
    }
  }

  minifyCSS(sheet) {
    try {
      const rules = sheet.cssRules;
      if (rules) {
        for (let i = 0; i < rules.length; i++) {
          const rule = rules[i];
          if (rule.type === CSSRule.STYLE_RULE) {
            rule.selectorText = rule.selectorText.replace(/\s+/g, ' ').trim();
            rule.style.cssText = rule.style.cssText.replace(/\s+/g, ' ').trim();
          }
        }
      }
    } catch (error) {
      console.warn('⚠️ No se pudo minificar CSS:', error);
    }
  }

  optimizeJavaScript() {
    if (this.config.minification) {
      const scripts = document.querySelectorAll('script:not([src])');
      scripts.forEach((script) => {
        this.minifyJavaScript(script);
      });
    }
  }

  minifyJavaScript(script) {
    const code = script.textContent;
    if (code) {
      const minified = code
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .replace(/\/\/.*$/gm, '')
        .replace(/\s+/g, ' ')
        .trim();
      script.textContent = minified;
    }
  }

  setupServiceWorker() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('✅ Service Worker registrado:', registration);
        })
        .catch((error) => {
          console.warn('⚠️ Error registrando Service Worker:', error);
        });
    }
  }

  optimizeFonts() {
    const criticalFonts = [
      'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap'
    ];
    
    criticalFonts.forEach((font) => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'style';
      link.href = font;
      link.onload = () => {
        link.rel = 'stylesheet';
      };
      document.head.appendChild(link);
    });
  }

  setupPreloading() {
    const criticalResources = [
      '/static/firebase-config.js',
      '/static/admin-brutal-functions.js',
      '/static/admin-god-mode.js',
      '/static/user-management-god.js'
    ];
    
    criticalResources.forEach((resource) => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'script';
      link.href = resource;
      document.head.appendChild(link);
    });
  }

  optimizeBundle() {
    if (this.config.bundleOptimization) {
      this.lazyLoadNonCriticalModules();
      this.treeShakeUnusedFunctions();
      this.splitCodeByRoute();
    }
  }

  lazyLoadNonCriticalModules() {
    const nonCriticalModules = [
      'modulos/reportes/reportes-avanzados.js',
      'modulos/inventario/inventario.js',
      'modulos/membresias/membresias.js'
    ];
    
    nonCriticalModules.forEach((module) => {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = module;
      document.head.appendChild(link);
    });
  }

  treeShakeUnusedFunctions() {
    const usedFunctions = new Set();
    const allFunctions = this.getAllFunctions();
    
    allFunctions.forEach(func => {
      if (this.isFunctionUsed(func)) {
        usedFunctions.add(func);
      }
    });
    
    console.log('🌳 Funciones no utilizadas:', allFunctions.filter(f => !usedFunctions.has(f)));
  }

  getAllFunctions() {
    const functions = [];
    const scripts = document.querySelectorAll('script');
    
    scripts.forEach(script => {
      const code = script.textContent;
      if (code) {
        const matches = code.match(/function\s+(\w+)/g);
        if (matches) {
          matches.forEach(match => {
            const funcName = match.replace('function ', '');
            functions.push(funcName);
          });
        }
      }
    });
    
    return functions;
  }

  isFunctionUsed(funcName) {
    const scripts = document.querySelectorAll('script');
    for (let script of scripts) {
      const code = script.textContent;
      if (code && code.includes(funcName)) {
        return true;
      }
    }
    return false;
  }

  splitCodeByRoute() {
    const routes = {
      '/admin-brutal.html': [
        'static/admin-brutal-functions.js',
        'static/admin-god-mode.js',
        'static/user-management-god.js'
      ],
      '/modulos/dashboard/': [
        'modulos/dashboard/dashboard.js'
      ],
      '/modulos/nomina/': [
        'modulos/nomina/nomina.js'
      ]
    };
    
    Object.entries(routes).forEach(([route, modules]) => {
      if (window.location.pathname.includes(route)) {
        modules.forEach(module => {
          this.loadModule(module);
        });
      }
    });
  }

  loadModule(modulePath) {
    const script = document.createElement('script');
    script.src = modulePath;
    script.async = true;
    document.head.appendChild(script);
  }

  optimizeCache() {
    if (this.config.cacheOptimization) {
      this.setCacheHeaders();
      this.implementCacheStrategy();
      this.cleanOldCache();
    }
  }

  setCacheHeaders() {
    const resources = document.querySelectorAll('link[rel="stylesheet"], script[src], img[src]');
    resources.forEach(resource => {
      if (resource.href || resource.src) {
        const url = new URL(resource.href || resource.src);
        url.searchParams.set('v', Date.now());
        if (resource.href) resource.href = url.toString();
        if (resource.src) resource.src = url.toString();
      }
    });
  }

  implementCacheStrategy() {
    const staticResources = document.querySelectorAll('img[src], link[rel="stylesheet"]');
    staticResources.forEach(resource => {
      resource.addEventListener('load', () => {
        this.cacheResource(resource.href || resource.src);
      });
    });
  }

  cacheResource(url) {
    if ('caches' in window) {
      caches.open('axyra-cache-v1').then(cache => {
        cache.add(url);
      });
    }
  }

  cleanOldCache() {
    if ('caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => {
          if (name !== 'axyra-cache-v1') {
            caches.delete(name);
          }
        });
      });
    }
  }

  logPerformanceMetrics() {
    console.log('📊 Métricas de rendimiento:', {
      loadTime: this.metrics.loadTime,
      bundleSize: this.metrics.bundleSize,
      imageSize: this.metrics.imageSize,
      cacheHitRate: this.metrics.cacheHitRate,
      compressionRatio: this.metrics.compressionRatio,
    });
  }

  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  getOptimizationReport() {
    return {
      config: this.config,
      metrics: this.metrics,
      recommendations: this.getRecommendations(),
      timestamp: new Date().toISOString(),
    };
  }

  getRecommendations() {
    const recommendations = [];
    
    if (this.metrics.loadTime > 3000) {
      recommendations.push({
        type: 'performance',
        priority: 'high',
        message: 'Tiempo de carga lento',
        action: 'Optimizar recursos críticos y implementar lazy loading'
      });
    }
    
    if (this.metrics.bundleSize > 500000) {
      recommendations.push({
        type: 'bundle',
        priority: 'medium',
        message: 'Bundle de JavaScript muy grande',
        action: 'Implementar code splitting y tree shaking'
      });
    }
    
    if (this.metrics.imageSize > 1000000) {
      recommendations.push({
        type: 'images',
        priority: 'medium',
        message: 'Imágenes sin optimizar',
        action: 'Convertir a WebP y implementar lazy loading'
      });
    }
    
    return recommendations;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.axyraOptimization = new AxyraOptimizationSystem();
});

window.AxyraOptimizationSystem = AxyraOptimizationSystem;