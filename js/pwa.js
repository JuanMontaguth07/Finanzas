if ('serviceWorker' in navigator) {
  // Cuando se publica una version nueva, el service worker nuevo toma el
  // control (skipWaiting + clients.claim en sw.js). La pagina abierta seguia
  // mostrando los archivos viejos hasta recargar a mano; ahora se recarga sola
  // una vez. Solo si ya habia un service worker antes (no en la primera visita).
  const habiaControlador = Boolean(navigator.serviceWorker.controller);
  let recargando = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!habiaControlador || recargando) return;
    recargando = true;
    window.location.reload();
  });

  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('sw.js')
      .then((registro) => {
        registro.update().catch(() => {});
        // Si la app queda abierta (por ejemplo instalada), revisa si hay
        // version nueva al volver a ella y cada 30 minutos.
        document.addEventListener('visibilitychange', () => {
          if (document.visibilityState === 'visible') registro.update().catch(() => {});
        });
        setInterval(() => registro.update().catch(() => {}), 30 * 60 * 1000);
      })
      .catch((err) => {
        console.warn('No se pudo registrar el service worker (normal si abriste el archivo con file://):', err);
      });
  });
}

// Muestra la version instalada (el nombre del cache del service worker) donde
// haya un elemento #version-app, por ejemplo en Configuración.
document.addEventListener('DOMContentLoaded', () => {
  const el = document.getElementById('version-app');
  if (!el || !('caches' in window)) return;
  caches.keys().then((nombres) => {
    const version = nombres.find((n) => n.startsWith('mis-finanzas-'));
    el.textContent = version ? version.replace('mis-finanzas-', '') : 'sin instalar';
  });
});
