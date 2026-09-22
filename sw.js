const CACHE_NAME = 'mis-finanzas-v3';

// El "app shell" (HTML/JS/CSS/manifest) se sirve siempre de red primero,
// para que las actualizaciones se vean de inmediato mientras haya internet.
// Las librerías pesadas (fuentes, xlsx, pdf.js) casi nunca cambian, asi que
// esas se sirven del cache primero por velocidad.
const APP_SHELL_PATTERN = /\.(html|js|css|json)$/;

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

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  const esAppShell = event.request.mode === 'navigate' || APP_SHELL_PATTERN.test(url.pathname);

  if (esAppShell) {
    // Network-first: intenta traer la version mas reciente; si no hay
    // internet, cae al cache para seguir funcionando offline.
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // Cache-first para librerias pesadas que casi nunca cambian.
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((response) => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      });
    })
  );
});
