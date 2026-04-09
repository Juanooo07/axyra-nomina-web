// ========================================
// AYUDANTE DE REGLAS TEMPORALES
// Reglas más permisivas para desarrollo y testing
// ========================================

class TemporaryRulesHelper {
    constructor() {
        this.isInitialized = false;
        this.init();
    }

    init() {
        if (this.isInitialized) return;
        
        console.log('🔧 Inicializando ayudante de reglas temporales...');
        this.showTemporaryRules();
        this.isInitialized = true;
    }

    showTemporaryRules() {
        console.log('🔧 REGLAS TEMPORALES PARA DESARROLLO:');
        console.log('=====================================');
        console.log('');
        console.log('⚠️ IMPORTANTE: Estas reglas son SOLO para desarrollo');
        console.log('   NO uses estas reglas en producción');
        console.log('');
        console.log('📋 Reglas temporales (copia y pega en Firebase Console):');
        console.log('');
        console.log('rules_version = "2";');
        console.log('service cloud.firestore {');
        console.log('  match /databases/{database}/documents {');
        console.log('    // Reglas temporales para desarrollo');
        console.log('    match /{document=**} {');
        console.log('      allow read, write: if request.auth != null;');
        console.log('    }');
        console.log('  }');
        console.log('}');
        console.log('');
        console.log('🔗 Enlace directo: https://console.firebase.google.com/project/axyra-48238/firestore/rules');
        console.log('');
        console.log('📝 Instrucciones:');
        console.log('1. Ve al enlace de arriba');
        console.log('2. Copia y pega las reglas temporales');
        console.log('3. Haz clic en "Publicar"');
        console.log('4. Prueba el registro nuevamente');
        console.log('');
        console.log('⚠️ RECUERDA: Cambiar a reglas de producción después del testing');
        
        // Mostrar notificación en la UI
        this.showTemporaryRulesNotification();
    }

    showTemporaryRulesNotification() {
        const notification = document.createElement('div');
        notification.innerHTML = `
            <div style="
                position: fixed;
                top: 20px;
                left: 20px;
                background: linear-gradient(135deg, #e74c3c, #c0392b);
                color: white;
                padding: 20px;
                border-radius: 10px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                z-index: 10000;
                font-family: 'Segoe UI', sans-serif;
                max-width: 500px;
            ">
                <div style="display: flex; align-items: center; gap: 15px;">
                    <i class="fas fa-exclamation-triangle" style="font-size: 24px;"></i>
                    <div>
                        <h4 style="margin: 0 0 10px 0;">⚠️ Reglas de Firestore Necesarias</h4>
                        <p style="margin: 0 0 15px 0; font-size: 14px;">
                            El registro está fallando por permisos insuficientes. 
                            Necesitas aplicar reglas temporales para desarrollo.
                        </p>
                        <div style="font-size: 12px; opacity: 0.8; margin-bottom: 15px;">
                            <strong>Reglas temporales:</strong><br>
                            <code style="background: rgba(255,255,255,0.2); padding: 2px 4px; border-radius: 3px;">
                                allow read, write: if request.auth != null;
                            </code>
                        </div>
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
                            Aplicar Reglas Temporales
                        </a>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(notification);

        // Remover notificación después de 15 segundos
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 15000);
    }

    // Método para verificar si las reglas temporales están aplicadas
    async checkTemporaryRules() {
        try {
            const db = firebase.firestore();
            const user = firebase.auth().currentUser;
            
            if (!user) {
                return { applied: false, error: 'Usuario no autenticado' };
            }

            // Intentar crear un documento de prueba
            const testData = {
                test: true,
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                userId: user.uid
            };

            await db.collection('test_permissions').add(testData);
            
            // Limpiar el documento de prueba
            const testDocs = await db.collection('test_permissions').where('userId', '==', user.uid).get();
            testDocs.forEach(doc => doc.ref.delete());
            
            return { applied: true, message: 'Reglas temporales funcionando' };
            
        } catch (error) {
            if (error.code === 'permission-denied') {
                return { applied: false, error: 'Reglas temporales no aplicadas' };
            }
            return { applied: false, error: error.message };
        }
    }

    // Método para mostrar estado de las reglas
    async showRulesStatus() {
        const status = await this.checkTemporaryRules();
        
        if (status.applied) {
            console.log('✅ Reglas temporales aplicadas correctamente');
        } else {
            console.log('❌ Reglas temporales no aplicadas:', status.error);
            console.log('💡 Aplica las reglas temporales para continuar');
        }
        
        return status;
    }
}

// Inicializar ayudante de reglas temporales
document.addEventListener('DOMContentLoaded', function() {
    window.temporaryRulesHelper = new TemporaryRulesHelper();
});

// Exportar para uso global
window.TemporaryRulesHelper = TemporaryRulesHelper;
