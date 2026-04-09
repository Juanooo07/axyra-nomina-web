// ========================================
// AXYRA BACKUP SYSTEM
// Sistema de backup automático programado
// ========================================

class AxyraBackupSystem {
  constructor() {
    this.backups = [];
    this.schedule = null;
    this.isRunning = false;
    this.backupInterval = 24 * 60 * 60 * 1000; // 24 horas
    this.maxBackups = 30; // Máximo 30 backups

    this.init();
  }

  async init() {
    console.log('💾 Inicializando Sistema de Backup AXYRA...');

    try {
      await this.loadBackupHistory();
      this.setupScheduledBackup();
      this.setupEventListeners();
      console.log('✅ Sistema de Backup AXYRA inicializado');
    } catch (error) {
      console.error('❌ Error inicializando sistema de backup:', error);
    }
  }

  async loadBackupHistory() {
    try {
      const backupData = localStorage.getItem('axyra_backup_history');
      if (backupData) {
        this.backups = JSON.parse(backupData);
      }
    } catch (error) {
      console.error('❌ Error cargando historial de backups:', error);
      this.backups = [];
    }
  }

  setupScheduledBackup() {
    // Verificar si ya hay un backup programado
    const lastBackup = this.getLastBackup();
    const now = new Date();

    if (!lastBackup || now - new Date(lastBackup.timestamp) >= this.backupInterval) {
      // Programar backup inmediato
      setTimeout(() => {
        this.createBackup();
      }, 5000); // 5 segundos después de cargar
    }

    // Programar backups regulares
    this.schedule = setInterval(() => {
      this.createBackup();
    }, this.backupInterval);
  }

  setupEventListeners() {
    // Backup antes de cerrar la página
    window.addEventListener('beforeunload', () => {
      this.createBackup();
    });

    // Backup cuando se detectan cambios importantes
    document.addEventListener('dataChanged', () => {
      this.createBackup();
    });

    // Limpiar backups antiguos
    document.addEventListener('cleanupBackups', () => {
      this.cleanupOldBackups();
    });
  }

  async createBackup(options = {}) {
    try {
      console.log('💾 Creando backup...');

      const backup = {
        id: this.generateBackupId(),
        timestamp: new Date().toISOString(),
        type: options.type || 'automatic',
        data: await this.collectData(),
        size: 0,
        status: 'creating',
      };

      // Calcular tamaño
      backup.size = JSON.stringify(backup.data).length;

      // Guardar backup
      await this.saveBackup(backup);

      // Actualizar historial
      this.backups.unshift(backup);
      await this.saveBackupHistory();

      // Limpiar backups antiguos
      this.cleanupOldBackups();

      backup.status = 'completed';
      console.log('✅ Backup creado exitosamente:', backup.id);

      // Notificar
      this.notifyBackupCreated(backup);

      return backup;
    } catch (error) {
      console.error('❌ Error creando backup:', error);
      this.notifyBackupError(error);
      throw error;
    }
  }

  async collectData() {
    const data = {
      employees: JSON.parse(localStorage.getItem('axyra_empleados') || '[]'),
      hours: JSON.parse(localStorage.getItem('axyra_horas') || '[]'),
      inventory: JSON.parse(localStorage.getItem('axyra_inventario_productos') || '[]'),
      movements: JSON.parse(localStorage.getItem('axyra_movimientos_inventario') || '[]'),
      payroll: JSON.parse(localStorage.getItem('axyra_nominas') || '[]'),
      cashRegister: JSON.parse(localStorage.getItem('axyra_cuadre_caja_movimientos') || '[]'),
      configuration: JSON.parse(localStorage.getItem('axyra_config') || '{}'),
      userData: JSON.parse(localStorage.getItem('axyra_user_data') || '{}'),
      membership: JSON.parse(localStorage.getItem('axyra_membership_plan') || 'free'),
      timestamp: new Date().toISOString(),
      version: '1.0.0',
    };

    return data;
  }

  async saveBackup(backup) {
    try {
      // Guardar en localStorage
      localStorage.setItem(`axyra_backup_${backup.id}`, JSON.stringify(backup));

      // Si hay conexión, intentar subir a Firebase
      if (navigator.onLine && typeof firebase !== 'undefined') {
        await this.uploadBackupToFirebase(backup);
      }
    } catch (error) {
      console.error('❌ Error guardando backup:', error);
    }
  }

  async uploadBackupToFirebase(backup) {
    try {
      if (typeof firebase !== 'undefined' && firebase.firestore) {
        const db = firebase.firestore();
        await db
          .collection('backups')
          .doc(backup.id)
          .set({
            ...backup,
            uploadedAt: firebase.firestore.FieldValue.serverTimestamp(),
          });
        console.log('☁️ Backup subido a Firebase:', backup.id);
      }
    } catch (error) {
      console.error('❌ Error subiendo backup a Firebase:', error);
    }
  }

  async saveBackupHistory() {
    try {
      localStorage.setItem('axyra_backup_history', JSON.stringify(this.backups));
    } catch (error) {
      console.error('❌ Error guardando historial de backups:', error);
    }
  }

  async restoreBackup(backupId) {
    try {
      console.log('🔄 Restaurando backup:', backupId);

      const backup = this.getBackup(backupId);
      if (!backup) {
        throw new Error('Backup no encontrado');
      }

      // Restaurar datos
      await this.restoreData(backup.data);

      // Notificar
      this.notifyBackupRestored(backup);

      console.log('✅ Backup restaurado exitosamente');
      return { success: true };
    } catch (error) {
      console.error('❌ Error restaurando backup:', error);
      this.notifyBackupError(error);
      throw error;
    }
  }

  async restoreData(data) {
    try {
      // Restaurar datos a localStorage
      if (data.employees) {
        localStorage.setItem('axyra_empleados', JSON.stringify(data.employees));
      }
      if (data.hours) {
        localStorage.setItem('axyra_horas', JSON.stringify(data.hours));
      }
      if (data.inventory) {
        localStorage.setItem('axyra_inventario_productos', JSON.stringify(data.inventory));
      }
      if (data.movements) {
        localStorage.setItem('axyra_movimientos_inventario', JSON.stringify(data.movements));
      }
      if (data.payroll) {
        localStorage.setItem('axyra_nominas', JSON.stringify(data.payroll));
      }
      if (data.cashRegister) {
        localStorage.setItem('axyra_cuadre_caja_movimientos', JSON.stringify(data.cashRegister));
      }
      if (data.configuration) {
        localStorage.setItem('axyra_config', JSON.stringify(data.configuration));
      }
      if (data.userData) {
        localStorage.setItem('axyra_user_data', JSON.stringify(data.userData));
      }
      if (data.membership) {
        localStorage.setItem('axyra_membership_plan', data.membership);
      }

      // Recargar página para aplicar cambios
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error('❌ Error restaurando datos:', error);
      throw error;
    }
  }

  cleanupOldBackups() {
    try {
      // Mantener solo los últimos N backups
      if (this.backups.length > this.maxBackups) {
        const backupsToDelete = this.backups.slice(this.maxBackups);

        backupsToDelete.forEach((backup) => {
          // Eliminar de localStorage
          localStorage.removeItem(`axyra_backup_${backup.id}`);

          // Eliminar de Firebase si está disponible
          if (typeof firebase !== 'undefined' && firebase.firestore) {
            firebase.firestore().collection('backups').doc(backup.id).delete();
          }
        });

        // Actualizar lista
        this.backups = this.backups.slice(0, this.maxBackups);
        this.saveBackupHistory();

        console.log(`🧹 Limpiados ${backupsToDelete.length} backups antiguos`);
      }
    } catch (error) {
      console.error('❌ Error limpiando backups antiguos:', error);
    }
  }

  // Métodos de utilidad
  getBackup(backupId) {
    return this.backups.find((backup) => backup.id === backupId);
  }

  getLastBackup() {
    return this.backups.length > 0 ? this.backups[0] : null;
  }

  getBackupHistory() {
    return this.backups;
  }

  generateBackupId() {
    return `backup_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Notificaciones
  notifyBackupCreated(backup) {
    if (window.axyraNotifications) {
      window.axyraNotifications.showSuccess(`Backup creado: ${backup.id}`, {
        title: 'Backup Automático',
        persistent: false,
      });
    }
  }

  notifyBackupRestored(backup) {
    if (window.axyraNotifications) {
      window.axyraNotifications.showSuccess(`Backup restaurado: ${backup.id}`, {
        title: 'Restauración Completada',
        persistent: false,
      });
    }
  }

  notifyBackupError(error) {
    if (window.axyraNotifications) {
      window.axyraNotifications.showError(`Error en backup: ${error.message}`, {
        title: 'Error de Backup',
        persistent: true,
      });
    }
  }

  // Métodos de control
  startScheduledBackup() {
    if (!this.schedule) {
      this.setupScheduledBackup();
      this.isRunning = true;
      console.log('▶️ Backup programado iniciado');
    }
  }

  stopScheduledBackup() {
    if (this.schedule) {
      clearInterval(this.schedule);
      this.schedule = null;
      this.isRunning = false;
      console.log('⏹️ Backup programado detenido');
    }
  }

  isScheduledBackupRunning() {
    return this.isRunning;
  }

  // Métodos de exportación
  async exportBackup(backupId) {
    try {
      const backup = this.getBackup(backupId);
      if (!backup) {
        throw new Error('Backup no encontrado');
      }

      const dataStr = JSON.stringify(backup, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });

      const link = document.createElement('a');
      link.href = URL.createObjectURL(dataBlob);
      link.download = `axyra_backup_${backupId}.json`;
      link.click();

      return { success: true };
    } catch (error) {
      console.error('❌ Error exportando backup:', error);
      throw error;
    }
  }

  async importBackup(file) {
    try {
      const text = await file.text();
      const backup = JSON.parse(text);

      // Validar estructura del backup
      if (!backup.id || !backup.timestamp || !backup.data) {
        throw new Error('Archivo de backup inválido');
      }

      // Agregar a la lista de backups
      this.backups.unshift(backup);
      await this.saveBackupHistory();

      console.log('✅ Backup importado exitosamente');
      return { success: true };
    } catch (error) {
      console.error('❌ Error importando backup:', error);
      throw error;
    }
  }
}

// Inicializar sistema de backup
document.addEventListener('DOMContentLoaded', function () {
  try {
    window.axyraBackup = new AxyraBackupSystem();
    console.log('✅ Sistema de Backup AXYRA cargado');
  } catch (error) {
    console.error('❌ Error cargando sistema de backup:', error);
  }
});

// Exportar para uso global
window.AxyraBackupSystem = AxyraBackupSystem;
