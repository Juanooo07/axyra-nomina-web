/**
 * AXYRA Third Party Services Manager
 * Gestor unificado de servicios de terceros
 * Incluye: Google Workspace, Microsoft 365, y futuras integraciones
 */

class AxyraThirdPartyManager {
  constructor() {
    this.integrations = {
      googleWorkspace: null,
      microsoft365: null,
    };
    this.isInitialized = false;
    this.syncInterval = null;
    this.syncIntervalTime = 5 * 60 * 1000; // 5 minutos
  }

  /**
   * Inicializar el gestor de servicios de terceros
   */
  async initialize() {
    try {
      if (this.isInitialized) return true;

      // Inicializar integraciones disponibles
      await this.initializeIntegrations();

      // Configurar sincronización automática
      this.setupAutoSync();

      this.isInitialized = true;
      console.log('✅ AXYRA Third Party Manager inicializado');
      return true;
    } catch (error) {
      console.error('❌ Error inicializando Third Party Manager:', error);
      return false;
    }
  }

  /**
   * Inicializar todas las integraciones
   */
  async initializeIntegrations() {
    try {
      // Google Workspace
      if (window.axyraGoogleWorkspace) {
        this.integrations.googleWorkspace = window.axyraGoogleWorkspace;
        await this.integrations.googleWorkspace.initialize();
      }

      // Microsoft 365
      if (window.axyraMicrosoft365) {
        this.integrations.microsoft365 = window.axyraMicrosoft365;
        await this.integrations.microsoft365.initialize();
      }

      console.log('✅ Integraciones de terceros inicializadas');
    } catch (error) {
      console.error('❌ Error inicializando integraciones:', error);
    }
  }

  /**
   * Configurar sincronización automática
   */
  setupAutoSync() {
    try {
      // Limpiar intervalo anterior si existe
      if (this.syncInterval) {
        clearInterval(this.syncInterval);
      }

      // Configurar nuevo intervalo
      this.syncInterval = setInterval(async () => {
        await this.syncAllIntegrations();
      }, this.syncIntervalTime);

      console.log('✅ Sincronización automática configurada');
    } catch (error) {
      console.error('❌ Error configurando sincronización:', error);
    }
  }

  /**
   * Sincronizar todas las integraciones
   */
  async syncAllIntegrations() {
    try {
      const syncResults = {
        timestamp: new Date().toISOString(),
        integrations: {},
      };

      // Sincronizar Google Workspace
      if (this.integrations.googleWorkspace) {
        try {
          const status = await this.integrations.googleWorkspace.getConnectionStatus();
          if (status.connected) {
            syncResults.integrations.googleWorkspace = {
              status: 'connected',
              lastSync: new Date().toISOString(),
            };
          }
        } catch (error) {
          syncResults.integrations.googleWorkspace = {
            status: 'error',
            error: error.message,
          };
        }
      }

      // Sincronizar Microsoft 365
      if (this.integrations.microsoft365) {
        try {
          const status = await this.integrations.microsoft365.getConnectionStatus();
          if (status.connected) {
            syncResults.integrations.microsoft365 = {
              status: 'connected',
              lastSync: new Date().toISOString(),
            };
          }
        } catch (error) {
          syncResults.integrations.microsoft365 = {
            status: 'error',
            error: error.message,
          };
        }
      }

      // Guardar resultados de sincronización
      localStorage.setItem('axyra_sync_results', JSON.stringify(syncResults));

      console.log('✅ Sincronización completada');
      return syncResults;
    } catch (error) {
      console.error('❌ Error en sincronización:', error);
      throw error;
    }
  }

  /**
   * Obtener estado de todas las integraciones
   */
  async getIntegrationsStatus() {
    try {
      const status = {
        timestamp: new Date().toISOString(),
        integrations: {},
      };

      // Estado Google Workspace
      if (this.integrations.googleWorkspace) {
        try {
          const connectionStatus = await this.integrations.googleWorkspace.getConnectionStatus();
          status.integrations.googleWorkspace = {
            name: 'Google Workspace',
            connected: connectionStatus.connected,
            message: connectionStatus.message,
            services: ['Gmail', 'Drive', 'Calendar', 'Meet', 'Docs'],
          };
        } catch (error) {
          status.integrations.googleWorkspace = {
            name: 'Google Workspace',
            connected: false,
            error: error.message,
          };
        }
      }

      // Estado Microsoft 365
      if (this.integrations.microsoft365) {
        try {
          const connectionStatus = await this.integrations.microsoft365.getConnectionStatus();
          status.integrations.microsoft365 = {
            name: 'Microsoft 365',
            connected: connectionStatus.connected,
            message: connectionStatus.message,
            services: ['Outlook', 'OneDrive', 'Teams', 'SharePoint', 'Power BI'],
          };
        } catch (error) {
          status.integrations.microsoft365 = {
            name: 'Microsoft 365',
            connected: false,
            error: error.message,
          };
        }
      }

      return status;
    } catch (error) {
      console.error('❌ Error obteniendo estado:', error);
      throw error;
    }
  }

  /**
   * Conectar integración específica
   */
  async connectIntegration(integrationName) {
    try {
      let integration = null;

      switch (integrationName) {
        case 'googleWorkspace':
          integration = this.integrations.googleWorkspace;
          break;
        case 'microsoft365':
          integration = this.integrations.microsoft365;
          break;
        default:
          throw new Error(`Integración ${integrationName} no encontrada`);
      }

      if (!integration) {
        throw new Error(`Integración ${integrationName} no disponible`);
      }

      const result = await integration.authenticate();

      // Notificar conexión exitosa
      if (window.axyraNotifications) {
        window.axyraNotifications.showSuccess(`Conectado a ${integrationName} exitosamente`);
      }

      return result;
    } catch (error) {
      console.error(`❌ Error conectando ${integrationName}:`, error);

      if (window.axyraNotifications) {
        window.axyraNotifications.showError(`Error conectando a ${integrationName}: ${error.message}`);
      }

      throw error;
    }
  }

  /**
   * Desconectar integración específica
   */
  async disconnectIntegration(integrationName) {
    try {
      let integration = null;

      switch (integrationName) {
        case 'googleWorkspace':
          integration = this.integrations.googleWorkspace;
          break;
        case 'microsoft365':
          integration = this.integrations.microsoft365;
          break;
        default:
          throw new Error(`Integración ${integrationName} no encontrada`);
      }

      if (!integration) {
        throw new Error(`Integración ${integrationName} no disponible`);
      }

      const result = await integration.disconnect();

      // Notificar desconexión exitosa
      if (window.axyraNotifications) {
        window.axyraNotifications.showInfo(`Desconectado de ${integrationName}`);
      }

      return result;
    } catch (error) {
      console.error(`❌ Error desconectando ${integrationName}:`, error);
      throw error;
    }
  }

  /**
   * Enviar email a través de cualquier integración disponible
   */
  async sendEmail(to, subject, body, attachments = [], preferredProvider = null) {
    try {
      let integration = null;

      // Seleccionar integración preferida o automática
      if (preferredProvider === 'google' && this.integrations.googleWorkspace) {
        integration = this.integrations.googleWorkspace;
      } else if (preferredProvider === 'microsoft' && this.integrations.microsoft365) {
        integration = this.integrations.microsoft365;
      } else {
        // Selección automática basada en disponibilidad
        if (this.integrations.googleWorkspace) {
          const googleStatus = await this.integrations.googleWorkspace.getConnectionStatus();
          if (googleStatus.connected) {
            integration = this.integrations.googleWorkspace;
          }
        }

        if (!integration && this.integrations.microsoft365) {
          const microsoftStatus = await this.integrations.microsoft365.getConnectionStatus();
          if (microsoftStatus.connected) {
            integration = this.integrations.microsoft365;
          }
        }
      }

      if (!integration) {
        throw new Error('No hay integraciones de email disponibles');
      }

      const result = await integration.sendEmail(to, subject, body, attachments);

      if (window.axyraNotifications) {
        window.axyraNotifications.showSuccess('Email enviado exitosamente');
      }

      return result;
    } catch (error) {
      console.error('❌ Error enviando email:', error);

      if (window.axyraNotifications) {
        window.axyraNotifications.showError(`Error enviando email: ${error.message}`);
      }

      throw error;
    }
  }

  /**
   * Crear evento en cualquier calendario disponible
   */
  async createEvent(eventData, preferredProvider = null) {
    try {
      let integration = null;

      // Seleccionar integración preferida o automática
      if (preferredProvider === 'google' && this.integrations.googleWorkspace) {
        integration = this.integrations.googleWorkspace;
      } else if (preferredProvider === 'microsoft' && this.integrations.microsoft365) {
        integration = this.integrations.microsoft365;
      } else {
        // Selección automática
        if (this.integrations.googleWorkspace) {
          const googleStatus = await this.integrations.googleWorkspace.getConnectionStatus();
          if (googleStatus.connected) {
            integration = this.integrations.googleWorkspace;
          }
        }

        if (!integration && this.integrations.microsoft365) {
          const microsoftStatus = await this.integrations.microsoft365.getConnectionStatus();
          if (microsoftStatus.connected) {
            integration = this.integrations.microsoft365;
          }
        }
      }

      if (!integration) {
        throw new Error('No hay integraciones de calendario disponibles');
      }

      const result = await integration.createEvent(eventData);

      if (window.axyraNotifications) {
        window.axyraNotifications.showSuccess('Evento creado exitosamente');
      }

      return result;
    } catch (error) {
      console.error('❌ Error creando evento:', error);

      if (window.axyraNotifications) {
        window.axyraNotifications.showError(`Error creando evento: ${error.message}`);
      }

      throw error;
    }
  }

  /**
   * Subir archivo a cualquier almacenamiento disponible
   */
  async uploadFile(file, folderPath = '', preferredProvider = null) {
    try {
      let integration = null;

      // Seleccionar integración preferida o automática
      if (preferredProvider === 'google' && this.integrations.googleWorkspace) {
        integration = this.integrations.googleWorkspace;
      } else if (preferredProvider === 'microsoft' && this.integrations.microsoft365) {
        integration = this.integrations.microsoft365;
      } else {
        // Selección automática
        if (this.integrations.googleWorkspace) {
          const googleStatus = await this.integrations.googleWorkspace.getConnectionStatus();
          if (googleStatus.connected) {
            integration = this.integrations.googleWorkspace;
          }
        }

        if (!integration && this.integrations.microsoft365) {
          const microsoftStatus = await this.integrations.microsoft365.getConnectionStatus();
          if (microsoftStatus.connected) {
            integration = this.integrations.microsoft365;
          }
        }
      }

      if (!integration) {
        throw new Error('No hay integraciones de almacenamiento disponibles');
      }

      const result = await integration.uploadFile(file, folderPath);

      if (window.axyraNotifications) {
        window.axyraNotifications.showSuccess('Archivo subido exitosamente');
      }

      return result;
    } catch (error) {
      console.error('❌ Error subiendo archivo:', error);

      if (window.axyraNotifications) {
        window.axyraNotifications.showError(`Error subiendo archivo: ${error.message}`);
      }

      throw error;
    }
  }

  /**
   * Obtener estadísticas de uso
   */
  async getUsageStats() {
    try {
      const stats = {
        timestamp: new Date().toISOString(),
        totalIntegrations: Object.keys(this.integrations).length,
        connectedIntegrations: 0,
        lastSync: null,
        usage: {},
      };

      // Contar integraciones conectadas
      for (const [name, integration] of Object.entries(this.integrations)) {
        if (integration) {
          try {
            const status = await integration.getConnectionStatus();
            if (status.connected) {
              stats.connectedIntegrations++;
            }
          } catch (error) {
            console.warn(`Error verificando estado de ${name}:`, error);
          }
        }
      }

      // Obtener datos de sincronización
      const syncData = localStorage.getItem('axyra_sync_results');
      if (syncData) {
        const parsed = JSON.parse(syncData);
        stats.lastSync = parsed.timestamp;
        stats.usage = parsed.integrations;
      }

      return stats;
    } catch (error) {
      console.error('❌ Error obteniendo estadísticas:', error);
      throw error;
    }
  }

  /**
   * Limpiar datos de integraciones
   */
  async cleanup() {
    try {
      // Desconectar todas las integraciones
      for (const [name, integration] of Object.entries(this.integrations)) {
        if (integration) {
          try {
            await integration.disconnect();
          } catch (error) {
            console.warn(`Error desconectando ${name}:`, error);
          }
        }
      }

      // Limpiar datos locales
      localStorage.removeItem('axyra_sync_results');
      localStorage.removeItem('axyra_google_tokens');
      localStorage.removeItem('axyra_microsoft_tokens');

      // Limpiar intervalo de sincronización
      if (this.syncInterval) {
        clearInterval(this.syncInterval);
        this.syncInterval = null;
      }

      console.log('✅ Datos de integraciones limpiados');
      return { success: true };
    } catch (error) {
      console.error('❌ Error en limpieza:', error);
      throw error;
    }
  }

  /**
   * Configurar intervalo de sincronización
   */
  setSyncInterval(minutes) {
    try {
      this.syncIntervalTime = minutes * 60 * 1000;

      // Reiniciar sincronización con nuevo intervalo
      this.setupAutoSync();

      console.log(`✅ Intervalo de sincronización configurado a ${minutes} minutos`);
      return { success: true };
    } catch (error) {
      console.error('❌ Error configurando intervalo:', error);
      throw error;
    }
  }
}

// Inicializar gestor
window.axyraThirdPartyManager = new AxyraThirdPartyManager();

// Auto-inicializar cuando esté disponible la configuración
document.addEventListener('DOMContentLoaded', async () => {
  if (window.axyraConfig) {
    await window.axyraThirdPartyManager.initialize();
  }
});

console.log('🚀 AXYRA Third Party Manager cargado');
