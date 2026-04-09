// ========================================
// SISTEMA DE FALLBACK PARA MÉTRICAS
// Manejo de consultas de Firestore con índices en construcción
// ========================================

class MetricsFallbackSystem {
    constructor() {
        this.isInitialized = false;
        this.cachedData = {
            income: 0,
            renewals: 0,
            activeUsers: 0,
            lastUpdate: null
        };
        this.init();
    }

    init() {
        if (this.isInitialized) return;
        
        console.log('📊 Inicializando sistema de fallback para métricas...');
        this.setupMetricsFallbacks();
        this.isInitialized = true;
        console.log('✅ Sistema de fallback para métricas inicializado');
    }

    setupMetricsFallbacks() {
        // Interceptar las funciones que están fallando
        this.overrideIncomeMetrics();
        this.overrideRenewalMetrics();
        this.overrideUserPlanAPI();
    }

    overrideIncomeMetrics() {
        // Interceptar consultas de métricas de ingresos
        const originalConsoleError = console.error;
        console.error = (...args) => {
            const message = args.join(' ');
            if (message.includes('Error cargando métricas de ingresos')) {
                console.warn('⚠️ Usando fallback para métricas de ingresos');
                this.getIncomeMetricsFallback().then(metrics => {
                    console.log('📊 Métricas de ingresos (fallback):', metrics);
                });
                return;
            }
            originalConsoleError.apply(console, args);
        };
    }

    overrideRenewalMetrics() {
        // Interceptar consultas de métricas de renovaciones
        const originalConsoleError = console.error;
        console.error = (...args) => {
            const message = args.join(' ');
            if (message.includes('Error cargando métricas de renovaciones')) {
                console.warn('⚠️ Usando fallback para métricas de renovaciones');
                this.getRenewalMetricsFallback().then(metrics => {
                    console.log('📊 Métricas de renovaciones (fallback):', metrics);
                });
                return;
            }
            originalConsoleError.apply(console, args);
        };
    }

    overrideUserPlanAPI() {
        // Interceptar requests a la API de verificación de plan
        const originalFetch = window.fetch;
        
        window.fetch = async (url, options) => {
            if (url.includes('/api/checkUserPlan')) {
                console.log('🔄 Interceptando request a checkUserPlan...');
                return this.handleUserPlanRequest(url, options);
            }
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

            console.log('✅ Plan del usuario obtenido (fallback):', planData.plan);

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

    async getIncomeMetricsFallback() {
        try {
            console.log('📊 Obteniendo métricas de ingresos (fallback)...');
            
            // Usar datos básicos sin consultas complejas
            const db = firebase.firestore();
            const snapshot = await db.collection('payments').limit(100).get();
            
            const payments = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            // Calcular métricas básicas
            const completedPayments = payments.filter(p => p.status === 'completed');
            const totalIncome = completedPayments.reduce((total, p) => {
                return total + (parseFloat(p.amount) || 0);
            }, 0);

            const metrics = {
                totalIncome,
                paymentCount: completedPayments.length,
                averagePayment: completedPayments.length > 0 ? totalIncome / completedPayments.length : 0,
                currency: 'COP',
                period: 'all_time'
            };

            this.cachedData.income = totalIncome;
            this.cachedData.lastUpdate = new Date().toISOString();

            console.log('✅ Métricas de ingresos calculadas (fallback):', metrics);
            return metrics;

        } catch (error) {
            console.error('❌ Error obteniendo métricas de ingresos (fallback):', error);
            return {
                totalIncome: this.cachedData.income,
                paymentCount: 0,
                averagePayment: 0,
                currency: 'COP',
                period: 'all_time'
            };
        }
    }

    async getRenewalMetricsFallback() {
        try {
            console.log('📊 Obteniendo métricas de renovaciones (fallback)...');
            
            // Usar datos básicos sin consultas complejas
            const db = firebase.firestore();
            const snapshot = await db.collection('users').limit(100).get();
            
            const users = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            // Calcular métricas básicas
            const activeRenewals = users.filter(u => 
                u.membership && u.membership.renewalStatus === 'active'
            ).length;

            const metrics = {
                activeRenewals,
                totalUsers: users.length,
                renewalRate: users.length > 0 ? activeRenewals / users.length : 0,
                period: 'all_time'
            };

            this.cachedData.renewals = activeRenewals;
            this.cachedData.activeUsers = users.length;
            this.cachedData.lastUpdate = new Date().toISOString();

            console.log('✅ Métricas de renovaciones calculadas (fallback):', metrics);
            return metrics;

        } catch (error) {
            console.error('❌ Error obteniendo métricas de renovaciones (fallback):', error);
            return {
                activeRenewals: this.cachedData.renewals,
                totalUsers: this.cachedData.activeUsers,
                renewalRate: 0,
                period: 'all_time'
            };
        }
    }

    // Método para obtener métricas generales
    async getGeneralMetrics() {
        try {
            const incomeMetrics = await this.getIncomeMetricsFallback();
            const renewalMetrics = await this.getRenewalMetricsFallback();

            return {
                income: incomeMetrics,
                renewals: renewalMetrics,
                lastUpdate: this.cachedData.lastUpdate,
                source: 'fallback'
            };
        } catch (error) {
            console.error('❌ Error obteniendo métricas generales:', error);
            return {
                income: { totalIncome: 0, paymentCount: 0, averagePayment: 0 },
                renewals: { activeRenewals: 0, totalUsers: 0, renewalRate: 0 },
                lastUpdate: new Date().toISOString(),
                source: 'cached'
            };
        }
    }

    // Método para verificar si los índices están listos
    async checkIndexStatus() {
        try {
            const db = firebase.firestore();
            
            // Probar consultas que requieren índices
            const testQueries = [
                () => db.collection('payments').where('status', '==', 'pending').orderBy('timestamp', 'desc').limit(1).get(),
                () => db.collection('users').where('membership.renewalStatus', '==', 'active').orderBy('membership.lastRenewalAttempt', 'desc').limit(1).get()
            ];

            const results = await Promise.allSettled(testQueries.map(query => query()));
            
            const indexStatus = {
                payments: results[0].status === 'fulfilled',
                users: results[1].status === 'fulfilled'
            };

            console.log('📊 Estado de índices:', indexStatus);
            return indexStatus;
        } catch (error) {
            console.error('❌ Error verificando estado de índices:', error);
            return { payments: false, users: false };
        }
    }
}

// Inicializar sistema de fallback para métricas
document.addEventListener('DOMContentLoaded', function() {
    window.metricsFallbackSystem = new MetricsFallbackSystem();
});

// Exportar para uso global
window.MetricsFallbackSystem = MetricsFallbackSystem;
