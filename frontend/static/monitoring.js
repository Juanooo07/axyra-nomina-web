// Sistema de monitoreo básico para AXYRA
class MonitoringSystem {
    constructor() {
        this.errors = [];
        this.performance = {};
        this.init();
    }

    init() {
        this.setupErrorTracking();
        this.setupPerformanceTracking();
        console.log('📊 Sistema de monitoreo inicializado');
    }

    setupErrorTracking() {
        window.addEventListener('error', (e) => {
            this.trackError('javascript_error', {
                message: e.message,
                filename: e.filename,
                line: e.lineno
            });
        });
    }

    setupPerformanceTracking() {
        window.addEventListener('load', () => {
            this.performance.pageLoadTime = performance.now();
        });
    }

    trackError(type, data) {
        this.errors.push({ type, data, timestamp: Date.now() });
        console.error('🚨 Error:', type, data);
    }

    getMetrics() {
        return {
            errors: this.errors.length,
            performance: this.performance,
            timestamp: Date.now()
        };
    }
}

// Inicializar
const monitoring = new MonitoringSystem();
window.monitoring = monitoring;
