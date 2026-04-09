// ========================================
// FALLBACK PARA VERIFICACIÓN DE PLAN DE USUARIO
// Sistema de gestión empresarial AXYRA
// ========================================

class UserPlanFallback {
    constructor() {
        this.isInitialized = false;
        this.init();
    }

    init() {
        if (this.isInitialized) return;
        
        console.log('🔄 Inicializando fallback de verificación de plan...');
        this.setupAPIFallback();
        this.isInitialized = true;
        console.log('✅ Fallback de verificación de plan inicializado');
    }

    setupAPIFallback() {
        // Interceptar fetch requests a la API
        const originalFetch = window.fetch;
        
        window.fetch = async (url, options) => {
            // Si es una request a la API de verificación de plan
            if (url.includes('/api/checkUserPlan')) {
                console.log('🔄 Interceptando request a checkUserPlan...');
                return this.handleUserPlanRequest(url, options);
            }
            
            // Para otras requests, usar fetch original
            return originalFetch(url, options);
        };
    }

    async handleUserPlanRequest(url, options) {
        try {
            const urlObj = new URL(url, window.location.origin);
            const userId = urlObj.searchParams.get('userId');
            
            if (!userId) {
                throw new Error('ID de usuario requerido');
            }

            // Obtener datos del usuario desde localStorage
            const userData = localStorage.getItem('axyra_user_data');
            let planData;

            if (userData) {
                const user = JSON.parse(userData);
                planData = {
                    success: true,
                    plan: user.plan || 'free',
                    membership: user.membership || {
                        type: 'free',
                        status: 'active',
                        features: ['basic_dashboard', 'basic_reports'],
                        limits: {
                            maxEmployees: 10,
                            maxReports: 5,
                            maxStorage: '100MB'
                        }
                    },
                    restrictions: user.restrictions || []
                };
            } else {
                // Plan por defecto
                planData = {
                    success: true,
                    plan: 'free',
                    membership: {
                        type: 'free',
                        status: 'active',
                        features: ['basic_dashboard', 'basic_reports'],
                        limits: {
                            maxEmployees: 10,
                            maxReports: 5,
                            maxStorage: '100MB'
                        }
                    },
                    restrictions: []
                };
            }

            console.log('✅ Plan del usuario obtenido:', planData.plan);

            return new Response(JSON.stringify(planData), {
                status: 200,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                }
            });

        } catch (error) {
            console.error('❌ Error en fallback de verificación de plan:', error);
            
            return new Response(JSON.stringify({
                success: false,
                error: error.message,
                plan: 'free',
                membership: {
                    type: 'free',
                    status: 'active',
                    features: ['basic_dashboard', 'basic_reports']
                }
            }), {
                status: 500,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                }
            });
        }
    }

    async checkUserPlan(userId) {
        try {
            const userData = localStorage.getItem('axyra_user_data');
            
            if (userData) {
                const user = JSON.parse(userData);
                return {
                    success: true,
                    plan: user.plan || 'free',
                    membership: user.membership || {
                        type: 'free',
                        status: 'active',
                        features: ['basic_dashboard', 'basic_reports']
                    }
                };
            }

            return {
                success: true,
                plan: 'free',
                membership: {
                    type: 'free',
                    status: 'active',
                    features: ['basic_dashboard', 'basic_reports']
                }
            };

        } catch (error) {
            console.error('❌ Error verificando plan del usuario:', error);
            return {
                success: false,
                error: error.message,
                plan: 'free'
            };
        }
    }
}

// Inicializar fallback
document.addEventListener('DOMContentLoaded', function() {
    window.userPlanFallback = new UserPlanFallback();
});

// Exportar para uso global
window.UserPlanFallback = UserPlanFallback;
