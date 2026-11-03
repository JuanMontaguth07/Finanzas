// Moni: la mascota de la app. Una alcancia-cerdito que cambia de animo segun
// como van las finanzas del mes, da consejos al tocarla y reacciona cuando se
// guarda algo (via showToast) o se completa un objetivo.
const MASCOTA_KEY = 'financeAppMascota';
const MASCOTA_SALUDO_KEY = 'financeAppMascotaSaludo';
const MASCOTA_ESTADOS = ['neutral', 'feliz', 'preocupada', 'celebrando', 'dormida'];

const MASCOTA_TIPS = [
  'Tip: anota también los gastos pequeños, son los que más se escapan. ☕',
  'Tip: separa el ahorro apenas te llegue el ingreso, no al final del mes.',
  'Tip: un presupuesto por categoría te avisa antes de que sea tarde. 📊',
  'Tip: revisa tus suscripciones, a veces pagamos cosas que ya no usamos.',
  'Tip: exporta un respaldo de vez en cuando desde Configuración. 💾',
  'Tip: ponle fecha a tus objetivos, así es más fácil cumplirlos. 🎯',
];

const MASCOTA_SVG = `
<svg viewBox="0 0 120 112" aria-hidden="true">
  <defs>
    <linearGradient id="mascota-grad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#fbcfe8"/>
      <stop offset="1" stop-color="#f472b6"/>
    </linearGradient>
  </defs>
  <ellipse class="mascota-sombra" cx="60" cy="106" rx="30" ry="4"/>
  <g class="mascota-cuerpo">
    <g class="mascota-moneda">
      <circle cx="60" cy="12" r="8" fill="#fbbf24" stroke="#d97706" stroke-width="2"/>
      <text x="60" y="15.5" text-anchor="middle" font-size="10" font-weight="800" fill="#92400e">$</text>
    </g>
    <path d="M98 64 q10 -2 8 -10 q-2 -6 -7 -2 q-4 4 2 7" fill="none" stroke="#ec4899" stroke-width="3" stroke-linecap="round"/>
    <rect x="34" y="84" width="13" height="16" rx="6" fill="#ec4899"/>
    <rect x="73" y="84" width="13" height="16" rx="6" fill="#ec4899"/>
    <path d="M34 40 L30 18 L52 31 Z" fill="#f9a8d4" stroke="#f9a8d4" stroke-width="6" stroke-linejoin="round"/>
    <path d="M86 40 L90 18 L68 31 Z" fill="#f9a8d4" stroke="#f9a8d4" stroke-width="6" stroke-linejoin="round"/>
    <ellipse cx="60" cy="62" rx="41" ry="35" fill="url(#mascota-grad)"/>
    <ellipse cx="44" cy="40" rx="11" ry="5" fill="#fff" opacity="0.4" transform="rotate(-20 44 40)"/>
    <rect x="49" y="29" width="22" height="4.5" rx="2.25" fill="#be185d" opacity="0.55"/>

    <g class="mascota-ojos">
      <circle cx="44" cy="55" r="7.5" fill="#fff"/>
      <circle cx="76" cy="55" r="7.5" fill="#fff"/>
      <g class="mascota-pupila"><circle cx="44" cy="55" r="4" fill="#2e1065"/><circle cx="45.5" cy="53.5" r="1.4" fill="#fff"/></g>
      <g class="mascota-pupila"><circle cx="76" cy="55" r="4" fill="#2e1065"/><circle cx="77.5" cy="53.5" r="1.4" fill="#fff"/></g>
    </g>
    <g class="mascota-extra mascota-ojos-cerrados" fill="none" stroke="#2e1065" stroke-width="2.5" stroke-linecap="round">
      <path d="M38 56 q6 5 12 0"/>
      <path d="M70 56 q6 5 12 0"/>
    </g>

    <ellipse cx="33" cy="70" rx="6.5" ry="3.8" fill="#fb7185" opacity="0.5"/>
    <ellipse cx="87" cy="70" rx="6.5" ry="3.8" fill="#fb7185" opacity="0.5"/>
    <ellipse cx="60" cy="70" rx="13" ry="9" fill="#f9a8d4" stroke="#db2777" stroke-opacity="0.35" stroke-width="1.5"/>
    <ellipse cx="55.5" cy="70" rx="2.2" ry="3.2" fill="#be185d"/>
    <ellipse cx="64.5" cy="70" rx="2.2" ry="3.2" fill="#be185d"/>

    <g fill="none" stroke="#2e1065" stroke-width="2.5" stroke-linecap="round">
      <path class="mascota-boca mascota-boca-neutral" d="M55 84 h10"/>
      <path class="mascota-boca mascota-boca-feliz" d="M53 83 q7 6 14 0"/>
      <path class="mascota-boca mascota-boca-preocupada" d="M53 87 q7 -5 14 0"/>
    </g>
    <path class="mascota-boca mascota-boca-celebrando" d="M52 82 q8 11 16 0 z" fill="#9f1239" stroke="#2e1065" stroke-width="2" stroke-linejoin="round"/>

    <path class="mascota-extra mascota-gota" d="M97 36 q-5 8 0 10 q5 -2 0 -10 z" fill="#7dd3fc"/>
    <g class="mascota-extra mascota-zzz" fill="#a78bfa" font-weight="800">
      <text x="94" y="32" font-size="12">z</text>
      <text x="103" y="22" font-size="9">z</text>
      <text x="110" y="14" font-size="7">z</text>
    </g>
    <g class="mascota-extra mascota-brillos" fill="#fbbf24">
      <g transform="translate(12 34)"><path class="mascota-brillo" d="M0 -7 L1.8 -1.8 L7 0 L1.8 1.8 L0 7 L-1.8 1.8 L-7 0 L-1.8 -1.8 Z"/></g>
      <g transform="translate(108 40)"><path class="mascota-brillo" d="M0 -6 L1.5 -1.5 L6 0 L1.5 1.5 L0 6 L-1.5 1.5 L-6 0 L-1.5 -1.5 Z"/></g>
      <g transform="translate(16 86)"><path class="mascota-brillo" d="M0 -5 L1.2 -1.2 L5 0 L1.2 1.2 L0 5 L-1.2 1.2 L-5 0 L-1.2 -1.2 Z"/></g>
    </g>
  </g>
</svg>`;

function mascotaVisible() {
  try {
    return localStorage.getItem(MASCOTA_KEY) !== 'oculta';
  } catch {
    return true;
  }
}

function mezclar(lista) {
  const copia = lista.slice();
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

// Calcula el animo de Moni y la lista de mensajes a partir de los datos del
// mes. Se hace aqui directamente con Storage (y no con analytics.js) porque
// no todas las paginas cargan analytics.js.
function analizarFinanzasMascota() {
  const hoy = new Date();
  const mes = currentMonthKey(hoy);
  const movimientos = Storage.getMovimientos();

  let ingresos = 0;
  let gastos = 0;
  const gastosPorCategoria = {};
  movimientos
    .filter((m) => m.fecha.startsWith(mes))
    .forEach((m) => {
      if (m.tipo === 'ingreso') ingresos += m.valor;
      if (m.tipo === 'gasto') {
        gastos += m.valor;
        gastosPorCategoria[m.categoria] = (gastosPorCategoria[m.categoria] || 0) + m.valor;
      }
    });

  const presupuestos = Storage.getPresupuestos();
  const excedidos = presupuestos.filter((p) => (gastosPorCategoria[p.categoria] || 0) > p.limite);
  const cerca = presupuestos.filter((p) => {
    const gastado = gastosPorCategoria[p.categoria] || 0;
    return gastado <= p.limite && gastado >= p.limite * 0.8;
  });

  const mensajes = [];

  if (movimientos.length === 0) {
    mensajes.push('¡Hola! Soy Moni 🐷. Registra tu primer movimiento y te ayudo a cuidar tu plata.');
  }

  if (gastos > ingresos && gastos > 0) {
    mensajes.push(
      ingresos > 0
        ? `Uy… este mes llevas ${formatCurrency(gastos - ingresos)} más en gastos que en ingresos. 😬`
        : `Este mes van ${formatCurrency(gastos)} en gastos y aún no registras ingresos.`
    );
  } else if (ingresos > 0) {
    const pct = Math.round((1 - gastos / ingresos) * 100);
    mensajes.push(`Este mes conservas el ${pct}% de lo que te entró. ¡Vas muy bien! 💪`);
  }

  excedidos.forEach((p) => {
    const meta = getCategoryMeta(p.categoria);
    const exceso = gastosPorCategoria[p.categoria] - p.limite;
    mensajes.push(`Ojo con ${meta.emoji} ${p.categoria}: ya pasaste el presupuesto por ${formatCurrency(exceso)}.`);
  });

  cerca.forEach((p) => {
    const meta = getCategoryMeta(p.categoria);
    const pct = Math.round((gastosPorCategoria[p.categoria] / p.limite) * 100);
    mensajes.push(`${meta.emoji} ${p.categoria} ya va en ${pct}% del presupuesto. ¡Con calma!`);
  });

  const objetivos = Storage.getObjetivos().map((o) => ({
    nombre: o.nombre,
    pct: Math.min(Math.round((Storage.getAhorradoObjetivo(o) / o.meta) * 100), 100),
  }));
  const completos = objetivos.filter((o) => o.pct >= 100);
  const enCurso = objetivos.filter((o) => o.pct < 100).sort((a, b) => b.pct - a.pct);
  if (enCurso.length > 0) {
    mensajes.push(`Tu objetivo "${enCurso[0].nombre}" va en ${enCurso[0].pct}%. ¡Sigue así! 🎯`);
  }
  if (completos.length > 0) {
    mensajes.push(`Ya cumpliste ${completos.length} objetivo${completos.length === 1 ? '' : 's'}. ¡Qué orgullo! 🏆`);
  }

  const diasRestantes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0).getDate() - hoy.getDate();
  mensajes.push(
    diasRestantes === 0
      ? 'Hoy es el último día del mes. ¡Buen momento para revisar cómo te fue!'
      : `Quedan ${diasRestantes} día${diasRestantes === 1 ? '' : 's'} para que termine el mes. 📅`
  );

  mensajes.push(...mezclar(MASCOTA_TIPS).slice(0, 2));

  let estado = movimientos.length === 0 ? 'neutral' : 'feliz';
  if (excedidos.length > 0 || (gastos > ingresos && gastos > 0)) estado = 'preocupada';

  const hora = hoy.getHours();
  if (hora >= 23 || hora < 6) {
    estado = 'dormida';
    mensajes.unshift('Zzz… 😴 ¿Tú tampoco duermes? Descansar también es cuidar la plata.');
  }

  return { estado, mensajes };
}

function lanzarConfeti() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const colores = ['#8b5cf6', '#ec4899', '#fbbf24', '#34d399', '#38bdf8', '#fb7185'];
  const capa = document.createElement('div');
  capa.className = 'confeti';
  for (let i = 0; i < 80; i++) {
    const pieza = document.createElement('span');
    pieza.className = 'confeti-pieza';
    pieza.style.left = `${Math.random() * 100}%`;
    pieza.style.background = colores[i % colores.length];
    pieza.style.animationDuration = `${2 + Math.random() * 1.5}s`;
    pieza.style.animationDelay = `${Math.random() * 0.4}s`;
    pieza.style.setProperty('--dx', `${(Math.random() - 0.5) * 160}px`);
    pieza.style.setProperty('--rot', `${Math.random() * 720 - 360}deg`);
    capa.appendChild(pieza);
  }
  document.body.appendChild(capa);
  setTimeout(() => capa.remove(), 4200);
}

const Mascota = {
  el: null,
  burbuja: null,
  texto: null,
  estadoBase: 'neutral',
  mensajes: [],
  indice: 0,
  timerBurbuja: null,
  timerEstado: null,
  raf: null,
  onPointerMove: null,

  montar() {
    if (this.el || !mascotaVisible()) return;

    const el = document.createElement('div');
    el.className = 'mascota';
    el.innerHTML = `
      <div class="mascota-burbuja" role="status" aria-live="polite" hidden>
        <span class="mascota-burbuja-texto"></span>
        <button type="button" class="mascota-burbuja-cerrar" aria-label="Cerrar mensaje">&times;</button>
      </div>
      <button type="button" class="mascota-btn" aria-label="Moni, tu mascota financiera. Toca para recibir un consejo" title="¡Hola! Soy Moni">${MASCOTA_SVG}</button>`;
    document.body.appendChild(el);

    this.el = el;
    this.burbuja = el.querySelector('.mascota-burbuja');
    this.texto = el.querySelector('.mascota-burbuja-texto');

    el.querySelector('.mascota-btn').addEventListener('click', () => {
      this.animar('mascota--salto');
      this.siguienteMensaje();
    });
    el.querySelector('.mascota-burbuja-cerrar').addEventListener('click', () => this.ocultarBurbuja());

    this.onPointerMove = (e) => this.seguirPuntero(e);
    document.addEventListener('pointermove', this.onPointerMove);

    this.actualizar();

    // Saluda solo una vez por sesion (no en cada cambio de pagina), y no
    // mientras la pantalla de PIN esta tapando la app.
    if (document.documentElement.classList.contains('bloqueado')) return;
    try {
      if (sessionStorage.getItem(MASCOTA_SALUDO_KEY) === 'true') return;
      sessionStorage.setItem(MASCOTA_SALUDO_KEY, 'true');
    } catch {
      // sin sessionStorage simplemente saluda
    }
    setTimeout(() => this.siguienteMensaje(), 900);
  },

  desmontar() {
    if (!this.el) return;
    document.removeEventListener('pointermove', this.onPointerMove);
    clearTimeout(this.timerBurbuja);
    clearTimeout(this.timerEstado);
    this.timerEstado = null;
    this.el.remove();
    this.el = null;
  },

  actualizar() {
    const { estado, mensajes } = analizarFinanzasMascota();
    this.estadoBase = estado;
    this.mensajes = mensajes;
    this.indice = 0;
    if (!this.timerEstado) this.aplicarEstado(estado);
  },

  aplicarEstado(estado) {
    if (!this.el) return;
    MASCOTA_ESTADOS.forEach((e) => this.el.classList.remove(`mascota--${e}`));
    this.el.classList.add(`mascota--${estado}`);
  },

  estadoTemporal(estado, ms) {
    clearTimeout(this.timerEstado);
    this.aplicarEstado(estado);
    this.timerEstado = setTimeout(() => {
      this.timerEstado = null;
      this.aplicarEstado(this.estadoBase);
    }, ms);
  },

  // Quita y vuelve a poner la clase para que la animacion se repita aunque
  // ya se haya disparado antes.
  animar(clase) {
    if (!this.el) return;
    this.el.classList.remove(clase);
    void this.el.offsetWidth;
    this.el.classList.add(clase);
  },

  mostrarMensaje(texto, ms = 7000) {
    if (!this.el) return;
    this.texto.textContent = texto;
    this.burbuja.hidden = false;
    this.burbuja.classList.remove('mascota-burbuja-pop');
    void this.burbuja.offsetWidth;
    this.burbuja.classList.add('mascota-burbuja-pop');
    clearTimeout(this.timerBurbuja);
    this.timerBurbuja = setTimeout(() => this.ocultarBurbuja(), ms);
  },

  ocultarBurbuja() {
    clearTimeout(this.timerBurbuja);
    if (this.burbuja) this.burbuja.hidden = true;
  },

  siguienteMensaje() {
    if (this.mensajes.length === 0) return;
    this.mostrarMensaje(this.mensajes[this.indice % this.mensajes.length]);
    this.indice++;
  },

  seguirPuntero(e) {
    if (this.raf) return;
    this.raf = requestAnimationFrame(() => {
      this.raf = null;
      if (!this.el) return;
      this.el.querySelectorAll('.mascota-pupila').forEach((pupila) => {
        const r = pupila.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2);
        const dy = e.clientY - (r.top + r.height / 2);
        const distancia = Math.hypot(dx, dy) || 1;
        const k = Math.min(distancia / 120, 1) * 2.6;
        pupila.setAttribute('transform', `translate(${((dx / distancia) * k).toFixed(2)} ${((dy / distancia) * k).toFixed(2)})`);
      });
    });
  },

  // Llamado desde showToast: cada vez que se guarda algo Moni salta y le cae
  // una moneda; si fue un error se sacude preocupada.
  reaccionar(tipo) {
    if (!this.el) return;
    if (tipo === 'error') {
      this.animar('mascota--sacudida');
      this.estadoTemporal('preocupada', 1800);
      return;
    }
    this.animar('mascota--salto');
    this.animar('mascota--moneda');
    this.actualizar();
  },

  celebrar(mensaje) {
    lanzarConfeti();
    if (!this.el) return;
    this.estadoTemporal('celebrando', 4500);
    this.animar('mascota--salto');
    this.animar('mascota--moneda');
    this.mostrarMensaje(mensaje, 6000);
  },
};

document.addEventListener('DOMContentLoaded', () => {
  Mascota.montar();

  const segmented = document.getElementById('mascota-segmented');
  if (!segmented) return;

  const pintar = () => {
    const actual = mascotaVisible() ? 'visible' : 'oculta';
    segmented.querySelectorAll('.segmented-option').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.mascota === actual);
    });
  };
  pintar();

  segmented.addEventListener('click', (e) => {
    const btn = e.target.closest('.segmented-option');
    if (!btn) return;
    try {
      localStorage.setItem(MASCOTA_KEY, btn.dataset.mascota);
    } catch {
      // sin localStorage la preferencia no persiste
    }
    if (btn.dataset.mascota === 'oculta') {
      Mascota.desmontar();
    } else if (!Mascota.el) {
      Mascota.montar();
      Mascota.mostrarMensaje('¡Volví! 🐷 Tócame cuando quieras un consejo.');
    }
    pintar();
  });
});
