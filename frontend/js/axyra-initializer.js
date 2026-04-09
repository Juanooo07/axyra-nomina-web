// ========================================
// INICIALIZADOR AXYRA
// Sistema robusto de inicialización de todos los componentes
// ========================================

class AxyraInitializer {
    constructor() {
        this.isInitialized = false;
        this.components = [];
        this.init();
    }

    init() {
        if (this.isInitialized) return;
        
        console.log('🚀 Inicializando AXYRA...');
        this.setupComponents();
        this.initializeComponents();
        this.isInitialized = true;
        console.log('✅ AXYRA inicializado correctamente');
    }

    setupComponents() {
        this.components = [
            {
                name: 'Firebase Singleton',
                init: () => this.initFirebase(),
                required: true
            },
            {
                name: 'Notifications Enhanced',
                init: () => this.initNotifications(),
                required: false
            },
            {
                name: 'AI Chat Functional',
                init: () => this.initAIChat(),
                required: false
            },
            {
                name: 'Auth System',
                init: () => this.initAuth(),
                required: true
            }
        ];
    }

    async initializeComponents() {
        for (const component of this.components) {
            try {
                await component.init();
                console.log(`✅ ${component.name} inicializado`);
            } catch (error) {
                console.error(`❌ Error inicializando ${component.name}:`, error);
                if (component.required) {
                    throw error;
                }
            }
        }
    }

    async initFirebase() {
        // Esperar a que Firebase esté disponible
        await this.waitForFirebase();
        
        // Verificar que el singleton esté listo
        if (window.firebaseSingleton && window.firebaseSingleton.isFirebaseReady()) {
            console.log('🔥 Firebase Singleton listo');
            return;
        }
        
        throw new Error('Firebase Singleton no está listo');
    }

    async initNotifications() {
        if (window.notificationsEnhanced) {
            console.log('🔔 Notifications Enhanced listo');
            return;
        }
        
        // Crear instancia si no existe
        if (window.NotificationsEnhanced) {
            window.notificationsEnhanced = new window.NotificationsEnhanced();
        }
    }

    async initAIChat() {
        if (window.aiChatFunctional) {
            console.log('🤖 AI Chat Functional listo');
            return;
        }
        
        // Crear instancia si no existe
        if (window.AIChatFunctional) {
            window.aiChatFunctional = new window.AIChatFunctional();
        }
    }

    async initAuth() {
        if (window.axyraAuth) {
            console.log('🔐 Auth System listo');
            return;
        }
        
        // Crear instancia si no existe
        if (window.AxyraAuthSystem) {
            window.axyraAuth = new window.AxyraAuthSystem();
        }
    }

    async waitForFirebase() {
        return new Promise((resolve, reject) => {
            let attempts = 0;
            const maxAttempts = 100; // 10 segundos máximo
            
            const checkFirebase = () => {
                attempts++;
                
                if (typeof firebase !== 'undefined' && firebase.apps) {
                    resolve();
                } else if (attempts >= maxAttempts) {
                    reject(new Error('Firebase SDK no se cargó en el tiempo esperado'));
                } else {
                    setTimeout(checkFirebase, 100);
                }
            };
            
            checkFirebase();
        });
    }

    // Método para verificar el estado de todos los componentes
    getStatus() {
        return {
            isInitialized: this.isInitialized,
            components: this.components.map(comp => ({
                name: comp.name,
                status: comp.init ? 'ready' : 'not ready'
            }))
        };
    }

    // Método para reinicializar si es necesario
    reinitialize() {
        console.log('🔄 Reinicializando AXYRA...');
        this.isInitialized = false;
        this.init();
    }
}

// Inicializar AXYRA cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    window.axyraInitializer = new AxyraInitializer();
});

// Exportar para uso global
window.AxyraInitializer = AxyraInitializer;
