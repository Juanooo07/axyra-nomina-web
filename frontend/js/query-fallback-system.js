// ========================================
// SISTEMA DE FALLBACK PARA CONSULTAS FIRESTORE
// Manejo robusto de índices en construcción
// ========================================

class QueryFallbackSystem {
    constructor() {
        this.isInitialized = false;
        this.fallbackData = {
            payments: [],
            users: [],
            metrics: {
                income: 0,
                renewals: 0,
                activeUsers: 0
            }
        };
        this.init();
    }

    init() {
        if (this.isInitialized) return;
        
        console.log('🔄 Inicializando sistema de fallback para consultas...');
        this.setupQueryInterceptors();
        this.loadFallbackData();
        this.isInitialized = true;
        console.log('✅ Sistema de fallback para consultas inicializado');
    }

    setupQueryInterceptors() {
        // Interceptar consultas de Firestore que fallan por índices
        const originalWhere = firebase.firestore.Query.prototype.where;
        const originalOrderBy = firebase.firestore.Query.prototype.orderBy;

        firebase.firestore.Query.prototype.where = function(field, operator, value) {
            try {
                return originalWhere.call(this, field, operator, value);
            } catch (error) {
                if (error.code === 'failed-precondition') {
                    console.warn(`⚠️ Índice faltante para consulta where(${field}, ${operator}, ${value})`);
                    return this;
                }
                throw error;
            }
        };

        firebase.firestore.Query.prototype.orderBy = function(field, direction) {
            try {
                return originalOrderBy.call(this, field, direction);
            } catch (error) {
                if (error.code === 'failed-precondition') {
                    console.warn(`⚠️ Índice faltante para consulta orderBy(${field}, ${direction})`);
                    return this;
                }
                throw error;
            }
        };
    }

    async loadFallbackData() {
        try {
            console.log('📊 Cargando datos de fallback...');
            
            // Cargar datos básicos sin consultas complejas
            await this.loadBasicPayments();
            await this.loadBasicUsers();
            await this.calculateBasicMetrics();
            
            console.log('✅ Datos de fallback cargados correctamente');
        } catch (error) {
            console.error('❌ Error cargando datos de fallback:', error);
        }
    }

    async loadBasicPayments() {
        try {
            const db = firebase.firestore();
            const snapshot = await db.collection('payments').limit(50).get();
            
            this.fallbackData.payments = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            
            console.log(`📊 ${this.fallbackData.payments.length} pagos cargados para fallback`);
        } catch (error) {
            console.error('❌ Error cargando pagos básicos:', error);
            this.fallbackData.payments = [];
        }
    }

    async loadBasicUsers() {
        try {
            const db = firebase.firestore();
            const snapshot = await db.collection('users').limit(50).get();
            
            this.fallbackData.users = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            
            console.log(`👥 ${this.fallbackData.users.length} usuarios cargados para fallback`);
        } catch (error) {
            console.error('❌ Error cargando usuarios básicos:', error);
            this.fallbackData.users = [];
        }
    }

    calculateBasicMetrics() {
        try {
            // Calcular métricas básicas desde los datos cargados
            const payments = this.fallbackData.payments;
            const users = this.fallbackData.users;

            // Calcular ingresos totales
            this.fallbackData.metrics.income = payments
                .filter(p => p.status === 'completed' && p.amount)
                .reduce((total, p) => total + (parseFloat(p.amount) || 0), 0);

            // Calcular renovaciones
            this.fallbackData.metrics.renewals = users
                .filter(u => u.membership && u.membership.renewalStatus === 'active')
                .length;

            // Calcular usuarios activos
            this.fallbackData.metrics.activeUsers = users
                .filter(u => u.activo !== false)
                .length;

            console.log('📊 Métricas básicas calculadas:', this.fallbackData.metrics);
        } catch (error) {
            console.error('❌ Error calculando métricas básicas:', error);
        }
    }

    // Métodos de fallback para consultas específicas
    async getPaymentsByStatus(status) {
        try {
            // Intentar consulta normal primero
            const db = firebase.firestore();
            const snapshot = await db.collection('payments')
                .where('status', '==', status)
                .get();
            
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            if (error.code === 'failed-precondition') {
                console.warn('⚠️ Usando fallback para consulta de pagos por estado');
                return this.fallbackData.payments.filter(p => p.status === status);
            }
            throw error;
        }
    }

    async getPaymentsByTimestamp() {
        try {
            // Intentar consulta normal primero
            const db = firebase.firestore();
            const snapshot = await db.collection('payments')
                .orderBy('timestamp', 'desc')
                .limit(20)
                .get();
            
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            if (error.code === 'failed-precondition') {
                console.warn('⚠️ Usando fallback para consulta de pagos por timestamp');
                return this.fallbackData.payments
                    .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))
                    .slice(0, 20);
            }
            throw error;
        }
    }

    async getUsersByMembershipStatus(status) {
        try {
            // Intentar consulta normal primero
            const db = firebase.firestore();
            const snapshot = await db.collection('users')
                .where('membership.renewalStatus', '==', status)
                .get();
            
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            if (error.code === 'failed-precondition') {
                console.warn('⚠️ Usando fallback para consulta de usuarios por membresía');
                return this.fallbackData.users.filter(u => 
                    u.membership && u.membership.renewalStatus === status
                );
            }
            throw error;
        }
    }

    async getUsersByLastRenewal() {
        try {
            // Intentar consulta normal primero
            const db = firebase.firestore();
            const snapshot = await db.collection('users')
                .orderBy('membership.lastRenewalAttempt', 'desc')
                .limit(20)
                .get();
            
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            if (error.code === 'failed-precondition') {
                console.warn('⚠️ Usando fallback para consulta de usuarios por renovación');
                return this.fallbackData.users
                    .filter(u => u.membership && u.membership.lastRenewalAttempt)
                    .sort((a, b) => (b.membership.lastRenewalAttempt || 0) - (a.membership.lastRenewalAttempt || 0))
                    .slice(0, 20);
            }
            throw error;
        }
    }

    // Métodos para métricas
    async getIncomeMetrics() {
        try {
            const payments = await this.getPaymentsByStatus('completed');
            const totalIncome = payments.reduce((total, p) => total + (parseFloat(p.amount) || 0), 0);
            
            return {
                totalIncome,
                paymentCount: payments.length,
                averagePayment: payments.length > 0 ? totalIncome / payments.length : 0
            };
        } catch (error) {
            console.error('❌ Error obteniendo métricas de ingresos:', error);
            return {
                totalIncome: this.fallbackData.metrics.income,
                paymentCount: this.fallbackData.payments.length,
                averagePayment: 0
            };
        }
    }

    async getRenewalMetrics() {
        try {
            const users = await this.getUsersByMembershipStatus('active');
            
            return {
                activeRenewals: users.length,
                totalUsers: this.fallbackData.users.length,
                renewalRate: this.fallbackData.users.length > 0 ? users.length / this.fallbackData.users.length : 0
            };
        } catch (error) {
            console.error('❌ Error obteniendo métricas de renovaciones:', error);
            return {
                activeRenewals: this.fallbackData.metrics.renewals,
                totalUsers: this.fallbackData.users.length,
                renewalRate: 0
            };
        }
    }

    // Método para verificar estado de índices
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

// Inicializar sistema de fallback
document.addEventListener('DOMContentLoaded', function() {
    window.queryFallbackSystem = new QueryFallbackSystem();
});

// Exportar para uso global
window.QueryFallbackSystem = QueryFallbackSystem;
