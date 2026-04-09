/**
 * 📊 DASHBOARD CON ANALYTICS EN TIEMPO REAL - AXYRA
 * 
 * Sistema de dashboard con métricas en tiempo real,
 * gráficos interactivos y analytics avanzados.
 */

class DashboardAnalytics {
    constructor() {
        this.metrics = {
            empleados: {
                total: 0,
                activos: 0,
                nuevos: 0,
                porDepartamento: {}
            },
            nominas: {
                totalGeneradas: 0,
                pendientes: 0,
                montoTotal: 0,
                promedio: 0
            },
            cuadreCaja: {
                saldoActual: 0,
                ingresosHoy: 0,
                egresosHoy: 0,
                movimientosHoy: 0
            },
            sistema: {
                usuariosActivos: 0,
                tiempoRespuesta: 0,
                errores: 0,
                uptime: 100
            }
        };
        
        this.charts = {};
        this.updateInterval = null;
        this.init();
    }

    init() {
        this.createDashboardHTML();
        this.setupEventListeners();
        this.startRealTimeUpdates();
        this.loadInitialData();
        console.log('📊 Dashboard Analytics inicializado');
    }

    createDashboardHTML() {
        const dashboardHTML = `
            <div class="dashboard-container" id="dashboard-container">
                <!-- Header del Dashboard -->
                <div class="dashboard-header">
                    <h1><i class="fas fa-chart-line"></i> Dashboard Analytics</h1>
                    <div class="dashboard-controls">
                        <button class="btn-refresh" id="refresh-dashboard">
                            <i class="fas fa-sync-alt"></i>
                            Actualizar
                        </button>
                        <button class="btn-export" id="export-dashboard">
                            <i class="fas fa-download"></i>
                            Exportar
                        </button>
                    </div>
                </div>

                <!-- Métricas Principales -->
                <div class="metrics-grid">
                    <!-- Empleados -->
                    <div class="metric-card empleados">
                        <div class="metric-header">
                            <h3><i class="fas fa-users"></i> Empleados</h3>
                            <span class="metric-trend positive">+12%</span>
                        </div>
                        <div class="metric-content">
                            <div class="metric-value" id="total-empleados">0</div>
                            <div class="metric-details">
                                <span class="metric-detail">
                                    <i class="fas fa-user-check"></i>
                                    <span id="empleados-activos">0</span> activos
                                </span>
                                <span class="metric-detail">
                                    <i class="fas fa-user-plus"></i>
                                    <span id="empleados-nuevos">0</span> nuevos
                                </span>
                            </div>
                        </div>
                        <div class="metric-chart" id="empleados-chart"></div>
                    </div>

                    <!-- Nóminas -->
                    <div class="metric-card nominas">
                        <div class="metric-header">
                            <h3><i class="fas fa-calculator"></i> Nóminas</h3>
                            <span class="metric-trend positive">+8%</span>
                        </div>
                        <div class="metric-content">
                            <div class="metric-value" id="total-nominas">0</div>
                            <div class="metric-details">
                                <span class="metric-detail">
                                    <i class="fas fa-money-bill-wave"></i>
                                    $<span id="monto-total">0</span>
                                </span>
                                <span class="metric-detail">
                                    <i class="fas fa-clock"></i>
                                    <span id="nominas-pendientes">0</span> pendientes
                                </span>
                            </div>
                        </div>
                        <div class="metric-chart" id="nominas-chart"></div>
                    </div>

                    <!-- Cuadre de Caja -->
                    <div class="metric-card cuadre-caja">
                        <div class="metric-header">
                            <h3><i class="fas fa-cash-register"></i> Cuadre de Caja</h3>
                            <span class="metric-trend positive">+15%</span>
                        </div>
                        <div class="metric-content">
                            <div class="metric-value" id="saldo-actual">$0</div>
                            <div class="metric-details">
                                <span class="metric-detail">
                                    <i class="fas fa-arrow-up text-success"></i>
                                    $<span id="ingresos-hoy">0</span> ingresos
                                </span>
                                <span class="metric-detail">
                                    <i class="fas fa-arrow-down text-danger"></i>
                                    $<span id="egresos-hoy">0</span> egresos
                                </span>
                            </div>
                        </div>
                        <div class="metric-chart" id="cuadre-chart"></div>
                    </div>

                    <!-- Sistema -->
                    <div class="metric-card sistema">
                        <div class="metric-header">
                            <h3><i class="fas fa-server"></i> Sistema</h3>
                            <span class="metric-trend positive">99.9%</span>
                        </div>
                        <div class="metric-content">
                            <div class="metric-value" id="uptime">100%</div>
                            <div class="metric-details">
                                <span class="metric-detail">
                                    <i class="fas fa-users"></i>
                                    <span id="usuarios-activos">0</span> usuarios
                                </span>
                                <span class="metric-detail">
                                    <i class="fas fa-bolt"></i>
                                    <span id="tiempo-respuesta">0</span>ms
                                </span>
                            </div>
                        </div>
                        <div class="metric-chart" id="sistema-chart"></div>
                    </div>
                </div>

                <!-- Gráficos Detallados -->
                <div class="charts-grid">
                    <!-- Gráfico de Empleados por Departamento -->
                    <div class="chart-card">
                        <div class="chart-header">
                            <h3>Empleados por Departamento</h3>
                            <div class="chart-controls">
                                <select id="departamento-filter">
                                    <option value="all">Todos los departamentos</option>
                                </select>
                            </div>
                        </div>
                        <div class="chart-content">
                            <canvas id="empleados-departamento-chart"></canvas>
                        </div>
                    </div>

                    <!-- Gráfico de Nóminas Mensuales -->
                    <div class="chart-card">
                        <div class="chart-header">
                            <h3>Nóminas Mensuales</h3>
                            <div class="chart-controls">
                                <select id="periodo-filter">
                                    <option value="6">Últimos 6 meses</option>
                                    <option value="12">Último año</option>
                                </select>
                            </div>
                        </div>
                        <div class="chart-content">
                            <canvas id="nominas-mensuales-chart"></canvas>
                        </div>
                    </div>

                    <!-- Gráfico de Movimientos de Caja -->
                    <div class="chart-card">
                        <div class="chart-header">
                            <h3>Movimientos de Caja</h3>
                            <div class="chart-controls">
                                <select id="caja-periodo-filter">
                                    <option value="7">Últimos 7 días</option>
                                    <option value="30">Últimos 30 días</option>
                                </select>
                            </div>
                        </div>
                        <div class="chart-content">
                            <canvas id="movimientos-caja-chart"></canvas>
                        </div>
                    </div>

                    <!-- Gráfico de Actividad del Sistema -->
                    <div class="chart-card">
                        <div class="chart-header">
                            <h3>Actividad del Sistema</h3>
                            <div class="chart-controls">
                                <span class="status-indicator online">
                                    <i class="fas fa-circle"></i>
                                    En línea
                                </span>
                            </div>
                        </div>
                        <div class="chart-content">
                            <canvas id="actividad-sistema-chart"></canvas>
                        </div>
                    </div>
                </div>

                <!-- Tabla de Actividad Reciente -->
                <div class="activity-card">
                    <div class="activity-header">
                        <h3>Actividad Reciente</h3>
                        <button class="btn-view-all">Ver todo</button>
                    </div>
                    <div class="activity-content">
                        <div class="activity-list" id="activity-list">
                            <div class="activity-item">
                                <div class="activity-icon">
                                    <i class="fas fa-user-plus"></i>
                                </div>
                                <div class="activity-content">
                                    <div class="activity-title">Nuevo empleado registrado</div>
                                    <div class="activity-description">Juan Pérez fue agregado al departamento de Ventas</div>
                                    <div class="activity-time">Hace 5 minutos</div>
                                </div>
                            </div>
                            <div class="activity-item">
                                <div class="activity-icon">
                                    <i class="fas fa-calculator"></i>
                                </div>
                                <div class="activity-content">
                                    <div class="activity-title">Nómina generada</div>
                                    <div class="activity-description">Nómina del período actual generada exitosamente</div>
                                    <div class="activity-time">Hace 1 hora</div>
                                </div>
                            </div>
                            <div class="activity-item">
                                <div class="activity-icon">
                                    <i class="fas fa-cash-register"></i>
                                </div>
                                <div class="activity-content">
                                    <div class="activity-title">Corte de caja realizado</div>
                                    <div class="activity-description">Corte diario completado con saldo de $2,500,000</div>
                                    <div class="activity-time">Hace 2 horas</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Insertar dashboard en el contenedor principal
        const mainContainer = document.querySelector('.container') || document.body;
        mainContainer.insertAdjacentHTML('beforeend', dashboardHTML);
    }

    setupEventListeners() {
        // Botón de actualizar
        document.getElementById('refresh-dashboard')?.addEventListener('click', () => {
            this.refreshDashboard();
        });

        // Botón de exportar
        document.getElementById('export-dashboard')?.addEventListener('click', () => {
            this.exportDashboard();
        });

        // Filtros
        document.getElementById('departamento-filter')?.addEventListener('change', (e) => {
            this.updateEmpleadosChart(e.target.value);
        });

        document.getElementById('periodo-filter')?.addEventListener('change', (e) => {
            this.updateNominasChart(e.target.value);
        });

        document.getElementById('caja-periodo-filter')?.addEventListener('change', (e) => {
            this.updateCajaChart(e.target.value);
        });
    }

    startRealTimeUpdates() {
        // Actualizar métricas cada 30 segundos
        this.updateInterval = setInterval(() => {
            this.updateMetrics();
        }, 30000);

        // Actualizar gráficos cada 2 minutos
        setInterval(() => {
            this.updateCharts();
        }, 120000);
    }

    async loadInitialData() {
        try {
            await this.loadEmpleadosData();
            await this.loadNominasData();
            await this.loadCajaData();
            await this.loadSistemaData();
            this.updateUI();
            this.initializeCharts();
        } catch (error) {
            console.error('Error cargando datos iniciales:', error);
        }
    }

    async loadEmpleadosData() {
        try {
            if (window.firebase && window.firebase.firestore) {
                const db = firebase.firestore();
                const snapshot = await db.collection('empleados').get();
                
                this.metrics.empleados.total = snapshot.size;
                this.metrics.empleados.activos = snapshot.docs.filter(doc => 
                    doc.data().estado === 'activo'
                ).length;
                
                // Contar por departamento
                const departamentos = {};
                snapshot.docs.forEach(doc => {
                    const dept = doc.data().departamento || 'Sin departamento';
                    departamentos[dept] = (departamentos[dept] || 0) + 1;
                });
                this.metrics.empleados.porDepartamento = departamentos;
            }
        } catch (error) {
            console.error('Error cargando datos de empleados:', error);
        }
    }

    async loadNominasData() {
        try {
            if (window.firebase && window.firebase.firestore) {
                const db = firebase.firestore();
                const snapshot = await db.collection('nominas').get();
                
                this.metrics.nominas.totalGeneradas = snapshot.size;
                
                let montoTotal = 0;
                snapshot.docs.forEach(doc => {
                    const data = doc.data();
                    montoTotal += data.totalPagar || 0;
                });
                
                this.metrics.nominas.montoTotal = montoTotal;
                this.metrics.nominas.promedio = snapshot.size > 0 ? montoTotal / snapshot.size : 0;
            }
        } catch (error) {
            console.error('Error cargando datos de nóminas:', error);
        }
    }

    async loadCajaData() {
        try {
            if (window.firebase && window.firebase.firestore) {
                const db = firebase.firestore();
                const hoy = new Date();
                hoy.setHours(0, 0, 0, 0);
                
                const snapshot = await db.collection('movimientos_caja')
                    .where('fecha', '>=', hoy)
                    .get();
                
                let ingresos = 0;
                let egresos = 0;
                
                snapshot.docs.forEach(doc => {
                    const data = doc.data();
                    if (data.tipo === 'ingreso') {
                        ingresos += data.monto || 0;
                    } else {
                        egresos += data.monto || 0;
                    }
                });
                
                this.metrics.cuadreCaja.ingresosHoy = ingresos;
                this.metrics.cuadreCaja.egresosHoy = egresos;
                this.metrics.cuadreCaja.saldoActual = ingresos - egresos;
                this.metrics.cuadreCaja.movimientosHoy = snapshot.size;
            }
        } catch (error) {
            console.error('Error cargando datos de caja:', error);
        }
    }

    async loadSistemaData() {
        // Simular datos del sistema
        this.metrics.sistema.usuariosActivos = Math.floor(Math.random() * 10) + 5;
        this.metrics.sistema.tiempoRespuesta = Math.floor(Math.random() * 100) + 50;
        this.metrics.sistema.errores = Math.floor(Math.random() * 3);
        this.metrics.sistema.uptime = 99.9;
    }

    updateUI() {
        // Actualizar métricas de empleados
        document.getElementById('total-empleados').textContent = this.metrics.empleados.total;
        document.getElementById('empleados-activos').textContent = this.metrics.empleados.activos;
        document.getElementById('empleados-nuevos').textContent = this.metrics.empleados.nuevos;

        // Actualizar métricas de nóminas
        document.getElementById('total-nominas').textContent = this.metrics.nominas.totalGeneradas;
        document.getElementById('monto-total').textContent = this.formatCurrency(this.metrics.nominas.montoTotal);
        document.getElementById('nominas-pendientes').textContent = this.metrics.nominas.pendientes;

        // Actualizar métricas de caja
        document.getElementById('saldo-actual').textContent = this.formatCurrency(this.metrics.cuadreCaja.saldoActual);
        document.getElementById('ingresos-hoy').textContent = this.formatCurrency(this.metrics.cuadreCaja.ingresosHoy);
        document.getElementById('egresos-hoy').textContent = this.formatCurrency(this.metrics.cuadreCaja.egresosHoy);

        // Actualizar métricas del sistema
        document.getElementById('uptime').textContent = this.metrics.sistema.uptime + '%';
        document.getElementById('usuarios-activos').textContent = this.metrics.sistema.usuariosActivos;
        document.getElementById('tiempo-respuesta').textContent = this.metrics.sistema.tiempoRespuesta;
    }

    initializeCharts() {
        // Inicializar gráficos con Chart.js si está disponible
        if (typeof Chart !== 'undefined') {
            this.createEmpleadosChart();
            this.createNominasChart();
            this.createCajaChart();
            this.createSistemaChart();
        }
    }

    createEmpleadosChart() {
        const ctx = document.getElementById('empleados-departamento-chart');
        if (!ctx) return;

        const departamentos = Object.keys(this.metrics.empleados.porDepartamento);
        const valores = Object.values(this.metrics.empleados.porDepartamento);

        this.charts.empleados = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: departamentos,
                datasets: [{
                    data: valores,
                    backgroundColor: [
                        '#3498db',
                        '#e74c3c',
                        '#2ecc71',
                        '#f39c12',
                        '#9b59b6',
                        '#1abc9c'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }

    createNominasChart() {
        const ctx = document.getElementById('nominas-mensuales-chart');
        if (!ctx) return;

        // Datos simulados para los últimos 6 meses
        const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'];
        const montos = [2500000, 2800000, 3200000, 2900000, 3500000, 3800000];

        this.charts.nominas = new Chart(ctx, {
            type: 'line',
            data: {
                labels: meses,
                datasets: [{
                    label: 'Monto Total',
                    data: montos,
                    borderColor: '#3498db',
                    backgroundColor: 'rgba(52, 152, 219, 0.1)',
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return '$' + value.toLocaleString();
                            }
                        }
                    }
                }
            }
        });
    }

    createCajaChart() {
        const ctx = document.getElementById('movimientos-caja-chart');
        if (!ctx) return;

        // Datos simulados para los últimos 7 días
        const dias = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
        const ingresos = [500000, 750000, 600000, 800000, 900000, 400000, 300000];
        const egresos = [200000, 300000, 250000, 400000, 350000, 150000, 100000];

        this.charts.caja = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: dias,
                datasets: [{
                    label: 'Ingresos',
                    data: ingresos,
                    backgroundColor: '#2ecc71'
                }, {
                    label: 'Egresos',
                    data: egresos,
                    backgroundColor: '#e74c3c'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return '$' + value.toLocaleString();
                            }
                        }
                    }
                }
            }
        });
    }

    createSistemaChart() {
        const ctx = document.getElementById('actividad-sistema-chart');
        if (!ctx) return;

        // Datos simulados para las últimas 24 horas
        const horas = Array.from({length: 24}, (_, i) => i + ':00');
        const actividad = Array.from({length: 24}, () => Math.floor(Math.random() * 100));

        this.charts.sistema = new Chart(ctx, {
            type: 'line',
            data: {
                labels: horas,
                datasets: [{
                    label: 'Actividad (%)',
                    data: actividad,
                    borderColor: '#9b59b6',
                    backgroundColor: 'rgba(155, 89, 182, 0.1)',
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100
                    }
                }
            }
        });
    }

    updateMetrics() {
        this.loadInitialData();
    }

    updateCharts() {
        // Actualizar datos de los gráficos
        if (this.charts.empleados) {
            this.charts.empleados.update();
        }
        if (this.charts.nominas) {
            this.charts.nominas.update();
        }
        if (this.charts.caja) {
            this.charts.caja.update();
        }
        if (this.charts.sistema) {
            this.charts.sistema.update();
        }
    }

    refreshDashboard() {
        this.loadInitialData();
        if (notificationsSystem) {
            notificationsSystem.showInfo('Dashboard actualizado', 'Los datos han sido actualizados correctamente');
        }
    }

    exportDashboard() {
        // Crear reporte del dashboard
        const report = {
            timestamp: new Date().toISOString(),
            metrics: this.metrics,
            charts: Object.keys(this.charts)
        };

        const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `dashboard-report-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);

        if (notificationsSystem) {
            notificationsSystem.showSuccess('Reporte exportado', 'El reporte del dashboard ha sido descargado');
        }
    }

    formatCurrency(value) {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0
        }).format(value);
    }
}

// Inicializar dashboard cuando se carga la página
document.addEventListener('DOMContentLoaded', () => {
    // Solo inicializar si estamos en la página principal
    if (window.location.pathname === '/' || window.location.pathname.includes('index.html')) {
        new DashboardAnalytics();
    }
});

// Exportar para uso global
window.DashboardAnalytics = DashboardAnalytics;
