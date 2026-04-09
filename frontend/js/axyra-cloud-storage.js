// ========================================
// AXYRA CLOUD STORAGE SYSTEM
// Sistema de integración de almacenamiento en la nube
// ========================================

class AxyraCloudStorageSystem {
  constructor() {
    this.storageProviders = new Map();
    this.storageSettings = {
      enableAWS_S3: true,
      enableGoogleCloud: false,
      enableAzure: false,
      enableDropbox: false,
      defaultProvider: 'aws_s3',
      awsAccessKeyId: '',
      awsSecretAccessKey: '',
      awsRegion: 'us-east-1',
      awsBucketName: 'axyra-storage',
      googleCloudProjectId: '',
      googleCloudKeyFile: '',
      googleCloudBucketName: 'axyra-storage',
      azureAccountName: '',
      azureAccountKey: '',
      azureContainerName: 'axyra-storage',
      dropboxAccessToken: '',
      webhookUrl: '/api/storage/webhook',
      maxFileSize: 100 * 1024 * 1024, // 100MB
      allowedFileTypes: ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx', 'xls', 'xlsx', 'txt'],
      enableCompression: true,
      enableEncryption: true,
      enableCDN: true,
    };

    this.storageMetrics = {
      totalFiles: 0,
      uploadedFiles: 0,
      downloadedFiles: 0,
      deletedFiles: 0,
      totalSize: 0,
      averageUploadTime: 0,
      averageDownloadTime: 0,
    };

    this.init();
  }

  async init() {
    console.log('☁️ Inicializando Sistema de Almacenamiento en la Nube AXYRA...');

    try {
      await this.loadStorageSettings();
      this.setupStorageProviders();
      this.setupStorageWebhooks();
      this.setupStorageMonitoring();
      this.setupStorageOptimization();
      console.log('✅ Sistema de Almacenamiento en la Nube AXYRA inicializado');
    } catch (error) {
      console.error('❌ Error inicializando sistema de almacenamiento:', error);
    }
  }

  async loadStorageSettings() {
    try {
      const settings = localStorage.getItem('axyra_storage_settings');
      if (settings) {
        const parsedSettings = JSON.parse(settings);
        this.storageSettings = { ...this.storageSettings, ...parsedSettings };
      }

      const metrics = localStorage.getItem('axyra_storage_metrics');
      if (metrics) {
        this.storageMetrics = { ...this.storageMetrics, ...JSON.parse(metrics) };
      }
    } catch (error) {
      console.error('❌ Error cargando configuración de almacenamiento:', error);
    }
  }

  setupStorageProviders() {
    // Configurar proveedores de almacenamiento
    this.storageProviders.set('aws_s3', {
      name: 'AWS S3',
      enabled: this.storageSettings.enableAWS_S3,
      accessKeyId: this.storageSettings.awsAccessKeyId,
      secretAccessKey: this.storageSettings.awsSecretAccessKey,
      region: this.storageSettings.awsRegion,
      bucketName: this.storageSettings.awsBucketName,
      webhookUrl: this.storageSettings.webhookUrl + '/aws_s3',
    });

    this.storageProviders.set('google_cloud', {
      name: 'Google Cloud Storage',
      enabled: this.storageSettings.enableGoogleCloud,
      projectId: this.storageSettings.googleCloudProjectId,
      keyFile: this.storageSettings.googleCloudKeyFile,
      bucketName: this.storageSettings.googleCloudBucketName,
      webhookUrl: this.storageSettings.webhookUrl + '/google_cloud',
    });

    this.storageProviders.set('azure', {
      name: 'Azure Blob Storage',
      enabled: this.storageSettings.enableAzure,
      accountName: this.storageSettings.azureAccountName,
      accountKey: this.storageSettings.azureAccountKey,
      containerName: this.storageSettings.azureContainerName,
      webhookUrl: this.storageSettings.webhookUrl + '/azure',
    });

    this.storageProviders.set('dropbox', {
      name: 'Dropbox',
      enabled: this.storageSettings.enableDropbox,
      accessToken: this.storageSettings.dropboxAccessToken,
      webhookUrl: this.storageSettings.webhookUrl + '/dropbox',
    });
  }

  setupStorageWebhooks() {
    // Configurar webhooks de almacenamiento
    this.setupAWS_S3Webhooks();
    this.setupGoogleCloudWebhooks();
    this.setupAzureWebhooks();
    this.setupDropboxWebhooks();
  }

  setupAWS_S3Webhooks() {
    if (!this.storageSettings.enableAWS_S3) return;

    // Configurar webhook de AWS S3
    const awsS3Provider = this.storageProviders.get('aws_s3');
    if (awsS3Provider && awsS3Provider.enabled) {
      this.setupAWS_S3Script();
    }
  }

  setupAWS_S3Script() {
    // Cargar script de AWS SDK
    const script = document.createElement('script');
    script.src = 'https://sdk.amazonaws.com/js/aws-sdk-2.1000.0.min.js';
    script.onload = () => {
      console.log('✅ AWS SDK script cargado');
      this.initializeAWS_S3();
    };
    script.onerror = () => {
      console.error('❌ Error cargando script de AWS SDK');
    };
    document.head.appendChild(script);
  }

  initializeAWS_S3() {
    if (typeof window.AWS !== 'undefined') {
      window.AWS.config.update({
        accessKeyId: this.storageSettings.awsAccessKeyId,
        secretAccessKey: this.storageSettings.awsSecretAccessKey,
        region: this.storageSettings.awsRegion,
      });
      window.s3 = new window.AWS.S3();
      console.log('✅ AWS S3 inicializado');
    }
  }

  setupGoogleCloudWebhooks() {
    if (!this.storageSettings.enableGoogleCloud) return;

    // Configurar webhook de Google Cloud
    const googleCloudProvider = this.storageProviders.get('google_cloud');
    if (googleCloudProvider && googleCloudProvider.enabled) {
      this.setupGoogleCloudScript();
    }
  }

  setupGoogleCloudScript() {
    // Cargar script de Google Cloud
    const script = document.createElement('script');
    script.src = 'https://storage.googleapis.com/storage/v1/b/' + this.storageSettings.googleCloudBucketName + '/o';
    script.onload = () => {
      console.log('✅ Google Cloud script cargado');
      this.initializeGoogleCloud();
    };
    script.onerror = () => {
      console.error('❌ Error cargando script de Google Cloud');
    };
    document.head.appendChild(script);
  }

  initializeGoogleCloud() {
    console.log('✅ Google Cloud Storage inicializado');
  }

  setupAzureWebhooks() {
    if (!this.storageSettings.enableAzure) return;

    // Configurar webhook de Azure
    const azureProvider = this.storageProviders.get('azure');
    if (azureProvider && azureProvider.enabled) {
      this.setupAzureScript();
    }
  }

  setupAzureScript() {
    // Cargar script de Azure
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/@azure/storage-blob@12.17.0/dist/index.min.js';
    script.onload = () => {
      console.log('✅ Azure script cargado');
      this.initializeAzure();
    };
    script.onerror = () => {
      console.error('❌ Error cargando script de Azure');
    };
    document.head.appendChild(script);
  }

  initializeAzure() {
    if (typeof window.AzureStorage !== 'undefined') {
      window.azureStorage = window.AzureStorage;
      console.log('✅ Azure Blob Storage inicializado');
    }
  }

  setupDropboxWebhooks() {
    if (!this.storageSettings.enableDropbox) return;

    // Configurar webhook de Dropbox
    const dropboxProvider = this.storageProviders.get('dropbox');
    if (dropboxProvider && dropboxProvider.enabled) {
      this.setupDropboxScript();
    }
  }

  setupDropboxScript() {
    // Cargar script de Dropbox
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/dropbox@10.32.0/dist/Dropbox-sdk.min.js';
    script.onload = () => {
      console.log('✅ Dropbox script cargado');
      this.initializeDropbox();
    };
    script.onerror = () => {
      console.error('❌ Error cargando script de Dropbox');
    };
    document.head.appendChild(script);
  }

  initializeDropbox() {
    if (typeof window.Dropbox !== 'undefined') {
      window.dropbox = new window.Dropbox({
        accessToken: this.storageSettings.dropboxAccessToken,
      });
      console.log('✅ Dropbox inicializado');
    }
  }

  setupStorageMonitoring() {
    // Monitorear almacenamiento
    this.monitorStorageUsage();
    this.monitorStoragePerformance();
    this.monitorStorageErrors();
  }

  monitorStorageUsage() {
    // Monitorear uso de almacenamiento
    setInterval(() => {
      this.checkStorageUsage();
    }, 60 * 1000); // Cada minuto
  }

  monitorStoragePerformance() {
    // Monitorear rendimiento de almacenamiento
    this.storagePerformanceMetrics = {
      averageUploadTime: 0,
      averageDownloadTime: 0,
      successRate: 0,
      errorRate: 0,
    };
  }

  monitorStorageErrors() {
    // Monitorear errores de almacenamiento
    this.storageErrorCount = 0;
    this.storageErrorThreshold = 5;
  }

  setupStorageOptimization() {
    // Configurar optimización de almacenamiento
    this.setupFileCompression();
    this.setupFileEncryption();
    this.setupCDNOptimization();
  }

  setupFileCompression() {
    // Configurar compresión de archivos
    if (this.storageSettings.enableCompression) {
      this.compressionEnabled = true;
      this.compressionLevel = 6;
    }
  }

  setupFileEncryption() {
    // Configurar encriptación de archivos
    if (this.storageSettings.enableEncryption) {
      this.encryptionEnabled = true;
      this.encryptionKey = this.generateEncryptionKey();
    }
  }

  setupCDNOptimization() {
    // Configurar optimización de CDN
    if (this.storageSettings.enableCDN) {
      this.cdnEnabled = true;
      this.cdnUrl = this.getCDNUrl();
    }
  }

  // Métodos de carga de archivos
  async uploadFile(file, options = {}) {
    try {
      const startTime = performance.now();

      // Validar archivo
      this.validateFile(file);

      // Seleccionar proveedor
      const provider = this.selectStorageProvider(options);

      // Procesar archivo
      const processedFile = await this.processFile(file, options);

      // Subir archivo
      const result = await this.executeUpload(provider, processedFile, options);

      const endTime = performance.now();
      const uploadTime = endTime - startTime;

      // Actualizar métricas
      this.updateStorageMetrics(result, uploadTime);

      // Registrar carga
      this.logStorageTransaction('upload', file, result);

      return result;
    } catch (error) {
      console.error('❌ Error cargando archivo:', error);
      this.handleStorageError(file, error);
      throw error;
    }
  }

  validateFile(file) {
    if (!file) {
      throw new Error('Archivo requerido');
    }

    if (file.size > this.storageSettings.maxFileSize) {
      throw new Error(`Archivo demasiado grande. Máximo ${this.storageSettings.maxFileSize / 1024 / 1024}MB`);
    }

    const fileExtension = file.name.split('.').pop().toLowerCase();
    if (!this.storageSettings.allowedFileTypes.includes(fileExtension)) {
      throw new Error(`Tipo de archivo no permitido: ${fileExtension}`);
    }
  }

  selectStorageProvider(options) {
    const availableProviders = Array.from(this.storageProviders.values()).filter((provider) => provider.enabled);

    if (availableProviders.length === 0) {
      throw new Error('No hay proveedores de almacenamiento disponibles');
    }

    // Seleccionar el proveedor por defecto o el especificado
    const providerName = options.provider || this.storageSettings.defaultProvider;
    const provider = this.storageProviders.get(providerName);

    return provider && provider.enabled ? provider : availableProviders[0];
  }

  async processFile(file, options) {
    let processedFile = file;

    // Comprimir archivo si está habilitado
    if (this.compressionEnabled && options.compress !== false) {
      processedFile = await this.compressFile(file);
    }

    // Encriptar archivo si está habilitado
    if (this.encryptionEnabled && options.encrypt !== false) {
      processedFile = await this.encryptFile(processedFile);
    }

    return processedFile;
  }

  async compressFile(file) {
    try {
      // Implementar compresión de archivo
      const compressedFile = await this.compressFileData(file);
      return compressedFile;
    } catch (error) {
      console.error('❌ Error comprimiendo archivo:', error);
      return file; // Retornar archivo original si falla la compresión
    }
  }

  async compressFileData(file) {
    // Implementar compresión usando pako o similar
    const arrayBuffer = await file.arrayBuffer();
    const compressed = pako.gzip(new Uint8Array(arrayBuffer));

    return new File([compressed], file.name + '.gz', {
      type: 'application/gzip',
    });
  }

  async encryptFile(file) {
    try {
      // Implementar encriptación de archivo
      const encryptedFile = await this.encryptFileData(file);
      return encryptedFile;
    } catch (error) {
      console.error('❌ Error encriptando archivo:', error);
      return file; // Retornar archivo original si falla la encriptación
    }
  }

  async encryptFileData(file) {
    // Implementar encriptación usando Web Crypto API
    const arrayBuffer = await file.arrayBuffer();
    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(this.encryptionKey),
      { name: 'AES-GCM' },
      false,
      ['encrypt']
    );

    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv: iv }, key, arrayBuffer);

    const encryptedFile = new File([encrypted], file.name + '.enc', {
      type: 'application/octet-stream',
    });

    return encryptedFile;
  }

  async executeUpload(provider, file, options) {
    switch (provider.name.toLowerCase()) {
      case 'aws s3':
        return await this.uploadToAWS_S3(file, options);
      case 'google cloud storage':
        return await this.uploadToGoogleCloud(file, options);
      case 'azure blob storage':
        return await this.uploadToAzure(file, options);
      case 'dropbox':
        return await this.uploadToDropbox(file, options);
      default:
        throw new Error(`Proveedor no soportado: ${provider.name}`);
    }
  }

  async uploadToAWS_S3(file, options) {
    try {
      if (typeof window.s3 === 'undefined') {
        throw new Error('AWS S3 no está inicializado');
      }

      const key = this.generateFileKey(file.name, options.path);
      const params = {
        Bucket: this.storageSettings.awsBucketName,
        Key: key,
        Body: file,
        ContentType: file.type,
        ACL: 'private',
      };

      const result = await window.s3.upload(params).promise();

      return {
        success: true,
        provider: 'aws_s3',
        fileId: result.Key,
        url: result.Location,
        size: file.size,
        type: file.type,
        uploadedAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error('❌ Error cargando archivo a AWS S3:', error);
      throw error;
    }
  }

  async uploadToGoogleCloud(file, options) {
    try {
      const key = this.generateFileKey(file.name, options.path);
      const response = await fetch(`/api/storage/google_cloud/upload`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: key,
          fileData: await this.fileToBase64(file),
          contentType: file.type,
        }),
      });

      const result = await response.json();

      return {
        success: true,
        provider: 'google_cloud',
        fileId: result.fileId,
        url: result.url,
        size: file.size,
        type: file.type,
        uploadedAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error('❌ Error cargando archivo a Google Cloud:', error);
      throw error;
    }
  }

  async uploadToAzure(file, options) {
    try {
      const key = this.generateFileKey(file.name, options.path);
      const response = await fetch(`/api/storage/azure/upload`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: key,
          fileData: await this.fileToBase64(file),
          contentType: file.type,
        }),
      });

      const result = await response.json();

      return {
        success: true,
        provider: 'azure',
        fileId: result.fileId,
        url: result.url,
        size: file.size,
        type: file.type,
        uploadedAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error('❌ Error cargando archivo a Azure:', error);
      throw error;
    }
  }

  async uploadToDropbox(file, options) {
    try {
      if (typeof window.dropbox === 'undefined') {
        throw new Error('Dropbox no está inicializado');
      }

      const key = this.generateFileKey(file.name, options.path);
      const result = await window.dropbox.filesUpload({
        path: '/' + key,
        contents: file,
      });

      return {
        success: true,
        provider: 'dropbox',
        fileId: result.id,
        url: result.url,
        size: file.size,
        type: file.type,
        uploadedAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error('❌ Error cargando archivo a Dropbox:', error);
      throw error;
    }
  }

  // Métodos de descarga de archivos
  async downloadFile(fileId, options = {}) {
    try {
      const startTime = performance.now();

      // Obtener información del archivo
      const fileInfo = await this.getFileInfo(fileId);

      // Seleccionar proveedor
      const provider = this.selectStorageProvider({ provider: fileInfo.provider });

      // Descargar archivo
      const result = await this.executeDownload(provider, fileId, options);

      const endTime = performance.now();
      const downloadTime = endTime - startTime;

      // Actualizar métricas
      this.updateStorageMetrics(result, downloadTime);

      // Registrar descarga
      this.logStorageTransaction('download', fileInfo, result);

      return result;
    } catch (error) {
      console.error('❌ Error descargando archivo:', error);
      throw error;
    }
  }

  async executeDownload(provider, fileId, options) {
    switch (provider.name.toLowerCase()) {
      case 'aws s3':
        return await this.downloadFromAWS_S3(fileId, options);
      case 'google cloud storage':
        return await this.downloadFromGoogleCloud(fileId, options);
      case 'azure blob storage':
        return await this.downloadFromAzure(fileId, options);
      case 'dropbox':
        return await this.downloadFromDropbox(fileId, options);
      default:
        throw new Error(`Proveedor no soportado: ${provider.name}`);
    }
  }

  async downloadFromAWS_S3(fileId, options) {
    try {
      if (typeof window.s3 === 'undefined') {
        throw new Error('AWS S3 no está inicializado');
      }

      const params = {
        Bucket: this.storageSettings.awsBucketName,
        Key: fileId,
      };

      const result = await window.s3.getObject(params).promise();

      return {
        success: true,
        provider: 'aws_s3',
        fileId: fileId,
        data: result.Body,
        contentType: result.ContentType,
        size: result.ContentLength,
      };
    } catch (error) {
      console.error('❌ Error descargando archivo de AWS S3:', error);
      throw error;
    }
  }

  async downloadFromGoogleCloud(fileId, options) {
    try {
      const response = await fetch(`/api/storage/google_cloud/download/${fileId}`);
      const result = await response.json();

      return {
        success: true,
        provider: 'google_cloud',
        fileId: fileId,
        data: result.data,
        contentType: result.contentType,
        size: result.size,
      };
    } catch (error) {
      console.error('❌ Error descargando archivo de Google Cloud:', error);
      throw error;
    }
  }

  async downloadFromAzure(fileId, options) {
    try {
      const response = await fetch(`/api/storage/azure/download/${fileId}`);
      const result = await response.json();

      return {
        success: true,
        provider: 'azure',
        fileId: fileId,
        data: result.data,
        contentType: result.contentType,
        size: result.size,
      };
    } catch (error) {
      console.error('❌ Error descargando archivo de Azure:', error);
      throw error;
    }
  }

  async downloadFromDropbox(fileId, options) {
    try {
      if (typeof window.dropbox === 'undefined') {
        throw new Error('Dropbox no está inicializado');
      }

      const result = await window.dropbox.filesDownload({
        path: fileId,
      });

      return {
        success: true,
        provider: 'dropbox',
        fileId: fileId,
        data: result.fileBinary,
        contentType: result.contentType,
        size: result.size,
      };
    } catch (error) {
      console.error('❌ Error descargando archivo de Dropbox:', error);
      throw error;
    }
  }

  // Métodos de eliminación de archivos
  async deleteFile(fileId, options = {}) {
    try {
      // Obtener información del archivo
      const fileInfo = await this.getFileInfo(fileId);

      // Seleccionar proveedor
      const provider = this.selectStorageProvider({ provider: fileInfo.provider });

      // Eliminar archivo
      const result = await this.executeDelete(provider, fileId, options);

      // Actualizar métricas
      this.updateStorageMetrics(result, 0);

      // Registrar eliminación
      this.logStorageTransaction('delete', fileInfo, result);

      return result;
    } catch (error) {
      console.error('❌ Error eliminando archivo:', error);
      throw error;
    }
  }

  async executeDelete(provider, fileId, options) {
    switch (provider.name.toLowerCase()) {
      case 'aws s3':
        return await this.deleteFromAWS_S3(fileId, options);
      case 'google cloud storage':
        return await this.deleteFromGoogleCloud(fileId, options);
      case 'azure blob storage':
        return await this.deleteFromAzure(fileId, options);
      case 'dropbox':
        return await this.deleteFromDropbox(fileId, options);
      default:
        throw new Error(`Proveedor no soportado: ${provider.name}`);
    }
  }

  async deleteFromAWS_S3(fileId, options) {
    try {
      if (typeof window.s3 === 'undefined') {
        throw new Error('AWS S3 no está inicializado');
      }

      const params = {
        Bucket: this.storageSettings.awsBucketName,
        Key: fileId,
      };

      await window.s3.deleteObject(params).promise();

      return {
        success: true,
        provider: 'aws_s3',
        fileId: fileId,
        deletedAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error('❌ Error eliminando archivo de AWS S3:', error);
      throw error;
    }
  }

  async deleteFromGoogleCloud(fileId, options) {
    try {
      const response = await fetch(`/api/storage/google_cloud/delete/${fileId}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      return {
        success: true,
        provider: 'google_cloud',
        fileId: fileId,
        deletedAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error('❌ Error eliminando archivo de Google Cloud:', error);
      throw error;
    }
  }

  async deleteFromAzure(fileId, options) {
    try {
      const response = await fetch(`/api/storage/azure/delete/${fileId}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      return {
        success: true,
        provider: 'azure',
        fileId: fileId,
        deletedAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error('❌ Error eliminando archivo de Azure:', error);
      throw error;
    }
  }

  async deleteFromDropbox(fileId, options) {
    try {
      if (typeof window.dropbox === 'undefined') {
        throw new Error('Dropbox no está inicializado');
      }

      await window.dropbox.filesDeleteV2({
        path: fileId,
      });

      return {
        success: true,
        provider: 'dropbox',
        fileId: fileId,
        deletedAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error('❌ Error eliminando archivo de Dropbox:', error);
      throw error;
    }
  }

  // Métodos de utilidad
  generateFileKey(fileName, path = '') {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 9);
    const extension = fileName.split('.').pop();
    const name = fileName.split('.').slice(0, -1).join('.');

    return `${path}/${name}_${timestamp}_${random}.${extension}`.replace(/^\/+/, '');
  }

  generateEncryptionKey() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let key = '';
    for (let i = 0; i < 32; i++) {
      key += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return key;
  }

  getCDNUrl() {
    // Implementar lógica de CDN
    return 'https://cdn.axyra.com';
  }

  async fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  }

  async getFileInfo(fileId) {
    try {
      const response = await fetch(`/api/storage/file/${fileId}`);
      return await response.json();
    } catch (error) {
      console.error('❌ Error obteniendo información del archivo:', error);
      return null;
    }
  }

  updateStorageMetrics(result, processingTime) {
    this.storageMetrics.totalFiles++;
    this.storageMetrics.totalSize += result.size || 0;

    if (result.success) {
      this.storageMetrics.uploadedFiles++;
    }

    this.storageMetrics.averageUploadTime = (this.storageMetrics.averageUploadTime + processingTime) / 2;

    this.saveStorageMetrics();
  }

  logStorageTransaction(action, file, result) {
    const transaction = {
      id: this.generateStorageId(),
      action: action,
      file: file,
      result: result,
      timestamp: Date.now(),
      userId: this.getCurrentUserId(),
    };

    this.saveStorageTransaction(transaction);
  }

  handleStorageError(file, error) {
    this.storageMetrics.failedFiles++;
    this.storageErrorCount++;

    if (this.storageErrorCount >= this.storageErrorThreshold) {
      this.triggerStorageErrorAlert(error);
    }
  }

  triggerStorageErrorAlert(error) {
    if (window.axyraNotifications) {
      window.axyraNotifications.showError('Error de Almacenamiento', {
        message: `Error crítico en almacenamiento: ${error.message}`,
        persistent: true,
      });
    }
  }

  async checkStorageUsage() {
    try {
      const response = await fetch('/api/storage/usage');
      const usage = await response.json();

      this.storageMetrics.totalSize = usage.totalSize;
      this.storageMetrics.totalFiles = usage.totalFiles;

      this.saveStorageMetrics();
    } catch (error) {
      console.error('❌ Error verificando uso de almacenamiento:', error);
    }
  }

  // Métodos de utilidad
  generateStorageId() {
    return 'STORAGE_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  getCurrentUserId() {
    try {
      const sessionData = localStorage.getItem('axyra_user_session');
      if (sessionData) {
        const session = JSON.parse(sessionData);
        return session.userId;
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  // Métodos de guardado
  saveStorageMetrics() {
    try {
      localStorage.setItem('axyra_storage_metrics', JSON.stringify(this.storageMetrics));
    } catch (error) {
      console.error('❌ Error guardando métricas de almacenamiento:', error);
    }
  }

  saveStorageTransaction(transaction) {
    try {
      const transactions = JSON.parse(localStorage.getItem('axyra_storage_transactions') || '[]');
      transactions.push(transaction);

      // Mantener solo los últimos 1000 transacciones
      if (transactions.length > 1000) {
        transactions.splice(0, transactions.length - 1000);
      }

      localStorage.setItem('axyra_storage_transactions', JSON.stringify(transactions));
    } catch (error) {
      console.error('❌ Error guardando transacción de almacenamiento:', error);
    }
  }

  // Métodos de exportación
  exportStorageReport() {
    const data = {
      metrics: this.storageMetrics,
      settings: this.storageSettings,
      timestamp: new Date().toISOString(),
      device: this.getCurrentDeviceInfo(),
    };

    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });

    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `axyra_storage_report_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  }

  getCurrentDeviceInfo() {
    return {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      screenResolution: `${screen.width}x${screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      language: navigator.language,
    };
  }

  // Métodos de limpieza
  destroy() {
    this.storageProviders.clear();
    this.storageMetrics = {
      totalFiles: 0,
      uploadedFiles: 0,
      downloadedFiles: 0,
      deletedFiles: 0,
      totalSize: 0,
      averageUploadTime: 0,
      averageDownloadTime: 0,
    };
  }
}

// Inicializar sistema de almacenamiento en la nube
document.addEventListener('DOMContentLoaded', function () {
  try {
    window.axyraCloudStorage = new AxyraCloudStorageSystem();
    console.log('✅ Sistema de Almacenamiento en la Nube AXYRA cargado');
  } catch (error) {
    console.error('❌ Error cargando sistema de almacenamiento en la nube:', error);
  }
});

// Exportar para uso global
window.AxyraCloudStorageSystem = AxyraCloudStorageSystem;
