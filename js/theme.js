const THEME_KEY = 'financeAppTheme';

function getTemaGuardado() {
  try {
    return localStorage.getItem(THEME_KEY);
  } catch {
    return null;
  }
}

function guardarTema(tema) {
  try {
    if (tema) localStorage.setItem(THEME_KEY, tema);
    else localStorage.removeItem(THEME_KEY);
  } catch {
    // localStorage no disponible (modo privado, etc.) — el tema simplemente no persiste.
  }
}

function aplicarTemaAlDocumento() {
  const tema = getTemaGuardado();
  if (tema === 'oscuro' || tema === 'claro') {
    document.documentElement.setAttribute('data-theme', tema);
  } else {
    document.documentElement.removeAttribute('data-theme');
  }
}

function esOscuroActivo() {
  const tema = getTemaGuardado();
  if (tema === 'oscuro') return true;
  if (tema === 'claro') return false;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function establecerTema(tema) {
  guardarTema(tema);
  aplicarTemaAlDocumento();
  actualizarControlesTema();
}

function actualizarControlesTema() {
  const btnToggle = document.getElementById('theme-toggle');
  if (btnToggle) {
    btnToggle.textContent = esOscuroActivo() ? '☀️' : '🌙';
    btnToggle.setAttribute('aria-label', esOscuroActivo() ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro');
  }

  const segmented = document.getElementById('tema-segmented');
  if (segmented) {
    const actual = getTemaGuardado() || 'auto';
    segmented.querySelectorAll('.segmented-option').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.tema === actual);
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  actualizarControlesTema();

  const btnToggle = document.getElementById('theme-toggle');
  if (btnToggle) {
    btnToggle.addEventListener('click', () => establecerTema(esOscuroActivo() ? 'claro' : 'oscuro'));
  }

  const segmented = document.getElementById('tema-segmented');
  if (segmented) {
    segmented.addEventListener('click', (e) => {
      const btn = e.target.closest('.segmented-option');
      if (!btn) return;
      establecerTema(btn.dataset.tema === 'auto' ? null : btn.dataset.tema);
    });
  }
});
