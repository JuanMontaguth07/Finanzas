if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch((err) => {
      console.warn('No se pudo registrar el service worker (normal si abriste el archivo con file://):', err);
    });
  });
}
