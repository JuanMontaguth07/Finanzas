const CACHE_NAME = 'mis-finanzas-v18';

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
  './js/theme.js',
  './js/pin.js',
  './js/mascota.js',
  './js/mascota-vida.js',
  './js/mascota-menu.js',
  './js/mascota-recompensas.js',
  './js/fondo.js',
  './js/comandos.js',
  './lib/xlsx.full.min.js',
  './lib/fonts/inter-latin.woff2',
  './lib/fonts/source-serif-4-latin.woff2',
  './lib/fonts/jetbrains-mono-latin.woff2',
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
    // cache: 'no-cache' obliga a confirmar con el servidor: GitHub Pages deja
    // los archivos 10 min en la cache HTTP y se podia mezclar un index.html
    // viejo con un dashboard.js nuevo (y el dashboard dejaba de cargar).
    // Las navegaciones (abrir una pagina) no se pueden copiar con opciones
    // nuevas (Chrome lanza un error y terminabamos sirviendo siempre el HTML
    // guardado), asi que para ellas se arma una peticion nueva desde la URL.
    const peticion =
      event.request.mode === 'navigate'
        ? new Request(event.request.url, { cache: 'no-cache', credentials: 'same-origin' })
        : new Request(event.request, { cache: 'no-cache' });
    event.respondWith(
      fetch(peticion)
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
