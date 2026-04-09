// ========================================
// CONFIGURACIÓN VERCEL AXYRA
// ========================================

console.log('🚀 Inicializando configuración Vercel...');

// Configuración específica para Vercel
const vercelConfig = {
  // Detectar si estamos en Vercel
  isVercel: () => {
    return (
      typeof window !== 'undefined' &&
      (window.location.hostname.includes('vercel.app') || window.location.hostname.includes('vercel.com'))
    );
  },

  // Detectar si estamos en desarrollo local
  isLocal: () => {
    return (
      typeof window !== 'undefined' &&
      (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    );
  },

  // Obtener URL base según el entorno
  getBaseUrl: () => {
    if (vercelConfig.isLocal()) {
      return 'http://localhost:3000';
    } else if (vercelConfig.isVercel()) {
      return `https://${window.location.hostname}`;
    } else {
      return window.location.origin;
    }
  },

  // Configuración de Firebase para Vercel
  getFirebaseConfig: () => {
    // En Vercel, las variables de entorno están disponibles en el cliente
    return {
      apiKey: process.env.FIREBASE_API_KEY || window.FIREBASE_API_KEY,
      authDomain: process.env.FIREBASE_AUTH_DOMAIN || window.FIREBASE_AUTH_DOMAIN,
      projectId: process.env.FIREBASE_PROJECT_ID || window.FIREBASE_PROJECT_ID,
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET || window.FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || window.FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.FIREBASE_APP_ID || window.FIREBASE_APP_ID,
      measurementId: process.env.FIREBASE_MEASUREMENT_ID || window.FIREBASE_MEASUREMENT_ID,
    };
  },

  // Configuración de CORS para Vercel
  corsConfig: {
    origin: [
      'https://axyra.vercel.app',
      'https://axyra-sistema-gestion.vercel.app',
      'https://*.vercel.app',
      'http://localhost:3000',
      'http://localhost:8080',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:8080',
    ],
    credentials: true,
  },

  // Configuración de caché para Vercel
  cacheConfig: {
    static: {
      maxAge: 31536000, // 1 año
      immutable: true,
    },
    dynamic: {
      maxAge: 3600, // 1 hora
      staleWhileRevalidate: 86400, // 1 día
    },
  },

  // Configuración de headers para Vercel
  headers: {
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  },
};

// Función para inicializar configuración específica de Vercel
function initializeVercelConfig() {
  console.log('🔧 Configurando para Vercel...');

  // Configurar meta tags para Vercel
  if (vercelConfig.isVercel()) {
    // Agregar meta tag para Vercel
    const meta = document.createElement('meta');
    meta.name = 'vercel';
    meta.content = 'true';
    document.head.appendChild(meta);

    console.log('✅ Configuración Vercel aplicada');
  }

  // Configurar service worker para Vercel
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        console.log('✅ Service Worker registrado:', registration.scope);
      })
      .catch((error) => {
        console.log('⚠️ Error registrando Service Worker:', error);
      });
  }

  // Configurar PWA para Vercel
  if (vercelConfig.isVercel()) {
    // Agregar manifest
    const manifest = document.createElement('link');
    manifest.rel = 'manifest';
    manifest.href = '/manifest.json';
    document.head.appendChild(manifest);

    // Agregar theme-color
    const themeColor = document.createElement('meta');
    themeColor.name = 'theme-color';
    themeColor.content = '#667eea';
    document.head.appendChild(themeColor);
  }
}

// Función para optimizar recursos en Vercel
function optimizeForVercel() {
  console.log('⚡ Optimizando para Vercel...');

  // Lazy loading de imágenes
  const images = document.querySelectorAll('img[data-src]');
  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src;
        img.classList.remove('lazy');
        observer.unobserve(img);
      }
    });
  });

  images.forEach((img) => imageObserver.observe(img));

  // Preload de recursos críticos
  const criticalResources = [
    '/static/axyra-styles.css',
    '/static/firebase-config.js',
    '/static/lazy-loading-system.js',
  ];

  criticalResources.forEach((resource) => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = resource;
    link.as = resource.endsWith('.css') ? 'style' : 'script';
    document.head.appendChild(link);
  });

  console.log('✅ Optimización Vercel completada');
}

// Función para configurar analytics en Vercel
function setupVercelAnalytics() {
  if (vercelConfig.isVercel()) {
    // Vercel Analytics (opcional)
    const script = document.createElement('script');
    script.src = 'https://va.vercel-scripts.com/v1/script.debug.js';
    script.defer = true;
    document.head.appendChild(script);

    console.log('📊 Analytics Vercel configurado');
  }
}

// Exportar configuración globalmente
window.vercelConfig = vercelConfig;

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    initializeVercelConfig();
    optimizeForVercel();
    setupVercelAnalytics();
  });
} else {
  initializeVercelConfig();
  optimizeForVercel();
  setupVercelAnalytics();
}

console.log('✅ Configuración Vercel inicializada');
