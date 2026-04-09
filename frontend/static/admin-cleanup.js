// ========================================
// SCRIPT DE LIMPIEZA ADMIN AXYRA
// ========================================

console.log('🧹 Inicializando script de limpieza admin...');

class AxyraAdminCleanup {
  constructor() {
    this.adminEmail = 'axyra.app@gmail.com';
    this.init();
  }

  init() {
    console.log('✅ Script de limpieza admin inicializado');
    this.cleanupFakeUsers();
    this.setupAdminOnlyAccess();
  }

  async cleanupFakeUsers() {
    try {
      console.log('🗑️ Limpiando usuarios ficticios...');
      
      // Obtener usuarios de Firebase
      const usersSnapshot = await window.axyraFirebase.firestore.collection('usuarios').get();
      const users = [];
      
      usersSnapshot.forEach(doc => {
        users.push({ id: doc.id, ...doc.data() });
      });

      console.log(`📊 Usuarios encontrados: ${users.length}`);

      // Filtrar usuarios que no sean el admin
      const fakeUsers = users.filter(user => 
        user.email !== this.adminEmail && 
        (user.email.includes('test') || 
         user.email.includes('demo') || 
         user.email.includes('fake') ||
         user.email.includes('usuario') ||
         user.email.includes('admin') ||
         user.email.includes('god') ||
         user.nombre?.includes('Test') ||
         user.nombre?.includes('Demo') ||
         user.nombre?.includes('Fake') ||
         user.nombre?.includes('Usuario') ||
         user.nombre?.includes('Admin') ||
         user.nombre?.includes('God'))
      );

      console.log(`🗑️ Usuarios ficticios a eliminar: ${fakeUsers.length}`);

      // Eliminar usuarios ficticios
      for (const user of fakeUsers) {
        try {
          await window.axyraFirebase.firestore.collection('usuarios').doc(user.id).delete();
          console.log(`✅ Usuario eliminado: ${user.email}`);
        } catch (error) {
          console.error(`❌ Error eliminando usuario ${user.email}:`, error);
        }
      }

      // Limpiar localStorage
      this.cleanupLocalStorage();

      console.log('✅ Limpieza de usuarios completada');
    } catch (error) {
      console.error('❌ Error en limpieza de usuarios:', error);
    }
  }

  cleanupLocalStorage() {
    try {
      console.log('🧹 Limpiando localStorage...');
      
      // Obtener todas las claves del localStorage
      const keys = Object.keys(localStorage);
      
      // Filtrar claves relacionadas con usuarios ficticios
      const userKeys = keys.filter(key => 
        key.includes('axyra_') && 
        (key.includes('user') || key.includes('usuario'))
      );

      // Limpiar datos de usuarios ficticios
      userKeys.forEach(key => {
        try {
          const data = JSON.parse(localStorage.getItem(key));
          if (data && data.email && data.email !== this.adminEmail) {
            localStorage.removeItem(key);
            console.log(`🗑️ Datos eliminados de localStorage: ${key}`);
          }
        } catch (error) {
          // Si no es JSON válido, eliminar directamente
          localStorage.removeItem(key);
        }
      });

      console.log('✅ localStorage limpiado');
    } catch (error) {
      console.error('❌ Error limpiando localStorage:', error);
    }
  }

  setupAdminOnlyAccess() {
    try {
      console.log('🔐 Configurando acceso solo para admin...');
      
      // Verificar si el usuario actual es el admin
      const currentUser = window.axyraFirebase.auth.currentUser;
      if (currentUser && currentUser.email === this.adminEmail) {
        console.log('✅ Usuario admin autenticado correctamente');
        
        // Configurar permisos especiales
        this.setAdminPermissions();
      } else {
        console.log('⚠️ Usuario no autorizado, redirigiendo...');
        this.redirectToLogin();
      }
    } catch (error) {
      console.error('❌ Error configurando acceso admin:', error);
    }
  }

  setAdminPermissions() {
    // Configurar permisos especiales para el admin
    window.axyraAdminPermissions = {
      canDeleteUsers: true,
      canManageAllData: true,
      canAccessAdminPanel: true,
      canModifySystemSettings: true,
      canViewAllReports: true,
      canExportAllData: true
    };

    console.log('🔐 Permisos de admin configurados');
  }

  redirectToLogin() {
    // Redirigir a login si no es admin
    window.location.href = '/login.html';
  }

  async forceCleanup() {
    console.log('🚀 Forzando limpieza completa...');
    
    try {
      // Limpiar todos los usuarios excepto admin
      const usersSnapshot = await window.axyraFirebase.firestore.collection('usuarios').get();
      
      for (const doc of usersSnapshot.docs) {
        const userData = doc.data();
        if (userData.email !== this.adminEmail) {
          await doc.ref.delete();
          console.log(`🗑️ Usuario eliminado: ${userData.email}`);
        }
      }

      // Limpiar localStorage completamente
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.includes('axyra_')) {
          localStorage.removeItem(key);
        }
      });

      console.log('✅ Limpieza forzada completada');
    } catch (error) {
      console.error('❌ Error en limpieza forzada:', error);
    }
  }
}

// Función global para limpieza manual
window.forceAdminCleanup = function() {
  if (window.axyraAdminCleanup) {
    window.axyraAdminCleanup.forceCleanup();
  }
};

// Inicializar cuando Firebase esté listo
document.addEventListener('DOMContentLoaded', () => {
  if (window.axyraFirebase && window.axyraFirebase.auth) {
    window.axyraAdminCleanup = new AxyraAdminCleanup();
  } else {
    // Esperar a que Firebase se inicialice
    const checkFirebase = setInterval(() => {
      if (window.axyraFirebase && window.axyraFirebase.auth) {
        clearInterval(checkFirebase);
        window.axyraAdminCleanup = new AxyraAdminCleanup();
      }
    }, 1000);
  }
});

console.log('🎯 Script de limpieza admin cargado');
