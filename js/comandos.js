// Paleta de comandos estilo Claude Code: se abre con Ctrl+K (Cmd+K en Mac),
// con la tecla "/" o con el boton ">_" de la esquina. Se escribe /comando
// (o parte del nombre), se navega con ↑ ↓ y se ejecuta con Enter.
(function () {
  function ir(url) {
    window.location.href = url;
  }

  // "/mes octubre", "/mes 2026-10" o "/mes oct" -> "2026-10" (el ultimo
  // octubre que ya paso o el actual). Sin argumento: el mes actual.
  function interpretarMes(texto) {
    const t = (texto || '').trim().toLowerCase();
    if (!t) return currentMonthKey();
    if (/^\d{4}-\d{2}$/.test(t)) return t;
    const idx = MESES_LARGOS.findIndex((m) => m.startsWith(t.slice(0, 3)));
    if (idx === -1) return null;
    const hoy = new Date();
    const year = idx > hoy.getMonth() ? hoy.getFullYear() - 1 : hoy.getFullYear();
    return `${year}-${String(idx + 1).padStart(2, '0')}`;
  }

  function abrirMenuMascota(pestana) {
    if (typeof MenuMascota !== 'undefined') MenuMascota.abrir(pestana);
  }

  const COMANDOS = [
    { nombre: 'nuevo', descripcion: 'Registrar un movimiento nuevo', accion: () => {
      const btn = document.getElementById('btn-nuevo-movimiento');
      if (btn) btn.click();
      else ir('movimientos.html?nuevo=1');
    } },
    { nombre: 'mes', argumento: '[mes]', descripcion: 'Ver las estadísticas de un mes (ej. /mes octubre)', accion: (arg) => {
      const mes = interpretarMes(arg);
      if (!mes) {
        if (typeof showToast === 'function') showToast(`No entendí el mes "${arg}". Prueba /mes octubre o /mes 2026-10.`, 'error');
        return;
      }
      // En el dashboard cambia el mes sin recargar; desde otra pagina navega.
      if (typeof cambiarMes === 'function') cambiarMes(mes);
      else ir(mes === currentMonthKey() ? 'index.html' : `index.html?mes=${mes}`);
    } },
    { nombre: 'dashboard', descripcion: 'Ir al dashboard', accion: () => ir('index.html') },
    { nombre: 'movimientos', descripcion: 'Ver la tabla de movimientos', accion: () => ir('movimientos.html') },
    { nombre: 'presupuestos', descripcion: 'Ver y ajustar presupuestos', accion: () => ir('presupuestos.html') },
    { nombre: 'objetivos', descripcion: 'Ver tus metas de ahorro', accion: () => ir('objetivos.html') },
    { nombre: 'exportar', descripcion: 'Descargar todo en Excel', accion: () => {
      if (typeof exportarExcel === 'function' && typeof XLSX !== 'undefined') exportarExcel();
      else ir('configuracion.html?accion=exportar');
    } },
    { nombre: 'tema', descripcion: 'Cambiar entre modo día y noche', accion: () => {
      if (typeof establecerTema === 'function') establecerTema(esOscuroActivo() ? 'claro' : 'oscuro');
    } },
    { nombre: 'brote', descripcion: 'Abrir el menú de tu mascota (estado, misiones, habilidades…) 🌱', accion: () => abrirMenuMascota() },
    { nombre: 'misiones', descripcion: 'Ver las misiones de tu mascota 🎯', accion: () => abrirMenuMascota('misiones') },
    { nombre: 'habilidades', descripcion: 'Aprender y usar habilidades ✨', accion: () => abrirMenuMascota('habilidades') },
    { nombre: 'personalizar', descripcion: 'Cambiar nombre, colores y accesorios 🎨', accion: () => abrirMenuMascota('personalizar') },
    { nombre: 'monedas', descripcion: 'Que lluevan monedas para tu mascota 🪙', accion: () => {
      if (typeof lluviaMonedas === 'function') lluviaMonedas(5);
    } },
    { nombre: 'bloquear', descripcion: 'Bloquear la app con tu PIN', disponible: () => typeof pinActivo === 'function' && pinActivo(), accion: () => {
      try {
        sessionStorage.removeItem('financeAppUnlocked');
      } catch {
        // si no hay sessionStorage, recargar igual muestra el PIN
      }
      window.location.reload();
    } },
    { nombre: 'config', descripcion: 'Abrir configuración', accion: () => ir('configuracion.html') },
  ];

  let overlay;
  let input;
  let lista;
  let visibles = [];
  let seleccionado = 0;

  function comandosDisponibles() {
    return COMANDOS.filter((c) => !c.disponible || c.disponible());
  }

  function separar(texto) {
    const limpio = texto.trim().replace(/^\//, '');
    const espacio = limpio.indexOf(' ');
    return espacio === -1
      ? { nombre: limpio.toLowerCase(), arg: '' }
      : { nombre: limpio.slice(0, espacio).toLowerCase(), arg: limpio.slice(espacio + 1) };
  }

  function filtrar() {
    const { nombre } = separar(input.value);
    visibles = comandosDisponibles().filter(
      (c) => !nombre || c.nombre.startsWith(nombre) || c.descripcion.toLowerCase().includes(nombre)
    );
    seleccionado = Math.min(seleccionado, Math.max(visibles.length - 1, 0));
    lista.innerHTML = visibles.length
      ? visibles
          .map(
            (c, i) => `
          <li class="comando${i === seleccionado ? ' comando-activo' : ''}" data-indice="${i}" role="option" aria-selected="${i === seleccionado}">
            <span class="comando-nombre">/${c.nombre}${c.argumento ? ` <span class="comando-arg">${c.argumento}</span>` : ''}</span>
            <span class="comando-desc">${c.descripcion}</span>
          </li>`
          )
          .join('')
      : '<li class="comando-vacio">Ningún comando coincide. Escribe / para ver todos.</li>';
  }

  function ejecutar(indice) {
    const comando = visibles[indice];
    if (!comando) return;
    const { arg } = separar(input.value);
    cerrar();
    comando.accion(arg);
  }

  function abrir(textoInicial = '/') {
    if (document.documentElement.classList.contains('bloqueado')) return;
    overlay.hidden = false;
    input.value = textoInicial;
    seleccionado = 0;
    filtrar();
    input.focus();
    input.setSelectionRange(input.value.length, input.value.length);
  }

  function cerrar() {
    overlay.hidden = true;
  }

  function escribiendoEnCampo(el) {
    return el && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName));
  }

  function montar() {
    overlay = document.createElement('div');
    overlay.className = 'comandos-overlay';
    overlay.hidden = true;
    overlay.innerHTML = `
      <div class="comandos-caja" role="dialog" aria-modal="true" aria-label="Paleta de comandos">
        <div class="comandos-entrada">
          <span class="comandos-prompt" aria-hidden="true">&gt;</span>
          <input type="text" class="comandos-input" placeholder="Escribe un comando…" autocomplete="off" spellcheck="false" aria-label="Comando">
        </div>
        <ul class="comandos-lista" role="listbox"></ul>
        <div class="comandos-pie"><span>↑↓ navegar</span><span>↵ ejecutar</span><span>esc cerrar</span></div>
      </div>`;
    document.body.appendChild(overlay);
    input = overlay.querySelector('.comandos-input');
    lista = overlay.querySelector('.comandos-lista');

    input.addEventListener('input', () => {
      seleccionado = 0;
      filtrar();
    });
    input.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        if (!visibles.length) return;
        seleccionado = (seleccionado + (e.key === 'ArrowDown' ? 1 : -1) + visibles.length) % visibles.length;
        filtrar();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        ejecutar(seleccionado);
      } else if (e.key === 'Tab' && visibles[seleccionado]) {
        // Tab autocompleta el nombre del comando, como en la terminal
        e.preventDefault();
        input.value = `/${visibles[seleccionado].nombre} `;
        filtrar();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        cerrar();
      }
    });
    lista.addEventListener('click', (e) => {
      const item = e.target.closest('[data-indice]');
      if (item) ejecutar(Number(item.dataset.indice));
    });
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) cerrar();
    });

    const boton = document.createElement('button');
    boton.type = 'button';
    boton.className = 'comandos-btn';
    boton.title = 'Comandos (Ctrl+K o /)';
    boton.setAttribute('aria-label', 'Abrir paleta de comandos');
    boton.innerHTML = '&gt;_';
    boton.addEventListener('click', () => abrir());
    document.body.appendChild(boton);

    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (overlay.hidden) abrir();
        else cerrar();
      } else if (e.key === '/' && overlay.hidden && !escribiendoEnCampo(document.activeElement) && !document.querySelector('.modal-overlay:not([hidden])')) {
        e.preventDefault();
        abrir();
      }
    });
  }

  document.addEventListener('DOMContentLoaded', montar);
})();
