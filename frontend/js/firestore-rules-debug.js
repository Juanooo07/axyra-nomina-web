// ========================================
// DEBUG DE REGLAS DE FIRESTORE
// Diagnóstico específico para problemas de permisos
// ========================================

class FirestoreRulesDebug {
    constructor() {
        this.isInitialized = false;
        this.init();
    }

    init() {
        if (this.isInitialized) return;
        
        console.log('🔍 Inicializando debug de reglas de Firestore...');
        this.diagnosePermissionIssues();
        this.isInitialized = true;
    }

    async diagnosePermissionIssues() {
        try {
            console.log('🔍 Diagnosticando problemas de permisos...');
            
            // Verificar autenticación
            const user = firebase.auth().currentUser;
            if (!user) {
                console.error('❌ Usuario no autenticado');
                return;
            }

            console.log('✅ Usuario autenticado:', user.email);
            console.log('🔑 UID del usuario:', user.uid);

            // Verificar permisos para crear usuario
            await this.testUserCreation(user);
            
            // Verificar permisos para crear empresa
            await this.testCompanyCreation(user);
            
            // Mostrar sugerencias de reglas
            this.showRuleSuggestions();
            
        } catch (error) {
            console.error('❌ Error en diagnóstico:', error);
        }
    }

    async testUserCreation(user) {
        try {
            const db = firebase.firestore();
            
            // Intentar crear un documento de usuario
            const userData = {
                uid: user.uid,
                email: user.email,
                displayName: user.displayName || 'Usuario Test',
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                role: 'admin',
                companyId: user.uid
            };

            console.log('🧪 Probando creación de usuario...');
            await db.collection('users').doc(user.uid).set(userData);
            console.log('✅ Usuario creado exitosamente');
            
        } catch (error) {
            console.error('❌ Error creando usuario:', error);
            this.analyzeUserCreationError(error);
        }
    }

    async testCompanyCreation(user) {
        try {
            const db = firebase.firestore();
            
            // Intentar crear un documento de empresa
            const companyData = {
                id: user.uid,
                nombreEmpresa: 'Empresa Test',
                adminUid: user.uid,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                plan: 'free'
            };

            console.log('🧪 Probando creación de empresa...');
            await db.collection('empresas').doc(user.uid).set(companyData);
            console.log('✅ Empresa creada exitosamente');
            
        } catch (error) {
            console.error('❌ Error creando empresa:', error);
            this.analyzeCompanyCreationError(error);
        }
    }

    analyzeUserCreationError(error) {
        console.log('🔍 Análisis del error de creación de usuario:');
        
        if (error.code === 'permission-denied') {
            console.log('❌ Error: Permisos insuficientes para crear usuario');
            console.log('💡 Solución: Verificar reglas de Firestore para colección "users"');
            console.log('📋 Regla sugerida:');
            console.log('   match /users/{userId} {');
            console.log('     allow create: if request.auth != null && request.auth.uid == userId;');
            console.log('   }');
        } else {
            console.log('❌ Error inesperado:', error.message);
        }
    }

    analyzeCompanyCreationError(error) {
        console.log('🔍 Análisis del error de creación de empresa:');
        
        if (error.code === 'permission-denied') {
            console.log('❌ Error: Permisos insuficientes para crear empresa');
            console.log('💡 Solución: Verificar reglas de Firestore para colección "empresas"');
            console.log('📋 Regla sugerida:');
            console.log('   match /empresas/{empresaId} {');
            console.log('     allow create: if request.auth != null;');
            console.log('   }');
        } else {
            console.log('❌ Error inesperado:', error.message);
        }
    }

    showRuleSuggestions() {
        console.log('📋 Reglas sugeridas para resolver problemas de permisos:');
        console.log('');
        console.log('1. Reglas básicas para desarrollo (TEMPORAL):');
        console.log('   rules_version = "2";');
        console.log('   service cloud.firestore {');
        console.log('     match /databases/{database}/documents {');
        console.log('       match /{document=**} {');
        console.log('         allow read, write: if request.auth != null;');
        console.log('       }');
        console.log('     }');
        console.log('   }');
        console.log('');
        console.log('2. Reglas específicas para registro:');
        console.log('   match /users/{userId} {');
        console.log('     allow create: if request.auth != null && request.auth.uid == userId;');
        console.log('     allow read, write: if request.auth != null && request.auth.uid == userId;');
        console.log('   }');
        console.log('   match /empresas/{empresaId} {');
        console.log('     allow create: if request.auth != null;');
        console.log('     allow read, write: if request.auth != null;');
        console.log('   }');
        console.log('');
        console.log('🔗 Enlace directo: https://console.firebase.google.com/project/axyra-48238/firestore/rules');
    }

    // Método para probar permisos específicos
    async testSpecificPermission(collection, operation, data) {
        try {
            const db = firebase.firestore();
            
            switch (operation) {
                case 'create':
                    await db.collection(collection).add(data);
                    break;
                case 'read':
                    await db.collection(collection).limit(1).get();
                    break;
                case 'update':
                    const doc = await db.collection(collection).limit(1).get();
                    if (!doc.empty) {
                        await doc.docs[0].ref.update(data);
                    }
                    break;
                case 'delete':
                    const doc2 = await db.collection(collection).limit(1).get();
                    if (!doc2.empty) {
                        await doc2.docs[0].ref.delete();
                    }
                    break;
            }
            
            console.log(`✅ Operación ${operation} en ${collection}: OK`);
            return true;
            
        } catch (error) {
            console.error(`❌ Operación ${operation} en ${collection}: FALLO`, error);
            return false;
        }
    }
}

// Inicializar debug de reglas
document.addEventListener('DOMContentLoaded', function() {
    // Esperar a que Firebase se inicialice
    setTimeout(() => {
        if (typeof firebase !== 'undefined' && firebase.auth) {
            window.firestoreRulesDebug = new FirestoreRulesDebug();
        }
    }, 3000);
});

// Exportar para uso global
window.FirestoreRulesDebug = FirestoreRulesDebug;
