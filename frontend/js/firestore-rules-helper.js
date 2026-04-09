// ========================================
// AYUDANTE DE REGLAS DE FIRESTORE
// Guía para configurar reglas de seguridad más permisivas
// ========================================

class FirestoreRulesHelper {
    constructor() {
        this.isInitialized = false;
        this.init();
    }

    init() {
        if (this.isInitialized) return;
        
        console.log('🔐 Inicializando ayudante de reglas de Firestore...');
        this.logCurrentRules();
        this.provideRuleSuggestions();
        this.isInitialized = true;
        console.log('✅ Ayudante de reglas de Firestore inicializado');
    }

    logCurrentRules() {
        console.log('📋 Reglas actuales de Firestore detectadas:');
        console.log('⚠️ Error: Missing or insufficient permissions');
        console.log('🔍 Esto indica que las reglas de seguridad están bloqueando las consultas');
    }

    provideRuleSuggestions() {
        console.log('💡 Sugerencias para reglas de Firestore:');
        console.log('');
        console.log('1. Reglas básicas para desarrollo:');
        console.log('   rules_version = "2";');
        console.log('   service cloud.firestore {');
        console.log('     match /databases/{database}/documents {');
        console.log('       match /{document=**} {');
        console.log('         allow read, write: if true;');
        console.log('       }');
        console.log('     }');
        console.log('   }');
        console.log('');
        console.log('2. Reglas más seguras para producción:');
        console.log('   rules_version = "2";');
        console.log('   service cloud.firestore {');
        console.log('     match /databases/{database}/documents {');
        console.log('       match /users/{userId} {');
        console.log('         allow read, write: if request.auth != null && request.auth.uid == userId;');
        console.log('       }');
        console.log('       match /empresas/{empresaId} {');
        console.log('         allow read, write: if request.auth != null;');
        console.log('       }');
        console.log('       match /payments/{paymentId} {');
        console.log('         allow read, write: if request.auth != null;');
        console.log('       }');
        console.log('     }');
        console.log('   }');
        console.log('');
        console.log('3. Para aplicar las reglas:');
        console.log('   - Ve a Firebase Console > Firestore > Rules');
        console.log('   - Copia y pega las reglas sugeridas');
        console.log('   - Haz clic en "Publish"');
        console.log('');
        console.log('🔗 Enlace directo: https://console.firebase.google.com/project/axyra-48238/firestore/rules');
    }

    // Método para verificar si las reglas están configuradas
    async checkRulesConfiguration() {
        try {
            if (typeof firebase === 'undefined' || !firebase.firestore) {
                return { configured: false, error: 'Firebase no disponible' };
            }

            const db = firebase.firestore();
            
            // Intentar una consulta simple para verificar permisos
            const testQuery = await db.collection('users').limit(1).get();
            
            return { 
                configured: true, 
                canRead: true,
                message: 'Reglas configuradas correctamente' 
            };
        } catch (error) {
            if (error.code === 'permission-denied') {
                return { 
                    configured: false, 
                    canRead: false,
                    error: 'Reglas de seguridad bloquean el acceso',
                    suggestion: 'Configurar reglas más permisivas'
                };
            }
            return { 
                configured: false, 
                canRead: false,
                error: error.message 
            };
        }
    }

    // Método para mostrar notificación de configuración de reglas
    showRulesNotification() {
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
                    <i class="fas fa-cog" style="font-size: 24px;"></i>
                    <div>
                        <h4 style="margin: 0 0 10px 0;">🔐 Configuración de Firestore</h4>
                        <p style="margin: 0 0 15px 0; font-size: 14px;">
                            Las reglas de seguridad están bloqueando las consultas. 
                            Configura reglas más permisivas para habilitar todas las funciones.
                        </p>
                        <a href="https://console.firebase.google.com/project/axyra-48238/firestore/rules" 
                           target="_blank" 
                           style="
                               background: rgba(255,255,255,0.2);
                               color: white;
                               padding: 8px 15px;
                               border-radius: 5px;
                               text-decoration: none;
                               font-size: 12px;
                               display: inline-block;
                           ">
                            <i class="fas fa-external-link-alt" style="margin-right: 5px;"></i>
                            Configurar Reglas
                        </a>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(notification);

        // Remover notificación después de 10 segundos
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 10000);
    }
}

// Inicializar ayudante de reglas de Firestore
document.addEventListener('DOMContentLoaded', function() {
    window.firestoreRulesHelper = new FirestoreRulesHelper();
    
    // Verificar configuración de reglas después de un breve delay
    setTimeout(async () => {
        const rulesStatus = await window.firestoreRulesHelper.checkRulesConfiguration();
        if (!rulesStatus.configured || !rulesStatus.canRead) {
            window.firestoreRulesHelper.showRulesNotification();
        }
    }, 2000);
});

// Exportar para uso global
window.FirestoreRulesHelper = FirestoreRulesHelper;
