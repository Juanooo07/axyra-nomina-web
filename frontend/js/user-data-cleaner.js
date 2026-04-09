// ========================================
// SISTEMA DE LIMPIEZA DE DATOS POR USUARIO
// Limpieza automática de datos al cambiar de usuario
// ========================================

class UserDataCleaner {
    constructor() {
        this.isInitialized = false;
        this.currentUserId = null;
        this.init();
    }

    init() {
        if (this.isInitialized) return;
        
        console.log('🧹 Inicializando sistema de limpieza de datos por usuario...');
        this.setupUserChangeListener();
        this.isInitialized = true;
        console.log('✅ Sistema de limpieza de datos por usuario inicializado');
    }

    setupUserChangeListener() {
        // Escuchar cambios de autenticación
        if (typeof firebase !== 'undefined' && firebase.auth) {
            firebase.auth().onAuthStateChanged((user) => {
                if (user) {
                    this.handleUserLogin(user);
                } else {
                    this.handleUserLogout();
                }
            });
        }
    }

    handleUserLogin(user) {
        const newUserId = user.uid;
        
        // Si es un usuario diferente, limpiar datos del usuario anterior
        if (this.currentUserId && this.currentUserId !== newUserId) {
            console.log('🔄 Usuario diferente detectado, limpiando datos del usuario anterior...');
            this.cleanUserData();
        }
        
        this.currentUserId = newUserId;
        console.log('✅ Usuario actual:', user.email);
    }

    handleUserLogout() {
        console.log('🚪 Usuario cerró sesión, limpiando todos los datos...');
        this.cleanAllData();
        this.currentUserId = null;
    }

    cleanUserData() {
        try {
            // Limpiar datos específicos del usuario
            const userSpecificKeys = [
                'axyra_user_data',
                'axyra_session_data',
                'axyra_user_plan',
                'axyra_employees',
                'axyra_hours',
                'axyra_payroll',
                'axyra_inventory',
                'axyra_cash',
                'axyra_reports',
                'axyra_metrics',
                'axyra_subscriptions',
                'axyra_payments'
            ];

            userSpecificKeys.forEach(key => {
                localStorage.removeItem(key);
            });

            // Limpiar sessionStorage
            sessionStorage.clear();

            console.log('✅ Datos del usuario limpiados correctamente');
        } catch (error) {
            console.error('❌ Error limpiando datos del usuario:', error);
        }
    }

    cleanAllData() {
        try {
            // Limpiar todos los datos de AXYRA
            const allKeys = Object.keys(localStorage).filter(key => key.startsWith('axyra_'));
            allKeys.forEach(key => {
                localStorage.removeItem(key);
            });

            // Limpiar sessionStorage
            sessionStorage.clear();

            console.log('✅ Todos los datos limpiados correctamente');
        } catch (error) {
            console.error('❌ Error limpiando todos los datos:', error);
        }
    }

    // Método para limpiar datos específicos
    cleanSpecificData(dataType) {
        try {
            switch (dataType) {
                case 'employees':
                    localStorage.removeItem('axyra_employees');
                    break;
                case 'hours':
                    localStorage.removeItem('axyra_hours');
                    break;
                case 'payroll':
                    localStorage.removeItem('axyra_payroll');
                    break;
                case 'inventory':
                    localStorage.removeItem('axyra_inventory');
                    break;
                case 'cash':
                    localStorage.removeItem('axyra_cash');
                    break;
                case 'reports':
                    localStorage.removeItem('axyra_reports');
                    break;
                case 'metrics':
                    localStorage.removeItem('axyra_metrics');
                    break;
                default:
                    console.warn('Tipo de datos no reconocido:', dataType);
            }
            console.log(`✅ Datos de ${dataType} limpiados`);
        } catch (error) {
            console.error(`❌ Error limpiando datos de ${dataType}:`, error);
        }
    }

    // Método para verificar si hay datos de otro usuario
    checkForOtherUserData() {
        try {
            const userData = localStorage.getItem('axyra_user_data');
            if (userData) {
                const parsedData = JSON.parse(userData);
                if (parsedData.uid && parsedData.uid !== this.currentUserId) {
                    console.warn('⚠️ Datos de otro usuario detectados, limpiando...');
                    this.cleanUserData();
                    return true;
                }
            }
            return false;
        } catch (error) {
            console.error('❌ Error verificando datos de otro usuario:', error);
            return false;
        }
    }

    // Método para forzar limpieza completa
    forceCleanAll() {
        console.log('🧹 Forzando limpieza completa de datos...');
        this.cleanAllData();
        this.currentUserId = null;
    }

    // Método para obtener estado de limpieza
    getCleanState() {
        const userData = localStorage.getItem('axyra_user_data');
        const hasData = userData !== null;
        
        return {
            hasUserData: hasData,
            currentUserId: this.currentUserId,
            isClean: !hasData || (userData && JSON.parse(userData).uid === this.currentUserId)
        };
    }
}

// Inicializar sistema de limpieza de datos
document.addEventListener('DOMContentLoaded', function() {
    window.userDataCleaner = new UserDataCleaner();
});

// Exportar para uso global
window.UserDataCleaner = UserDataCleaner;
