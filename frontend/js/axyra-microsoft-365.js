/**
 * AXYRA Microsoft 365 Integration
 * Sistema de integración con Microsoft 365
 * Incluye: Outlook, OneDrive, Teams, SharePoint, Power BI
 */

class AxyraMicrosoft365Integration {
  constructor() {
    this.isInitialized = false;
    this.accessToken = null;
    this.refreshToken = null;
    this.scopes = [
      'https://graph.microsoft.com/Mail.Read',
      'https://graph.microsoft.com/Mail.Send',
      'https://graph.microsoft.com/Files.ReadWrite',
      'https://graph.microsoft.com/Calendars.ReadWrite',
      'https://graph.microsoft.com/Team.ReadBasic.All',
      'https://graph.microsoft.com/Sites.ReadWrite.All',
      'https://graph.microsoft.com/User.Read',
    ];
    this.apiEndpoints = {
      graph: 'https://graph.microsoft.com/v1.0',
      auth: 'https://login.microsoftonline.com',
    };
  }

  /**
   * Inicializar la integración con Microsoft 365
   */
  async initialize() {
    try {
      if (this.isInitialized) return true;

      // Cargar configuración
      const config = window.axyraConfig?.getAxyraConfig();
      if (!config?.integrations?.microsoft365) {
        throw new Error('Configuración de Microsoft 365 no encontrada');
      }

      this.clientId = config.integrations.microsoft365.clientId;
      this.clientSecret = config.integrations.microsoft365.clientSecret;
      this.tenantId = config.integrations.microsoft365.tenantId;
      this.redirectUri = config.integrations.microsoft365.redirectUri;

      // Cargar tokens guardados
      this.loadTokens();

      this.isInitialized = true;
      console.log('✅ Microsoft 365 Integration inicializada');
      return true;
    } catch (error) {
      console.error('❌ Error inicializando Microsoft 365:', error);
      return false;
    }
  }

  /**
   * Autenticar con Microsoft OAuth
   */
  async authenticate() {
    try {
      const authUrl = this.buildAuthUrl();

      // Abrir ventana de autenticación
      const authWindow = window.open(authUrl, 'microsoft-auth', 'width=500,height=600,scrollbars=yes,resizable=yes');

      return new Promise((resolve, reject) => {
        const checkClosed = setInterval(() => {
          if (authWindow.closed) {
            clearInterval(checkClosed);
            reject(new Error('Autenticación cancelada'));
          }
        }, 1000);

        // Escuchar mensaje de respuesta
        window.addEventListener('message', (event) => {
          if (event.origin !== window.location.origin) return;

          if (event.data.type === 'MICROSOFT_AUTH_SUCCESS') {
            clearInterval(checkClosed);
            authWindow.close();

            this.accessToken = event.data.accessToken;
            this.refreshToken = event.data.refreshToken;
            this.saveTokens();

            resolve({
              success: true,
              accessToken: this.accessToken,
            });
          } else if (event.data.type === 'MICROSOFT_AUTH_ERROR') {
            clearInterval(checkClosed);
            authWindow.close();
            reject(new Error(event.data.error));
          }
        });
      });
    } catch (error) {
      console.error('❌ Error en autenticación Microsoft:', error);
      throw error;
    }
  }

  /**
   * Construir URL de autenticación
   */
  buildAuthUrl() {
    const params = new URLSearchParams({
      client_id: this.clientId,
      response_type: 'code',
      redirect_uri: this.redirectUri,
      scope: this.scopes.join(' '),
      response_mode: 'query',
      state: 'axyra-microsoft-auth',
    });

    return `${this.apiEndpoints.auth}/${this.tenantId}/oauth2/v2.0/authorize?${params.toString()}`;
  }

  /**
   * Outlook Integration
   */
  async sendEmail(to, subject, body, attachments = []) {
    try {
      await this.ensureAuthenticated();

      const message = {
        message: {
          subject: subject,
          body: {
            contentType: 'HTML',
            content: body,
          },
          toRecipients: to.map((email) => ({
            emailAddress: { address: email },
          })),
          attachments: attachments.map((att) => ({
            '@odata.type': '#microsoft.graph.fileAttachment',
            name: att.name,
            contentType: att.type,
            contentBytes: att.data,
          })),
        },
      };

      const response = await this.makeRequest(`${this.apiEndpoints.graph}/me/sendMail`, 'POST', message);

      return {
        success: true,
        messageId: response.id,
      };
    } catch (error) {
      console.error('❌ Error enviando email:', error);
      throw error;
    }
  }

  async getEmails(filter = '', top = 10) {
    try {
      await this.ensureAuthenticated();

      const params = new URLSearchParams({
        $filter: filter,
        $top: top,
        $orderby: 'receivedDateTime desc',
      });

      const response = await this.makeRequest(`${this.apiEndpoints.graph}/me/messages?${params.toString()}`);

      return {
        success: true,
        messages: response.value || [],
      };
    } catch (error) {
      console.error('❌ Error obteniendo emails:', error);
      throw error;
    }
  }

  /**
   * OneDrive Integration
   */
  async uploadFile(file, folderPath = '') {
    try {
      await this.ensureAuthenticated();

      const uploadPath = folderPath ? `/${folderPath}/${file.name}` : `/${file.name}`;

      const response = await fetch(`${this.apiEndpoints.graph}/me/drive/root:${uploadPath}:/content`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          'Content-Type': file.type,
        },
        body: file,
      });

      const result = await response.json();

      return {
        success: true,
        fileId: result.id,
        webUrl: result.webUrl,
        downloadUrl: result['@microsoft.graph.downloadUrl'],
      };
    } catch (error) {
      console.error('❌ Error subiendo archivo:', error);
      throw error;
    }
  }

  async getFiles(folderPath = '', filter = '') {
    try {
      await this.ensureAuthenticated();

      const path = folderPath ? `/${folderPath}` : '';
      const params = new URLSearchParams();
      if (filter) params.append('$filter', filter);

      const response = await this.makeRequest(
        `${this.apiEndpoints.graph}/me/drive/root${path}/children?${params.toString()}`
      );

      return {
        success: true,
        files: response.value || [],
      };
    } catch (error) {
      console.error('❌ Error obteniendo archivos:', error);
      throw error;
    }
  }

  /**
   * Calendar Integration
   */
  async createEvent(eventData) {
    try {
      await this.ensureAuthenticated();

      const event = {
        subject: eventData.title,
        body: {
          contentType: 'HTML',
          content: eventData.description || '',
        },
        start: {
          dateTime: eventData.startTime,
          timeZone: eventData.timeZone || 'America/Bogota',
        },
        end: {
          dateTime: eventData.endTime,
          timeZone: eventData.timeZone || 'America/Bogota',
        },
        attendees:
          eventData.attendees?.map((email) => ({
            emailAddress: { address: email },
          })) || [],
        location: eventData.location
          ? {
              displayName: eventData.location,
            }
          : null,
        isReminderOn: true,
        reminderMinutesBeforeStart: 15,
      };

      const response = await this.makeRequest(`${this.apiEndpoints.graph}/me/events`, 'POST', event);

      return {
        success: true,
        eventId: response.id,
        webLink: response.webLink,
        onlineMeeting: response.onlineMeeting,
      };
    } catch (error) {
      console.error('❌ Error creando evento:', error);
      throw error;
    }
  }

  async getEvents(startTime, endTime) {
    try {
      await this.ensureAuthenticated();

      const params = new URLSearchParams({
        startDateTime: startTime,
        endDateTime: endTime,
        $orderby: 'start/dateTime',
      });

      const response = await this.makeRequest(`${this.apiEndpoints.graph}/me/calendar/events?${params.toString()}`);

      return {
        success: true,
        events: response.value || [],
      };
    } catch (error) {
      console.error('❌ Error obteniendo eventos:', error);
      throw error;
    }
  }

  /**
   * Teams Integration
   */
  async createMeeting(meetingData) {
    try {
      await this.ensureAuthenticated();

      const meeting = {
        subject: meetingData.title,
        body: {
          contentType: 'HTML',
          content: meetingData.description || '',
        },
        start: {
          dateTime: meetingData.startTime,
          timeZone: meetingData.timeZone || 'America/Bogota',
        },
        end: {
          dateTime: meetingData.endTime,
          timeZone: meetingData.timeZone || 'America/Bogota',
        },
        attendees:
          meetingData.attendees?.map((email) => ({
            emailAddress: { address: email },
          })) || [],
        isOnlineMeeting: true,
        onlineMeetingProvider: 'teamsForBusiness',
      };

      const response = await this.makeRequest(`${this.apiEndpoints.graph}/me/events`, 'POST', meeting);

      return {
        success: true,
        meetingId: response.id,
        joinUrl: response.onlineMeeting?.joinUrl,
        webLink: response.webLink,
      };
    } catch (error) {
      console.error('❌ Error creando reunión:', error);
      throw error;
    }
  }

  async getTeams() {
    try {
      await this.ensureAuthenticated();

      const response = await this.makeRequest(`${this.apiEndpoints.graph}/me/joinedTeams`);

      return {
        success: true,
        teams: response.value || [],
      };
    } catch (error) {
      console.error('❌ Error obteniendo teams:', error);
      throw error;
    }
  }

  async sendTeamsMessage(teamId, channelId, message) {
    try {
      await this.ensureAuthenticated();

      const messageData = {
        body: {
          content: message,
        },
      };

      const response = await this.makeRequest(
        `${this.apiEndpoints.graph}/teams/${teamId}/channels/${channelId}/messages`,
        'POST',
        messageData
      );

      return {
        success: true,
        messageId: response.id,
      };
    } catch (error) {
      console.error('❌ Error enviando mensaje Teams:', error);
      throw error;
    }
  }

  /**
   * SharePoint Integration
   */
  async createDocumentLibrary(siteId, libraryName, description = '') {
    try {
      await this.ensureAuthenticated();

      const library = {
        name: libraryName,
        description: description,
        drive: {
          driveType: 'documentLibrary',
        },
      };

      const response = await this.makeRequest(`${this.apiEndpoints.graph}/sites/${siteId}/lists`, 'POST', library);

      return {
        success: true,
        libraryId: response.id,
        webUrl: response.webUrl,
      };
    } catch (error) {
      console.error('❌ Error creando biblioteca:', error);
      throw error;
    }
  }

  async getSites(searchTerm = '') {
    try {
      await this.ensureAuthenticated();

      const params = new URLSearchParams();
      if (searchTerm) {
        params.append('search', searchTerm);
      }

      const response = await this.makeRequest(`${this.apiEndpoints.graph}/sites?${params.toString()}`);

      return {
        success: true,
        sites: response.value || [],
      };
    } catch (error) {
      console.error('❌ Error obteniendo sitios:', error);
      throw error;
    }
  }

  /**
   * Power BI Integration
   */
  async getReports() {
    try {
      await this.ensureAuthenticated();

      const response = await this.makeRequest(`${this.apiEndpoints.graph}/me/insights/used`);

      return {
        success: true,
        reports: response.value || [],
      };
    } catch (error) {
      console.error('❌ Error obteniendo reportes:', error);
      throw error;
    }
  }

  async createDashboard(dashboardName, tiles = []) {
    try {
      await this.ensureAuthenticated();

      const dashboard = {
        displayName: dashboardName,
        tiles: tiles,
      };

      const response = await this.makeRequest(`${this.apiEndpoints.graph}/me/insights`, 'POST', dashboard);

      return {
        success: true,
        dashboardId: response.id,
        webUrl: response.webUrl,
      };
    } catch (error) {
      console.error('❌ Error creando dashboard:', error);
      throw error;
    }
  }

  /**
   * Utilidades
   */
  async ensureAuthenticated() {
    if (!this.accessToken) {
      throw new Error('No autenticado. Use authenticate() primero.');
    }

    // Verificar si el token es válido
    try {
      await this.makeRequest(`${this.apiEndpoints.graph}/me`);
    } catch (error) {
      if (error.status === 401) {
        await this.refreshAccessToken();
      } else {
        throw error;
      }
    }
  }

  async refreshAccessToken() {
    try {
      const response = await fetch(`${this.apiEndpoints.auth}/${this.tenantId}/oauth2/v2.0/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: this.clientId,
          client_secret: this.clientSecret,
          refresh_token: this.refreshToken,
          grant_type: 'refresh_token',
          scope: this.scopes.join(' '),
        }),
      });

      const data = await response.json();
      this.accessToken = data.access_token;
      this.saveTokens();

      return true;
    } catch (error) {
      console.error('❌ Error renovando token:', error);
      throw new Error('No se pudo renovar el token de acceso');
    }
  }

  async makeRequest(url, method = 'GET', body = null) {
    const options = {
      method,
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  }

  loadTokens() {
    try {
      const tokens = localStorage.getItem('axyra_microsoft_tokens');
      if (tokens) {
        const parsed = JSON.parse(tokens);
        this.accessToken = parsed.accessToken;
        this.refreshToken = parsed.refreshToken;
      }
    } catch (error) {
      console.error('❌ Error cargando tokens:', error);
    }
  }

  saveTokens() {
    try {
      const tokens = {
        accessToken: this.accessToken,
        refreshToken: this.refreshToken,
        timestamp: Date.now(),
      };
      localStorage.setItem('axyra_microsoft_tokens', JSON.stringify(tokens));
    } catch (error) {
      console.error('❌ Error guardando tokens:', error);
    }
  }

  /**
   * Desconectar Microsoft 365
   */
  async disconnect() {
    try {
      this.accessToken = null;
      this.refreshToken = null;
      localStorage.removeItem('axyra_microsoft_tokens');

      console.log('✅ Microsoft 365 desconectado');
      return { success: true };
    } catch (error) {
      console.error('❌ Error desconectando:', error);
      throw error;
    }
  }

  /**
   * Verificar estado de conexión
   */
  async getConnectionStatus() {
    try {
      if (!this.accessToken) {
        return { connected: false, message: 'No conectado' };
      }

      await this.ensureAuthenticated();
      return { connected: true, message: 'Conectado correctamente' };
    } catch (error) {
      return { connected: false, message: 'Error de conexión' };
    }
  }

  /**
   * Sincronización de datos
   */
  async syncData() {
    try {
      await this.ensureAuthenticated();

      const syncResults = {
        emails: await this.getEmails('', 5),
        events: await this.getEvents(
          new Date().toISOString(),
          new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        ),
        files: await this.getFiles('', ''),
        teams: await this.getTeams(),
      };

      return {
        success: true,
        data: syncResults,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('❌ Error sincronizando datos:', error);
      throw error;
    }
  }
}

// Inicializar integración
window.axyraMicrosoft365 = new AxyraMicrosoft365Integration();

// Auto-inicializar cuando esté disponible la configuración
document.addEventListener('DOMContentLoaded', () => {
  if (window.axyraConfig) {
    window.axyraMicrosoft365.initialize();
  }
});

console.log('🚀 AXYRA Microsoft 365 Integration cargado');
