// ========================================
// AUTENTICACIÓN ESPECÍFICA PARA REGISTRO
// Sin redirecciones automáticas
// ========================================

class RegisterAuthSystem {
    constructor() {
        this.isInitialized = false;
        this.init();
    }

    async init() {
        if (this.isInitialized) return;
        
        try {
            console.log('🔐 Inicializando sistema de autenticación para registro...');
            await this.initializeFirebase();
            this.isInitialized = true;
            console.log('✅ Sistema de autenticación para registro inicializado');
        } catch (error) {
            console.error('❌ Error inicializando autenticación para registro:', error);
        }
    }

    async initializeFirebase() {
        try {
            if (typeof firebase === 'undefined') {
                throw new Error('Firebase SDK no está disponible');
            }

            const config = window.getAxyraConfig();
            if (!config || !config.firebase) {
                throw new Error('Configuración de Firebase no disponible');
            }

            if (!firebase.apps.length) {
                firebase.initializeApp(config.firebase);
            }

            this.auth = firebase.auth();
            this.db = firebase.firestore();
            
            console.log('🔥 Firebase inicializado para registro');
        } catch (error) {
            console.error('❌ Error inicializando Firebase para registro:', error);
            throw error;
        }
    }

    async registerWithEmail(email, password, userData) {
        try {
            if (!this.auth) {
                throw new Error('Firebase Auth no está inicializado');
            }

            // Crear usuario con Firebase Auth
            const userCredential = await this.auth.createUserWithEmailAndPassword(email, password);
            const user = userCredential.user;

            // Actualizar perfil del usuario
            await user.updateProfile({
                displayName: userData.nombre
            });

            // Guardar información completa en Firestore
            await this.db.collection('users').doc(user.uid).set({
                // Información personal
                nombre: userData.nombre,
                usuario: userData.usuario,
                email: userData.email,
                telefono: userData.telefono || '',
                cargo: userData.cargo || '',
                
                // Información de la empresa
                empresa: userData.empresa,
                nit: userData.nit,
                sector: userData.sector || '',
                direccion: userData.direccion || '',
                ciudad: userData.ciudad || '',
                pais: userData.pais || 'Colombia',
                
                // Información del sistema
                fechaRegistro: firebase.firestore.FieldValue.serverTimestamp(),
                rol: 'admin', // El primer usuario es admin
                activo: true,
                tipoCuenta: 'empresarial'
            });

            // Crear documento de la empresa
            await this.db.collection('empresas').doc(user.uid).set({
                nombre: userData.empresa,
                nit: userData.nit,
                sector: userData.sector || '',
                direccion: userData.direccion || '',
                ciudad: userData.ciudad || '',
                pais: userData.pais || 'Colombia',
                fechaCreacion: firebase.firestore.FieldValue.serverTimestamp(),
                administrador: user.uid,
                activa: true
            });

            // Redirigir al dashboard después del registro exitoso
            console.log('✅ Registro exitoso, redirigiendo al dashboard...');
            setTimeout(() => {
                window.location.href = 'dashboard-optimized.html';
            }, 2000);

            return { success: true, user: user };
        } catch (error) {
            console.error('❌ Error en registro:', error);
            return { success: false, error: error };
        }
    }

    async registerWithGoogle() {
        try {
            if (!this.auth) {
                throw new Error('Firebase Auth no está inicializado');
            }

            const provider = new firebase.auth.GoogleAuthProvider();
            const result = await this.auth.signInWithPopup(provider);
            const user = result.user;
            
            // Crear perfil de usuario con información básica
            const userData = {
                nombre: user.displayName || 'Usuario Google',
                usuario: user.email.split('@')[0],
                email: user.email,
                telefono: '',
                cargo: '',
                empresa: 'Empresa Google',
                nit: '',
                sector: '',
                direccion: '',
                ciudad: '',
                pais: 'Colombia',
                fechaRegistro: firebase.firestore.FieldValue.serverTimestamp(),
                rol: 'admin',
                activo: true,
                tipoCuenta: 'empresarial',
                proveedor: 'google'
            };

            // Guardar en Firestore
            await this.db.collection('users').doc(user.uid).set(userData);
            
            return { success: true, user: user };
        } catch (error) {
            console.error('❌ Error en registro con Google:', error);
            return { success: false, error: error };
        }
    }
}

// Inicializar sistema de autenticación para registro
document.addEventListener('DOMContentLoaded', function () {
    try {
        window.registerAuth = new RegisterAuthSystem();
        console.log('✅ Sistema de autenticación para registro cargado');
    } catch (error) {
        console.error('❌ Error cargando sistema de autenticación para registro:', error);
    }
});

// Exportar para uso global
window.RegisterAuthSystem = RegisterAuthSystem;
