// ========================================
// SISTEMA DE INICIO LIMPIO AXYRA
// Limpieza completa de datos para empezar desde cero
// ========================================

class CleanStartSystem {
    constructor() {
        this.isInitialized = false;
        this.init();
    }

    init() {
        if (this.isInitialized) return;
        
        console.log('🧹 Inicializando sistema de inicio limpio...');
        this.setupCleanStart();
        this.isInitialized = true;
        console.log('✅ Sistema de inicio limpio inicializado');
    }

    setupCleanStart() {
        // Limpiar datos locales
        this.clearLocalData();
        
        // Limpiar datos de sesión
        this.clearSessionData();
        
        // Limpiar datos de fallback
        this.clearFallbackData();
        
        // Mostrar notificación de inicio limpio
        this.showCleanStartNotification();
    }

    clearLocalData() {
        try {
            // Lista de claves a limpiar
            const keysToRemove = [
                'axyra_user_data',
                'axyra_session_data',
                'axyra_fallback_data',
                'axyra_user_plan',
                'axyra_logs',
                'axyra_cache',
                'axyra_backup',
                'axyra_metrics',
                'axyra_subscriptions',
                'axyra_payments',
                'axyra_employees',
                'axyra_hours',
                'axyra_payroll',
                'axyra_inventory',
                'axyra_cash',
                'axyra_reports'
            ];

            keysToRemove.forEach(key => {
                localStorage.removeItem(key);
            });

            console.log('🧹 Datos locales limpiados');
        } catch (error) {
            console.error('❌ Error limpiando datos locales:', error);
        }
    }

    clearSessionData() {
        try {
            // Limpiar sessionStorage
            sessionStorage.clear();
            console.log('🧹 Datos de sesión limpiados');
        } catch (error) {
            console.error('❌ Error limpiando datos de sesión:', error);
        }
    }

    clearFallbackData() {
        try {
            // Limpiar datos de fallback
            if (window.firestorePermissionsFallback) {
                window.firestorePermissionsFallback.clearFallbackData();
            }
            
            if (window.metricsErrorInterceptor) {
                window.metricsErrorInterceptor.resetErrorCount();
            }
            
            console.log('🧹 Datos de fallback limpiados');
        } catch (error) {
            console.error('❌ Error limpiando datos de fallback:', error);
        }
    }

    showCleanStartNotification() {
        const notification = document.createElement('div');
        notification.innerHTML = `
            <div style="
                position: fixed;
                top: 20px;
                left: 20px;
                background: linear-gradient(135deg, #3498db, #2980b9);
                color: white;
                padding: 20px;
                border-radius: 10px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                z-index: 10000;
                font-family: 'Segoe UI', sans-serif;
                max-width: 400px;
            ">
                <div style="display: flex; align-items: center; gap: 15px;">
                    <i class="fas fa-broom" style="font-size: 24px;"></i>
                    <div>
                        <h4 style="margin: 0 0 10px 0;">🧹 Inicio Limpio Activado</h4>
                        <p style="margin: 0 0 15px 0; font-size: 14px;">
                            Todos los datos locales han sido limpiados. 
                            El sistema está listo para empezar desde cero.
                        </p>
                        <div style="font-size: 12px; opacity: 0.8;">
                            ✅ Datos locales limpiados<br>
                            ✅ Datos de sesión limpiados<br>
                            ✅ Datos de fallback limpiados
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(notification);

        // Remover notificación después de 6 segundos
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 6000);
    }

    // Método para limpiar datos específicos
    clearSpecificData(dataType) {
        try {
            switch (dataType) {
                case 'user':
                    localStorage.removeItem('axyra_user_data');
                    localStorage.removeItem('axyra_user_plan');
                    break;
                case 'session':
                    sessionStorage.clear();
                    localStorage.removeItem('axyra_session_data');
                    break;
                case 'fallback':
                    this.clearFallbackData();
                    break;
                case 'all':
                    this.clearLocalData();
                    this.clearSessionData();
                    this.clearFallbackData();
                    break;
                default:
                    console.warn('Tipo de datos no reconocido:', dataType);
            }
            console.log(`🧹 Datos de ${dataType} limpiados`);
        } catch (error) {
            console.error(`❌ Error limpiando datos de ${dataType}:`, error);
        }
    }

    // Método para verificar estado de limpieza
    checkCleanState() {
        const localData = Object.keys(localStorage).filter(key => key.startsWith('axyra_'));
        const sessionData = Object.keys(sessionStorage).length;
        
        return {
            localData: localData.length,
            sessionData: sessionData,
            isClean: localData.length === 0 && sessionData === 0
        };
    }

    // Método para mostrar estado de limpieza
    showCleanState() {
        const state = this.checkCleanState();
        console.log('📊 Estado de limpieza:');
        console.log('  Datos locales:', state.localData);
        console.log('  Datos de sesión:', state.sessionData);
        console.log('  Estado limpio:', state.isClean ? '✅ SÍ' : '❌ NO');
        return state;
    }
}

// Inicializar sistema de inicio limpio
document.addEventListener('DOMContentLoaded', function() {
    window.cleanStartSystem = new CleanStartSystem();
});

// Exportar para uso global
window.CleanStartSystem = CleanStartSystem;
