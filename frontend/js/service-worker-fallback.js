// ========================================
// SISTEMA DE FALLBACK PARA SERVICE WORKER
// Manejo de errores de cache y service worker
// ========================================

class ServiceWorkerFallback {
    constructor() {
        this.isInitialized = false;
        this.cacheErrors = [];
        this.init();
    }

    init() {
        if (this.isInitialized) return;
        
        console.log('🔧 Inicializando sistema de fallback para Service Worker...');
        this.setupErrorHandlers();
        this.setupCacheFallback();
        this.isInitialized = true;
        console.log('✅ Sistema de fallback para Service Worker inicializado');
    }

    setupErrorHandlers() {
        // Interceptar errores de Service Worker
        window.addEventListener('error', (event) => {
            if (event.message && event.message.includes('Service Worker')) {
                console.warn('⚠️ Error de Service Worker interceptado:', event.message);
                this.handleServiceWorkerError(event);
            }
        });

        // Interceptar errores de promesas relacionadas con cache
        window.addEventListener('unhandledrejection', (event) => {
            const error = event.reason;
            if (error && error.message && 
                (error.message.includes('Cache') || 
                 error.message.includes('addAll') ||
                 error.message.includes('Service Worker'))) {
                console.warn('⚠️ Error de cache interceptado:', error.message);
                this.handleCacheError(error);
                event.preventDefault();
            }
        });
    }

    setupCacheFallback() {
        // Interceptar errores de cache específicos
        const originalConsoleError = console.error;
        console.error = (...args) => {
            const message = args.join(' ');
            if (message.includes('Failed to execute \'addAll\' on \'Cache\'')) {
                console.warn('⚠️ Error de cache interceptado, usando fallback');
                this.handleCacheError({ message });
                return;
            }
            originalConsoleError.apply(console, args);
        };
    }

    handleServiceWorkerError(event) {
        console.log('🔧 Manejando error de Service Worker...');
        
        // Registrar error
        this.cacheErrors.push({
            type: 'service_worker',
            message: event.message,
            timestamp: new Date().toISOString(),
            url: event.filename
        });

        // Intentar recargar Service Worker
        this.reloadServiceWorker();
    }

    handleCacheError(error) {
        console.log('🔧 Manejando error de cache...');
        
        // Registrar error
        this.cacheErrors.push({
            type: 'cache',
            message: error.message,
            timestamp: new Date().toISOString()
        });

        // Limpiar cache problemático
        this.clearProblematicCache();
    }

    async reloadServiceWorker() {
        try {
            if ('serviceWorker' in navigator) {
                const registrations = await navigator.serviceWorker.getRegistrations();
                for (let registration of registrations) {
                    await registration.unregister();
                }
                
                // Recargar página para registrar nuevo Service Worker
                console.log('🔄 Recargando página para registrar nuevo Service Worker...');
                setTimeout(() => {
                    window.location.reload();
                }, 1000);
            }
        } catch (error) {
            console.error('❌ Error recargando Service Worker:', error);
        }
    }

    async clearProblematicCache() {
        try {
            if ('caches' in window) {
                const cacheNames = await caches.keys();
                for (let cacheName of cacheNames) {
                    await caches.delete(cacheName);
                }
                console.log('🧹 Cache limpiado correctamente');
            }
        } catch (error) {
            console.error('❌ Error limpiando cache:', error);
        }
    }

    // Método para obtener errores registrados
    getCacheErrors() {
        return this.cacheErrors;
    }

    // Método para limpiar errores registrados
    clearCacheErrors() {
        this.cacheErrors = [];
        console.log('🧹 Errores de cache limpiados');
    }

    // Método para verificar estado del Service Worker
    async checkServiceWorkerStatus() {
        try {
            if ('serviceWorker' in navigator) {
                const registrations = await navigator.serviceWorker.getRegistrations();
                return {
                    available: true,
                    registrations: registrations.length,
                    errors: this.cacheErrors.length
                };
            } else {
                return {
                    available: false,
                    registrations: 0,
                    errors: this.cacheErrors.length
                };
            }
        } catch (error) {
            console.error('❌ Error verificando estado del Service Worker:', error);
            return {
                available: false,
                registrations: 0,
                errors: this.cacheErrors.length,
                error: error.message
            };
        }
    }
}

// Inicializar sistema de fallback para Service Worker
document.addEventListener('DOMContentLoaded', function() {
    window.serviceWorkerFallback = new ServiceWorkerFallback();
});

// Exportar para uso global
window.ServiceWorkerFallback = ServiceWorkerFallback;
