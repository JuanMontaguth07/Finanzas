const NAV_ITEMS = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    corto: 'Inicio',
    href: 'index.html',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>',
  },
  {
    id: 'movimientos',
    label: 'Movimientos',
    corto: 'Movim.',
    href: 'movimientos.html',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>',
  },
  {
    id: 'presupuestos',
    label: 'Presupuestos',
    corto: 'Presup.',
    href: 'presupuestos.html',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" y1="21" x2="4" y2="14"></line><line x1="4" y1="10" x2="4" y2="3"></line><line x1="12" y1="21" x2="12" y2="12"></line><line x1="12" y1="8" x2="12" y2="3"></line><line x1="20" y1="21" x2="20" y2="16"></line><line x1="20" y1="12" x2="20" y2="3"></line><line x1="1" y1="14" x2="7" y2="14"></line><line x1="9" y1="8" x2="15" y2="8"></line><line x1="17" y1="16" x2="23" y2="16"></line></svg>',
  },
  {
    id: 'objetivos',
    label: 'Objetivos',
    corto: 'Metas',
    href: 'objetivos.html',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle></svg>',
  },
  {
    // No es una pagina: abre el menu RPG de la mascota (js/mascota-menu.js)
    id: 'mascota',
    label: 'Mascota',
    corto: 'Mascota',
    accion: true,
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 20h10"></path><path d="M8 20l-1-7h10l-1 7"></path><path d="M12 13V8"></path><path d="M12 9c-3 0-5-2-5-5 3 0 5 2 5 5z"></path><path d="M12 8c0-3 2-5 5-5 0 3-2 5-5 5z"></path></svg>',
  },
  {
    id: 'configuracion',
    label: 'Configuración',
    corto: 'Ajustes',
    href: 'configuracion.html',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>',
  },
];

function renderNav() {
  const current = document.body.dataset.page;
  const container = document.getElementById('sidebar-nav');
  if (!container) return;
  container.innerHTML = NAV_ITEMS.map((item) =>
    item.accion
      ? `
    <button type="button" class="nav-link nav-boton" data-nav-accion="${item.id}">
      <span class="nav-icon">${item.icon}</span>
      <span class="nav-label">${item.label}</span>
      <span class="nav-label-corto" aria-hidden="true">${item.corto}</span>
      <span class="nav-badge" id="badge-misiones" hidden></span>
    </button>`
      : `
    <a class="nav-link${item.id === current ? ' active' : ''}" href="${item.href}">
      <span class="nav-icon">${item.icon}</span>
      <span class="nav-label">${item.label}</span>
      <span class="nav-label-corto" aria-hidden="true">${item.corto}</span>
    </a>
  `).join('');
  container.querySelector('[data-nav-accion="mascota"]')?.addEventListener('click', () => {
    if (typeof MenuMascota !== 'undefined') MenuMascota.abrir();
  });
}

// Simbolo que va cambiando (· ✢ ✳ ✶ ✻ ✽) como el indicador de "pensando" de
// Claude Code. Se pone delante del titulo de cada pagina y en cualquier
// elemento con la clase .glifo-spinner.
const GLIFOS_SPINNER = ['·', '✢', '✳', '✶', '✻', '✽', '✻', '✶', '✳', '✢'];

function animarSpinners() {
  document.querySelectorAll('.page-header h1').forEach((h1) => {
    if (h1.querySelector('.glifo-spinner')) return;
    h1.insertAdjacentHTML('afterbegin', '<span class="glifo-spinner" aria-hidden="true">✻</span>');
  });

  const spinners = document.querySelectorAll('.glifo-spinner');
  if (spinners.length === 0 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  let i = 0;
  setInterval(() => {
    i = (i + 1) % GLIFOS_SPINNER.length;
    spinners.forEach((s) => {
      s.textContent = GLIFOS_SPINNER[i];
    });
  }, 150);
}

document.addEventListener('DOMContentLoaded', () => {
  renderNav();
  animarSpinners();
});
