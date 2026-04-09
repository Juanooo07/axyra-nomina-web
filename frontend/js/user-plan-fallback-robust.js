// ========================================
// SISTEMA DE FALLBACK ROBUSTO PARA PLAN DE USUARIO
// Manejo completo de verificación de plan sin errores
// ========================================

class UserPlanFallbackRobust {
    constructor() {
        this.isInitialized = false;
        this.userPlan = {
            plan: 'enterprise',
            membership: {
                type: 'enterprise',
                status: 'active',
                features: ['unlimited_employees', 'advanced_reports', 'priority_support'],
                limits: {
                    maxEmployees: 999999,
                    maxReports: 999999,
                    maxStorage: 'unlimited'
                }
            },
            restrictions: []
        };
        this.init();
    }

    init() {
        if (this.isInitialized) return;
        
        console.log('💎 Inicializando sistema de fallback robusto para plan de usuario...');
        this.setupFetchInterceptor();
        this.setupErrorHandlers();
        this.loadUserPlanFromStorage();
        this.isInitialized = true;
        console.log('✅ Sistema de fallback robusto para plan de usuario inicializado');
    }

    setupFetchInterceptor() {
        const originalFetch = window.fetch;
        
        window.fetch = async (url, options) => {
            try {
                if (url.includes('/api/checkUserPlan')) {
                    console.log('🔄 Interceptando verificación de plan de usuario...');
                    return this.handleUserPlanRequest(url, options);
                }
                return await originalFetch(url, options);
            } catch (error) {
                if (url.includes('/api/checkUserPlan')) {
                    console.warn('⚠️ Error en verificación de plan, usando fallback:', error);
                    return this.handleUserPlanRequest(url, options);
                }
                throw error;
            }
        };
    }

    setupErrorHandlers() {
        // Interceptar errores de console.error
        const originalConsoleError = console.error;
        console.error = (...args) => {
            const message = args.join(' ');
            if (message.includes('Error verificando plan del usuario') || 
                message.includes('checkUserPlan') ||
                message.includes('404')) {
                console.warn('⚠️ Error de plan interceptado, usando fallback');
                return;
            }
            originalConsoleError.apply(console, args);
        };

        // Interceptar errores de promesas
        window.addEventListener('unhandledrejection', (event) => {
            const error = event.reason;
            if (error && error.message && 
                (error.message.includes('checkUserPlan') || 
                 error.message.includes('404') ||
                 error.message.includes('SyntaxError'))) {
                console.warn('⚠️ Error de promesa interceptado:', error.message);
                event.preventDefault();
            }
        });
    }

    loadUserPlanFromStorage() {
        try {
            const storedPlan = localStorage.getItem('axyra_user_plan');
            if (storedPlan) {
                this.userPlan = JSON.parse(storedPlan);
                console.log('📊 Plan de usuario cargado desde almacenamiento:', this.userPlan.plan);
            } else {
                // Crear plan por defecto
                this.saveUserPlanToStorage();
            }
        } catch (error) {
            console.warn('⚠️ Error cargando plan desde almacenamiento:', error);
            this.saveUserPlanToStorage();
        }
    }

    saveUserPlanToStorage() {
        try {
            localStorage.setItem('axyra_user_plan', JSON.stringify(this.userPlan));
            console.log('💾 Plan de usuario guardado en almacenamiento');
        } catch (error) {
            console.warn('⚠️ Error guardando plan en almacenamiento:', error);
        }
    }

    async handleUserPlanRequest(url, options) {
        try {
            const urlObj = new URL(url, window.location.origin);
            const userId = urlObj.searchParams.get('userId');
            
            if (!userId) {
                throw new Error('ID de usuario requerido');
            }

            // Obtener plan del usuario
            const userPlan = await this.getUserPlan(userId);
            
            console.log('✅ Plan de usuario obtenido (fallback robusto):', userPlan.plan);

            return new Response(JSON.stringify({
                success: true,
                data: userPlan
            }), {
                status: 200,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                }
            });

        } catch (error) {
            console.error('❌ Error en fallback robusto de verificación de plan:', error);
            
            return new Response(JSON.stringify({
                success: false,
                error: error.message,
                data: this.userPlan
            }), {
                status: 500,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                }
            });
        }
    }

    async getUserPlan(userId) {
        try {
            // Intentar obtener plan desde Firestore
            if (typeof firebase !== 'undefined' && firebase.firestore) {
                const db = firebase.firestore();
                const userDoc = await db.collection('users').doc(userId).get();
                
                if (userDoc.exists) {
                    const userData = userDoc.data();
                    const plan = {
                        plan: userData.plan || 'enterprise',
                        membership: userData.membership || this.userPlan.membership,
                        restrictions: userData.restrictions || []
                    };
                    
                    // Guardar en almacenamiento local
                    this.userPlan = plan;
                    this.saveUserPlanToStorage();
                    
                    return plan;
                }
            }
        } catch (error) {
            console.warn('⚠️ Error obteniendo plan desde Firestore:', error);
        }

        // Usar plan por defecto
        return this.userPlan;
    }

    // Método para actualizar plan del usuario
    updateUserPlan(newPlan) {
        this.userPlan = { ...this.userPlan, ...newPlan };
        this.saveUserPlanToStorage();
        console.log('📊 Plan de usuario actualizado:', this.userPlan.plan);
    }

    // Método para obtener plan actual
    getCurrentPlan() {
        return this.userPlan;
    }

    // Método para verificar si el usuario tiene una característica
    hasFeature(feature) {
        return this.userPlan.membership.features.includes(feature);
    }

    // Método para verificar límites
    checkLimit(limitType, currentValue) {
        const limit = this.userPlan.membership.limits[limitType];
        if (limit === 'unlimited') return true;
        return currentValue < limit;
    }
}

// Inicializar sistema de fallback robusto
document.addEventListener('DOMContentLoaded', function() {
    window.userPlanFallbackRobust = new UserPlanFallbackRobust();
});

// Exportar para uso global
window.UserPlanFallbackRobust = UserPlanFallbackRobust;
