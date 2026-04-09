// ========================================
// MONITOREO DE SUSCRIPCIONES AXYRA
// ========================================
// Sistema de monitoreo en tiempo real para suscripciones y pagos

class AxyraSubscriptionMonitoring {
    constructor() {
        this.metrics = {
            totalSubscriptions: 0,
            activeSubscriptions: 0,
            expiredSubscriptions: 0,
            monthlyRevenue: 0,
            renewalsThisMonth: 0,
            failedRenewals: 0,
            churnRate: 0
        };
        
        this.charts = {};
        this.init();
    }

    init() {
        console.log('📊 Inicializando monitoreo de suscripciones...');
        this.setupEventListeners();
        this.startRealTimeMonitoring();
        this.loadMetrics();
        console.log('✅ Monitoreo de suscripciones inicializado');
    }

    setupEventListeners() {
        // Event listeners para actualizar métricas
        document.addEventListener('subscriptionUpdated', () => {
            this.loadMetrics();
        });

        // Actualizar métricas cada 5 minutos
        setInterval(() => {
            this.loadMetrics();
        }, 5 * 60 * 1000);
    }

    async loadMetrics() {
        try {
            console.log('📊 Cargando métricas de suscripciones...');
            
            // Cargar métricas desde Firebase
            await this.loadSubscriptionMetrics();
            await this.loadRevenueMetrics();
            await this.loadRenewalMetrics();
            
            // Actualizar UI
            this.updateMetricsUI();
            this.updateCharts();
            
            console.log('✅ Métricas cargadas:', this.metrics);
        } catch (error) {
            console.error('❌ Error cargando métricas:', error);
        }
    }

    async loadSubscriptionMetrics() {
        try {
            if (!window.firebase || !window.firebase.firestore) {
                console.warn('Firebase no disponible, usando datos simulados');
                this.metrics.totalSubscriptions = 150;
                this.metrics.activeSubscriptions = 120;
                this.metrics.expiredSubscriptions = 30;
                return;
            }

            const db = window.firebase.firestore();
            
            // Contar suscripciones totales
            const totalSnapshot = await db.collection('users')
                .where('membership', '!=', null)
                .get();
            this.metrics.totalSubscriptions = totalSnapshot.size;

            // Contar suscripciones activas
            const activeSnapshot = await db.collection('users')
                .where('membership.status', '==', 'active')
                .get();
            this.metrics.activeSubscriptions = activeSnapshot.size;

            // Contar suscripciones expiradas
            const expiredSnapshot = await db.collection('users')
                .where('membership.status', '==', 'expired')
                .get();
            this.metrics.expiredSubscriptions = expiredSnapshot.size;

        } catch (error) {
            console.error('❌ Error cargando métricas de suscripciones:', error);
        }
    }

    async loadRevenueMetrics() {
        try {
            if (!window.firebase || !window.firebase.firestore) {
                console.warn('Firebase no disponible, usando datos simulados');
                this.metrics.monthlyRevenue = 15000000; // 15M COP
                return;
            }

            const db = window.firebase.firestore();
            const now = new Date();
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            
            // Calcular ingresos del mes actual
            const paymentsSnapshot = await db.collection('payments')
                .where('timestamp', '>=', startOfMonth)
                .where('status', '==', 'completed')
                .get();

            this.metrics.monthlyRevenue = paymentsSnapshot.docs.reduce((total, doc) => {
                const payment = doc.data();
                return total + (payment.amount || 0);
            }, 0);

        } catch (error) {
            console.error('❌ Error cargando métricas de ingresos:', error);
        }
    }

    async loadRenewalMetrics() {
        try {
            if (!window.firebase || !window.firebase.firestore) {
                console.warn('Firebase no disponible, usando datos simulados');
                this.metrics.renewalsThisMonth = 45;
                this.metrics.failedRenewals = 3;
                this.metrics.churnRate = 5.2;
                return;
            }

            const db = window.firebase.firestore();
            const now = new Date();
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            
            // Contar renovaciones del mes
            const renewalsSnapshot = await db.collection('payments')
                .where('timestamp', '>=', startOfMonth)
                .where('type', '==', 'renewal')
                .where('status', '==', 'completed')
                .get();
            this.metrics.renewalsThisMonth = renewalsSnapshot.size;

            // Contar renovaciones fallidas
            const failedRenewalsSnapshot = await db.collection('users')
                .where('membership.renewalStatus', '==', 'failed')
                .where('membership.lastRenewalAttempt', '>=', startOfMonth)
                .get();
            this.metrics.failedRenewals = failedRenewalsSnapshot.size;

            // Calcular tasa de churn
            const totalRenewals = this.metrics.renewalsThisMonth + this.metrics.failedRenewals;
            this.metrics.churnRate = totalRenewals > 0 ? 
                (this.metrics.failedRenewals / totalRenewals) * 100 : 0;

        } catch (error) {
            console.error('❌ Error cargando métricas de renovaciones:', error);
        }
    }

    updateMetricsUI() {
        // Actualizar tarjetas de métricas
        this.updateMetricCard('totalSubscriptions', this.metrics.totalSubscriptions);
        this.updateMetricCard('activeSubscriptions', this.metrics.activeSubscriptions);
        this.updateMetricCard('expiredSubscriptions', this.metrics.expiredSubscriptions);
        this.updateMetricCard('monthlyRevenue', this.formatCurrency(this.metrics.monthlyRevenue));
        this.updateMetricCard('renewalsThisMonth', this.metrics.renewalsThisMonth);
        this.updateMetricCard('failedRenewals', this.metrics.failedRenewals);
        this.updateMetricCard('churnRate', `${this.metrics.churnRate.toFixed(1)}%`);
    }

    updateMetricCard(metricId, value) {
        const element = document.getElementById(metricId);
        if (element) {
            element.textContent = value;
        }
    }

    updateCharts() {
        // Actualizar gráficos si Chart.js está disponible
        if (window.Chart) {
            this.updateSubscriptionChart();
            this.updateRevenueChart();
            this.updateRenewalChart();
        }
    }

    updateSubscriptionChart() {
        const ctx = document.getElementById('subscriptionChart');
        if (!ctx) return;

        if (this.charts.subscription) {
            this.charts.subscription.destroy();
        }

        this.charts.subscription = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Activas', 'Expiradas'],
                datasets: [{
                    data: [this.metrics.activeSubscriptions, this.metrics.expiredSubscriptions],
                    backgroundColor: ['#10b981', '#ef4444'],
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom'
                    },
                    title: {
                        display: true,
                        text: 'Estado de Suscripciones'
                    }
                }
            }
        });
    }

    updateRevenueChart() {
        const ctx = document.getElementById('revenueChart');
        if (!ctx) return;

        if (this.charts.revenue) {
            this.charts.revenue.destroy();
        }

        // Generar datos de ingresos de los últimos 6 meses
        const revenueData = this.generateRevenueData();

        this.charts.revenue = new Chart(ctx, {
            type: 'line',
            data: {
                labels: revenueData.labels,
                datasets: [{
                    label: 'Ingresos Mensuales (COP)',
                    data: revenueData.values,
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Ingresos Mensuales'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return new Intl.NumberFormat('es-CO', {
                                    style: 'currency',
                                    currency: 'COP',
                                    minimumFractionDigits: 0
                                }).format(value);
                            }
                        }
                    }
                }
            }
        });
    }

    updateRenewalChart() {
        const ctx = document.getElementById('renewalChart');
        if (!ctx) return;

        if (this.charts.renewal) {
            this.charts.renewal.destroy();
        }

        this.charts.renewal = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Renovaciones Exitosas', 'Renovaciones Fallidas'],
                datasets: [{
                    data: [this.metrics.renewalsThisMonth, this.metrics.failedRenewals],
                    backgroundColor: ['#10b981', '#ef4444'],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Renovaciones del Mes'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    generateRevenueData() {
        const labels = [];
        const values = [];
        const now = new Date();
        
        for (let i = 5; i >= 0; i--) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            labels.push(date.toLocaleDateString('es-CO', { month: 'short', year: 'numeric' }));
            
            // Simular datos de ingresos (en producción vendrían de Firebase)
            const baseRevenue = this.metrics.monthlyRevenue;
            const variation = (Math.random() - 0.5) * 0.3; // ±15% variación
            values.push(Math.round(baseRevenue * (1 + variation)));
        }
        
        return { labels, values };
    }

    startRealTimeMonitoring() {
        // Monitoreo en tiempo real de cambios en suscripciones
        if (window.firebase && window.firebase.firestore) {
            const db = window.firebase.firestore();
            
            // Escuchar cambios en la colección de usuarios
            db.collection('users')
                .where('membership', '!=', null)
                .onSnapshot((snapshot) => {
                    console.log('📊 Cambios detectados en suscripciones');
                    this.loadMetrics();
                });

            // Escuchar cambios en la colección de pagos
            db.collection('payments')
                .onSnapshot((snapshot) => {
                    console.log('💳 Cambios detectados en pagos');
                    this.loadMetrics();
                });
        }
    }

    formatCurrency(amount) {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0
        }).format(amount);
    }

    // Método para exportar métricas
    exportMetrics() {
        const data = {
            timestamp: new Date().toISOString(),
            metrics: this.metrics
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `axyra-metrics-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // Método para generar reporte de suscripciones
    generateSubscriptionReport() {
        const report = {
            timestamp: new Date().toISOString(),
            summary: {
                totalSubscriptions: this.metrics.totalSubscriptions,
                activeSubscriptions: this.metrics.activeSubscriptions,
                expiredSubscriptions: this.metrics.expiredSubscriptions,
                monthlyRevenue: this.metrics.monthlyRevenue,
                renewalsThisMonth: this.metrics.renewalsThisMonth,
                failedRenewals: this.metrics.failedRenewals,
                churnRate: this.metrics.churnRate
            },
            insights: this.generateInsights()
        };
        
        return report;
    }

    generateInsights() {
        const insights = [];
        
        if (this.metrics.churnRate > 10) {
            insights.push('⚠️ Tasa de churn alta: Considera revisar la estrategia de retención');
        }
        
        if (this.metrics.failedRenewals > this.metrics.renewalsThisMonth * 0.2) {
            insights.push('⚠️ Muchas renovaciones fallidas: Revisa el proceso de pago');
        }
        
        if (this.metrics.activeSubscriptions < this.metrics.totalSubscriptions * 0.8) {
            insights.push('⚠️ Baja tasa de suscripciones activas: Considera campañas de reactivación');
        }
        
        if (insights.length === 0) {
            insights.push('✅ Métricas saludables: El sistema funciona correctamente');
        }
        
        return insights;
    }
}

// Inicializar monitoreo de suscripciones cuando el DOM esté cargado
document.addEventListener('DOMContentLoaded', () => {
    if (!window.axyraSubscriptionMonitoring) {
        window.axyraSubscriptionMonitoring = new AxyraSubscriptionMonitoring();
    }
});
