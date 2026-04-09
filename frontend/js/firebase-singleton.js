// ========================================
// SINGLETON DE FIREBASE AXYRA
// Inicialización única y controlada de Firebase
// ========================================

class FirebaseSingleton {
    constructor() {
        this.isInitialized = false;
        this.firebase = null;
        this.config = null;
        this.init();
    }

    init() {
        if (this.isInitialized) return;
        
        console.log('🔥 Inicializando Singleton de Firebase...');
        this.setupFirebaseConfig();
        
        // Esperar a que Firebase esté disponible
        this.waitForFirebase().then(() => {
            this.initializeFirebase();
            this.isInitialized = true;
            console.log('✅ Singleton de Firebase inicializado');
        }).catch(error => {
            console.error('❌ Error esperando Firebase:', error);
        });
    }

    async waitForFirebase() {
        return new Promise((resolve, reject) => {
            let attempts = 0;
            const maxAttempts = 50; // 5 segundos máximo
            
            const checkFirebase = () => {
                attempts++;
                
                if (typeof firebase !== 'undefined') {
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

    setupFirebaseConfig() {
        this.config = {
            apiKey: "AIzaSyAW3ejokcsWAP5G1yJT63jLBpFmdTiTUwc",
            authDomain: "axyra-48238.firebaseapp.com",
            projectId: "axyra-48238",
            storageBucket: "axyra-48238.firebasestorage.app",
            messagingSenderId: "796334517286",
            appId: "1:796334517286:web:95947cf0f773dc11378ae7",
            measurementId: "G-R8W2MP15B7"
        };
    }

    initializeFirebase() {
        try {
            if (typeof firebase === 'undefined') {
                console.error('❌ Firebase SDK no está disponible');
                return;
            }

            // Verificar si Firebase ya está inicializado
            if (firebase.apps.length > 0) {
                console.log('🔥 Firebase ya estaba inicializado');
                this.firebase = firebase;
                return;
            }

            // Inicializar Firebase
            firebase.initializeApp(this.config);
            this.firebase = firebase;
            
            console.log('🔥 Firebase inicializado correctamente');
            
            // Configurar persistencia de autenticación
            this.setupAuthPersistence();
            
        } catch (error) {
            console.error('❌ Error inicializando Firebase:', error);
        }
    }

    setupAuthPersistence() {
        try {
            if (this.firebase && this.firebase.auth) {
                this.firebase.auth().setPersistence(this.firebase.auth.Auth.Persistence.LOCAL);
                console.log('🔐 Persistencia de autenticación configurada');
            }
        } catch (error) {
            console.warn('⚠️ Error configurando persistencia de auth:', error);
        }
    }

    // Método para obtener la instancia de Firebase
    getFirebase() {
        if (!this.firebase) {
            this.initializeFirebase();
        }
        return this.firebase;
    }

    // Método para obtener la configuración
    getConfig() {
        return this.config;
    }

    // Método para verificar si está inicializado
    isFirebaseReady() {
        return this.firebase !== null && this.firebase.apps.length > 0;
    }

    // Método para reinicializar si es necesario
    reinitialize() {
        console.log('🔄 Reinicializando Firebase...');
        this.isInitialized = false;
        this.firebase = null;
        this.init();
    }
}

// Crear instancia única
const firebaseSingleton = new FirebaseSingleton();

// Exponer globalmente
window.firebaseSingleton = firebaseSingleton;
window.getFirebase = () => firebaseSingleton.getFirebase();
window.getFirebaseConfig = () => firebaseSingleton.getConfig();
window.getAxyraConfig = () => firebaseSingleton.getConfig(); // Alias para compatibilidad
window.isFirebaseReady = () => firebaseSingleton.isFirebaseReady();

// Interceptar intentos de inicialización múltiple (solo si Firebase está disponible)
if (typeof firebase !== 'undefined') {
    const originalInitializeApp = firebase.initializeApp;
    firebase.initializeApp = function(config, name) {
        if (firebase.apps.length > 0) {
            console.warn('⚠️ Firebase ya está inicializado, usando instancia existente');
            return firebase.app();
        }
        return originalInitializeApp.call(this, config, name);
    };
}

console.log('🔥 Firebase Singleton AXYRA cargado');
