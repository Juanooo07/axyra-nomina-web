// ========================================
// API DE VERIFICACIÓN DE PLAN DE USUARIO
// Sistema de gestión empresarial AXYRA
// ========================================

class UserPlanAPI {
    constructor() {
        this.baseUrl = '/api';
        this.init();
    }

    init() {
        console.log('🔍 Inicializando API de verificación de plan de usuario...');
    }

    async checkUserPlan(userId) {
        try {
            if (!userId) {
                throw new Error('ID de usuario requerido');
            }

            // Verificar si hay datos de usuario en localStorage
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
                    },
                    restrictions: user.restrictions || []
                };
            }

            // Si no hay datos locales, devolver plan por defecto
            return {
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

        } catch (error) {
            console.error('❌ Error verificando plan del usuario:', error);
            return {
                success: false,
                error: error.message,
                plan: 'free',
                membership: {
                    type: 'free',
                    status: 'active',
                    features: ['basic_dashboard', 'basic_reports']
                }
            };
        }
    }

    async getUserFeatures(userId) {
        try {
            const planData = await this.checkUserPlan(userId);
            return planData.membership.features || [];
        } catch (error) {
            console.error('❌ Error obteniendo características del usuario:', error);
            return ['basic_dashboard', 'basic_reports'];
        }
    }

    async getUserLimits(userId) {
        try {
            const planData = await this.checkUserPlan(userId);
            return planData.membership.limits || {
                maxEmployees: 10,
                maxReports: 5,
                maxStorage: '100MB'
            };
        } catch (error) {
            console.error('❌ Error obteniendo límites del usuario:', error);
            return {
                maxEmployees: 10,
                maxReports: 5,
                maxStorage: '100MB'
            };
        }
    }
}

// Crear instancia global
window.userPlanAPI = new UserPlanAPI();

// Función para manejar la API
async function handleUserPlanAPI(request) {
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');

    if (!userId) {
        return new Response(JSON.stringify({
            success: false,
            error: 'ID de usuario requerido'
        }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    try {
        const result = await window.userPlanAPI.checkUserPlan(userId);
        return new Response(JSON.stringify(result), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        return new Response(JSON.stringify({
            success: false,
            error: error.message
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

// Interceptar requests a la API
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data.type === 'API_REQUEST') {
            handleUserPlanAPI(event.data.request);
        }
    });
}

console.log('✅ API de verificación de plan de usuario cargada');
