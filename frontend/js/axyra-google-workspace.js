/**
 * AXYRA Google Workspace Integration
 * Sistema de integración con Google Workspace
 * Incluye: Gmail, Google Drive, Google Calendar, Google Meet, Google Docs
 */

class AxyraGoogleWorkspaceIntegration {
  constructor() {
    this.isInitialized = false;
    this.accessToken = null;
    this.refreshToken = null;
    this.scopes = [
      'https://www.googleapis.com/auth/gmail.readonly',
      'https://www.googleapis.com/auth/gmail.send',
      'https://www.googleapis.com/auth/drive.readonly',
      'https://www.googleapis.com/auth/drive.file',
      'https://www.googleapis.com/auth/calendar.readonly',
      'https://www.googleapis.com/auth/calendar.events',
      'https://www.googleapis.com/auth/meetings.space.created',
    ];
    this.apiEndpoints = {
      gmail: 'https://gmail.googleapis.com/gmail/v1',
      drive: 'https://www.googleapis.com/drive/v3',
      calendar: 'https://www.googleapis.com/calendar/v3',
      docs: 'https://docs.googleapis.com/v1',
      meet: 'https://meet.googleapis.com/v2',
    };
  }

  /**
   * Inicializar la integración con Google Workspace
   */
  async initialize() {
    try {
      if (this.isInitialized) return true;

      // Cargar configuración
      const config = window.axyraConfig?.getAxyraConfig();
      if (!config?.integrations?.googleWorkspace) {
        throw new Error('Configuración de Google Workspace no encontrada');
      }

      this.clientId = config.integrations.googleWorkspace.clientId;
      this.clientSecret = config.integrations.googleWorkspace.clientSecret;
      this.redirectUri = config.integrations.googleWorkspace.redirectUri;

      // Cargar tokens guardados
      this.loadTokens();

      this.isInitialized = true;
      console.log('✅ Google Workspace Integration inicializada');
      return true;
    } catch (error) {
      console.error('❌ Error inicializando Google Workspace:', error);
      return false;
    }
  }

  /**
   * Autenticar con Google OAuth
   */
  async authenticate() {
    try {
      const authUrl = this.buildAuthUrl();

      // Abrir ventana de autenticación
      const authWindow = window.open(authUrl, 'google-auth', 'width=500,height=600,scrollbars=yes,resizable=yes');

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

          if (event.data.type === 'GOOGLE_AUTH_SUCCESS') {
            clearInterval(checkClosed);
            authWindow.close();

            this.accessToken = event.data.accessToken;
            this.refreshToken = event.data.refreshToken;
            this.saveTokens();

            resolve({
              success: true,
              accessToken: this.accessToken,
            });
          } else if (event.data.type === 'GOOGLE_AUTH_ERROR') {
            clearInterval(checkClosed);
            authWindow.close();
            reject(new Error(event.data.error));
          }
        });
      });
    } catch (error) {
      console.error('❌ Error en autenticación Google:', error);
      throw error;
    }
  }

  /**
   * Construir URL de autenticación
   */
  buildAuthUrl() {
    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      response_type: 'code',
      scope: this.scopes.join(' '),
      access_type: 'offline',
      prompt: 'consent',
      state: 'axyra-google-auth',
    });

    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }

  /**
   * Gmail Integration
   */
  async sendEmail(to, subject, body, attachments = []) {
    try {
      await this.ensureAuthenticated();

      const message = this.createEmailMessage(to, subject, body, attachments);
      const response = await this.makeRequest(`${this.apiEndpoints.gmail}/users/me/messages/send`, 'POST', {
        raw: message,
      });

      return {
        success: true,
        messageId: response.id,
        threadId: response.threadId,
      };
    } catch (error) {
      console.error('❌ Error enviando email:', error);
      throw error;
    }
  }

  async getEmails(query = '', maxResults = 10) {
    try {
      await this.ensureAuthenticated();

      const params = new URLSearchParams({
        q: query,
        maxResults: maxResults,
      });

      const response = await this.makeRequest(`${this.apiEndpoints.gmail}/users/me/messages?${params.toString()}`);

      return {
        success: true,
        messages: response.messages || [],
        nextPageToken: response.nextPageToken,
      };
    } catch (error) {
      console.error('❌ Error obteniendo emails:', error);
      throw error;
    }
  }

  /**
   * Google Drive Integration
   */
  async uploadFile(file, folderId = null) {
    try {
      await this.ensureAuthenticated();

      const metadata = {
        name: file.name,
        parents: folderId ? [folderId] : [],
      };

      const form = new FormData();
      form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
      form.append('file', file);

      const response = await fetch(`${this.apiEndpoints.drive}/files?uploadType=multipart`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
        body: form,
      });

      const result = await response.json();

      return {
        success: true,
        fileId: result.id,
        webViewLink: result.webViewLink,
        webContentLink: result.webContentLink,
      };
    } catch (error) {
      console.error('❌ Error subiendo archivo:', error);
      throw error;
    }
  }

  async getFiles(query = '', maxResults = 10) {
    try {
      await this.ensureAuthenticated();

      const params = new URLSearchParams({
        q: query,
        pageSize: maxResults,
        fields: 'files(id,name,mimeType,size,createdTime,modifiedTime,webViewLink)',
      });

      const response = await this.makeRequest(`${this.apiEndpoints.drive}/files?${params.toString()}`);

      return {
        success: true,
        files: response.files || [],
      };
    } catch (error) {
      console.error('❌ Error obteniendo archivos:', error);
      throw error;
    }
  }

  /**
   * Google Calendar Integration
   */
  async createEvent(eventData) {
    try {
      await this.ensureAuthenticated();

      const event = {
        summary: eventData.title,
        description: eventData.description,
        start: {
          dateTime: eventData.startTime,
          timeZone: eventData.timeZone || 'America/Bogota',
        },
        end: {
          dateTime: eventData.endTime,
          timeZone: eventData.timeZone || 'America/Bogota',
        },
        attendees: eventData.attendees || [],
        location: eventData.location || '',
        reminders: {
          useDefault: true,
        },
      };

      const response = await this.makeRequest(`${this.apiEndpoints.calendar}/calendars/primary/events`, 'POST', event);

      return {
        success: true,
        eventId: response.id,
        htmlLink: response.htmlLink,
        hangoutLink: response.hangoutLink,
      };
    } catch (error) {
      console.error('❌ Error creando evento:', error);
      throw error;
    }
  }

  async getEvents(timeMin, timeMax, maxResults = 10) {
    try {
      await this.ensureAuthenticated();

      const params = new URLSearchParams({
        timeMin: timeMin,
        timeMax: timeMax,
        maxResults: maxResults,
        singleEvents: true,
        orderBy: 'startTime',
      });

      const response = await this.makeRequest(
        `${this.apiEndpoints.calendar}/calendars/primary/events?${params.toString()}`
      );

      return {
        success: true,
        events: response.items || [],
      };
    } catch (error) {
      console.error('❌ Error obteniendo eventos:', error);
      throw error;
    }
  }

  /**
   * Google Meet Integration
   */
  async createMeeting(meetingData) {
    try {
      await this.ensureAuthenticated();

      const meeting = {
        conferenceData: {
          createRequest: {
            requestId: `axyra-meeting-${Date.now()}`,
            conferenceSolutionKey: {
              type: 'hangoutsMeet',
            },
          },
        },
        summary: meetingData.title,
        description: meetingData.description,
        start: {
          dateTime: meetingData.startTime,
          timeZone: meetingData.timeZone || 'America/Bogota',
        },
        end: {
          dateTime: meetingData.endTime,
          timeZone: meetingData.timeZone || 'America/Bogota',
        },
        attendees: meetingData.attendees || [],
      };

      const response = await this.makeRequest(
        `${this.apiEndpoints.calendar}/calendars/primary/events`,
        'POST',
        meeting
      );

      return {
        success: true,
        meetingId: response.id,
        meetLink: response.conferenceData?.entryPoints?.[0]?.uri,
        htmlLink: response.htmlLink,
      };
    } catch (error) {
      console.error('❌ Error creando reunión:', error);
      throw error;
    }
  }

  /**
   * Google Docs Integration
   */
  async createDocument(title, content = '') {
    try {
      await this.ensureAuthenticated();

      const document = {
        title: title,
      };

      const response = await this.makeRequest(`${this.apiEndpoints.docs}/documents`, 'POST', document);

      if (content) {
        await this.updateDocumentContent(response.documentId, content);
      }

      return {
        success: true,
        documentId: response.documentId,
        title: response.title,
        documentUrl: `https://docs.google.com/document/d/${response.documentId}/edit`,
      };
    } catch (error) {
      console.error('❌ Error creando documento:', error);
      throw error;
    }
  }

  async updateDocumentContent(documentId, content) {
    try {
      await this.ensureAuthenticated();

      const requests = [
        {
          insertText: {
            location: { index: 1 },
            text: content,
          },
        },
      ];

      await this.makeRequest(`${this.apiEndpoints.docs}/documents/${documentId}:batchUpdate`, 'POST', { requests });

      return { success: true };
    } catch (error) {
      console.error('❌ Error actualizando documento:', error);
      throw error;
    }
  }

  /**
   * Utilidades
   */
  createEmailMessage(to, subject, body, attachments = []) {
    const boundary = '----=_Part_' + Math.random().toString(36).substr(2, 9);
    let message = [
      `To: ${to}`,
      `Subject: ${subject}`,
      'MIME-Version: 1.0',
      `Content-Type: multipart/mixed; boundary="${boundary}"`,
      '',
      `--${boundary}`,
      'Content-Type: text/html; charset=utf-8',
      '',
      body,
    ];

    // Agregar attachments si existen
    attachments.forEach((attachment) => {
      message.push(
        `--${boundary}`,
        `Content-Type: ${attachment.type}`,
        'Content-Disposition: attachment',
        `Content-Transfer-Encoding: base64`,
        '',
        attachment.data
      );
    });

    message.push(`--${boundary}--`);

    return btoa(message.join('\r\n')).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }

  async ensureAuthenticated() {
    if (!this.accessToken) {
      throw new Error('No autenticado. Use authenticate() primero.');
    }

    // Verificar si el token es válido
    try {
      await this.makeRequest(`${this.apiEndpoints.gmail}/users/me/profile`);
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
      const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: this.clientId,
          client_secret: this.clientSecret,
          refresh_token: this.refreshToken,
          grant_type: 'refresh_token',
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
      const tokens = localStorage.getItem('axyra_google_tokens');
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
      localStorage.setItem('axyra_google_tokens', JSON.stringify(tokens));
    } catch (error) {
      console.error('❌ Error guardando tokens:', error);
    }
  }

  /**
   * Desconectar Google Workspace
   */
  async disconnect() {
    try {
      this.accessToken = null;
      this.refreshToken = null;
      localStorage.removeItem('axyra_google_tokens');

      console.log('✅ Google Workspace desconectado');
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
}

// Inicializar integración
window.axyraGoogleWorkspace = new AxyraGoogleWorkspaceIntegration();

// Auto-inicializar cuando esté disponible la configuración
document.addEventListener('DOMContentLoaded', () => {
  if (window.axyraConfig) {
    window.axyraGoogleWorkspace.initialize();
  }
});

console.log('🚀 AXYRA Google Workspace Integration cargado');
