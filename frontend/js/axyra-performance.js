// ========================================
// AXYRA PERFORMANCE SYSTEM
// Sistema de monitoreo y optimización de rendimiento
// ========================================

class AxyraPerformanceSystem {
  constructor() {
    this.metrics = {
      pageLoad: 0,
      domContentLoaded: 0,
      firstContentfulPaint: 0,
      largestContentfulPaint: 0,
      firstInputDelay: 0,
      cumulativeLayoutShift: 0,
      totalBlockingTime: 0,
      speedIndex: 0,
    };

    this.observers = [];
    this.performanceData = [];
    this.optimizationSuggestions = [];

    this.init();
  }

  async init() {
    console.log('⚡ Inicializando Sistema de Rendimiento AXYRA...');

    try {
      this.setupPerformanceObservers();
      this.setupResourceMonitoring();
      this.setupUserInteractionMonitoring();
      this.setupMemoryMonitoring();
      this.setupNetworkMonitoring();
      this.analyzePerformance();
      console.log('✅ Sistema de Rendimiento AXYRA inicializado');
    } catch (error) {
      console.error('❌ Error inicializando sistema de rendimiento:', error);
    }
  }

  setupPerformanceObservers() {
    // Observer para métricas de navegación
    this.navigationObserver = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.entryType === 'navigation') {
          this.metrics.pageLoad = entry.loadEventEnd - entry.loadEventStart;
          this.metrics.domContentLoaded = entry.domContentLoadedEventEnd - entry.domContentLoadedEventStart;
        }
      });
    });
    this.navigationObserver.observe({ entryTypes: ['navigation'] });

    // Observer para métricas de pintura
    this.paintObserver = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.name === 'first-contentful-paint') {
          this.metrics.firstContentfulPaint = entry.startTime;
        }
      });
    });
    this.paintObserver.observe({ entryTypes: ['paint'] });

    // Observer para métricas de layout
    this.layoutObserver = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.entryType === 'largest-contentful-paint') {
          this.metrics.largestContentfulPaint = entry.startTime;
        }
      });
    });
    this.layoutObserver.observe({ entryTypes: ['largest-contentful-paint'] });

    // Observer para métricas de interacción
    this.interactionObserver = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.entryType === 'first-input') {
          this.metrics.firstInputDelay = entry.processingStart - entry.startTime;
        }
      });
    });
    this.interactionObserver.observe({ entryTypes: ['first-input'] });

    // Observer para métricas de layout shift
    this.layoutShiftObserver = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.entryType === 'layout-shift') {
          this.metrics.cumulativeLayoutShift += entry.value;
        }
      });
    });
    this.layoutShiftObserver.observe({ entryTypes: ['layout-shift'] });
  }

  setupResourceMonitoring() {
    // Monitorear recursos
    this.resourceObserver = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        this.analyzeResource(entry);
      });
    });
    this.resourceObserver.observe({ entryTypes: ['resource'] });
  }

  setupUserInteractionMonitoring() {
    // Monitorear interacciones del usuario
    this.setupClickMonitoring();
    this.setupScrollMonitoring();
    this.setupKeyboardMonitoring();
  }

  setupClickMonitoring() {
    let clickCount = 0;
    let clickTimes = [];

    document.addEventListener('click', (event) => {
      const clickTime = performance.now();
      clickTimes.push(clickTime);
      clickCount++;

      // Calcular tiempo promedio entre clicks
      if (clickTimes.length > 1) {
        const avgClickInterval =
          clickTimes.reduce((sum, time, index) => {
            if (index > 0) {
              return sum + (time - clickTimes[index - 1]);
            }
            return sum;
          }, 0) /
          (clickTimes.length - 1);

        this.metrics.avgClickInterval = avgClickInterval;
      }
    });
  }

  setupScrollMonitoring() {
    let scrollCount = 0;
    let scrollTimes = [];

    window.addEventListener('scroll', (event) => {
      const scrollTime = performance.now();
      scrollTimes.push(scrollTime);
      scrollCount++;

      // Calcular velocidad de scroll
      if (scrollTimes.length > 1) {
        const scrollVelocity =
          scrollTimes.reduce((sum, time, index) => {
            if (index > 0) {
              return sum + (time - scrollTimes[index - 1]);
            }
            return sum;
          }, 0) /
          (scrollTimes.length - 1);

        this.metrics.scrollVelocity = scrollVelocity;
      }
    });
  }

  setupKeyboardMonitoring() {
    let keyCount = 0;
    let keyTimes = [];

    document.addEventListener('keydown', (event) => {
      const keyTime = performance.now();
      keyTimes.push(keyTime);
      keyCount++;

      // Calcular velocidad de escritura
      if (keyTimes.length > 1) {
        const typingSpeed =
          keyTimes.reduce((sum, time, index) => {
            if (index > 0) {
              return sum + (time - keyTimes[index - 1]);
            }
            return sum;
          }, 0) /
          (keyTimes.length - 1);

        this.metrics.typingSpeed = typingSpeed;
      }
    });
  }

  setupMemoryMonitoring() {
    // Monitorear uso de memoria
    this.memoryMonitor = setInterval(() => {
      if (performance.memory) {
        this.metrics.memoryUsage = {
          used: performance.memory.usedJSHeapSize,
          total: performance.memory.totalJSHeapSize,
          limit: performance.memory.jsHeapSizeLimit,
          usagePercent: (performance.memory.usedJSHeapSize / performance.memory.jsHeapSizeLimit) * 100,
        };

        // Alerta si el uso de memoria es alto
        if (this.metrics.memoryUsage.usagePercent > 80) {
          this.optimizeMemory();
        }
      }
    }, 5000);
  }

  setupNetworkMonitoring() {
    // Monitorear conexión de red
    if (navigator.connection) {
      this.metrics.networkInfo = {
        effectiveType: navigator.connection.effectiveType,
        downlink: navigator.connection.downlink,
        rtt: navigator.connection.rtt,
        saveData: navigator.connection.saveData,
      };
    }
  }

  analyzeResource(entry) {
    const resource = {
      name: entry.name,
      duration: entry.duration,
      size: entry.transferSize,
      type: entry.initiatorType,
      startTime: entry.startTime,
      endTime: entry.startTime + entry.duration,
    };

    this.performanceData.push(resource);

    // Analizar recursos lentos
    if (entry.duration > 1000) {
      this.optimizationSuggestions.push({
        type: 'slow_resource',
        resource: entry.name,
        duration: entry.duration,
        suggestion: 'Considerar optimización o compresión',
      });
    }

    // Analizar recursos grandes
    if (entry.transferSize > 1024 * 1024) {
      this.optimizationSuggestions.push({
        type: 'large_resource',
        resource: entry.name,
        size: entry.transferSize,
        suggestion: 'Considerar compresión o lazy loading',
      });
    }
  }

  analyzePerformance() {
    // Analizar métricas de rendimiento
    this.analyzeCoreWebVitals();
    this.analyzeResourcePerformance();
    this.analyzeUserExperience();
    this.generateOptimizationSuggestions();
  }

  analyzeCoreWebVitals() {
    // Analizar Core Web Vitals
    const lcp = this.metrics.largestContentfulPaint;
    const fid = this.metrics.firstInputDelay;
    const cls = this.metrics.cumulativeLayoutShift;

    if (lcp > 2500) {
      this.optimizationSuggestions.push({
        type: 'lcp',
        value: lcp,
        suggestion: 'Optimizar Largest Contentful Paint',
      });
    }

    if (fid > 100) {
      this.optimizationSuggestions.push({
        type: 'fid',
        value: fid,
        suggestion: 'Optimizar First Input Delay',
      });
    }

    if (cls > 0.1) {
      this.optimizationSuggestions.push({
        type: 'cls',
        value: cls,
        suggestion: 'Optimizar Cumulative Layout Shift',
      });
    }
  }

  analyzeResourcePerformance() {
    // Analizar rendimiento de recursos
    const resources = this.performanceData;
    const totalSize = resources.reduce((sum, r) => sum + r.size, 0);
    const totalTime = resources.reduce((sum, r) => sum + r.duration, 0);

    this.metrics.resourceStats = {
      totalResources: resources.length,
      totalSize: totalSize,
      totalTime: totalTime,
      averageSize: totalSize / resources.length,
      averageTime: totalTime / resources.length,
    };
  }

  analyzeUserExperience() {
    // Analizar experiencia del usuario
    const userMetrics = {
      pageLoad: this.metrics.pageLoad,
      firstContentfulPaint: this.metrics.firstContentfulPaint,
      largestContentfulPaint: this.metrics.largestContentfulPaint,
      firstInputDelay: this.metrics.firstInputDelay,
      cumulativeLayoutShift: this.metrics.cumulativeLayoutShift,
    };

    this.metrics.userExperience = this.calculateUserExperienceScore(userMetrics);
  }

  calculateUserExperienceScore(metrics) {
    let score = 100;

    // Penalizar por métricas pobres
    if (metrics.pageLoad > 3000) score -= 20;
    if (metrics.firstContentfulPaint > 1500) score -= 15;
    if (metrics.largestContentfulPaint > 2500) score -= 20;
    if (metrics.firstInputDelay > 100) score -= 15;
    if (metrics.cumulativeLayoutShift > 0.1) score -= 10;

    return Math.max(0, score);
  }

  generateOptimizationSuggestions() {
    // Generar sugerencias de optimización
    this.optimizationSuggestions.push({
      type: 'general',
      suggestion: 'Implementar lazy loading para imágenes',
      priority: 'high',
    });

    this.optimizationSuggestions.push({
      type: 'general',
      suggestion: 'Minificar y comprimir recursos',
      priority: 'medium',
    });

    this.optimizationSuggestions.push({
      type: 'general',
      suggestion: 'Usar CDN para recursos estáticos',
      priority: 'medium',
    });
  }

  optimizeMemory() {
    // Optimizar uso de memoria
    if (window.axyraCache) {
      window.axyraCache.cleanupExpiredCache();
    }

    if (window.axyraLazyLoading) {
      window.axyraLazyLoading.clearModuleCache();
    }

    // Limpiar datos no utilizados
    this.cleanupUnusedData();
  }

  cleanupUnusedData() {
    // Limpiar datos no utilizados
    const unusedKeys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('axyra_temp_')) {
        unusedKeys.push(key);
      }
    }

    unusedKeys.forEach((key) => {
      localStorage.removeItem(key);
    });

    console.log(`🧹 Limpiados ${unusedKeys.length} elementos no utilizados`);
  }

  // Métodos de utilidad
  getPerformanceMetrics() {
    return {
      ...this.metrics,
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
      },
    };
  }

  getOptimizationSuggestions() {
    return this.optimizationSuggestions;
  }

  getPerformanceScore() {
    const metrics = this.metrics;
    let score = 100;

    // Calcular puntuación basada en métricas
    if (metrics.pageLoad > 3000) score -= 20;
    if (metrics.firstContentfulPaint > 1500) score -= 15;
    if (metrics.largestContentfulPaint > 2500) score -= 20;
    if (metrics.firstInputDelay > 100) score -= 15;
    if (metrics.cumulativeLayoutShift > 0.1) score -= 10;

    return Math.max(0, score);
  }

  // Métodos de exportación
  exportPerformanceData() {
    const data = {
      metrics: this.getPerformanceMetrics(),
      suggestions: this.getOptimizationSuggestions(),
      score: this.getPerformanceScore(),
      timestamp: new Date().toISOString(),
    };

    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });

    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `axyra_performance_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  }

  // Métodos de limpieza
  destroy() {
    this.observers.forEach((observer) => observer.disconnect());
    if (this.memoryMonitor) {
      clearInterval(this.memoryMonitor);
    }
    this.performanceData = [];
    this.optimizationSuggestions = [];
  }
}

// Inicializar sistema de rendimiento
document.addEventListener('DOMContentLoaded', function () {
  try {
    window.axyraPerformance = new AxyraPerformanceSystem();
    console.log('✅ Sistema de Rendimiento AXYRA cargado');
  } catch (error) {
    console.error('❌ Error cargando sistema de rendimiento:', error);
  }
});

// Exportar para uso global
window.AxyraPerformanceSystem = AxyraPerformanceSystem;
