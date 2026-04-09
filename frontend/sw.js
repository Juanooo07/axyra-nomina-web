// ========================================
// SERVICE WORKER AXYRA - VERCEL
// ========================================

const CACHE_NAME = 'axyra-v1.0.0';
const STATIC_CACHE = 'axyra-static-v1.0.0';
const DYNAMIC_CACHE = 'axyra-dynamic-v1.0.0';

// Recursos críticos para cachear
const CRITICAL_RESOURCES = [
  '/',
  '/index.html',
  '/static/axyra-styles.css',
  '/static/firebase-config.js',
  '/static/lazy-loading-system.js',
  '/static/vercel-config.js',
  '/static/ai-chat-system.js',
  '/manifest.json',
];

// Recursos estáticos para cachear
const STATIC_RESOURCES = [
  '/static/axyra-design-system.css',
  '/static/form-validation-system.js',
  '/static/cleanup-system.js',
  '/static/modal-fixes.css',
  '/modulos/dashboard/dashboard.html',
  '/modulos/gestion_personal/gestion_personal.html',
  '/modulos/inventario/inventario.html',
  '/modulos/membresias/membresias.html',
];

// Instalar Service Worker
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker instalando...');

  event.waitUntil(
    Promise.all([
      // Cachear recursos críticos
      caches.open(STATIC_CACHE).then((cache) => {
        console.log('📦 Cacheando recursos críticos...');
        return cache.addAll(CRITICAL_RESOURCES);
      }),
      // Cachear recursos estáticos
      caches.open(STATIC_CACHE).then((cache) => {
        console.log('📦 Cacheando recursos estáticos...');
        return cache.addAll(STATIC_RESOURCES);
      }),
    ]).then(() => {
      console.log('✅ Service Worker instalado correctamente');
      return self.skipWaiting();
    })
  );
});

// Activar Service Worker
self.addEventListener('activate', (event) => {
  console.log('🚀 Service Worker activando...');

  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME && cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log('🗑️ Eliminando cache antiguo:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('✅ Service Worker activado');
        return self.clients.claim();
      })
  );
});

// Interceptar requests
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Solo procesar requests HTTP/HTTPS
  if (!request.url.startsWith('http')) {
    return;
  }

  // Estrategia de cache para diferentes tipos de recursos
  if (request.method === 'GET') {
    // Recursos estáticos (CSS, JS, imágenes)
    if (url.pathname.match(/\.(css|js|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf)$/)) {
      event.respondWith(cacheFirst(request));
    }
    // Páginas HTML
    else if (url.pathname.endsWith('.html') || url.pathname === '/') {
      event.respondWith(networkFirst(request));
    }
    // API calls (Firebase)
    else if (url.hostname.includes('firebase') || url.hostname.includes('googleapis')) {
      event.respondWith(networkFirst(request));
    }
    // Otros recursos
    else {
      event.respondWith(staleWhileRevalidate(request));
    }
  }
});

// Estrategia: Cache First
async function cacheFirst(request) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.warn('⚠️ Error en cacheFirst:', error);
    return new Response('Recurso no disponible', { status: 404 });
  }
}

// Estrategia: Network First
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.warn('⚠️ Error de red, buscando en cache:', error);
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    return new Response('Contenido no disponible', { status: 404 });
  }
}

// Estrategia: Stale While Revalidate
async function staleWhileRevalidate(request) {
  const cache = await caches.open(DYNAMIC_CACHE);
  const cachedResponse = await cache.match(request);

  const fetchPromise = fetch(request)
    .then((networkResponse) => {
      if (networkResponse.ok) {
        cache.put(request, networkResponse.clone());
      }
      return networkResponse;
    })
    .catch((error) => {
      console.warn('⚠️ Error en staleWhileRevalidate:', error);
      return cachedResponse;
    });

  return cachedResponse || fetchPromise;
}

// Manejar mensajes del cliente
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'CACHE_URLS') {
    const urlsToCache = event.data.urls;
    event.waitUntil(
      caches.open(DYNAMIC_CACHE).then((cache) => {
        return cache.addAll(urlsToCache);
      })
    );
  }
});

// Limpiar cache periódicamente
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'cleanup-cache') {
    event.waitUntil(cleanupCache());
  }
});

async function cleanupCache() {
  console.log('🧹 Limpiando cache...');

  const cacheNames = await caches.keys();
  const oldCaches = cacheNames.filter(
    (name) => name.startsWith('axyra-') && name !== CACHE_NAME && name !== STATIC_CACHE && name !== DYNAMIC_CACHE
  );

  await Promise.all(oldCaches.map((cacheName) => caches.delete(cacheName)));

  console.log('✅ Cache limpiado');
}

// Manejar notificaciones push
self.addEventListener('push', (event) => {
  console.log('🔔 Push recibido:', event);

  let data = {};
  if (event.data) {
    try {
      data = event.data.json();
    } catch (error) {
      data = { title: 'AXYRA', body: event.data.text() };
    }
  }

  const options = {
    body: data.body || 'Nueva notificación',
    icon: data.icon || '/logo.png',
    badge: data.badge || '/logo.png',
    tag: data.tag || 'axyra-push',
    data: data.data || {},
    actions: data.actions || [],
    requireInteraction: data.requireInteraction || false,
    silent: data.silent || false,
    timestamp: Date.now(),
  };

  event.waitUntil(self.registration.showNotification(data.title || 'AXYRA', options));
});

// Manejar clicks en notificaciones
self.addEventListener('notificationclick', (event) => {
  console.log('👆 Notificación clickeada:', event);

  event.notification.close();

  const data = event.notification.data || {};
  const url = data.url || '/dashboard';

  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      // Buscar ventana existente
      for (const client of clientList) {
        if (client.url.includes(url) && 'focus' in client) {
          return client.focus();
        }
      }

      // Abrir nueva ventana
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});

// Manejar cierre de notificaciones
self.addEventListener('notificationclose', (event) => {
  console.log('❌ Notificación cerrada:', event);

  // Enviar mensaje a la página principal
  self.clients.matchAll().then((clients) => {
    clients.forEach((client) => {
      client.postMessage({
        type: 'NOTIFICATION_CLOSED',
        payload: {
          tag: event.notification.tag,
          timestamp: Date.now(),
        },
      });
    });
  });
});

console.log('✅ Service Worker AXYRA cargado');
