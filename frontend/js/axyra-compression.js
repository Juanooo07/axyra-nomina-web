// ========================================
// AXYRA COMPRESSION SYSTEM
// Sistema de compresión y optimización de recursos
// ========================================

class AxyraCompressionSystem {
  constructor() {
    this.compressionEnabled = true;
    this.compressionLevel = 6; // Nivel de compresión (1-9)
    this.compressedResources = new Map();
    this.compressionStats = {
      originalSize: 0,
      compressedSize: 0,
      compressionRatio: 0,
      timeSaved: 0,
    };

    this.init();
  }

  async init() {
    console.log('🗜️ Inicializando Sistema de Compresión AXYRA...');

    try {
      await this.loadCompressionLibraries();
      this.setupCompressionStrategies();
      this.setupResourceOptimization();
      this.setupImageOptimization();
      this.setupTextCompression();
      console.log('✅ Sistema de Compresión AXYRA inicializado');
    } catch (error) {
      console.error('❌ Error inicializando sistema de compresión:', error);
    }
  }

  async loadCompressionLibraries() {
    // Cargar librerías de compresión
    const libraries = [
      'https://cdnjs.cloudflare.com/ajax/libs/pako/2.1.0/pako.min.js',
      'https://cdnjs.cloudflare.com/ajax/libs/lz-string/1.4.4/lz-string.min.js',
    ];

    for (const lib of libraries) {
      await this.loadScript(lib);
    }
  }

  loadScript(src) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  setupCompressionStrategies() {
    this.strategies = {
      gzip: {
        level: 6,
        method: 'gzip',
        threshold: 1024, // Comprimir solo archivos > 1KB
      },
      deflate: {
        level: 6,
        method: 'deflate',
        threshold: 512,
      },
      'lz-string': {
        level: 6,
        method: 'lz-string',
        threshold: 256,
      },
    };
  }

  setupResourceOptimization() {
    // Optimizar recursos existentes
    this.optimizeExistingResources();

    // Interceptar requests para comprimir respuestas
    this.interceptRequests();
  }

  setupImageOptimization() {
    // Optimizar imágenes
    this.optimizeImages();

    // Lazy loading de imágenes
    this.setupImageLazyLoading();
  }

  setupTextCompression() {
    // Comprimir texto y JSON
    this.compressTextResources();

    // Comprimir datos de localStorage
    this.compressLocalStorage();
  }

  // Métodos de compresión
  async compress(data, options = {}) {
    const strategy = this.getCompressionStrategy(data, options);
    const startTime = performance.now();

    try {
      let compressed;

      switch (strategy.method) {
        case 'gzip':
          compressed = await this.compressGzip(data);
          break;
        case 'deflate':
          compressed = await this.compressDeflate(data);
          break;
        case 'lz-string':
          compressed = this.compressLZString(data);
          break;
        default:
          compressed = data;
      }

      const endTime = performance.now();
      const compressionTime = endTime - startTime;

      // Calcular estadísticas
      this.updateCompressionStats(data, compressed, compressionTime);

      return {
        data: compressed,
        originalSize: data.length,
        compressedSize: compressed.length,
        compressionRatio: (1 - compressed.length / data.length) * 100,
        compressionTime: compressionTime,
      };
    } catch (error) {
      console.error('❌ Error comprimiendo datos:', error);
      return { data: data, originalSize: data.length, compressedSize: data.length, compressionRatio: 0 };
    }
  }

  async compressGzip(data) {
    if (typeof pako !== 'undefined') {
      const compressed = pako.gzip(data, { level: this.compressionLevel });
      return new Uint8Array(compressed);
    }
    return data;
  }

  async compressDeflate(data) {
    if (typeof pako !== 'undefined') {
      const compressed = pako.deflate(data, { level: this.compressionLevel });
      return new Uint8Array(compressed);
    }
    return data;
  }

  compressLZString(data) {
    if (typeof LZString !== 'undefined') {
      return LZString.compress(data);
    }
    return data;
  }

  // Métodos de descompresión
  async decompress(compressedData, method) {
    try {
      switch (method) {
        case 'gzip':
          return await this.decompressGzip(compressedData);
        case 'deflate':
          return await this.decompressDeflate(compressedData);
        case 'lz-string':
          return this.decompressLZString(compressedData);
        default:
          return compressedData;
      }
    } catch (error) {
      console.error('❌ Error descomprimiendo datos:', error);
      return compressedData;
    }
  }

  async decompressGzip(compressedData) {
    if (typeof pako !== 'undefined') {
      const decompressed = pako.ungzip(compressedData);
      return new Uint8Array(decompressed);
    }
    return compressedData;
  }

  async decompressDeflate(compressedData) {
    if (typeof pako !== 'undefined') {
      const decompressed = pako.inflate(compressedData);
      return new Uint8Array(decompressed);
    }
    return compressedData;
  }

  decompressLZString(compressedData) {
    if (typeof LZString !== 'undefined') {
      return LZString.decompress(compressedData);
    }
    return compressedData;
  }

  // Métodos de optimización de recursos
  optimizeExistingResources() {
    // Optimizar CSS
    this.optimizeCSS();

    // Optimizar JavaScript
    this.optimizeJavaScript();

    // Optimizar HTML
    this.optimizeHTML();
  }

  optimizeCSS() {
    const styleSheets = document.styleSheets;
    for (let i = 0; i < styleSheets.length; i++) {
      try {
        const sheet = styleSheets[i];
        if (sheet.href && sheet.href.includes('axyra')) {
          this.optimizeStylesheet(sheet);
        }
      } catch (error) {
        // Ignorar errores de CORS
      }
    }
  }

  optimizeStylesheet(sheet) {
    // Aplicar optimizaciones CSS
    const rules = sheet.cssRules;
    if (rules) {
      for (let i = 0; i < rules.length; i++) {
        const rule = rules[i];
        if (rule.type === CSSRule.STYLE_RULE) {
          this.optimizeCSSRule(rule);
        }
      }
    }
  }

  optimizeCSSRule(rule) {
    // Optimizar reglas CSS
    const style = rule.style;

    // Eliminar propiedades duplicadas
    const properties = new Set();
    const optimizedDeclarations = [];

    for (let i = 0; i < style.length; i++) {
      const property = style[i];
      if (!properties.has(property)) {
        properties.add(property);
        optimizedDeclarations.push(`${property}: ${style.getPropertyValue(property)}`);
      }
    }

    // Aplicar optimizaciones
    if (optimizedDeclarations.length < style.length) {
      rule.style.cssText = optimizedDeclarations.join('; ');
    }
  }

  optimizeJavaScript() {
    // Optimizar scripts JavaScript
    const scripts = document.querySelectorAll('script[src*="axyra"]');
    scripts.forEach((script) => {
      this.optimizeScript(script);
    });
  }

  optimizeScript(script) {
    // Aplicar optimizaciones JavaScript
    if (script.src) {
      // Agregar atributos de optimización
      script.async = true;
      script.defer = true;

      // Comprimir contenido si es inline
      if (script.textContent) {
        this.compressScriptContent(script);
      }
    }
  }

  compressScriptContent(script) {
    const content = script.textContent;
    if (content.length > 1024) {
      // Solo comprimir scripts grandes
      this.compress(content).then((result) => {
        if (result.compressionRatio > 20) {
          // Solo si la compresión es significativa
          script.textContent = result.data;
          script.dataset.compressed = 'true';
          script.dataset.compressionRatio = result.compressionRatio;
        }
      });
    }
  }

  optimizeHTML() {
    // Optimizar HTML
    this.removeUnnecessaryWhitespace();
    this.optimizeAttributes();
    this.optimizeElements();
  }

  removeUnnecessaryWhitespace() {
    // Eliminar espacios innecesarios
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);

    let node;
    while ((node = walker.nextNode())) {
      if (node.textContent.trim() === '') {
        node.remove();
      } else {
        node.textContent = node.textContent.replace(/\s+/g, ' ').trim();
      }
    }
  }

  optimizeAttributes() {
    // Optimizar atributos HTML
    const elements = document.querySelectorAll('[data-axyra]');
    elements.forEach((element) => {
      this.optimizeElementAttributes(element);
    });
  }

  optimizeElementAttributes(element) {
    // Eliminar atributos innecesarios
    const attributesToRemove = ['data-axyra-temp', 'data-axyra-debug'];
    attributesToRemove.forEach((attr) => {
      if (element.hasAttribute(attr)) {
        element.removeAttribute(attr);
      }
    });
  }

  optimizeElements() {
    // Optimizar elementos HTML
    const elements = document.querySelectorAll('[data-axyra-optimize]');
    elements.forEach((element) => {
      this.optimizeElement(element);
    });
  }

  optimizeElement(element) {
    // Aplicar optimizaciones específicas
    if (element.tagName === 'IMG') {
      this.optimizeImageElement(element);
    } else if (element.tagName === 'SCRIPT') {
      this.optimizeScriptElement(element);
    } else if (element.tagName === 'LINK') {
      this.optimizeLinkElement(element);
    }
  }

  // Métodos de optimización de imágenes
  optimizeImages() {
    const images = document.querySelectorAll('img[data-src]');
    images.forEach((img) => {
      this.optimizeImage(img);
    });
  }

  optimizeImage(img) {
    // Aplicar optimizaciones de imagen
    img.loading = 'lazy';
    img.decoding = 'async';

    // Comprimir imagen si es posible
    if (img.src && img.src.startsWith('data:')) {
      this.compressImageData(img);
    }
  }

  compressImageData(img) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const image = new Image();

    image.onload = () => {
      canvas.width = image.width;
      canvas.height = image.height;
      ctx.drawImage(image, 0, 0);

      // Comprimir imagen
      const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.8);
      if (compressedDataUrl.length < img.src.length) {
        img.src = compressedDataUrl;
        img.dataset.compressed = 'true';
      }
    };

    image.src = img.src;
  }

  setupImageLazyLoading() {
    // Configurar lazy loading de imágenes
    const images = document.querySelectorAll('img[data-src]');
    images.forEach((img) => {
      this.setupImageLazyLoad(img);
    });
  }

  setupImageLazyLoad(img) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          this.loadImage(entry.target);
          observer.unobserve(entry.target);
        }
      });
    });

    observer.observe(img);
  }

  loadImage(img) {
    const src = img.dataset.src;
    if (src) {
      img.src = src;
      img.classList.remove('lazy');
      img.classList.add('loaded');
    }
  }

  // Métodos de compresión de texto
  compressTextResources() {
    // Comprimir recursos de texto
    this.compressJSONResources();
    this.compressXMLResources();
    this.compressTextFiles();
  }

  compressJSONResources() {
    // Comprimir datos JSON
    const jsonElements = document.querySelectorAll('[data-axyra-json]');
    jsonElements.forEach((element) => {
      this.compressJSONElement(element);
    });
  }

  compressJSONElement(element) {
    try {
      const jsonData = JSON.parse(element.textContent);
      const jsonString = JSON.stringify(jsonData);

      if (jsonString.length > 1024) {
        this.compress(jsonString).then((result) => {
          if (result.compressionRatio > 30) {
            element.textContent = result.data;
            element.dataset.compressed = 'true';
            element.dataset.compressionRatio = result.compressionRatio;
          }
        });
      }
    } catch (error) {
      console.error('❌ Error comprimiendo JSON:', error);
    }
  }

  compressXMLResources() {
    // Comprimir recursos XML
    const xmlElements = document.querySelectorAll('[data-axyra-xml]');
    xmlElements.forEach((element) => {
      this.compressXMLElement(element);
    });
  }

  compressXMLElement(element) {
    const xmlData = element.textContent;
    if (xmlData.length > 1024) {
      this.compress(xmlData).then((result) => {
        if (result.compressionRatio > 30) {
          element.textContent = result.data;
          element.dataset.compressed = 'true';
          element.dataset.compressionRatio = result.compressionRatio;
        }
      });
    }
  }

  compressTextFiles() {
    // Comprimir archivos de texto
    const textElements = document.querySelectorAll('[data-axyra-text]');
    textElements.forEach((element) => {
      this.compressTextElement(element);
    });
  }

  compressTextElement(element) {
    const textData = element.textContent;
    if (textData.length > 512) {
      this.compress(textData).then((result) => {
        if (result.compressionRatio > 20) {
          element.textContent = result.data;
          element.dataset.compressed = 'true';
          element.dataset.compressionRatio = result.compressionRatio;
        }
      });
    }
  }

  // Métodos de compresión de localStorage
  compressLocalStorage() {
    // Comprimir datos de localStorage
    const keys = Object.keys(localStorage);
    keys.forEach((key) => {
      if (key.startsWith('axyra_')) {
        this.compressLocalStorageItem(key);
      }
    });
  }

  compressLocalStorageItem(key) {
    const data = localStorage.getItem(key);
    if (data && data.length > 1024) {
      this.compress(data).then((result) => {
        if (result.compressionRatio > 20) {
          localStorage.setItem(`${key}_compressed`, result.data);
          localStorage.setItem(
            `${key}_compression_info`,
            JSON.stringify({
              method: 'gzip',
              originalSize: result.originalSize,
              compressedSize: result.compressedSize,
              compressionRatio: result.compressionRatio,
            })
          );
          localStorage.removeItem(key);
        }
      });
    }
  }

  // Métodos de utilidad
  getCompressionStrategy(data, options) {
    const size = data.length;

    if (size < 256) {
      return this.strategies['lz-string'];
    } else if (size < 1024) {
      return this.strategies['deflate'];
    } else {
      return this.strategies['gzip'];
    }
  }

  updateCompressionStats(original, compressed, time) {
    this.compressionStats.originalSize += original.length;
    this.compressionStats.compressedSize += compressed.length;
    this.compressionStats.compressionRatio =
      (1 - this.compressionStats.compressedSize / this.compressionStats.originalSize) * 100;
    this.compressionStats.timeSaved += time;
  }

  getCompressionStats() {
    return {
      ...this.compressionStats,
      spaceSaved: this.compressionStats.originalSize - this.compressionStats.compressedSize,
      spaceSavedPercent: this.compressionStats.compressionRatio,
    };
  }

  // Métodos de interceptación
  interceptRequests() {
    // Interceptar requests para comprimir respuestas
    const originalFetch = window.fetch;
    window.fetch = async (url, options) => {
      const response = await originalFetch(url, options);

      if (response.ok && this.shouldCompressResponse(response)) {
        return this.compressResponse(response);
      }

      return response;
    };
  }

  shouldCompressResponse(response) {
    const contentType = response.headers.get('content-type');
    return (
      contentType &&
      (contentType.includes('application/json') ||
        contentType.includes('text/html') ||
        contentType.includes('text/css') ||
        contentType.includes('application/javascript'))
    );
  }

  async compressResponse(response) {
    const data = await response.text();
    const compressed = await this.compress(data);

    if (compressed.compressionRatio > 20) {
      return new Response(compressed.data, {
        status: response.status,
        statusText: response.statusText,
        headers: {
          ...response.headers,
          'content-encoding': 'gzip',
          'content-length': compressed.compressedSize.toString(),
        },
      });
    }

    return response;
  }

  // Métodos de limpieza
  destroy() {
    this.compressedResources.clear();
    this.compressionStats = {
      originalSize: 0,
      compressedSize: 0,
      compressionRatio: 0,
      timeSaved: 0,
    };
  }
}

// Inicializar sistema de compresión
document.addEventListener('DOMContentLoaded', function () {
  try {
    window.axyraCompression = new AxyraCompressionSystem();
    console.log('✅ Sistema de Compresión AXYRA cargado');
  } catch (error) {
    console.error('❌ Error cargando sistema de compresión:', error);
  }
});

// Exportar para uso global
window.AxyraCompressionSystem = AxyraCompressionSystem;
