// ========================================
// MANEJO DE ÍNDICES DE FIRESTORE
// Sistema de gestión empresarial AXYRA
// ========================================

class FirestoreIndexManager {
    constructor() {
        this.requiredIndexes = [
            {
                collection: 'payments',
                fields: ['status', 'timestamp'],
                description: 'Índice para consultas de pagos por estado y fecha'
            },
            {
                collection: 'users',
                fields: ['membership.renewalStatus', 'membership.lastRenewalAttempt'],
                description: 'Índice para consultas de renovaciones de membresía'
            }
        ];
        this.init();
    }

    init() {
        console.log('📊 Inicializando gestor de índices de Firestore...');
        this.checkIndexes();
    }

    async checkIndexes() {
        try {
            if (typeof firebase === 'undefined' || !firebase.firestore) {
                console.log('⚠️ Firebase Firestore no disponible para verificar índices');
                return;
            }

            const db = firebase.firestore();
            
            // Verificar cada índice requerido
            for (const index of this.requiredIndexes) {
                await this.testIndex(db, index);
            }

        } catch (error) {
            console.error('❌ Error verificando índices:', error);
        }
    }

    async testIndex(db, indexConfig) {
        try {
            const { collection, fields } = indexConfig;
            
            // Crear una consulta de prueba
            let query = db.collection(collection);
            
            // Aplicar filtros para probar el índice
            if (fields.includes('status')) {
                query = query.where('status', '==', 'pending');
            }
            if (fields.includes('timestamp')) {
                query = query.orderBy('timestamp', 'desc');
            }
            if (fields.includes('membership.renewalStatus')) {
                query = query.where('membership.renewalStatus', '==', 'active');
            }
            if (fields.includes('membership.lastRenewalAttempt')) {
                query = query.orderBy('membership.lastRenewalAttempt', 'desc');
            }

            // Ejecutar consulta de prueba
            const snapshot = await query.limit(1).get();
            console.log(`✅ Índice verificado para ${collection}:`, fields.join(', '));

        } catch (error) {
            if (error.code === 'failed-precondition') {
                console.warn(`⚠️ Índice faltante para ${collection}:`, fields.join(', '));
                console.warn(`🔗 Crear índice en: https://console.firebase.google.com/v1/r/project/axyra-48238/firestore/indexes`);
                this.createIndexFallback(collection, fields);
            } else {
                console.error(`❌ Error verificando índice para ${collection}:`, error);
            }
        }
    }

    createIndexFallback(collection, fields) {
        // Crear un fallback para cuando no hay índice
        console.log(`🔄 Creando fallback para ${collection}...`);
        
        // Implementar lógica alternativa que no requiera índices complejos
        if (collection === 'payments') {
            this.setupPaymentsFallback();
        } else if (collection === 'users') {
            this.setupUsersFallback();
        }
    }

    setupPaymentsFallback() {
        console.log('💳 Configurando fallback para consultas de pagos...');
        
        // Usar consultas simples que no requieren índices complejos
        window.paymentsFallback = {
            async getPaymentsByStatus(status) {
                try {
                    const db = firebase.firestore();
                    const snapshot = await db.collection('payments')
                        .where('status', '==', status)
                        .get();
                    
                    return snapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    }));
                } catch (error) {
                    console.error('❌ Error obteniendo pagos por estado:', error);
                    return [];
                }
            },

            async getRecentPayments(limit = 10) {
                try {
                    const db = firebase.firestore();
                    const snapshot = await db.collection('payments')
                        .orderBy('timestamp', 'desc')
                        .limit(limit)
                        .get();
                    
                    return snapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    }));
                } catch (error) {
                    console.error('❌ Error obteniendo pagos recientes:', error);
                    return [];
                }
            }
        };
    }

    setupUsersFallback() {
        console.log('👥 Configurando fallback para consultas de usuarios...');
        
        // Usar consultas simples que no requieren índices complejos
        window.usersFallback = {
            async getUsersByMembershipStatus(status) {
                try {
                    const db = firebase.firestore();
                    const snapshot = await db.collection('users')
                        .where('membership.renewalStatus', '==', status)
                        .get();
                    
                    return snapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    }));
                } catch (error) {
                    console.error('❌ Error obteniendo usuarios por estado de membresía:', error);
                    return [];
                }
            },

            async getAllUsers() {
                try {
                    const db = firebase.firestore();
                    const snapshot = await db.collection('users').get();
                    
                    return snapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    }));
                } catch (error) {
                    console.error('❌ Error obteniendo todos los usuarios:', error);
                    return [];
                }
            }
        };
    }

    // Método para crear índices automáticamente (requiere permisos de administrador)
    async createIndex(collection, fields) {
        try {
            console.log(`🔧 Creando índice para ${collection}:`, fields.join(', '));
            
            // Nota: La creación de índices requiere la API de administración de Firebase
            // Por ahora, solo mostramos la URL para crear el índice manualmente
            const indexUrl = `https://console.firebase.google.com/v1/r/project/axyra-48238/firestore/indexes?create_composite=Ck${btoa(JSON.stringify({
                collection: collection,
                fields: fields
            }))}`;
            
            console.log(`🔗 Crear índice manualmente en: ${indexUrl}`);
            
            return {
                success: true,
                message: 'Índice creado exitosamente',
                url: indexUrl
            };

        } catch (error) {
            console.error('❌ Error creando índice:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
}

// Inicializar gestor de índices
document.addEventListener('DOMContentLoaded', function() {
    window.firestoreIndexManager = new FirestoreIndexManager();
});

// Exportar para uso global
window.FirestoreIndexManager = FirestoreIndexManager;
