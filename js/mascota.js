// Brote: la mascota de la app. Una planta de oficina en su maceta que cambia
// de animo segun como van las finanzas del mes (se le caen las hojas si vas
// mal, le sale una flor cuando cumples un objetivo), da consejos al tocarla y
// reacciona cuando se guarda algo (via showToast).
const MASCOTA_KEY = 'financeAppMascota';
const MASCOTA_SALUDO_KEY = 'financeAppMascotaSaludo';
const MASCOTA_POS_KEY = 'financeAppMascotaPos';
const MASCOTA_ESTADOS = ['neutral', 'feliz', 'preocupada', 'celebrando', 'dormida'];

const MASCOTA_TIPS = [
  'Tip: anota también los gastos pequeños, son los que más se escapan. ☕',
  'Tip: separa el ahorro apenas te llegue el ingreso, no al final del mes.',
  'Tip: un presupuesto por categoría te avisa antes de que sea tarde. 📊',
  'Tip: revisa tus suscripciones, a veces pagamos cosas que ya no usamos.',
  'Tip: exporta un respaldo de vez en cuando desde Configuración. 💾',
  'Tip: ponle fecha a tus objetivos, así es más fácil cumplirlos. 🎯',
  'Tip: el ahorro es como una planta: poquito pero constante. 🌱',
];

// El SVG se genera con un sufijo para los ids de los degradados, asi puede
// haber dos Brotes en la misma pagina (la flotante y la de la pantalla de PIN).
function mascotaSvg(sufijo = '') {
  return `
<svg viewBox="0 0 120 112" aria-hidden="true">
  <defs>
    <linearGradient id="mascota-maceta${sufijo}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#ffffff"/>
      <stop offset="1" stop-color="#d6deea"/>
    </linearGradient>
    <linearGradient id="mascota-borde${sufijo}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#f1f4f8"/>
      <stop offset="1" stop-color="#cdd6e2"/>
    </linearGradient>
  </defs>
  <ellipse class="mascota-sombra" cx="60" cy="106" rx="28" ry="4"/>
  <g class="mascota-cuerpo">
    <g class="mascota-hojas">
      <path d="M60 52 C60 42 59 34 60 24" fill="none" stroke="#2f7a4b" stroke-width="3" stroke-linecap="round"/>
      <g class="mascota-hoja mascota-hoja-izq">
        <path d="M58 44 C50 30 36 22 22 24 C26 38 42 46 58 44 Z" fill="#5fae7a"/>
        <path d="M56 43 Q40 34 25 25" fill="none" stroke="#3f8f5c" stroke-width="1.2" stroke-linecap="round"/>
      </g>
      <g class="mascota-hoja mascota-hoja-der">
        <path d="M62 38 C70 24 84 16 98 18 C94 32 78 40 62 38 Z" fill="#7cc795"/>
        <path d="M64 37 Q80 28 95 19" fill="none" stroke="#4f9e6b" stroke-width="1.2" stroke-linecap="round"/>
      </g>
      <g class="mascota-hoja mascota-hoja-top">
        <path d="M60 26 C52 18 54 6 61 2 C68 8 68 18 60 26 Z" fill="#4f9e6b"/>
        <path d="M60 24 Q61 14 61 5" fill="none" stroke="#3f8f5c" stroke-width="1.2" stroke-linecap="round"/>
      </g>
      <g class="mascota-extra mascota-flor">
        <circle cx="61" cy="-3" r="4.2" fill="#fff" stroke="#e8c4cc"/>
        <circle cx="66.7" cy="1.1" r="4.2" fill="#fff" stroke="#e8c4cc"/>
        <circle cx="64.5" cy="7.8" r="4.2" fill="#fff" stroke="#e8c4cc"/>
        <circle cx="57.5" cy="7.8" r="4.2" fill="#fff" stroke="#e8c4cc"/>
        <circle cx="55.3" cy="1.1" r="4.2" fill="#fff" stroke="#e8c4cc"/>
        <circle cx="61" cy="2.8" r="3.2" fill="#e8b04a"/>
      </g>
    </g>

    <g class="mascota-moneda">
      <circle cx="82" cy="14" r="7" fill="#e8b04a" stroke="#b8862a" stroke-width="1.8"/>
      <text x="82" y="17.3" text-anchor="middle" font-size="9" font-weight="800" fill="#6b4c0e">$</text>
    </g>

    <path d="M28 62 H92 L85 99 Q84 103 79 103 H41 Q36 103 35 99 Z" fill="url(#mascota-maceta${sufijo})" stroke="#c3cedb"/>
    <path d="M33.7 92 H86.3 L85.4 97 H34.6 Z" fill="#3b5e91" opacity="0.85"/>
    <path d="M34 67 Q36 79 38.5 89" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity="0.8"/>
    <rect x="24" y="50" width="72" height="13" rx="5" fill="url(#mascota-borde${sufijo})" stroke="#b8c4d3"/>
    <ellipse cx="60" cy="51.5" rx="31" ry="3" fill="#6b5140"/>

    <g class="mascota-ojos">
      <g class="mascota-pupila"><circle cx="49" cy="74" r="4.2" fill="#1f1e1d"/><circle cx="50.4" cy="72.6" r="1.4" fill="#fff"/></g>
      <g class="mascota-pupila"><circle cx="71" cy="74" r="4.2" fill="#1f1e1d"/><circle cx="72.4" cy="72.6" r="1.4" fill="#fff"/></g>
    </g>
    <g class="mascota-extra mascota-ojos-cerrados" fill="none" stroke="#1f1e1d" stroke-width="2.4" stroke-linecap="round">
      <path d="M44 75 q5 4 10 0"/>
      <path d="M66 75 q5 4 10 0"/>
    </g>

    <ellipse cx="42" cy="82" rx="5" ry="3" fill="#f4a3a8" opacity="0.5"/>
    <ellipse cx="78" cy="82" rx="5" ry="3" fill="#f4a3a8" opacity="0.5"/>

    <g fill="none" stroke="#1f1e1d" stroke-width="2.4" stroke-linecap="round">
      <path class="mascota-boca mascota-boca-neutral" d="M56 85 h8"/>
      <path class="mascota-boca mascota-boca-feliz" d="M54 83 q6 5 12 0"/>
      <path class="mascota-boca mascota-boca-preocupada" d="M54 87 q6 -4 12 0"/>
    </g>
    <path class="mascota-boca mascota-boca-celebrando" d="M53 82 q7 9 14 0 z" fill="#c2545c" stroke="#1f1e1d" stroke-width="2" stroke-linejoin="round"/>

    <path class="mascota-extra mascota-gota" d="M100 54 q-4 7 0 9 q4 -2 0 -9 z" fill="#8ab4d8"/>
    <g class="mascota-extra mascota-zzz" fill="#7ea3d4" font-weight="800">
      <text x="94" y="34" font-size="12">z</text>
      <text x="103" y="24" font-size="9">z</text>
      <text x="110" y="16" font-size="7">z</text>
    </g>
    <g class="mascota-extra mascota-brillos" fill="#e8b04a">
      <g transform="translate(12 30)"><path class="mascota-brillo" d="M0 -7 L1.8 -1.8 L7 0 L1.8 1.8 L0 7 L-1.8 1.8 L-7 0 L-1.8 -1.8 Z"/></g>
      <g transform="translate(108 44)"><path class="mascota-brillo" d="M0 -6 L1.5 -1.5 L6 0 L1.5 1.5 L0 6 L-1.5 1.5 L-6 0 L-1.5 -1.5 Z"/></g>
      <g transform="translate(14 86)"><path class="mascota-brillo" d="M0 -5 L1.2 -1.2 L5 0 L1.2 1.2 L0 5 L-1.2 1.2 L-5 0 L-1.2 -1.2 Z"/></g>
    </g>
  </g>
</svg>`;
}

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

// Calcula el animo de Brote y la lista de mensajes a partir de los datos del
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
    mensajes.push('¡Hola! Soy Brote 🌱. Registra tu primer movimiento y te ayudo a que tu plata crezca.');
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
    const pct = porcentajeProgreso(gastosPorCategoria[p.categoria], p.limite);
    mensajes.push(`${meta.emoji} ${p.categoria} ya va en ${pct}% del presupuesto. ¡Con calma!`);
  });

  const objetivos = Storage.getObjetivos().map((o) => ({
    nombre: o.nombre,
    pct: porcentajeProgreso(Storage.getAhorradoObjetivo(o), o.meta),
  }));
  const completos = objetivos.filter((o) => o.pct >= 100);
  const enCurso = objetivos.filter((o) => o.pct < 100).sort((a, b) => b.pct - a.pct);
  if (enCurso.length > 0) {
    mensajes.push(`Tu objetivo "${enCurso[0].nombre}" va en ${enCurso[0].pct}%. ¡Sigue así! 🎯`);
  }
  if (completos.length > 0) {
    mensajes.push(`Ya cumpliste ${completos.length} objetivo${completos.length === 1 ? '' : 's'}. ¡Qué orgullo! 🏆`);
  }

  // Contando hoy, igual que la pagina de Presupuestos (getDiasRestantesDelMes).
  const diasRestantes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0).getDate() - hoy.getDate() + 1;
  mensajes.push(
    diasRestantes === 1
      ? 'Hoy es el último día del mes. ¡Buen momento para revisar cómo te fue!'
      : `Quedan ${diasRestantes} días del mes, contando hoy. 📅`
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
  const colores = ['#3b5e91', '#8cb0e0', '#4f9e6b', '#9fd4ae', '#e8b04a', '#dfe6ee'];
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

const MASCOTA_PENSAMIENTOS = [
  '🎵 la la la…',
  'Revisando tus cuentas… 🔍',
  '¡Qué buena luz hay por aquí! ☀️',
  'Un pasito más cerca de tus metas. 🌱',
  '¿Ya anotaste los gastos de hoy?',
  'Estirando las hojas un ratito. 🌿',
  'Desde aquí arriba se ve todo mejor 👀',
];

const MASCOTA_AL_SOLTAR = ['¡Wiii! 🌿', '¡Qué vista desde aquí!', 'Aquí me quedo un ratito.', '¡Me mareé un poquito! 😵'];
const MASCOTA_COSQUILLAS = ['¡Jiji, cosquillas! 💚', '¡Ay, para, para! 😆', 'Me encanta que me consientas 🥰'];
const MASCOTA_REGAR = ['¡Gracias por el agua! 💧', 'Ahhh, qué rico. Crezco como tus ahorros 🌱', '¡Glu glu! Justo lo que necesitaba 💧'];
const MASCOTA_DESPIERTA = ['¡Ah! Me quedé dormida 😳', '¿Eh? Ya estoy despierta… casi 🥱'];
const MASCOTA_SALUDOS = ['¡Hola! 👋', '¡Ey, por aquí! 🌿', 'Hola de nuevo 😊'];
// Gestos que hace sola cuando esta quieta
const MASCOTA_GESTOS = ['mascota--mira', 'mascota--saluda', 'mascota--estira'];
// Elementos sobre los que se puede parar
const MASCOTA_PLATAFORMAS = '.card, .hero-balance, .resumen-filtro';
// Animacion CSS -> clase que la dispara. Al terminar se quita la clase, si no
// se quedaria pegada y taparia otras (por ejemplo los pasitos al caminar).
const MASCOTA_ANIMACIONES = {
  'mascota-salto': 'mascota--salto',
  'mascota-sacudida': 'mascota--sacudida',
  'mascota-aterriza': 'mascota--aterriza',
  'mascota-giro': 'mascota--giro',
  'mascota-tambalea': 'mascota--tambalea',
  'mascota-risa': 'mascota--risa',
  'mascota-estira': 'mascota--estira',
  'mascota-mira': 'mascota--mira',
  'mascota-saluda': 'mascota--saluda',
  'mascota-crece-izq': 'mascota--regada',
  'mascota-moneda': 'mascota--moneda',
};

function elegirAlAzar(lista) {
  return lista[Math.floor(Math.random() * lista.length)];
}

function leerPosicionMascota() {
  try {
    const pos = JSON.parse(localStorage.getItem(MASCOTA_POS_KEY));
    return pos && Number.isFinite(pos.x) ? pos : null;
  } catch {
    return null;
  }
}

function sinMovimiento() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

// Lo que dice Brote si dejas el cursor sobre una tarjeta del dashboard.
function comentarioDeTarjeta(card) {
  const valor = card.querySelector('.kpi-value, #kpi-disponible')?.textContent.trim();
  if (!valor) return null;
  if (card.querySelector('#kpi-disponible')) return `Tienes ${valor} disponibles. ¡Úsalos con cariño! 💙`;
  if (card.querySelector('#kpi-ingresos')) {
    return valor === '$ 0' ? 'No veo ingresos en este mes. ¿Ya importaste el extracto? 📄' : `Entraron ${valor}. ¡Qué bien! 💸`;
  }
  if (card.querySelector('#kpi-gastos')) {
    return valor === '$ 0' ? 'Cero gastos… ¿será verdad? 👀' : `Van ${valor} en gastos. Yo los vigilo 👀`;
  }
  if (card.querySelector('#kpi-obligaciones')) {
    return valor === '—' ? 'Si pones un límite a Obligaciones te digo cuánto falta pagar.' : `Faltan ${valor} de obligaciones por cubrir.`;
  }
  if (card.querySelector('#kpi-ahorro')) return `Llevas ${valor} ahorrados. ¡Así se crece! 🌱`;
  if (card.querySelector('#kpi-tasa-ahorro')) {
    return valor === '—' ? 'Cuando haya ingresos te digo cuánto ahorras.' : `Estás ahorrando el ${valor} de lo que entra.`;
  }
  return null;
}

const Mascota = {
  el: null,
  btn: null,
  burbuja: null,
  texto: null,
  estadoBase: 'neutral',
  mensajes: [],
  indice: 0,
  timerBurbuja: null,
  timerEstado: null,
  timerPaseo: null,
  timerGesto: null,
  timerClick: null,
  timerPresion: null,
  timerTarjeta: null,
  raf: null,
  loop: null,
  ultimoTick: 0,
  oyentes: [],

  // Posicion: x = distancia al borde izquierdo; y = altura de los pies sobre
  // el borde inferior. "superficie" es el elemento donde esta parada (null =
  // el piso). Si esta sobre una tarjeta, se mueve con ella al hacer scroll.
  x: 0,
  y: 0,
  superficie: null,
  movimiento: null,
  arrastre: null,
  suprimirClick: false,

  // Interacciones
  caricias: [],
  ultimoXCaricia: null,
  ultimaDirCaricia: 0,
  finPausaCaricia: 0,
  ultimoSaludo: 0,
  punteroLejos: true,
  ultimoScroll: 0,
  ultimoTambaleo: 0,
  comentadas: new Set(),

  montar() {
    if (this.el || !mascotaVisible()) return;

    const el = document.createElement('div');
    el.className = 'mascota';
    el.innerHTML = `
      <div class="mascota-burbuja" role="status" aria-live="polite" hidden>
        <span class="mascota-burbuja-texto"></span>
        <button type="button" class="mascota-burbuja-cerrar" aria-label="Cerrar mensaje">&times;</button>
      </div>
      <button type="button" class="mascota-btn" aria-label="Brote, tu planta financiera. Tócala para un consejo, arrástrala, acaríciala o mantenla presionada para regarla" title="¡Hola! Soy Brote. Tócame, arrástrame, acaríciame o mantenme presionada para regarme">${mascotaSvg()}</button>`;
    document.body.appendChild(el);

    this.el = el;
    this.btn = el.querySelector('.mascota-btn');
    this.burbuja = el.querySelector('.mascota-burbuja');
    this.texto = el.querySelector('.mascota-burbuja-texto');

    // Un toque muestra un consejo; dos toques seguidos la hacen girar.
    this.btn.addEventListener('click', () => {
      if (this.suprimirClick) return;
      clearTimeout(this.timerClick);
      this.timerClick = setTimeout(() => this.alTocar(), 230);
    });
    this.btn.addEventListener('dblclick', (e) => {
      e.preventDefault();
      clearTimeout(this.timerClick);
      this.girar();
    });
    this.btn.addEventListener('pointerdown', (e) => this.iniciarArrastre(e));
    this.btn.addEventListener('pointermove', (e) => {
      this.moverArrastre(e);
      if (e.buttons === 0) this.detectarCaricia(e);
    });
    this.btn.addEventListener('pointerup', (e) => this.soltarArrastre(e));
    this.btn.addEventListener('pointercancel', (e) => this.soltarArrastre(e));
    this.btn.addEventListener('pointerleave', () => {
      this.caricias = [];
      this.ultimoXCaricia = null;
    });
    el.querySelector('.mascota-burbuja-cerrar').addEventListener('click', () => this.ocultarBurbuja());
    el.addEventListener('animationend', (e) => {
      const clase = MASCOTA_ANIMACIONES[e.animationName];
      if (clase) el.classList.remove(clase);
    });

    this.escuchar(document, 'pointermove', (e) => this.seguirPuntero(e));
    this.escuchar(window, 'scroll', () => this.alHacerScroll(), { passive: true });
    this.escuchar(document, 'pointerover', (e) => this.alPasarSobreTarjeta(e));
    this.escuchar(document, 'pointerout', (e) => {
      if (e.target.closest?.('.kpi-card, .hero-balance')) clearTimeout(this.timerTarjeta);
    });

    const guardada = leerPosicionMascota();
    this.x = guardada ? guardada.x : this.posicionInicial();
    this.y = this.alturaSuperficie(null);
    this.aplicarPosicion();

    this.actualizar();
    this.programarPaseo();
    this.programarGesto();
    this.ultimoTick = performance.now();
    this.loop = requestAnimationFrame((t) => this.tick(t));

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

  escuchar(objetivo, evento, fn, opciones) {
    objetivo.addEventListener(evento, fn, opciones);
    this.oyentes.push(() => objetivo.removeEventListener(evento, fn, opciones));
  },

  desmontar() {
    if (!this.el) return;
    this.oyentes.forEach((quitar) => quitar());
    this.oyentes = [];
    cancelAnimationFrame(this.loop);
    [this.timerBurbuja, this.timerEstado, this.timerPaseo, this.timerGesto, this.timerClick, this.timerPresion, this.timerTarjeta].forEach(clearTimeout);
    this.timerEstado = null;
    this.movimiento = null;
    this.arrastre = null;
    this.superficie = null;
    this.el.remove();
    this.el = null;
  },

  // ---- Superficies (piso y tarjetas) ----
  esMovil() {
    return window.matchMedia('(max-width: 768px)').matches;
  },

  ancho() {
    return this.btn.offsetWidth || 92;
  },

  alto() {
    return this.btn.offsetHeight || 86;
  },

  // En movil el piso queda encima de la barra de navegacion inferior.
  alturaPiso() {
    return this.esMovil() ? 74 : 12;
  },

  alturaSuperficie(sup) {
    return sup ? window.innerHeight - sup.getBoundingClientRect().top : this.alturaPiso();
  },

  rangoX(sup) {
    if (!sup) return { min: 8, max: Math.max(8, window.innerWidth - this.ancho() - 8) };
    const r = sup.getBoundingClientRect();
    return { min: r.left + 6, max: Math.max(r.left + 6, r.right - this.ancho() - 6) };
  },

  // Una tarjeta sirve de plataforma si se ve en pantalla, cabe Brote encima
  // y no esta dentro de un modal o de la paleta de comandos.
  esPlataformaValida(el) {
    if (!el || !el.isConnected || el.offsetParent === null) return false;
    if (el.closest('.modal-overlay, .pin-lock-overlay, .comandos-overlay, .sidebar')) return false;
    const r = el.getBoundingClientRect();
    return r.width > this.ancho() + 30 && r.top > this.alto() * 0.6 && r.top < window.innerHeight - 30;
  },

  plataformasVisibles() {
    return Array.from(document.querySelectorAll(MASCOTA_PLATAFORMAS)).filter((p) => p !== this.superficie && this.esPlataformaValida(p));
  },

  // La superficie mas cercana justo debajo de Brote (para caer sobre ella).
  superficieDebajo() {
    const centro = this.x + this.ancho() / 2;
    const pies = window.innerHeight - this.y;
    let mejor = null;
    let mejorTop = Infinity;
    document.querySelectorAll(MASCOTA_PLATAFORMAS).forEach((p) => {
      if (!this.esPlataformaValida(p)) return;
      const r = p.getBoundingClientRect();
      if (centro > r.left && centro < r.right && r.top >= pies - 4 && r.top < mejorTop) {
        mejor = p;
        mejorTop = r.top;
      }
    });
    return mejor;
  },

  posicionInicial() {
    return this.esMovil() ? window.innerWidth - this.ancho() - 10 : 28;
  },

  aplicarPosicion() {
    const transform = `translate3d(${this.x.toFixed(1)}px, ${(-this.y).toFixed(1)}px, 0)`;
    if (this.el.style.transform !== transform) this.el.style.transform = transform;
    this.el.classList.toggle('mascota--lado-der', this.x + this.ancho() / 2 > window.innerWidth / 2);
    // Si esta muy arriba, el globo se muestra debajo para que no se salga de la pantalla.
    this.el.classList.toggle('mascota--burbuja-abajo', window.innerHeight - this.y - this.alto() < 110);
  },

  guardarPosicion() {
    try {
      localStorage.setItem(MASCOTA_POS_KEY, JSON.stringify({ x: Math.round(this.x) }));
    } catch {
      // sin localStorage la posicion no persiste entre paginas
    }
  },

  // ---- Bucle de animacion: camina, salta, cae y sigue a su tarjeta ----
  tick(ahora) {
    this.loop = requestAnimationFrame((t) => this.tick(t));
    const dt = Math.min((ahora - this.ultimoTick) / 1000, 0.05);
    this.ultimoTick = ahora;
    if (this.arrastre?.activo) return;

    // Si su tarjeta desaparece o sale de la pantalla, se cae.
    if (this.superficie && !this.movimiento && !this.esPlataformaValida(this.superficie)) {
      this.superficie = null;
      this.caer();
    }

    const m = this.movimiento;
    if (m) {
      this.avanzar(m, dt);
    } else {
      this.y = this.alturaSuperficie(this.superficie);
      const rango = this.rangoX(this.superficie);
      this.x = Math.min(Math.max(this.x, rango.min), rango.max);
    }
    this.aplicarPosicion();
  },

  avanzar(m, dt) {
    if (m.tipo === 'caminar') {
      const paso = 70 * dt;
      const falta = m.destinoX - this.x;
      this.x += Math.abs(falta) <= paso ? falta : Math.sign(falta) * paso;
      this.y = this.alturaSuperficie(this.superficie);
      if (this.superficie && !this.esPlataformaValida(this.superficie)) {
        this.superficie = null;
        this.caer();
        return;
      }
      if (Math.abs(m.destinoX - this.x) < 0.5) this.terminarMovimiento();
      return;
    }

    // Saltar o caer: el destino se recalcula en cada cuadro por si hay scroll.
    if (m.hacia && !this.esPlataformaValida(m.hacia)) {
      m.hacia = null;
      m.destinoX = Math.min(Math.max(m.destinoX, this.rangoX(null).min), this.rangoX(null).max);
    }
    m.t = Math.min(m.t + dt / m.duracion, 1);
    const yFin = this.alturaSuperficie(m.hacia);
    this.x = m.desdeX + (m.destinoX - m.desdeX) * m.t;
    if (m.tipo === 'caer') {
      this.y = m.desdeY + (yFin - m.desdeY) * m.t * m.t;
    } else {
      this.y = m.desdeY + (yFin - m.desdeY) * m.t + m.altura * 4 * m.t * (1 - m.t);
    }
    if (m.t >= 1) {
      this.superficie = m.hacia;
      this.y = yFin;
      this.animar('mascota--aterriza');
      this.terminarMovimiento();
    }
  },

  caminarA(destinoX) {
    const rango = this.rangoX(this.superficie);
    const destino = Math.min(Math.max(destinoX, rango.min), rango.max);
    if (Math.abs(destino - this.x) < 2) return false;
    this.el.classList.toggle('mascota--izq', destino < this.x);
    this.el.classList.add('mascota--caminando');
    this.movimiento = { tipo: 'caminar', destinoX: destino };
    return true;
  },

  saltarA(hacia, destinoX) {
    const rango = this.rangoX(hacia);
    const destino = Math.min(Math.max(destinoX, rango.min), rango.max);
    const distancia = Math.hypot(destino - this.x, this.alturaSuperficie(hacia) - this.y);
    this.el.classList.toggle('mascota--izq', destino < this.x);
    this.el.classList.remove('mascota--caminando');
    this.el.classList.add('mascota--saltando');
    this.movimiento = {
      tipo: 'saltar',
      hacia,
      desdeX: this.x,
      desdeY: this.y,
      destinoX: destino,
      t: 0,
      duracion: Math.min(Math.max(distancia / 650, 0.45), 0.95),
      altura: Math.min(70 + distancia * 0.12, 170),
    };
  },

  // Cae con gravedad sobre lo que haya debajo (una tarjeta o el piso).
  caer() {
    const hacia = this.superficieDebajo();
    const caida = Math.abs(this.y - this.alturaSuperficie(hacia));
    this.el.classList.remove('mascota--caminando');
    this.el.classList.add('mascota--saltando');
    this.movimiento = {
      tipo: 'caer',
      hacia,
      desdeX: this.x,
      desdeY: this.y,
      destinoX: this.x,
      t: 0,
      duracion: Math.min(Math.max(Math.sqrt(caida) / 24, 0.2), 0.8),
    };
  },

  terminarMovimiento() {
    this.movimiento = null;
    this.el.classList.remove('mascota--caminando', 'mascota--saltando');
    this.guardarPosicion();
    if (Math.random() < 0.25 && this.burbuja.hidden) this.mostrarMensaje(elegirAlAzar(MASCOTA_PENSAMIENTOS), 3500);
    this.programarPaseo();
  },

  detenerse() {
    if (this.movimiento?.tipo === 'caminar') this.terminarMovimiento();
  },

  // ---- Paseos: cada cierto tiempo camina o salta a otra tarjeta ----
  programarPaseo() {
    clearTimeout(this.timerPaseo);
    if (!this.el || sinMovimiento()) return;
    this.timerPaseo = setTimeout(() => this.pasear(), 7000 + Math.random() * 11000);
  },

  pasear() {
    if (!this.el) return;
    const ocupada =
      this.movimiento ||
      this.arrastre ||
      !this.burbuja.hidden ||
      document.hidden ||
      this.el.classList.contains('mascota--dormida') ||
      document.documentElement.classList.contains('bloqueado');
    if (ocupada) {
      this.programarPaseo();
      return;
    }

    const azar = Math.random();
    const plataformas = this.plataformasVisibles();
    if (this.superficie && azar < 0.3) {
      // bajarse de la tarjeta al piso
      this.saltarA(null, this.x + (Math.random() - 0.5) * 240);
    } else if (plataformas.length && azar < 0.65) {
      const destino = elegirAlAzar(plataformas);
      const rango = this.rangoX(destino);
      this.saltarA(destino, rango.min + Math.random() * (rango.max - rango.min));
    } else {
      const rango = this.rangoX(this.superficie);
      let destino = rango.min + Math.random() * (rango.max - rango.min);
      if (Math.abs(destino - this.x) < 80) destino = this.x > (rango.min + rango.max) / 2 ? this.x - 160 : this.x + 160;
      if (!this.caminarA(destino)) this.programarPaseo();
    }
  },

  // ---- Gestos sueltos (mirar alrededor, saludar con una hoja, estirarse) ----
  programarGesto() {
    clearTimeout(this.timerGesto);
    if (!this.el || sinMovimiento()) return;
    this.timerGesto = setTimeout(() => {
      if (this.el && !this.movimiento && !this.arrastre && !this.el.classList.contains('mascota--dormida')) {
        this.animar(elegirAlAzar(MASCOTA_GESTOS));
      }
      this.programarGesto();
    }, 5000 + Math.random() * 7000);
  },

  // ---- Arrastrar, mantener presionado (regar) ----
  iniciarArrastre(e) {
    if (e.button !== 0) return;
    this.btn.setPointerCapture(e.pointerId);
    this.arrastre = { id: e.pointerId, inicioX: e.clientX, inicioY: e.clientY, origenX: this.x, origenY: this.y, activo: false, regando: false };
    clearTimeout(this.timerPresion);
    this.timerPresion = setTimeout(() => {
      if (this.arrastre && !this.arrastre.activo) {
        this.arrastre.regando = true;
        this.regar();
      }
    }, 600);
  },

  moverArrastre(e) {
    const a = this.arrastre;
    if (!a || e.pointerId !== a.id || a.regando) return;
    const dx = e.clientX - a.inicioX;
    const dy = e.clientY - a.inicioY;
    if (!a.activo) {
      if (Math.hypot(dx, dy) < 6) return;
      a.activo = true;
      clearTimeout(this.timerPresion);
      this.movimiento = null;
      this.superficie = null;
      this.el.classList.remove('mascota--caminando', 'mascota--saltando');
      a.origenX = this.x;
      a.origenY = this.y;
      this.ocultarBurbuja();
      this.el.classList.add('mascota--arrastrando');
    }
    this.el.classList.toggle('mascota--izq', dx < 0);
    this.x = Math.min(Math.max(a.origenX + dx, 0), window.innerWidth - this.ancho());
    this.y = Math.min(Math.max(a.origenY - dy, this.alturaPiso()), window.innerHeight - this.alto());
    this.aplicarPosicion();
  },

  soltarArrastre(e) {
    const a = this.arrastre;
    if (!a || e.pointerId !== a.id) return;
    this.arrastre = null;
    clearTimeout(this.timerPresion);
    if (!a.activo && !a.regando) return;

    // El navegador dispara "click" justo despues de soltar: no debe contar como toque.
    this.suprimirClick = true;
    setTimeout(() => {
      this.suprimirClick = false;
    }, 0);
    if (a.regando) return;

    this.el.classList.remove('mascota--arrastrando');
    // Al soltarla cae sobre la tarjeta (o el piso) que tenga debajo.
    this.caer();
    if (Math.random() < 0.5) this.mostrarMensaje(elegirAlAzar(MASCOTA_AL_SOLTAR), 3000);
  },

  // ---- Interacciones ----
  alTocar() {
    this.detenerse();
    if (this.el.classList.contains('mascota--dormida')) {
      this.estadoTemporal('feliz', 8000);
      this.animar('mascota--salto');
      this.mostrarMensaje(elegirAlAzar(MASCOTA_DESPIERTA), 4000);
      return;
    }
    this.animar('mascota--salto');
    this.siguienteMensaje();
    this.programarPaseo();
  },

  girar() {
    this.detenerse();
    this.animar('mascota--giro');
    if (Math.random() < 0.6) this.mostrarMensaje('¡Wiii! 🌀', 2000);
  },

  // Pasar el cursor de lado a lado sobre Brote varias veces = cosquillas.
  detectarCaricia(e) {
    const ahora = performance.now();
    if (this.ultimoXCaricia !== null) {
      const dx = e.clientX - this.ultimoXCaricia;
      if (Math.abs(dx) > 2) {
        const dir = Math.sign(dx);
        if (this.ultimaDirCaricia && dir !== this.ultimaDirCaricia) this.caricias.push(ahora);
        this.ultimaDirCaricia = dir;
      }
    }
    this.ultimoXCaricia = e.clientX;
    this.caricias = this.caricias.filter((t) => ahora - t < 1200);
    if (this.caricias.length >= 4 && ahora > this.finPausaCaricia) {
      this.caricias = [];
      this.finPausaCaricia = ahora + 5000;
      this.cosquillas();
    }
  },

  cosquillas() {
    this.detenerse();
    this.estadoTemporal('feliz', 3500);
    this.animar('mascota--risa');
    this.lanzarParticulas(['💚', '💙', '🤍', '💚', '💙'], 'mascota-corazon', 1400);
    this.mostrarMensaje(elegirAlAzar(MASCOTA_COSQUILLAS), 3000);
  },

  regar() {
    this.detenerse();
    this.estadoTemporal('feliz', 4000);
    const nube = document.createElement('span');
    nube.className = 'mascota-nube';
    nube.textContent = '🌧️';
    this.el.appendChild(nube);
    this.lanzarParticulas(['', '', '', '', '', '', ''], 'mascota-agua', 1300);
    setTimeout(() => nube.remove(), 1900);
    setTimeout(() => {
      this.animar('mascota--regada');
      this.mostrarMensaje(elegirAlAzar(MASCOTA_REGAR), 3500);
    }, 900);
  },

  // Crea elementos sueltos (corazones, gotas) que se animan y desaparecen.
  lanzarParticulas(contenidos, clase, duracion) {
    if (!this.el) return;
    contenidos.forEach((contenido, i) => {
      const p = document.createElement('span');
      p.className = clase;
      p.textContent = contenido;
      p.style.setProperty('--dx', `${(Math.random() - 0.5) * 60}px`);
      p.style.left = `${30 + Math.random() * 40}%`;
      p.style.animationDelay = `${i * 0.12}s`;
      this.el.appendChild(p);
      setTimeout(() => p.remove(), duracion + i * 120);
    });
  },

  alHacerScroll() {
    const ahora = performance.now();
    const delta = Math.abs(window.scrollY - (this.scrollPrevio ?? window.scrollY));
    this.scrollPrevio = window.scrollY;
    const rapido = delta > 90 && ahora - this.ultimoScroll < 120;
    this.ultimoScroll = ahora;
    if (rapido && !this.movimiento && ahora - this.ultimoTambaleo > 800) {
      this.ultimoTambaleo = ahora;
      this.animar('mascota--tambalea');
    }
  },

  // Si dejas el cursor sobre una cifra del dashboard, Brote la comenta y a
  // veces salta encima de esa tarjeta.
  alPasarSobreTarjeta(e) {
    const card = e.target.closest?.('.kpi-card, .hero-balance');
    if (!card || this.comentadas.has(card)) return;
    clearTimeout(this.timerTarjeta);
    this.timerTarjeta = setTimeout(() => {
      if (!this.el || this.arrastre || this.movimiento || !this.burbuja.hidden) return;
      const texto = comentarioDeTarjeta(card);
      if (!texto) return;
      this.comentadas.add(card);
      this.mostrarMensaje(texto, 4500);
      if (!sinMovimiento() && Math.random() < 0.25 && this.esPlataformaValida(card) && card !== this.superficie) {
        const rango = this.rangoX(card);
        this.saltarA(card, (rango.min + rango.max) / 2);
      }
    }, 1400);
  },

  // ---- Animo y mensajes ----
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
      // Si esta mirando a la izquierda el SVG esta espejado, asi que el eje X va al reves.
      const giro = this.el.classList.contains('mascota--izq') ? -1 : 1;
      this.el.querySelectorAll('.mascota-pupila').forEach((pupila) => {
        const r = pupila.getBoundingClientRect();
        const dx = (e.clientX - (r.left + r.width / 2)) * giro;
        const dy = e.clientY - (r.top + r.height / 2);
        const distancia = Math.hypot(dx, dy) || 1;
        const k = Math.min(distancia / 120, 1) * 2.6;
        pupila.setAttribute('transform', `translate(${((dx / distancia) * k).toFixed(2)} ${((dy / distancia) * k).toFixed(2)})`);
      });

      // Saluda con una hoja cuando acercas el cursor despues de un rato lejos.
      const r = this.btn.getBoundingClientRect();
      const cerca = Math.hypot(e.clientX - (r.left + r.width / 2), e.clientY - (r.top + r.height / 2));
      if (cerca > 350) this.punteroLejos = true;
      const ahora = performance.now();
      if (cerca < 160 && this.punteroLejos && ahora - this.ultimoSaludo > 25000 && !this.movimiento && !this.arrastre) {
        this.punteroLejos = false;
        this.ultimoSaludo = ahora;
        this.animar('mascota--saluda');
        if (this.burbuja.hidden && Math.random() < 0.4) this.mostrarMensaje(elegirAlAzar(MASCOTA_SALUDOS), 2500);
      }
    });
  },

  // Llamado desde showToast: cada vez que se guarda algo Brote salta y le cae
  // una moneda en la maceta; si fue un error se sacude preocupada.
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
    this.detenerse();
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
      Mascota.mostrarMensaje('¡Volví! 🌱 Tócame cuando quieras un consejo.');
    }
    pintar();
  });
});
