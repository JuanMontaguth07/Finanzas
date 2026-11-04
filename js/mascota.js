// Brote: la mascota de la app. Una planta de oficina en su maceta que cambia
// de animo segun como van las finanzas del mes (se le caen las hojas si vas
// mal, le sale una flor cuando cumples un objetivo), da consejos al tocarla y
// reacciona cuando se guarda algo (via showToast).
const MASCOTA_KEY = 'financeAppMascota';
const MASCOTA_SALUDO_KEY = 'financeAppMascotaSaludo';
const MASCOTA_POS_KEY = 'financeAppMascotaPos';
const MASCOTA_ESTADOS = ['neutral', 'feliz', 'preocupada', 'celebrando', 'dormida', 'mareada', 'sediento'];

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
// Un ojo con todas sus variantes (se elige cual se ve con clases CSS). Todo va
// dentro de .mascota-pupila para que siga al cursor junto con la pupila.
// lado: -1 ojo izquierdo, 1 ojo derecho (las pestañas van hacia afuera).
function ojoMascota(x, lado) {
  const p = (dx) => x + dx * lado;
  return `<g class="mascota-pupila">
        <circle class="ojo-base" cx="${x}" cy="74" r="4.2" fill="#1f1e1d"/>
        <circle class="ojo-base" cx="${x + 1.4}" cy="72.6" r="1.4" fill="#fff"/>
        <path class="ojo-corazon" d="M${x} 77.8 C${x - 5.6} 74 ${x - 4.6} 69.4 ${x - 1.6} 70.4 C${x - 0.6} 70.8 ${x} 71.6 ${x} 72.2 C${x} 71.6 ${x + 0.6} 70.8 ${x + 1.6} 70.4 C${x + 4.6} 69.4 ${x + 5.6} 74 ${x} 77.8 Z" fill="#e0475f"/>
        <path class="ojo-brillo" d="M${x - 1.6} 74.4 l0.6 -1.3 l0.6 1.3 l1.3 0.6 l-1.3 0.6 l-0.6 1.3 l-0.6 -1.3 l-1.3 -0.6 z" fill="#fff"/>
        <path class="ojo-pestanas" d="M${p(3.4)} 70.8 l${2.4 * lado} -1.8 M${p(1.8)} 69.6 l${1.3 * lado} -2.6 M${p(-0.2)} 69.4 l${0.3 * lado} -2.9" fill="none" stroke="#1f1e1d" stroke-width="1.3" stroke-linecap="round"/>
      </g>`;
}

// Patrones de la maceta (lunares, rayas, estrellas, corazones), recortados con
// la forma de la maceta. Se colorean con la franja (ver CSS .mascota-patron).
function patronesMascota(sufijo) {
  const lunares = [];
  for (let fila = 0, y = 66; y <= 101; y += 8.5, fila++) {
    for (let x = 30 + (fila % 2) * 5; x <= 92; x += 10) lunares.push(`<circle cx="${x}" cy="${y}" r="2.1"/>`);
  }
  const rayas = [];
  for (let i = -44; i < 72; i += 9) rayas.push(`<path d="M${28 + i} 106 L${50 + i} 58"/>`);
  const puntos = [[34, 68], [86, 67], [40, 96], [80, 97], [30, 83], [90, 84], [60, 100], [47, 65], [73, 65]];
  const estrellas = puntos.map(([x, y]) => `<path d="M${x} ${y - 3} l0.9 2.1 l2.1 0.9 l-2.1 0.9 l-0.9 2.1 l-0.9 -2.1 l-2.1 -0.9 l2.1 -0.9 z"/>`);
  const corazones = puntos.map(([x, y]) => `<path d="M${x} ${y + 2.4} C${x - 3.6} ${y} ${x - 3} ${y - 3} ${x - 1} ${y - 2.4} C${x - 0.4} ${y - 2.1} ${x} ${y - 1.6} ${x} ${y - 1.2} C${x} ${y - 1.6} ${x + 0.4} ${y - 2.1} ${x + 1} ${y - 2.4} C${x + 3} ${y - 3} ${x + 3.6} ${y} ${x} ${y + 2.4} Z"/>`);
  return `<g class="mascota-patron" clip-path="url(#mascota-clip${sufijo})">
      <g class="patron patron-lunares">${lunares.join('')}</g>
      <g class="patron patron-rayas">${rayas.join('')}</g>
      <g class="patron patron-estrellas">${estrellas.join('')}</g>
      <g class="patron patron-corazones">${corazones.join('')}</g>
    </g>`;
}

function mascotaSvg(sufijo = '') {
  return `
<svg viewBox="0 0 120 112" aria-hidden="true">
  <defs>
    <linearGradient id="mascota-maceta${sufijo}" x1="0" y1="0" x2="1" y2="1">
      <stop class="tinte-maceta-1" offset="0" stop-color="#ffffff"/>
      <stop class="tinte-maceta-2" offset="1" stop-color="#d6deea"/>
    </linearGradient>
    <linearGradient id="mascota-borde${sufijo}" x1="0" y1="0" x2="0" y2="1">
      <stop class="tinte-borde-1" offset="0" stop-color="#f1f4f8"/>
      <stop class="tinte-borde-2" offset="1" stop-color="#cdd6e2"/>
    </linearGradient>
    <clipPath id="mascota-clip${sufijo}">
      <path d="M28 62 H92 L85 99 Q84 103 79 103 H41 Q36 103 35 99 Z"/>
    </clipPath>
  </defs>
  <ellipse class="mascota-sombra" cx="60" cy="109.5" rx="28" ry="3.6"/>
  <g class="mascota-cuerpo">
    <g class="mascota-hojas">
      <path class="tinte-tallo" d="M60 52 C60 42 59 34 60 24" fill="none" stroke="#2f7a4b" stroke-width="3" stroke-linecap="round"/>
      <g class="mascota-hoja mascota-hoja-izq">
        <path class="tinte-hoja-1" d="M58 44 C50 30 36 22 22 24 C26 38 42 46 58 44 Z" fill="#5fae7a"/>
        <path d="M56 43 Q40 34 25 25" fill="none" stroke="#3f8f5c" stroke-width="1.2" stroke-linecap="round"/>
      </g>
      <g class="mascota-hoja mascota-hoja-der">
        <path class="tinte-hoja-2" d="M62 38 C70 24 84 16 98 18 C94 32 78 40 62 38 Z" fill="#7cc795"/>
        <path d="M64 37 Q80 28 95 19" fill="none" stroke="#4f9e6b" stroke-width="1.2" stroke-linecap="round"/>
      </g>
      <g class="mascota-hoja mascota-hoja-top">
        <path class="tinte-hoja-3" d="M60 26 C52 18 54 6 61 2 C68 8 68 18 60 26 Z" fill="#4f9e6b"/>
        <path d="M60 24 Q61 14 61 5" fill="none" stroke="#3f8f5c" stroke-width="1.2" stroke-linecap="round"/>
      </g>
      <!-- Partes que aparecen al subir de nivel (js/mascota-vida.js) -->
      <g class="mascota-nivel mascota-n2">
        <path class="tinte-hoja-2" d="M60 50 C55 45 48 44 43 46 C47 51 54 52 60 50 Z" fill="#7cc795"/>
        <path class="tinte-hoja-1" d="M60 49 C65 44 72 43 77 45 C73 50 66 51 60 49 Z" fill="#6fbf8a"/>
      </g>
      <g class="mascota-nivel mascota-n3 mascota-capullo">
        <ellipse cx="61" cy="-1" rx="3.8" ry="5.4" fill="#f4a3b8"/>
        <path d="M57.4 1.5 Q61 6 64.6 1.5 Q63 5.5 61 6.5 Q59 5.5 57.4 1.5 Z" fill="#4f9e6b"/>
      </g>
      <g class="mascota-nivel mascota-n5">
        <path d="M96 20 V28 M24 26 V33" stroke="#2f7a4b" stroke-width="1.4" stroke-linecap="round"/>
        <circle cx="96" cy="32" r="4.8" fill="#e8b04a" stroke="#b8862a" stroke-width="1.2"/>
        <circle cx="24" cy="37" r="4.8" fill="#e8b04a" stroke="#b8862a" stroke-width="1.2"/>
        <text x="96" y="34.6" text-anchor="middle" font-size="6.5" font-weight="800" fill="#6b4c0e">$</text>
        <text x="24" y="39.6" text-anchor="middle" font-size="6.5" font-weight="800" fill="#6b4c0e">$</text>
      </g>
      <g class="mascota-extra mascota-flor">
        <circle cx="61" cy="-3" r="4.2" fill="#fff" stroke="#e8c4cc"/>
        <circle cx="66.7" cy="1.1" r="4.2" fill="#fff" stroke="#e8c4cc"/>
        <circle cx="64.5" cy="7.8" r="4.2" fill="#fff" stroke="#e8c4cc"/>
        <circle cx="57.5" cy="7.8" r="4.2" fill="#fff" stroke="#e8c4cc"/>
        <circle cx="55.3" cy="1.1" r="4.2" fill="#fff" stroke="#e8c4cc"/>
        <circle cx="61" cy="2.8" r="3.2" fill="#e8b04a"/>
      </g>
      <g class="mascota-acc mascota-acc-corona">
        <path d="M51 -7 L51 -17 L56 -11.5 L61 -19 L66 -11.5 L71 -17 L71 -7 Z" fill="#f2c94c" stroke="#b8862a" stroke-width="1.2" stroke-linejoin="round"/>
        <circle cx="61" cy="-10.5" r="1.6" fill="#d64545"/>
        <circle cx="55" cy="-9.5" r="1.1" fill="#5a80b8"/>
        <circle cx="67" cy="-9.5" r="1.1" fill="#5a80b8"/>
      </g>
      <g class="mascota-acc mascota-acc-halo">
        <ellipse cx="61" cy="-12" rx="11" ry="3.2" fill="none" stroke="#f2c94c" stroke-width="2.6"/>
        <ellipse cx="61" cy="-12" rx="11" ry="3.2" fill="none" stroke="#fff6c9" stroke-width="0.9"/>
      </g>
    </g>

    <g class="mascota-moneda">
      <circle cx="82" cy="14" r="7" fill="#e8b04a" stroke="#b8862a" stroke-width="1.8"/>
      <text x="82" y="17.3" text-anchor="middle" font-size="9" font-weight="800" fill="#6b4c0e">$</text>
    </g>

    <!-- Patitas: van antes de la maceta para que asomen por debajo -->
    <g class="mascota-pata mascota-pata-izq">
      <ellipse cx="46" cy="104.6" rx="7.6" ry="4.7" fill="#f8fafc" stroke="#b8c4d3" stroke-width="1.4"/>
      <ellipse cx="44.2" cy="106.4" rx="2.5" ry="1.4" fill="#f4a3a8" opacity="0.65"/>
    </g>
    <g class="mascota-pata mascota-pata-der">
      <ellipse cx="74" cy="104.6" rx="7.6" ry="4.7" fill="#f8fafc" stroke="#b8c4d3" stroke-width="1.4"/>
      <ellipse cx="75.8" cy="106.4" rx="2.5" ry="1.4" fill="#f4a3a8" opacity="0.65"/>
    </g>

    <path d="M28 62 H92 L85 99 Q84 103 79 103 H41 Q36 103 35 99 Z" fill="url(#mascota-maceta${sufijo})" stroke="#c3cedb"/>
    ${patronesMascota(sufijo)}
    <path class="tinte-franja" d="M33.7 92 H86.3 L85.4 97 H34.6 Z" fill="#3b5e91" opacity="0.85"/>
    <path d="M34 67 Q36 79 38.5 89" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity="0.8"/>
    <g class="mascota-acc mascota-acc-bufanda">
      <path d="M29.5 62 H90.5 L89.4 69 H30.6 Z" fill="#d64545"/>
      <path d="M36 62 V69 M44 62 V69 M52 62 V69 M60 62 V69 M68 62 V69 M76 62 V69 M84 62 V69" stroke="#fff" stroke-opacity="0.35" stroke-width="2"/>
      <path d="M77 66 L81 83 L75 84.5 L72 67 Z" fill="#c23b3b"/>
    </g>
    <rect x="24" y="50" width="72" height="13" rx="5" fill="url(#mascota-borde${sufijo})" stroke="#b8c4d3"/>
    <ellipse cx="60" cy="51.5" rx="31" ry="3" fill="#6b5140"/>

    <!-- Gorro: de dormir en modo noche, navideño en diciembre -->
    <g class="mascota-gorro">
      <path class="mascota-gorro-tela" d="M25 52 C27 40 22 30 12 26 C24 26 36 36 47 50 Z"/>
      <circle class="mascota-gorro-estrella" cx="28" cy="40" r="1.1"/>
      <circle class="mascota-gorro-estrella" cx="35" cy="45" r="0.9"/>
      <path class="mascota-gorro-borde" d="M23 53 Q36 47 49 51" fill="none" stroke-width="5" stroke-linecap="round"/>
      <circle class="mascota-gorro-pompon" cx="12" cy="26" r="4.2"/>
    </g>
    <g class="mascota-acc mascota-acc-copa" transform="rotate(-12 38 49)">
      <rect x="29" y="29" width="18" height="19" rx="2" fill="#1f2937"/>
      <rect x="29" y="41.5" width="18" height="3.6" fill="#d64545"/>
      <ellipse cx="38" cy="48.5" rx="13" ry="3" fill="#111827"/>
    </g>
    <g class="mascota-acc mascota-acc-gorra" transform="rotate(-10 38 48)">
      <path d="M26 49 Q27 34 39 34 Q51 34 51 49 Z" fill="#3b82f6"/>
      <path d="M26 49 Q18 49 13 52.5 Q24 53.5 34 50 Z" fill="#1d4ed8"/>
      <circle cx="39" cy="34.6" r="1.9" fill="#1d4ed8"/>
    </g>
    <g class="mascota-acc mascota-acc-audifonos">
      <path d="M26 70 Q23 35 60 32 Q97 35 94 70" fill="none" stroke="#334155" stroke-width="3.6" stroke-linecap="round"/>
      <rect x="20.5" y="64" width="9.5" height="15" rx="4.5" fill="#1f2937"/>
      <rect x="90" y="64" width="9.5" height="15" rx="4.5" fill="#1f2937"/>
      <rect x="22.2" y="66.8" width="2.8" height="9.4" rx="1.4" fill="#8cb0e0"/>
      <rect x="95" y="66.8" width="2.8" height="9.4" rx="1.4" fill="#8cb0e0"/>
    </g>

    <g class="mascota-ojos">
      ${ojoMascota(49, -1)}
      ${ojoMascota(71, 1)}
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

    <g class="mascota-acc mascota-acc-gafas">
      <rect x="40" y="68.5" width="17.5" height="10.5" rx="4.5" fill="#1f2937"/>
      <rect x="62.5" y="68.5" width="17.5" height="10.5" rx="4.5" fill="#1f2937"/>
      <path d="M57.5 72 H62.5" stroke="#1f2937" stroke-width="2"/>
      <path d="M43 71.5 H48 M65.5 71.5 H70.5" stroke="#fff" stroke-opacity="0.55" stroke-width="1.6" stroke-linecap="round"/>
    </g>
    <g class="mascota-acc mascota-acc-monoculo" fill="none" stroke="#c99a1e" stroke-width="1.6">
      <circle cx="71" cy="74" r="7" fill="#ffffff" fill-opacity="0.18"/>
      <path d="M77.5 77 Q82 86 79 95" stroke-dasharray="2 1.5"/>
    </g>
    <g class="mascota-acc mascota-acc-lazo">
      <path d="M88 54 L79 48 L80 60 Z" fill="#f472b6" stroke="#db2777" stroke-width="0.8" stroke-linejoin="round"/>
      <path d="M88 54 L97 48 L96 60 Z" fill="#f472b6" stroke="#db2777" stroke-width="0.8" stroke-linejoin="round"/>
      <circle cx="88" cy="54" r="2.8" fill="#db2777"/>
    </g>
    <g class="mascota-acc mascota-acc-corbatin">
      <path d="M60 92.5 L50.5 87.5 L50.5 97.5 Z" fill="#d64545" stroke="#a52a2a" stroke-width="0.8" stroke-linejoin="round"/>
      <path d="M60 92.5 L69.5 87.5 L69.5 97.5 Z" fill="#d64545" stroke="#a52a2a" stroke-width="0.8" stroke-linejoin="round"/>
      <circle cx="60" cy="92.5" r="2.4" fill="#a52a2a"/>
    </g>
    <g class="mascota-acc mascota-acc-bigote">
      <path d="M60 80.4 C57 77.4 52 77.9 50 80.4 C48.5 82.4 46 81.9 45.5 80.4 C46.5 84.4 52 84.9 55.5 82.4 C57.5 81.2 59 81.1 60 81.9 C61 81.1 62.5 81.2 64.5 82.4 C68 84.9 73.5 84.4 74.5 80.4 C74 81.9 71.5 82.4 70 80.4 C68 77.9 63 77.4 60 80.4 Z" fill="#4a3426"/>
    </g>

    <g class="mascota-extra mascota-ojos-x" fill="none" stroke="#1f1e1d" stroke-width="2.2" stroke-linecap="round">
      <path d="M45.5 70.5 l7 7 M52.5 70.5 l-7 7"/>
      <path d="M67.5 70.5 l7 7 M74.5 70.5 l-7 7"/>
    </g>

    <!-- Bracitos: van al final para quedar delante de la cara (en el PIN se tapa los ojos) -->
    <g class="mascota-brazo mascota-brazo-izq">
      <path d="M30 70 Q22 73 19 81" fill="none" stroke="#b8c4d3" stroke-width="6.5" stroke-linecap="round"/>
      <path d="M30 70 Q22 73 19 81" fill="none" stroke="#f1f4f8" stroke-width="4" stroke-linecap="round"/>
      <!-- manita: pulgar, palma y almohadilla -->
      <circle cx="22.6" cy="79.4" r="1.9" fill="#f8fafc" stroke="#b8c4d3" stroke-width="1.1"/>
      <circle cx="19" cy="82.6" r="4.2" fill="#f8fafc" stroke="#b8c4d3" stroke-width="1.3"/>
      <circle cx="18.4" cy="83.3" r="1.4" fill="#f4a3a8" opacity="0.6"/>
    </g>
    <g class="mascota-brazo mascota-brazo-der">
      <path d="M90 70 Q98 73 101 81" fill="none" stroke="#b8c4d3" stroke-width="6.5" stroke-linecap="round"/>
      <path d="M90 70 Q98 73 101 81" fill="none" stroke="#f1f4f8" stroke-width="4" stroke-linecap="round"/>
      <circle cx="97.4" cy="79.4" r="1.9" fill="#f8fafc" stroke="#b8c4d3" stroke-width="1.1"/>
      <circle cx="101" cy="82.6" r="4.2" fill="#f8fafc" stroke="#b8c4d3" stroke-width="1.3"/>
      <circle cx="101.6" cy="83.3" r="1.4" fill="#f4a3a8" opacity="0.6"/>
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
    const nombre = typeof nombreMascota === 'function' ? nombreMascota() : 'Brote';
    mensajes.push(`¡Hola! Soy ${nombre} 🌱. Registra tu primer movimiento y te ayudo a que tu plata crezca.`);
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
const MASCOTA_LANZADA = ['¡Wiiiiii! 🚀', '¡Estoy volandooo! 🌿', '¡Aaaah! 😆'];
const MASCOTA_COSQUILLAS = ['¡Jiji, cosquillas! 💚', '¡Ay, para, para! 😆', 'Me encanta que me consientas 🥰'];
const MASCOTA_REGAR = ['¡Gracias por el agua! 💧', 'Ahhh, qué rico. Crezco como tus ahorros 🌱', '¡Glu glu! Justo lo que necesitaba 💧'];
const MASCOTA_DESPIERTA = ['¡Ah! Me quedé dormida 😳', '¿Eh? Ya estoy despierta… casi 🥱'];
const MASCOTA_SALUDOS = ['¡Hola! 👋', '¡Ey, por aquí! 🌿', 'Hola de nuevo 😊'];
const MASCOTA_GOLPES = ['¡Auch! 😵', 'Eso dolió… 🤕', 'Veo estrellitas ✨', '¡Ay, mi maceta!'];
const MASCOTA_PARED = ['¡Mírame, soy escaladora! 🧗', 'Desde aquí vigilo tus gastos 👀', '¡Me agarré! 💪'];
// Gestos que hace sola cuando esta quieta
const MASCOTA_GESTOS = ['mascota--mira', 'mascota--saluda', 'mascota--estira', 'mascota--tap'];
// Elementos sobre los que se puede parar
const MASCOTA_PLATAFORMAS = '.card, .hero-balance, .resumen-filtro';
// Animacion CSS -> clase que la dispara. Al terminar se quita la clase, si no
// se quedaria pegada y taparia otras (por ejemplo los pasitos al caminar).
const MASCOTA_ANIMACIONES = {
  'mascota-salto': 'mascota--salto',
  'mascota-sacudida': 'mascota--sacudida',
  'mascota-aterriza': 'mascota--aterriza',
  'mascota-golpe': 'mascota--golpe',
  'mascota-giro': 'mascota--giro',
  'mascota-tambalea': 'mascota--tambalea',
  'mascota-risa': 'mascota--risa',
  'mascota-estira': 'mascota--estira',
  'mascota-mira': 'mascota--mira',
  'mascota-saluda': 'mascota--saluda',
  'mascota-crece-izq': 'mascota--regada',
  'mascota-moneda': 'mascota--moneda',
  'pata-tap': 'mascota--tap',
};

// Fisica (pixeles y segundos)
const MASCOTA_GRAVEDAD = 2300;
const MASCOTA_GOLPE_PARED = 650; // velocidad contra una pared/techo que la marea
const MASCOTA_GOLPE_CAIDA = 1700; // velocidad de caida que la marea al aterrizar (~65% de la pantalla)

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

  // Posicion: x = distancia al borde izquierdo; y = altura de la base sobre
  // el borde inferior. "modo" puede ser:
  //   'suelo' -> parada en el piso o sobre una tarjeta (this.superficie)
  //   'pared' -> agarrada a la pared izquierda o derecha (this.pared)
  //   'aire'  -> volando/cayendo con gravedad (this.vel)
  x: 0,
  y: 0,
  modo: 'suelo',
  superficie: null,
  pared: null,
  vel: null,
  movimiento: null,
  arrastre: null,
  suprimirClick: false,
  ultimoGolpe: 0,
  // true mientras persigue monedas (minijuego de js/mascota-vida.js)
  enJuego: false,
  timerEscritura: null,
  saltoVoluntario: false,

  // Interacciones
  caricias: [],
  ultimoXCaricia: null,
  ultimaDirCaricia: 0,
  finPausaCaricia: 0,
  ultimoSaludo: 0,
  punteroLejos: true,
  scrollPrevio: null,
  ultimoScroll: 0,
  ultimoTambaleo: 0,
  comentadas: new Set(),

  montar() {
    if (this.el || !mascotaVisible()) return;

    const nombreVisible = escapeHtml(typeof nombreMascota === 'function' ? nombreMascota() : 'Brote');
    const el = document.createElement('div');
    el.className = 'mascota';
    el.innerHTML = `
      <div class="mascota-burbuja" role="status" aria-live="polite" hidden>
        <span class="mascota-burbuja-texto"></span>
        <button type="button" class="mascota-burbuja-menu" aria-label="Abrir el menú de la mascota" title="Menú">☰</button>
        <button type="button" class="mascota-burbuja-cerrar" aria-label="Cerrar mensaje">&times;</button>
      </div>
      <button type="button" class="mascota-btn" aria-label="${nombreVisible}, tu planta financiera. Tócala para un consejo, arrástrala o lánzala, acaríciala o mantenla presionada para regarla" title="¡Hola! Soy ${nombreVisible}. Tócame, arrástrame (¡o lánzame!), acaríciame o mantenme presionada para regarme">${mascotaSvg()}</button>`;
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
    [this.timerBurbuja, this.timerEstado, this.timerPaseo, this.timerGesto, this.timerClick, this.timerPresion, this.timerTarjeta, this.timerEscritura].forEach(clearTimeout);
    this.timerEstado = null;
    this.movimiento = null;
    this.arrastre = null;
    this.superficie = null;
    this.pared = null;
    this.modo = 'suelo';
    this.el.remove();
    this.el = null;
  },

  // ---- Superficies (piso, tarjetas y paredes) ----
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

  limitesPared() {
    return {
      xIzq: 0,
      xDer: window.innerWidth - this.ancho(),
      minY: this.alturaPiso() + 6,
      maxY: Math.max(this.alturaPiso() + 6, window.innerHeight - this.alto() - 12),
    };
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

  // Tarjeta cuyo borde superior cruzaron los pies en este cuadro (cayendo).
  superficieCruzada(pieAntes, pieAhora) {
    const centro = this.x + this.ancho() / 2;
    let mejor = null;
    let mejorTop = Infinity;
    document.querySelectorAll(MASCOTA_PLATAFORMAS).forEach((p) => {
      if (!this.esPlataformaValida(p)) return;
      const r = p.getBoundingClientRect();
      if (centro > r.left && centro < r.right && r.top >= pieAntes - 3 && r.top <= pieAhora + 3 && r.top < mejorTop) {
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

  // ---- Bucle de animacion ----
  tick(ahora) {
    this.loop = requestAnimationFrame((t) => this.tick(t));
    const dt = Math.min((ahora - this.ultimoTick) / 1000, 0.05);
    this.ultimoTick = ahora;
    if (this.arrastre?.activo) return;

    if (this.modo === 'aire') {
      this.fisica(dt);
    } else if (this.modo === 'pared') {
      this.enPared(dt);
    } else {
      // Si su tarjeta desaparece o sale de la pantalla, se cae.
      if (this.superficie && this.movimiento?.tipo !== 'saltar' && !this.esPlataformaValida(this.superficie)) {
        this.soltarEnAire(0, 0);
        this.aplicarPosicion();
        return;
      }
      if (this.movimiento) {
        this.avanzar(this.movimiento, dt);
      } else {
        this.y = this.alturaSuperficie(this.superficie);
        const rango = this.rangoX(this.superficie);
        this.x = Math.min(Math.max(this.x, rango.min), rango.max);
      }
    }
    this.aplicarPosicion();
  },

  // Caminar sobre el piso/tarjeta o el salto dirigido a una tarjeta.
  avanzar(m, dt) {
    if (m.tipo === 'caminar') {
      const paso = (m.velocidad || 70) * dt;
      const falta = m.destinoX - this.x;
      this.x += Math.abs(falta) <= paso ? falta : Math.sign(falta) * paso;
      this.y = this.alturaSuperficie(this.superficie);
      if (Math.abs(m.destinoX - this.x) < 0.5) this.terminarMovimiento();
      return;
    }

    // Antes de despegar se agacha un instante (anticipacion).
    if (m.espera > 0) {
      m.espera -= dt;
      this.y = this.alturaSuperficie(this.superficie);
      if (m.espera <= 0) {
        m.desdeY = this.y;
        this.el.classList.remove('mascota--agacha');
        this.el.classList.add('mascota--saltando');
      }
      return;
    }

    // Saltar: el destino se recalcula en cada cuadro por si hay scroll.
    if (m.hacia && !this.esPlataformaValida(m.hacia)) {
      m.hacia = null;
      const piso = this.rangoX(null);
      m.destinoX = Math.min(Math.max(m.destinoX, piso.min), piso.max);
    }
    m.t = Math.min(m.t + dt / m.duracion, 1);
    const yFin = this.alturaSuperficie(m.hacia);
    this.x = m.desdeX + (m.destinoX - m.desdeX) * m.t;
    this.y = m.desdeY + (yFin - m.desdeY) * m.t + m.altura * 4 * m.t * (1 - m.t);
    if (m.t >= 1) {
      this.superficie = m.hacia;
      this.y = yFin;
      this.animar('mascota--aterriza');
      this.polvo();
      this.terminarMovimiento();
    }
  },

  // Volando o cayendo: gravedad, rebotes, golpes y aterrizaje.
  fisica(dt) {
    const pieAntes = window.innerHeight - this.y;
    this.vel.y -= MASCOTA_GRAVEDAD * dt;
    this.x += this.vel.x * dt;
    this.y += this.vel.y * dt;

    // Se inclina hacia donde vuela y se estira un poco al caer rapido.
    const inclinacion = Math.max(Math.min(this.vel.x / 45, 28), -28);
    const estiramiento = 1 + Math.min(Math.abs(this.vel.y) / 7000, 0.14);
    this.el.style.setProperty('--inclinacion', `${inclinacion.toFixed(1)}deg`);
    this.el.style.setProperty('--estiramiento', estiramiento.toFixed(3));

    // Paredes: si choca fuerte se marea y rebota; si no, a veces se agarra.
    const maxX = window.innerWidth - this.ancho();
    if (this.x < 0 || this.x > maxX) {
      const lado = this.x < 0 ? 'izq' : 'der';
      this.x = lado === 'izq' ? 0 : maxX;
      const impacto = Math.abs(this.vel.x);
      if (impacto > MASCOTA_GOLPE_PARED) {
        this.vel.x *= -0.4;
        this.golpe();
      } else if (impacto > 120 && Math.random() < 0.6) {
        this.agarrarPared(lado);
        return;
      } else {
        this.vel.x *= -0.4;
      }
    }

    // Techo
    const maxY = window.innerHeight - this.alto();
    if (this.y > maxY) {
      this.y = maxY;
      if (this.vel.y > MASCOTA_GOLPE_PARED) this.golpe();
      this.vel.y = -Math.abs(this.vel.y) * 0.3;
    }

    // Aterrizar sobre una tarjeta o el piso
    if (this.vel.y <= 0) {
      const sup = this.superficieCruzada(pieAntes, window.innerHeight - this.y);
      if (sup || this.y <= this.alturaPiso()) {
        const velocidad = -this.vel.y;
        this.superficie = sup;
        this.y = this.alturaSuperficie(sup);
        this.aterrizar(velocidad);
      }
    }
  },

  // voluntario = true cuando salta ella misma (de una pared): asi no se marea
  // al caer, solo cuando la sueltas o la lanzas desde muy alto.
  soltarEnAire(vx, vy, voluntario = false) {
    this.modo = 'aire';
    this.saltoVoluntario = voluntario;
    this.vel = { x: vx, y: vy };
    this.superficie = null;
    this.pared = null;
    this.movimiento = null;
    this.el.classList.remove('mascota--caminando', 'mascota--saltando', 'mascota--agacha', 'mascota--trepando', 'mascota--en-pared', 'mascota--pared-izq', 'mascota--pared-der');
    this.el.classList.add('mascota--en-aire');
    if (Math.abs(vx) > 30) this.el.classList.toggle('mascota--izq', vx < 0);
  },

  aterrizar(velocidad) {
    this.modo = 'suelo';
    this.vel = null;
    this.el.classList.remove('mascota--en-aire', 'mascota--volteretas');
    if (velocidad > 350) this.polvo();
    if (velocidad > MASCOTA_GOLPE_CAIDA && !this.saltoVoluntario) this.golpe();
    else if (velocidad > 350) this.animar('mascota--aterriza');
    this.guardarPosicion();
    this.programarPaseo();
  },

  // Nubecitas de polvo a los lados de las patitas al aterrizar.
  polvo() {
    if (!this.el || sinMovimiento()) return;
    [-1, -1, 1, 1].forEach((lado, i) => {
      const p = document.createElement('span');
      p.className = 'mascota-polvo';
      p.style.setProperty('--dx', `${lado * (18 + Math.random() * 22)}px`);
      p.style.left = `${lado < 0 ? 34 : 56}%`;
      p.style.animationDelay = `${(i % 2) * 0.05}s`;
      this.el.appendChild(p);
      setTimeout(() => p.remove(), 650);
    });
  },

  // Golpe fuerte: queda mareada con estrellitas girando.
  golpe() {
    const ahora = performance.now();
    if (ahora - this.ultimoGolpe < 700) return;
    this.ultimoGolpe = ahora;
    this.estadoTemporal('mareada', 2600);
    this.animar('mascota--golpe');
    const mareo = document.createElement('span');
    mareo.className = 'mascota-mareo';
    mareo.innerHTML = '<span>⭐</span><span>✨</span><span>⭐</span>';
    this.el.appendChild(mareo);
    setTimeout(() => mareo.remove(), 2600);
    this.mostrarMensaje(elegirAlAzar(MASCOTA_GOLPES), 2600);
  },

  // ---- Paredes ----
  agarrarPared(lado) {
    this.modo = 'pared';
    this.pared = lado;
    this.vel = null;
    this.superficie = null;
    this.movimiento = null;
    this.el.classList.remove('mascota--en-aire', 'mascota--volteretas', 'mascota--caminando', 'mascota--saltando', 'mascota--pared-izq', 'mascota--pared-der');
    this.el.classList.add('mascota--en-pared', `mascota--pared-${lado}`);
    const lim = this.limitesPared();
    this.x = lado === 'izq' ? lim.xIzq : lim.xDer;
    this.y = Math.min(Math.max(this.y, lim.minY), lim.maxY);
    if (this.burbuja.hidden && Math.random() < 0.35) this.mostrarMensaje(elegirAlAzar(MASCOTA_PARED), 3000);
    this.programarPaseo(2500, 6000);
  },

  enPared(dt) {
    const lim = this.limitesPared();
    this.x = this.pared === 'izq' ? lim.xIzq : lim.xDer;
    const m = this.movimiento;
    if (m?.tipo === 'trepar') {
      const destino = Math.min(Math.max(m.destinoY, lim.minY), lim.maxY);
      const paso = 55 * dt;
      const falta = destino - this.y;
      this.y += Math.abs(falta) <= paso ? falta : Math.sign(falta) * paso;
      if (Math.abs(destino - this.y) < 0.5) this.terminarMovimiento();
    }
    this.y = Math.min(Math.max(this.y, lim.minY), lim.maxY);
  },

  trepar(destinoY, despues) {
    this.el.classList.add('mascota--trepando');
    this.movimiento = { tipo: 'trepar', destinoY, despues };
  },

  // Camina hasta la pared mas cercana, se agarra y sube.
  irAPared() {
    const lado = this.x + this.ancho() / 2 < window.innerWidth / 2 ? 'izq' : 'der';
    const rango = this.rangoX(null);
    const subir = () => {
      this.agarrarPared(lado);
      const lim = this.limitesPared();
      this.trepar(lim.minY + (lim.maxY - lim.minY) * (0.3 + Math.random() * 0.5));
    };
    if (!this.caminarA(lado === 'izq' ? rango.min : rango.max, subir)) subir();
  },

  saltarDePared() {
    const direccion = this.pared === 'izq' ? 1 : -1;
    this.soltarEnAire(direccion * (260 + Math.random() * 240), 380 + Math.random() * 260, true);
    if (this.burbuja.hidden && Math.random() < 0.4) this.mostrarMensaje('¡Allá voy! 🌿', 2000);
  },

  bajarDePared() {
    this.modo = 'suelo';
    this.pared = null;
    this.superficie = null;
    this.el.classList.remove('mascota--en-pared', 'mascota--pared-izq', 'mascota--pared-der', 'mascota--trepando');
    const rango = this.rangoX(null);
    this.x = Math.min(Math.max(this.x, rango.min), rango.max);
    this.y = this.alturaPiso();
    this.animar('mascota--aterriza');
    this.programarPaseo();
  },

  // ---- Movimientos dirigidos ----
  // velocidad en px/s: 70 caminando; mas de 120 ya es correr (otra animacion).
  caminarA(destinoX, despues, velocidad = 70) {
    const rango = this.rangoX(this.superficie);
    const destino = Math.min(Math.max(destinoX, rango.min), rango.max);
    if (Math.abs(destino - this.x) < 2) return false;
    this.el.classList.toggle('mascota--izq', destino < this.x);
    this.el.classList.add('mascota--caminando');
    this.el.classList.toggle('mascota--corriendo', velocidad > 120);
    this.movimiento = { tipo: 'caminar', destinoX: destino, despues, velocidad };
    return true;
  },

  saltarA(hacia, destinoX) {
    const rango = this.rangoX(hacia);
    const destino = Math.min(Math.max(destinoX, rango.min), rango.max);
    const distancia = Math.hypot(destino - this.x, this.alturaSuperficie(hacia) - this.y);
    this.el.classList.toggle('mascota--izq', destino < this.x);
    this.el.classList.remove('mascota--caminando');
    this.el.classList.add('mascota--agacha');
    this.movimiento = {
      tipo: 'saltar',
      espera: 0.14,
      hacia,
      desdeX: this.x,
      desdeY: this.y,
      destinoX: destino,
      t: 0,
      duracion: Math.min(Math.max(distancia / 650, 0.45), 0.95),
      altura: Math.min(70 + distancia * 0.12, 170),
    };
  },

  // completado = false cuando se interrumpe (por un toque, por ejemplo).
  terminarMovimiento(completado = true) {
    const m = this.movimiento;
    this.movimiento = null;
    this.el.classList.remove('mascota--caminando', 'mascota--corriendo', 'mascota--saltando', 'mascota--trepando', 'mascota--agacha');
    this.guardarPosicion();
    if (completado && m?.despues) {
      m.despues();
      return;
    }
    if (completado && !this.enJuego && Math.random() < 0.25 && this.burbuja.hidden) this.mostrarMensaje(elegirAlAzar(MASCOTA_PENSAMIENTOS), 3500);
    this.programarPaseo();
  },

  detenerse() {
    if (this.movimiento?.tipo === 'caminar' || this.movimiento?.tipo === 'trepar') this.terminarMovimiento(false);
  },

  // ---- Paseos: camina, salta a tarjetas, trepa paredes ----
  programarPaseo(min = 7000, max = 18000) {
    clearTimeout(this.timerPaseo);
    if (!this.el || sinMovimiento()) return;
    this.timerPaseo = setTimeout(() => this.pasear(), min + Math.random() * (max - min));
  },

  pasear() {
    if (!this.el) return;
    const ocupada =
      this.movimiento ||
      this.arrastre ||
      this.enJuego ||
      this.modo === 'aire' ||
      !this.burbuja.hidden ||
      document.hidden ||
      this.el.classList.contains('mascota--dormida') ||
      this.el.classList.contains('mascota--mareada') ||
      document.documentElement.classList.contains('bloqueado');
    if (ocupada) {
      this.programarPaseo();
      return;
    }

    const azar = Math.random();

    if (this.modo === 'pared') {
      const lim = this.limitesPared();
      if (azar < 0.35) this.trepar(lim.minY + Math.random() * (lim.maxY - lim.minY));
      else if (azar < 0.75) this.saltarDePared();
      else this.trepar(lim.minY, () => this.bajarDePared());
      return;
    }

    const plataformas = this.plataformasVisibles();
    if (this.superficie && azar < 0.3) {
      // bajarse de la tarjeta al piso
      this.saltarA(null, this.x + (Math.random() - 0.5) * 240);
    } else if (plataformas.length && azar < 0.6) {
      const destino = elegirAlAzar(plataformas);
      const rango = this.rangoX(destino);
      this.saltarA(destino, rango.min + Math.random() * (rango.max - rango.min));
    } else if (!this.superficie && azar < 0.8) {
      this.irAPared();
    } else {
      const rango = this.rangoX(this.superficie);
      let destino = rango.min + Math.random() * (rango.max - rango.min);
      if (Math.abs(destino - this.x) < 80) destino = this.x > (rango.min + rango.max) / 2 ? this.x - 160 : this.x + 160;
      if (!this.caminarA(destino)) this.programarPaseo();
    }
  },

  // ---- Gestos sueltos (mirar alrededor, saludar, estirarse) ----
  programarGesto() {
    clearTimeout(this.timerGesto);
    if (!this.el || sinMovimiento()) return;
    this.timerGesto = setTimeout(() => {
      const libre = this.el && !this.movimiento && !this.arrastre && this.modo !== 'aire';
      if (libre && !this.el.classList.contains('mascota--dormida') && !this.el.classList.contains('mascota--mareada')) {
        this.animar(elegirAlAzar(MASCOTA_GESTOS));
      }
      this.programarGesto();
    }, 5000 + Math.random() * 7000);
  },

  // ---- Arrastrar / lanzar, mantener presionado (regar) ----
  iniciarArrastre(e) {
    if (e.button !== 0) return;
    this.btn.setPointerCapture(e.pointerId);
    this.arrastre = { id: e.pointerId, inicioX: e.clientX, inicioY: e.clientY, origenX: this.x, origenY: this.y, activo: false, regando: false, muestras: [] };
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
      this.pared = null;
      this.vel = null;
      this.modo = 'suelo';
      this.el.classList.remove('mascota--caminando', 'mascota--saltando', 'mascota--agacha', 'mascota--trepando', 'mascota--en-aire', 'mascota--volteretas', 'mascota--en-pared', 'mascota--pared-izq', 'mascota--pared-der');
      a.origenX = this.x;
      a.origenY = this.y;
      this.ocultarBurbuja();
      this.el.classList.add('mascota--arrastrando');
    }
    this.el.classList.toggle('mascota--izq', dx < 0);
    this.x = Math.min(Math.max(a.origenX + dx, 0), window.innerWidth - this.ancho());
    this.y = Math.min(Math.max(a.origenY - dy, this.alturaPiso()), window.innerHeight - this.alto());
    this.aplicarPosicion();

    // Ultimas posiciones para calcular con que velocidad la lanzas
    const ahora = performance.now();
    a.muestras.push({ t: ahora, x: this.x, y: this.y });
    a.muestras = a.muestras.filter((m) => ahora - m.t < 90);
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
    let vx = 0;
    let vy = 0;
    const primera = a.muestras[0];
    const ultima = a.muestras[a.muestras.length - 1];
    if (primera && ultima && ultima !== primera) {
      // Minimo un cuadro (16 ms) para que un gesto rapidisimo no de 0 ni infinito.
      const segundos = Math.max((ultima.t - primera.t) / 1000, 0.016);
      vx = Math.max(Math.min((ultima.x - primera.x) / segundos, 2600), -2600);
      vy = Math.max(Math.min((ultima.y - primera.y) / segundos, 2600), -2600);
    }
    // Al soltarla vuela con el impulso que traia y cae con gravedad.
    this.soltarEnAire(vx, vy);
    const rapida = Math.hypot(vx, vy) > 900;
    if (Math.hypot(vx, vy) > 1500 && !sinMovimiento()) this.el.classList.add('mascota--volteretas');
    if (rapida) this.mostrarMensaje(elegirAlAzar(MASCOTA_LANZADA), 2200);
    else if (Math.random() < 0.5) this.mostrarMensaje(elegirAlAzar(MASCOTA_AL_SOLTAR), 3000);
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
    if (rapido && !this.movimiento && this.modo === 'suelo' && ahora - this.ultimoTambaleo > 800) {
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
      if (!this.el || this.arrastre || this.movimiento || this.modo !== 'suelo' || !this.burbuja.hidden) return;
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

  // Estilo Claude Code: primero un ✻ "pensando" y luego el texto se escribe
  // letra por letra con un cursor. Un texto invisible reserva el tamaño final
  // del globo para que no vaya creciendo mientras escribe.
  mostrarMensaje(texto, ms = 7000) {
    if (!this.el) return;
    clearTimeout(this.timerEscritura);
    const letras = Array.from(texto);
    this.texto.innerHTML = `
      <span class="sr-solo"></span>
      <span class="mascota-burbuja-fantasma" aria-hidden="true"></span>
      <span class="mascota-burbuja-escrito" aria-hidden="true"></span>`;
    this.texto.querySelector('.sr-solo').textContent = texto;
    this.texto.querySelector('.mascota-burbuja-fantasma').textContent = texto;
    const escrito = this.texto.querySelector('.mascota-burbuja-escrito');

    this.burbuja.hidden = false;
    this.burbuja.classList.remove('mascota-burbuja-pop');
    void this.burbuja.offsetWidth;
    this.burbuja.classList.add('mascota-burbuja-pop');

    let duracionEscritura = 0;
    if (sinMovimiento()) {
      escrito.textContent = texto;
    } else {
      const pausa = 280;
      const porLetra = Math.max(12, Math.min(30, 1100 / letras.length));
      duracionEscritura = pausa + porLetra * letras.length;
      escrito.innerHTML = '<span class="mascota-pensando">✻</span>';
      // Mientras "piensa" se lleva la mano a la barbilla; mientras escribe mueve la boca.
      this.el.classList.remove('mascota--hablando');
      this.el.classList.add('mascota--piensa');
      let i = 0;
      const escribir = () => {
        i++;
        if (i === 1) {
          this.el?.classList.remove('mascota--piensa');
          this.el?.classList.add('mascota--hablando');
        }
        escrito.textContent = letras.slice(0, i).join('');
        if (i < letras.length) {
          escrito.insertAdjacentHTML('beforeend', '<span class="mascota-cursor"></span>');
          this.timerEscritura = setTimeout(escribir, porLetra);
        } else {
          this.el?.classList.remove('mascota--hablando');
        }
      };
      this.timerEscritura = setTimeout(escribir, pausa);
    }

    clearTimeout(this.timerBurbuja);
    this.timerBurbuja = setTimeout(() => this.ocultarBurbuja(), ms + duracionEscritura);
  },

  ocultarBurbuja() {
    clearTimeout(this.timerBurbuja);
    clearTimeout(this.timerEscritura);
    this.el?.classList.remove('mascota--piensa', 'mascota--hablando');
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
      // El SVG puede estar espejado (mirando a la izquierda) y girado 90° si
      // esta en una pared: se deshace eso para que los ojos miren al cursor.
      const giro = this.el.classList.contains('mascota--izq') ? -1 : 1;
      this.el.querySelectorAll('.mascota-pupila').forEach((pupila) => {
        const r = pupila.getBoundingClientRect();
        let dx = e.clientX - (r.left + r.width / 2);
        let dy = e.clientY - (r.top + r.height / 2);
        if (this.modo === 'pared') [dx, dy] = this.pared === 'izq' ? [dy, -dx] : [-dy, dx];
        dx *= giro;
        const distancia = Math.hypot(dx, dy) || 1;
        const k = Math.min(distancia / 120, 1) * 2.6;
        pupila.setAttribute('transform', `translate(${((dx / distancia) * k).toFixed(2)} ${((dy / distancia) * k).toFixed(2)})`);
      });

      // Saluda cuando acercas el cursor despues de un rato lejos.
      const r = this.btn.getBoundingClientRect();
      const cerca = Math.hypot(e.clientX - (r.left + r.width / 2), e.clientY - (r.top + r.height / 2));
      if (cerca > 350) this.punteroLejos = true;
      const ahora = performance.now();
      if (cerca < 160 && this.punteroLejos && ahora - this.ultimoSaludo > 25000 && !this.movimiento && !this.arrastre && this.modo !== 'aire') {
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
