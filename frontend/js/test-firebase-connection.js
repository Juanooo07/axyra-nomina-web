/**
 * Script para probar la conexión a Firebase
 * AXYRA Sistema de Gestión
 */

class FirebaseConnectionTest {
  constructor() {
    this.isConnected = false;
    this.testResults = {
      firebaseSDK: false,
      authentication: false,
      firestore: false,
      analytics: false
    };
  }

  async runTests() {
    console.log('🧪 Iniciando pruebas de conexión a Firebase...');
    
    try {
      // Test 1: Verificar que Firebase SDK esté cargado
      if (typeof firebase !== 'undefined') {
        this.testResults.firebaseSDK = true;
        console.log('✅ Firebase SDK cargado correctamente');
      } else {
        console.log('❌ Firebase SDK no está disponible');
        return this.testResults;
      }

      // Test 2: Inicializar Firebase
      if (!firebase.apps.length) {
        firebase.initializeApp({
          apiKey: "AIzaSyAW3ejokcsWAP5G1yJT63jLBpFmdTiTUwc",
          authDomain: "axyra-48238.firebaseapp.com",
          projectId: "axyra-48238",
          storageBucket: "axyra-48238.firebasestorage.app",
          messagingSenderId: "796334517286",
          appId: "1:796334517286:web:95947cf0f773dc11378ae7",
          measurementId: "G-R8W2MP15B7"
        });
        console.log('✅ Firebase inicializado correctamente');
      }

      // Test 3: Verificar Authentication
      try {
        const auth = firebase.auth();
        if (auth) {
          this.testResults.authentication = true;
          console.log('✅ Firebase Authentication disponible');
        }
      } catch (error) {
        console.log('❌ Error con Firebase Authentication:', error.message);
      }

      // Test 4: Verificar Firestore
      try {
        const firestore = firebase.firestore();
        if (firestore) {
          this.testResults.firestore = true;
          console.log('✅ Firebase Firestore disponible');
        }
      } catch (error) {
        console.log('❌ Error con Firebase Firestore:', error.message);
      }

      // Test 5: Verificar Analytics
      try {
        const analytics = firebase.analytics();
        if (analytics) {
          this.testResults.analytics = true;
          console.log('✅ Firebase Analytics disponible');
        }
      } catch (error) {
        console.log('❌ Error con Firebase Analytics:', error.message);
      }

      // Test 6: Probar conexión a Firestore
      try {
        const testDoc = await firebase.firestore().collection('test').doc('connection').get();
        console.log('✅ Conexión a Firestore exitosa');
        this.isConnected = true;
      } catch (error) {
        console.log('⚠️ Error conectando a Firestore:', error.message);
        console.log('ℹ️ Esto puede ser normal si las reglas de seguridad están activas');
      }

      // Resumen de resultados
      const passedTests = Object.values(this.testResults).filter(result => result === true).length;
      const totalTests = Object.keys(this.testResults).length;
      
      console.log(`\n📊 Resumen de pruebas: ${passedTests}/${totalTests} exitosas`);
      
      if (passedTests === totalTests) {
        console.log('🎉 ¡Todas las pruebas de Firebase pasaron correctamente!');
      } else {
        console.log('⚠️ Algunas pruebas fallaron, pero el sistema puede funcionar en modo offline');
      }

      return this.testResults;

    } catch (error) {
      console.error('❌ Error durante las pruebas de Firebase:', error);
      return this.testResults;
    }
  }

  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      results: this.testResults
    };
  }
}

// Crear instancia global
window.firebaseConnectionTest = new FirebaseConnectionTest();

// Ejecutar pruebas automáticamente cuando se carga la página
document.addEventListener('DOMContentLoaded', async () => {
  // Esperar un poco para que Firebase se cargue
  setTimeout(async () => {
    await window.firebaseConnectionTest.runTests();
  }, 2000);
});

console.log('🧪 Firebase Connection Test cargado');
