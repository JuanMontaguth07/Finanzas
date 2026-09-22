const CACHE_NAME = 'mis-finanzas-v2';

const ASSETS = [
  './',
  './index.html',
  './movimientos.html',
  './presupuestos.html',
  './objetivos.html',
  './configuracion.html',
  './manifest.json',
  './css/styles.css',
  './js/storage.js',
  './js/format.js',
  './js/analytics.js',
  './js/export.js',
  './js/ui.js',
  './js/nav.js',
  './js/pwa.js',
  './js/dashboard.js',
  './js/movimientos.js',
  './js/nequi-parser.js',
  './js/importar-nequi.js',
  './js/presupuestos.js',
  './js/objetivos.js',
  './js/configuracion.js',
  './lib/xlsx.full.min.js',
  './lib/fonts/poppins-400.woff2',
  './lib/fonts/poppins-600.woff2',
  './lib/fonts/poppins-700.woff2',
  './lib/fonts/poppins-800.woff2',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
    )
  );
  self.clients.claim();
});

// Cache-first: sirve del cache si existe; si no, va a la red y guarda copia para la próxima vez offline.
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request)
        .then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => cached);
    })
  );
});
