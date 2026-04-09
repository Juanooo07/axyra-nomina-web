// ========================================
// CONFIGURACIÓN UNIFICADA AXYRA
// Sistema único y robusto para toda la aplicación
// ========================================

class AxyraUnifiedConfig {
    constructor() {
        this.isInitialized = false;
        this.config = null;
        this.firebase = null;
        this.init();
    }

    init() {
        if (this.isInitialized) return;
        
        console.log('🔧 Inicializando configuración unificada AXYRA...');
        this.setupConfiguration();
        this.initializeFirebase();
        this.setupGlobalFunctions();
        this.isInitialized = true;
        console.log('✅ Configuración unificada AXYRA inicializada');
    }

    setupConfiguration() {
        // Configuración de Firebase
        const firebaseConfig = {
            apiKey: "AIzaSyAW3ejokcsWAP5G1yJT63jLBpFmdTiTUwc",
            authDomain: "axyra-48238.firebaseapp.com",
            projectId: "axyra-48238",
            storageBucket: "axyra-48238.firebasestorage.app",
            messagingSenderId: "796334517286",
            appId: "1:796334517286:web:95947cf0f773dc11378ae7",
            measurementId: "G-R8W2MP15B7"
        };

        // Configuración completa de AXYRA
        this.config = {
            firebase: firebaseConfig,
            company: {
                name: "AXYRA",
                version: "1.0.0",
                environment: "production"
            },
            features: {
                offlineMode: true,
                realTimeSync: true,
                notifications: true,
                analytics: true
            },
            storage: {
                maxLogs: 1000,
                maxCache: 50,
                maxBackups: 10
            }
        };

        console.log('📊 Configuración AXYRA establecida');
    }

    initializeFirebase() {
        try {
            if (typeof firebase === 'undefined') {
                console.warn('⚠️ Firebase SDK no está disponible, usando modo offline');
                this.firebase = null;
                return;
            }

            // Verificar si Firebase ya está inicializado
            if (firebase.apps.length > 0) {
                console.log('🔥 Firebase ya estaba inicializado');
                this.firebase = firebase;
                return;
            }

            // Inicializar Firebase
            firebase.initializeApp(this.config.firebase);
            this.firebase = firebase;
            
            console.log('🔥 Firebase AXYRA inicializado correctamente');
            
            // Configurar persistencia de autenticación
            this.setupAuthPersistence();
            
            // Verificar servicios disponibles
            this.checkFirebaseServices();
            
        } catch (error) {
            console.error('❌ Error inicializando Firebase:', error);
            this.firebase = null;
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

    checkFirebaseServices() {
        if (!this.firebase) return;

        const services = {
            Auth: typeof this.firebase.auth === 'function',
            Firestore: typeof this.firebase.firestore === 'function',
            Analytics: typeof this.firebase.analytics === 'function'
        };

        console.log('✅ Servicios de Firebase disponibles:', services);
    }

    setupGlobalFunctions() {
        // Exponer funciones globales
        window.getAxyraConfig = () => this.config;
        window.getFirebaseConfig = () => this.config.firebase;
        window.getFirebase = () => this.firebase;
        window.axyraConfig = this;
        
        console.log('🌐 Funciones globales AXYRA expuestas');
    }

    // Método para obtener configuración
    getConfig() {
        return this.config;
    }

    // Método para obtener Firebase
    getFirebase() {
        return this.firebase;
    }

    // Método para verificar si Firebase está disponible
    isFirebaseAvailable() {
        return this.firebase !== null;
    }

    // Método para obtener usuario actual
    getCurrentUser() {
        if (!this.firebase || !this.firebase.auth) return null;
        
        try {
            return this.firebase.auth().currentUser;
        } catch (error) {
            console.warn('⚠️ Error obteniendo usuario actual:', error);
            return null;
        }
    }

    // Método para obtener datos del usuario desde localStorage
    getCurrentUserData() {
        try {
            const userData = localStorage.getItem('axyra_user_data');
            return userData ? JSON.parse(userData) : null;
        } catch (error) {
            console.warn('⚠️ Error obteniendo datos del usuario:', error);
            return null;
        }
    }

    // Método para guardar datos del usuario
    saveUserData(userData) {
        try {
            localStorage.setItem('axyra_user_data', JSON.stringify(userData));
            console.log('💾 Datos del usuario guardados');
        } catch (error) {
            console.error('❌ Error guardando datos del usuario:', error);
        }
    }

    // Método para limpiar datos del usuario
    clearUserData() {
        try {
            localStorage.removeItem('axyra_user_data');
            console.log('🧹 Datos del usuario limpiados');
        } catch (error) {
            console.error('❌ Error limpiando datos del usuario:', error);
        }
    }
}

// Inicializar configuración unificada
document.addEventListener('DOMContentLoaded', function() {
    window.axyraUnifiedConfig = new AxyraUnifiedConfig();
});

// Exportar para uso global
window.AxyraUnifiedConfig = AxyraUnifiedConfig;
