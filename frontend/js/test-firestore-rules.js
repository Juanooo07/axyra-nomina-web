// ========================================
// TEST DE REGLAS DE FIRESTORE
// Verificación completa del sistema después de aplicar reglas
// ========================================

class FirestoreRulesTest {
    constructor() {
        this.isInitialized = false;
        this.testResults = {
            authentication: false,
            permissions: false,
            collections: {},
            errors: []
        };
        this.init();
    }

    init() {
        if (this.isInitialized) return;
        
        console.log('🧪 Iniciando test de reglas de Firestore...');
        this.runAllTests();
        this.isInitialized = true;
    }

    async runAllTests() {
        try {
            console.log('🔍 Ejecutando tests de reglas...');
            
            // Test 1: Verificar autenticación
            await this.testAuthentication();
            
            // Test 2: Verificar permisos básicos
            await this.testBasicPermissions();
            
            // Test 3: Verificar colecciones principales
            await this.testMainCollections();
            
            // Test 4: Verificar métricas
            await this.testMetrics();
            
            // Mostrar resultados
            this.showTestResults();
            
        } catch (error) {
            console.error('❌ Error ejecutando tests:', error);
            this.testResults.errors.push(error.message);
        }
    }

    async testAuthentication() {
        try {
            if (typeof firebase === 'undefined' || !firebase.auth) {
                throw new Error('Firebase no está disponible');
            }

            const user = firebase.auth().currentUser;
            if (user) {
                console.log('✅ Usuario autenticado:', user.email);
                this.testResults.authentication = true;
            } else {
                console.log('⚠️ Usuario no autenticado');
                this.testResults.authentication = false;
            }
        } catch (error) {
            console.error('❌ Error en test de autenticación:', error);
            this.testResults.errors.push('Error de autenticación: ' + error.message);
        }
    }

    async testBasicPermissions() {
        try {
            if (typeof firebase === 'undefined' || !firebase.firestore) {
                throw new Error('Firestore no está disponible');
            }

            const db = firebase.firestore();
            
            // Test de lectura básica
            const testQuery = await db.collection('users').limit(1).get();
            console.log('✅ Permisos básicos funcionando');
            this.testResults.permissions = true;
            
        } catch (error) {
            if (error.code === 'permission-denied') {
                console.error('❌ Error de permisos:', error.message);
                this.testResults.errors.push('Error de permisos: ' + error.message);
            } else {
                console.error('❌ Error en test de permisos:', error);
                this.testResults.errors.push('Error de permisos: ' + error.message);
            }
            this.testResults.permissions = false;
        }
    }

    async testMainCollections() {
        const collections = [
            'users',
            'empresas', 
            'empleados',
            'horas_trabajadas',
            'nominas',
            'departamentos',
            'cuadre_caja',
            'inventario',
            'facturas',
            'clientes',
            'membresias',
            'pagos',
            'payments',
            'subscriptions',
            'reportes',
            'metricas',
            'notificaciones'
        ];

        for (const collection of collections) {
            try {
                const db = firebase.firestore();
                const testQuery = await db.collection(collection).limit(1).get();
                console.log(`✅ Colección ${collection}: OK`);
                this.testResults.collections[collection] = true;
            } catch (error) {
                if (error.code === 'permission-denied') {
                    console.warn(`⚠️ Colección ${collection}: Sin permisos`);
                    this.testResults.collections[collection] = false;
                } else {
                    console.error(`❌ Colección ${collection}: Error`, error.message);
                    this.testResults.collections[collection] = false;
                }
            }
        }
    }

    async testMetrics() {
        try {
            const db = firebase.firestore();
            
            // Test de métricas de suscripciones
            const subscriptionsQuery = await db.collection('subscriptions').limit(5).get();
            console.log('✅ Métricas de suscripciones: OK');
            
            // Test de métricas de pagos
            const paymentsQuery = await db.collection('payments').limit(5).get();
            console.log('✅ Métricas de pagos: OK');
            
            // Test de métricas de usuarios
            const usersQuery = await db.collection('users').limit(5).get();
            console.log('✅ Métricas de usuarios: OK');
            
        } catch (error) {
            console.error('❌ Error en test de métricas:', error);
            this.testResults.errors.push('Error de métricas: ' + error.message);
        }
    }

    showTestResults() {
        console.log('📊 Resultados del test de reglas:');
        console.log('================================');
        console.log('🔐 Autenticación:', this.testResults.authentication ? '✅ OK' : '❌ FALLO');
        console.log('🔑 Permisos básicos:', this.testResults.permissions ? '✅ OK' : '❌ FALLO');
        console.log('');
        console.log('📁 Colecciones:');
        
        Object.entries(this.testResults.collections).forEach(([collection, status]) => {
            console.log(`  ${collection}:`, status ? '✅ OK' : '❌ FALLO');
        });
        
        if (this.testResults.errors.length > 0) {
            console.log('');
            console.log('❌ Errores encontrados:');
            this.testResults.errors.forEach((error, index) => {
                console.log(`  ${index + 1}. ${error}`);
            });
        }
        
        console.log('');
        console.log('🎯 Test completado');
        
        // Mostrar notificación en la UI
        this.showTestNotification();
    }

    showTestNotification() {
        const notification = document.createElement('div');
        notification.innerHTML = `
            <div style="
                position: fixed;
                top: 20px;
                right: 20px;
                background: linear-gradient(135deg, #27ae60, #2ecc71);
                color: white;
                padding: 20px;
                border-radius: 10px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                z-index: 10000;
                font-family: 'Segoe UI', sans-serif;
                max-width: 400px;
            ">
                <div style="display: flex; align-items: center; gap: 15px;">
                    <i class="fas fa-check-circle" style="font-size: 24px;"></i>
                    <div>
                        <h4 style="margin: 0 0 10px 0;">🧪 Test de Reglas Completado</h4>
                        <p style="margin: 0 0 15px 0; font-size: 14px;">
                            ${this.testResults.authentication && this.testResults.permissions ? 
                                '✅ Todas las reglas funcionando correctamente' : 
                                '⚠️ Algunas reglas necesitan ajustes'
                            }
                        </p>
                        <div style="font-size: 12px; opacity: 0.8;">
                            Autenticación: ${this.testResults.authentication ? 'OK' : 'FALLO'}<br>
                            Permisos: ${this.testResults.permissions ? 'OK' : 'FALLO'}<br>
                            Colecciones: ${Object.values(this.testResults.collections).filter(Boolean).length}/${Object.keys(this.testResults.collections).length}
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(notification);

        // Remover notificación después de 8 segundos
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 8000);
    }

    // Método para obtener resultados del test
    getTestResults() {
        return this.testResults;
    }

    // Método para ejecutar test específico
    async runSpecificTest(testName) {
        switch (testName) {
            case 'authentication':
                await this.testAuthentication();
                break;
            case 'permissions':
                await this.testBasicPermissions();
                break;
            case 'collections':
                await this.testMainCollections();
                break;
            case 'metrics':
                await this.testMetrics();
                break;
            default:
                console.warn('Test no encontrado:', testName);
        }
    }
}

// Inicializar test de reglas
document.addEventListener('DOMContentLoaded', function() {
    // Esperar un poco para que Firebase se inicialice
    setTimeout(() => {
        window.firestoreRulesTest = new FirestoreRulesTest();
    }, 2000);
});

// Exportar para uso global
window.FirestoreRulesTest = FirestoreRulesTest;
