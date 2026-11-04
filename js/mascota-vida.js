// Vida y RPG de la mascota (se carga despues de js/mascota.js y la extiende).
//  - Varias mascotas por navegador, cada una con su nivel, XP, monedas, agua,
//    habilidades, misiones y apariencia (localStorage, y viajan en el respaldo JSON).
//  - Crece: gana XP con tus buenos habitos; al subir de nivel le salen partes
//    nuevas (hojitas, capullo, flor, monedas) y gana puntos de habilidad.
//  - Misiones diarias y semanales conectadas con tus finanzas.
//  - Habilidades pasivas (cambian como se comporta) y activas (se usan desde el menu).
//  - Tienda: colores y accesorios que se compran con las monedas que gana.
//  - Minijuego de monedas, llamarla con doble clic, aviso en botones de borrar.
// La interfaz del menu esta en js/mascota-menu.js.
const MASCOTAS_KEY = 'financeAppMascotas';
const VIDA_VIEJA_KEY = 'financeAppBroteVida';
const MASCOTAS_MAX = 4;
const VIDA_SED_POR_HORA = 3; // % de agua que pierde por hora (vacia en ~33 h)
const VIDA_UMBRAL_SED = 35;

const VIDA_NIVELES = [
  { xp: 0, nombre: 'Brotecito', emoji: '🌱' },
  { xp: 40, nombre: 'Plantita', emoji: '🌿' },
  { xp: 120, nombre: 'Capullo', emoji: '🌷' },
  { xp: 260, nombre: 'En flor', emoji: '🌸' },
  { xp: 500, nombre: 'Árbol de la plata', emoji: '🌳' },
  { xp: 800, nombre: 'Árbol sabio', emoji: '🦉' },
  { xp: 1200, nombre: 'Guardiana del ahorro', emoji: '🛡️' },
  { xp: 1700, nombre: 'Leyenda verde', emoji: '🏅' },
  { xp: 2300, nombre: 'Bosque entero', emoji: '🌲' },
  { xp: 3000, nombre: 'Espíritu de la plata', emoji: '✨' },
];

// tipo: 'pasiva' (siempre activa una vez aprendida) o 'activa' (se usa desde el menu)
const HABILIDADES = [
  { id: 'baile', nombre: 'Bailecito', icono: '💃', tipo: 'activa', nivel: 1, costo: 0, espera: 60 * 1000, desc: 'Se pone a bailar de felicidad.' },
  { id: 'iman', nombre: 'Imán de monedas', icono: '🧲', tipo: 'pasiva', nivel: 2, costo: 1, desc: 'Las monedas que caen se acercan a {n} y las atrapa más fácil.' },
  { id: 'lluvia', nombre: 'Lluvia dorada', icono: '🌧️', tipo: 'activa', nivel: 2, costo: 1, espera: 6 * 3600 * 1000, desc: 'Hace llover 8 monedas para jugar. Una vez cada 6 horas.' },
  { id: 'veloz', nombre: 'Pies ligeros', icono: '💨', tipo: 'pasiva', nivel: 3, costo: 1, desc: 'Camina y corre un 40% más rápido.' },
  { id: 'raices', nombre: 'Raíces profundas', icono: '🌊', tipo: 'pasiva', nivel: 3, costo: 1, desc: 'Pierde agua la mitad de rápido.' },
  { id: 'fotosintesis', nombre: 'Fotosíntesis', icono: '☀️', tipo: 'pasiva', nivel: 4, costo: 1, desc: 'Gana 25% más XP en todo.' },
  { id: 'pronostico', nombre: 'Pronóstico', icono: '🔮', tipo: 'activa', nivel: 4, costo: 1, espera: 0, desc: 'Calcula cuánto gastarás este mes si sigues al mismo ritmo, y te lo recuerda entre sus consejos.' },
  { id: 'supersalto', nombre: 'Súper salto', icono: '🚀', tipo: 'activa', nivel: 5, costo: 1, espera: 5 * 60 * 1000, desc: 'Un salto gigante con volteretas.' },
];

// Tienda de apariencia. Lo de precio 0 viene incluido; "nivel" = nivel minimo.
const TIENDA = {
  maceta: [
    { id: 'blanca', nombre: 'Blanca', precio: 0, colores: ['#ffffff', '#d6deea', '#f1f4f8', '#cdd6e2'] },
    { id: 'cielo', nombre: 'Cielo', precio: 15, colores: ['#eef6ff', '#b9d3f0', '#e3effc', '#a9c4e4'] },
    { id: 'menta', nombre: 'Menta', precio: 20, colores: ['#e6faf0', '#a6dcc0', '#d7f5e6', '#93cdb0'] },
    { id: 'rosa', nombre: 'Rosa', precio: 20, colores: ['#fff0f6', '#f2b8cf', '#fde3ee', '#e8a5c0'] },
    { id: 'lavanda', nombre: 'Lavanda', precio: 25, colores: ['#f4f0ff', '#c9bcef', '#ebe5fd', '#b8a9e3'] },
    { id: 'terracota', nombre: 'Terracota', precio: 30, colores: ['#e9a083', '#b85a3b', '#eea98d', '#c4603e'] },
    { id: 'atardecer', nombre: 'Atardecer', precio: 35, colores: ['#ffe2b8', '#f4a09a', '#ffd9a8', '#ec9a8f'] },
    { id: 'oceano', nombre: 'Océano', precio: 35, colores: ['#d4f1fb', '#6fb3dc', '#c4ebf8', '#5fa3cc'] },
    { id: 'dorada', nombre: 'Dorada', precio: 90, nivel: 5, colores: ['#fff3c4', '#e0b54a', '#fbe7a1', '#d4a53a'] },
    { id: 'galaxia', nombre: 'Galaxia', precio: 150, nivel: 7, colores: ['#d9cffb', '#7b68c9', '#cbbef7', '#6d5bb8'] },
  ],
  patron: [
    { id: 'ninguno', nombre: 'Lisa', precio: 0, icono: '▫️' },
    { id: 'lunares', nombre: 'Lunares', precio: 20, icono: '⚪' },
    { id: 'rayas', nombre: 'Rayas', precio: 20, icono: '〰️' },
    { id: 'estrellas', nombre: 'Estrellas', precio: 35, icono: '⭐' },
    { id: 'corazones', nombre: 'Corazones', precio: 35, icono: '💗' },
  ],
  franja: [
    { id: 'marino', nombre: 'Azul marino', precio: 0, color: '#3b5e91' },
    { id: 'verde', nombre: 'Verde', precio: 10, color: '#3f8f5c' },
    { id: 'coral', nombre: 'Coral', precio: 10, color: '#e0715f' },
    { id: 'rosa', nombre: 'Rosa', precio: 10, color: '#e879a6' },
    { id: 'menta', nombre: 'Menta', precio: 10, color: '#2fae86' },
    { id: 'violeta', nombre: 'Violeta', precio: 12, color: '#7c5cc4' },
    { id: 'carbon', nombre: 'Carbón', precio: 15, color: '#1f2937' },
    { id: 'oro', nombre: 'Oro', precio: 30, color: '#d4a53a' },
  ],
  hojas: [
    { id: 'verde', nombre: 'Verde', precio: 0, colores: ['#5fae7a', '#7cc795', '#4f9e6b', '#2f7a4b'] },
    { id: 'menta', nombre: 'Menta', precio: 15, colores: ['#4fc1a6', '#7fdcc3', '#35a88c', '#23806a'] },
    { id: 'otono', nombre: 'Otoño', precio: 25, colores: ['#e08a3c', '#f2b05e', '#c9622f', '#8a4a22'] },
    { id: 'sakura', nombre: 'Sakura', precio: 30, colores: ['#f29bb8', '#f7c1d3', '#e07a9e', '#9b5a6e'] },
    { id: 'lavanda', nombre: 'Lavanda', precio: 30, colores: ['#9f86d9', '#c2b0ef', '#8269c4', '#5a4691'] },
    { id: 'nieve', nombre: 'Nieve', precio: 40, colores: ['#c9dcf2', '#e9f2fc', '#a9c3e3', '#6b87ab'] },
    { id: 'fuego', nombre: 'Fuego', precio: 60, nivel: 5, colores: ['#f97316', '#fbbf24', '#ea580c', '#9a3412'] },
    { id: 'dorado', nombre: 'Dorado', precio: 120, nivel: 6, colores: ['#e5b93f', '#f5d77a', '#c99a1e', '#8a6a12'] },
    { id: 'galaxia', nombre: 'Galaxia', precio: 150, nivel: 8, colores: ['#6d5bd0', '#a78bfa', '#4c3db5', '#312e81'] },
  ],
  ojos: [
    { id: 'normal', nombre: 'Normales', precio: 0, icono: '👀' },
    { id: 'pestanas', nombre: 'Pestañas', precio: 15, icono: '👁️' },
    { id: 'brillos', nombre: 'Brillitos', precio: 25, icono: '✨' },
    { id: 'corazon', nombre: 'Enamorada', precio: 40, icono: '😍' },
  ],
  accesorio: [
    { id: 'ninguno', nombre: 'Ninguno', precio: 0, icono: '·' },
    { id: 'bigote', nombre: 'Bigote', precio: 15, icono: '🥸' },
    { id: 'lazo', nombre: 'Lazo', precio: 20, icono: '🎀' },
    { id: 'corbatin', nombre: 'Corbatín', precio: 20, icono: '🎗️' },
    { id: 'bufanda', nombre: 'Bufanda', precio: 25, icono: '🧣' },
    { id: 'gorra', nombre: 'Gorra', precio: 25, icono: '🧢' },
    { id: 'gafas', nombre: 'Gafas de sol', precio: 30, icono: '🕶️' },
    { id: 'audifonos', nombre: 'Audífonos', precio: 40, icono: '🎧' },
    { id: 'monoculo', nombre: 'Monóculo', precio: 45, icono: '🧐' },
    { id: 'copa', nombre: 'Sombrero de copa', precio: 50, icono: '🎩' },
    { id: 'halo', nombre: 'Halo', precio: 100, nivel: 6, icono: '😇' },
    { id: 'corona', nombre: 'Corona', precio: 120, nivel: 5, icono: '👑' },
  ],
  estela: [
    { id: 'ninguna', nombre: 'Ninguna', precio: 0, icono: '·', particulas: [] },
    { id: 'brillos', nombre: 'Brillitos', precio: 30, icono: '✨', particulas: ['✨', '⭐', '✦'] },
    { id: 'hojitas', nombre: 'Hojitas', precio: 30, icono: '🍃', particulas: ['🍃', '🌿', '🍀'] },
    { id: 'burbujas', nombre: 'Burbujas', precio: 30, icono: '🫧', particulas: ['○', '◦', '°'] },
    { id: 'corazones', nombre: 'Corazones', precio: 40, icono: '💗', particulas: ['💗', '💖', '💕'] },
    { id: 'monedas', nombre: 'Monedas', precio: 60, nivel: 4, icono: '🪙', particulas: ['🪙', '$', '💰'] },
  ],
};

// Orden y titulos de las categorias en el menu
const CATEGORIAS_TIENDA = [
  ['maceta', '🪴 Maceta'],
  ['patron', '🔸 Patrón de la maceta'],
  ['franja', '🎗️ Franja'],
  ['hojas', '🍃 Hojas'],
  ['ojos', '👀 Ojos'],
  ['accesorio', '🎩 Accesorio'],
  ['estela', '✨ Estela al moverse'],
];

// Misiones rapidas que cambian cada hora (se eligen 2).
const MISIONES_HORA = [
  { id: 'h-caricia', texto: 'Hazle cosquillas a {n}', evento: 'caricia', meta: 1, xp: 3, monedas: 4 },
  { id: 'h-monedas', texto: 'Atrapa 3 monedas', evento: 'moneda', meta: 3, xp: 4, monedas: 5 },
  { id: 'h-baile', texto: 'Haz bailar a {n}', evento: 'baile', meta: 1, xp: 3, monedas: 4 },
  { id: 'h-consejo', texto: 'Pídele un consejo a {n} (tócala)', evento: 'consejo', meta: 1, xp: 3, monedas: 4 },
  { id: 'h-lanzar', texto: 'Lanza a {n} por los aires 🚀', evento: 'lanzar', meta: 1, xp: 4, monedas: 5 },
  { id: 'h-llamar', texto: 'Llama a {n} con doble clic en un espacio vacío', evento: 'llamar', meta: 1, xp: 3, monedas: 4 },
  { id: 'h-girar', texto: 'Haz girar a {n} (doble clic sobre ella)', evento: 'girar', meta: 1, xp: 3, monedas: 4 },
  { id: 'h-comandos', texto: 'Abre la paleta de comandos (Ctrl + K)', evento: 'comandos', meta: 1, xp: 3, monedas: 4 },
  { id: 'h-mes', texto: 'Revisa otro mes en el dashboard', evento: 'mes', meta: 1, xp: 4, monedas: 5 },
  { id: 'h-equipar', texto: 'Cámbiale algo del look a {n}', evento: 'equipar', meta: 1, xp: 3, monedas: 4 },
  { id: 'h-regar', texto: 'Dale agüita a {n}', evento: 'regar', meta: 1, xp: 3, monedas: 4 },
  { id: 'h-trepar', texto: 'Mira a {n} agarrarse de una pared (o lánzala contra una)', evento: 'trepar', meta: 1, xp: 4, monedas: 5 },
];

const MISIONES_DIARIAS = [
  { id: 'movimientos', texto: 'Registra 2 movimientos', evento: 'movimiento', meta: 2, xp: 10, monedas: 15 },
  { id: 'regar', texto: 'Riega a {n}', evento: 'regar', meta: 1, xp: 5, monedas: 8 },
  { id: 'cosquillas', texto: 'Hazle cosquillas a {n}', evento: 'caricia', meta: 1, xp: 5, monedas: 8 },
  { id: 'monedas', texto: 'Atrapa 5 monedas', evento: 'moneda', meta: 5, xp: 8, monedas: 12 },
  { id: 'monedas15', texto: 'Atrapa 15 monedas', evento: 'moneda', meta: 15, xp: 14, monedas: 20 },
  { id: 'dashboard', texto: 'Revisa tu dashboard', evento: 'pagina-dashboard', meta: 1, xp: 4, monedas: 6 },
  { id: 'presupuestos', texto: 'Revisa tus presupuestos', evento: 'pagina-presupuestos', meta: 1, xp: 4, monedas: 6 },
  { id: 'objetivos', texto: 'Revisa tus objetivos de ahorro', evento: 'pagina-objetivos', meta: 1, xp: 4, monedas: 6 },
  { id: 'habilidad', texto: 'Usa una habilidad de {n}', evento: 'habilidad', meta: 1, xp: 5, monedas: 8 },
  { id: 'baile3', texto: 'Haz bailar a {n} 3 veces', evento: 'baile', meta: 3, xp: 8, monedas: 12 },
  { id: 'lanzar3', texto: 'Lanza a {n} 3 veces', evento: 'lanzar', meta: 3, xp: 8, monedas: 12 },
  { id: 'misiones-hora', texto: 'Completa 3 misiones de hora', evento: 'mision-hora', meta: 3, xp: 12, monedas: 18 },
];

const MISIONES_SEMANALES = [
  { id: 'aporte', texto: 'Haz un aporte a un objetivo de ahorro', evento: 'aporte', meta: 1, xp: 25, monedas: 40 },
  { id: 'aportes3', texto: 'Haz 3 aportes a tus objetivos', evento: 'aporte', meta: 3, xp: 45, monedas: 70 },
  { id: 'movimientos10', texto: 'Registra 10 movimientos', evento: 'movimiento', meta: 10, xp: 30, monedas: 50 },
  { id: 'racha', texto: 'Abre la app 4 días distintos', evento: 'visita', meta: 4, xp: 25, monedas: 40 },
  { id: 'presupuestos-sanos', texto: 'Ten todos tus presupuestos en verde', condicion: 'presupuestosSanos', meta: 1, xp: 30, monedas: 45 },
  { id: 'tasa-ahorro', texto: 'Ahorra al menos el 10% de lo que te entra este mes', condicion: 'tasaAhorro10', meta: 1, xp: 35, monedas: 50 },
  { id: 'misiones10', texto: 'Reclama 10 misiones', evento: 'mision', meta: 10, xp: 40, monedas: 60 },
  { id: 'monedas50', texto: 'Atrapa 50 monedas', evento: 'moneda', meta: 50, xp: 30, monedas: 45 },
];

// ---- Guardado ----
function idMascotaNueva() {
  return `m${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

function nuevaMascota(nombre = 'Brote') {
  return {
    id: idMascotaNueva(),
    nombre,
    creada: Date.now(),
    xp: 0,
    monedas: 0,
    puntosExtra: 0,
    agua: 100,
    ultimaAgua: Date.now(),
    ultimoRiegoXp: 0,
    ultimaCaricia: 0,
    ultimaVisita: '',
    habilidades: ['baile'],
    usos: {},
    apariencia: { maceta: 'blanca', patron: 'ninguno', franja: 'marino', hojas: 'verde', ojos: 'normal', accesorio: 'ninguno', estela: 'ninguna' },
    inventario: [],
    misiones: null,
    stats: { monedasAtrapadas: 0, riegos: 0, caricias: 0, misiones: 0 },
  };
}

// Completa campos que falten (datos de versiones anteriores).
function normalizarMascota(m) {
  const base = nuevaMascota(m.nombre || 'Brote');
  return {
    ...base,
    ...m,
    apariencia: { ...base.apariencia, ...(m.apariencia || {}) },
    stats: { ...base.stats, ...(m.stats || {}) },
    usos: m.usos || {},
    habilidades: Array.isArray(m.habilidades) ? m.habilidades : base.habilidades,
    inventario: Array.isArray(m.inventario) ? m.inventario : base.inventario,
  };
}

function guardarMascotas(datos) {
  try {
    localStorage.setItem(MASCOTAS_KEY, JSON.stringify(datos));
  } catch {
    // sin localStorage las mascotas no persisten
  }
}

function leerMascotas() {
  try {
    const datos = JSON.parse(localStorage.getItem(MASCOTAS_KEY));
    if (datos && Array.isArray(datos.mascotas) && datos.mascotas.length) {
      datos.mascotas = datos.mascotas.map(normalizarMascota);
      if (!datos.mascotas.some((m) => m.id === datos.activa)) datos.activa = datos.mascotas[0].id;
      return datos;
    }
  } catch {
    // datos corruptos: se crea de nuevo abajo
  }
  // Primera vez: se crea Brote, conservando el progreso de la version anterior.
  const primera = nuevaMascota('Brote');
  try {
    const vieja = JSON.parse(localStorage.getItem(VIDA_VIEJA_KEY));
    if (vieja && Number.isFinite(vieja.xp)) {
      ['xp', 'agua', 'ultimaAgua', 'ultimoRiegoXp', 'ultimaCaricia', 'ultimaVisita'].forEach((k) => {
        if (vieja[k] !== undefined) primera[k] = vieja[k];
      });
    }
  } catch {
    // sin datos viejos
  }
  const datos = { version: 1, activa: primera.id, mascotas: [primera] };
  guardarMascotas(datos);
  return datos;
}

// Mascota activa (la que se ve en pantalla).
function leerVida() {
  const datos = leerMascotas();
  return datos.mascotas.find((m) => m.id === datos.activa);
}

function guardarVida(mascota) {
  const datos = leerMascotas();
  const i = datos.mascotas.findIndex((m) => m.id === mascota.id);
  if (i === -1) return;
  datos.mascotas[i] = mascota;
  guardarMascotas(datos);
}

function nombreMascota() {
  return leerVida().nombre;
}

function tieneHabilidad(id, mascota = leerVida()) {
  return mascota.habilidades.includes(id);
}

// ---- Nivel, agua, puntos ----
function nivelDeXp(xp) {
  let nivel = 1;
  VIDA_NIVELES.forEach((n, i) => {
    if (xp >= n.xp) nivel = i + 1;
  });
  return nivel;
}

function aguaActual(mascota) {
  const horas = (Date.now() - mascota.ultimaAgua) / 3600000;
  const ritmo = VIDA_SED_POR_HORA * (tieneHabilidad('raices', mascota) ? 0.5 : 1);
  return Math.max(0, Math.round(mascota.agua - horas * ritmo));
}

// 1 punto por cada nivel subido, mas los comprados; menos los gastados.
function puntosDisponibles(mascota) {
  const gastados = mascota.habilidades.reduce((s, id) => s + (HABILIDADES.find((h) => h.id === id)?.costo || 0), 0);
  return nivelDeXp(mascota.xp) - 1 + (mascota.puntosExtra || 0) - gastados;
}

// ---- Apariencia: clases y variables CSS ----
function itemTienda(categoria, id) {
  return TIENDA[categoria].find((i) => i.id === id) || TIENDA[categoria][0];
}

function clasesDeMascota(mascota) {
  const nivel = Math.min(nivelDeXp(mascota.xp), 5);
  const clases = [];
  for (let i = 2; i <= nivel; i++) clases.push(`mascota--n${i}`);
  if (mascota.apariencia.accesorio !== 'ninguno') clases.push(`mascota--acc-${mascota.apariencia.accesorio}`);
  if (mascota.apariencia.patron !== 'ninguno') clases.push(`mascota--patron-${mascota.apariencia.patron}`);
  if (mascota.apariencia.ojos !== 'normal') clases.push(`mascota--ojos-${mascota.apariencia.ojos}`);
  if (new Date().getMonth() === 11) clases.push('mascota--diciembre');
  return clases.join(' ');
}

function estiloDeMascota(mascota) {
  const maceta = itemTienda('maceta', mascota.apariencia.maceta).colores;
  const hojas = itemTienda('hojas', mascota.apariencia.hojas).colores;
  const franja = itemTienda('franja', mascota.apariencia.franja).color;
  return [
    `--brote-maceta-1:${maceta[0]}`,
    `--brote-maceta-2:${maceta[1]}`,
    `--brote-borde-1:${maceta[2]}`,
    `--brote-borde-2:${maceta[3]}`,
    `--brote-franja:${franja}`,
    `--brote-hoja-1:${hojas[0]}`,
    `--brote-hoja-2:${hojas[1]}`,
    `--brote-hoja-3:${hojas[2]}`,
    `--brote-tallo:${hojas[3]}`,
  ].join(';');
}

// Usadas tambien por la mascota de la pantalla de PIN (js/pin.js).
function clasesVidaBrote() {
  return clasesDeMascota(leerVida());
}

function estiloVidaBrote() {
  return estiloDeMascota(leerVida());
}

function aplicarClasesVida(el, mascota = leerVida()) {
  if (!el) return;
  [...el.classList].filter((c) => /^mascota--(n\d|acc-|patron-|ojos-|diciembre)/.test(c)).forEach((c) => el.classList.remove(c));
  clasesDeMascota(mascota)
    .split(' ')
    .filter(Boolean)
    .forEach((c) => el.classList.add(c));
  const sinColores = el.style.cssText.replace(/--brote-[^;]+;?/g, '').trim();
  el.style.cssText = `${sinColores}${sinColores && !sinColores.endsWith(';') ? ';' : ''}${estiloDeMascota(mascota)}`;
}

// ---- XP, monedas y textos flotantes ----
function textoFlotante(texto, clase = 'mascota-xp') {
  if (!Mascota.el) return;
  const span = document.createElement('span');
  span.className = clase;
  span.textContent = texto;
  Mascota.el.appendChild(span);
  setTimeout(() => span.remove(), 1200);
}

function ganarXp(cantidad) {
  const mascota = leerVida();
  const total = Math.round(cantidad * (tieneHabilidad('fotosintesis', mascota) ? 1.25 : 1));
  const antes = nivelDeXp(mascota.xp);
  mascota.xp += total;
  const despues = nivelDeXp(mascota.xp);
  if (despues > antes) mascota.monedas += 20 * (despues - antes);
  guardarVida(mascota);
  if (typeof MenuMascota !== 'undefined') MenuMascota.refrescar();
  if (!Mascota.el) return;
  textoFlotante(`+${total} XP`);
  aplicarClasesVida(Mascota.el, mascota);
  if (despues > antes) {
    const nivel = VIDA_NIVELES[despues - 1];
    setTimeout(() => {
      lanzarConfeti();
      Mascota.estadoTemporal('celebrando', 4500);
      Mascota.animar('mascota--nivel');
      Mascota.lanzarParticulas(['⭐', '✨', '🌟', '✨', '⭐', '🌟'], 'mascota-corazon', 1500);
      if (typeof MenuMascota !== 'undefined') MenuMascota.celebrarNivel(despues);
      Mascota.mostrarMensaje(`¡Subí a nivel ${despues}: ${nivel.nombre}! ${nivel.emoji} Tengo un punto de habilidad nuevo ✨`, 6500);
    }, 500);
  }
}

function ganarMonedas(cantidad) {
  const mascota = leerVida();
  mascota.monedas += cantidad;
  guardarVida(mascota);
}

// ---- Misiones ----
function claveHora(fecha = new Date()) {
  return `${todayIso()}T${String(fecha.getHours()).padStart(2, '0')}`;
}

function claveSemana(fecha = new Date()) {
  const lunes = new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate());
  lunes.setDate(lunes.getDate() - ((lunes.getDay() + 6) % 7));
  return `${lunes.getFullYear()}-${String(lunes.getMonth() + 1).padStart(2, '0')}-${String(lunes.getDate()).padStart(2, '0')}`;
}

// Elige "cantidad" misiones al azar pero fijas para ese dia/semana y mascota.
function elegirMisiones(pool, cantidad, semilla) {
  let h = 0;
  for (const c of semilla) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  const copia = pool.slice();
  for (let i = copia.length - 1; i > 0; i--) {
    h = (h * 1103515245 + 12345) >>> 0;
    const j = h % (i + 1);
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia.slice(0, cantidad).map((m) => m.id);
}

function asegurarMisiones(mascota) {
  const hoy = todayIso();
  const semana = claveSemana();
  let cambio = false;
  if (!mascota.misiones) mascota.misiones = {};
  const m = mascota.misiones;
  if (m.dia !== hoy) {
    m.dia = hoy;
    m.diarias = elegirMisiones(MISIONES_DIARIAS, 4, hoy + mascota.id);
    m.progresoDia = {};
    m.reclamadasDia = [];
    cambio = true;
  }
  const hora = claveHora();
  if (m.hora !== hora) {
    m.hora = hora;
    m.horarias = elegirMisiones(MISIONES_HORA, 2, hora + mascota.id);
    m.progresoHora = {};
    m.reclamadasHora = [];
    cambio = true;
  }
  if (m.semana !== semana) {
    m.semana = semana;
    m.semanales = elegirMisiones(MISIONES_SEMANALES, 3, semana + mascota.id);
    m.progresoSemana = {};
    m.reclamadasSemana = [];
    cambio = true;
  }
  return cambio;
}

// Algunas misiones se cumplen por una condicion (no por eventos).
const CONDICIONES = {
  presupuestosSanos() {
    const presupuestos = Storage.getPresupuestos();
    if (!presupuestos.length) return false;
    const mes = currentMonthKey();
    const gastos = {};
    Storage.getMovimientos()
      .filter((m) => m.tipo === 'gasto' && m.fecha.startsWith(mes))
      .forEach((m) => {
        gastos[m.categoria] = (gastos[m.categoria] || 0) + m.valor;
      });
    return presupuestos.every((p) => (gastos[p.categoria] || 0) <= p.limite);
  },
  tasaAhorro10() {
    const mes = currentMonthKey();
    const ingresos = Storage.getMovimientos()
      .filter((m) => m.tipo === 'ingreso' && m.fecha.startsWith(mes))
      .reduce((s, m) => s + m.valor, 0);
    if (!ingresos) return false;
    const aportes = Storage.getObjetivos()
      .flatMap((o) => o.aportes)
      .filter((a) => a.fecha.startsWith(mes))
      .reduce((s, a) => s + a.valor, 0);
    return aportes / ingresos >= 0.1;
  },
};

// Lista de misiones con su progreso, para el menu.
function misionesDe(mascota) {
  if (asegurarMisiones(mascota)) guardarVida(mascota);
  const m = mascota.misiones;
  const armar = (pool, ids, progreso, reclamadas, tipo) =>
    ids
      .map((id) => pool.find((x) => x.id === id))
      .filter(Boolean)
      .map((def) => {
        const avance = def.condicion ? (CONDICIONES[def.condicion]() ? 1 : 0) : Math.min(progreso[def.id] || 0, def.meta);
        return { ...def, tipo, texto: def.texto.replace('{n}', mascota.nombre), avance, completa: avance >= def.meta, reclamada: reclamadas.includes(def.id) };
      });
  return {
    horarias: armar(MISIONES_HORA, m.horarias, m.progresoHora, m.reclamadasHora, 'hora'),
    diarias: armar(MISIONES_DIARIAS, m.diarias, m.progresoDia, m.reclamadasDia, 'dia'),
    semanales: armar(MISIONES_SEMANALES, m.semanales, m.progresoSemana, m.reclamadasSemana, 'semana'),
  };
}

function misionesPorReclamar(mascota = leerVida()) {
  const { horarias, diarias, semanales } = misionesDe(mascota);
  return [...horarias, ...diarias, ...semanales].filter((x) => x.completa && !x.reclamada).length;
}

function actualizarBadgeMisiones() {
  const badge = document.getElementById('badge-misiones');
  if (!badge) return;
  const n = misionesPorReclamar();
  badge.textContent = n;
  badge.hidden = n === 0;
}

// Registra que paso algo (guardar un movimiento, regar...) y avanza las misiones.
function registrarEvento(evento, cantidad = 1) {
  const mascota = leerVida();
  asegurarMisiones(mascota);
  const m = mascota.misiones;
  const cumplidas = [];
  const avanzar = (pool, ids, progreso) => {
    ids.forEach((id) => {
      const def = pool.find((x) => x.id === id);
      if (!def || def.evento !== evento) return;
      const antes = progreso[id] || 0;
      progreso[id] = Math.min(def.meta, antes + cantidad);
      if (antes < def.meta && progreso[id] >= def.meta) cumplidas.push(def.texto.replace('{n}', mascota.nombre));
    });
  };
  avanzar(MISIONES_HORA, m.horarias, m.progresoHora);
  avanzar(MISIONES_DIARIAS, m.diarias, m.progresoDia);
  avanzar(MISIONES_SEMANALES, m.semanales, m.progresoSemana);
  guardarVida(mascota);
  actualizarBadgeMisiones();
  if (typeof MenuMascota !== 'undefined') MenuMascota.refrescar();
  if (cumplidas.length && Mascota.el) {
    setTimeout(() => {
      Mascota.animar('mascota--salto');
      Mascota.mostrarMensaje(`🎯 ¡Misión cumplida: ${cumplidas[0]}! Reclama el premio en mi menú 🎁`, 5000);
    }, 1200);
  }
}

const LISTA_POR_TIPO = { hora: 'horarias', dia: 'diarias', semana: 'semanales' };
const RECLAMADAS_POR_TIPO = { hora: 'reclamadasHora', dia: 'reclamadasDia', semana: 'reclamadasSemana' };

function reclamarMision(tipo, id) {
  const mascota = leerVida();
  const lista = misionesDe(mascota)[LISTA_POR_TIPO[tipo]];
  const mision = lista && lista.find((x) => x.id === id);
  if (!mision || !mision.completa || mision.reclamada) return null;
  mascota.misiones[RECLAMADAS_POR_TIPO[tipo]].push(id);
  mascota.monedas += mision.monedas;
  mascota.stats.misiones++;
  guardarVida(mascota);
  ganarXp(mision.xp);
  registrarEvento('mision');
  if (tipo === 'hora') registrarEvento('mision-hora');
  actualizarBadgeMisiones();
  if (Mascota.el) {
    Mascota.animar('mascota--salto');
    Mascota.lanzarParticulas(['🪙', '🪙', '🎁', '🪙', '✨'], 'mascota-corazon', 1400);
    setTimeout(() => textoFlotante(`+🪙${mision.monedas}`, 'mascota-xp mascota-xp-monedas'), 350);
  }
  return mision;
}

// ---- Habilidades ----
function estadoHabilidad(def, mascota = leerVida()) {
  const nivel = nivelDeXp(mascota.xp);
  const aprendida = mascota.habilidades.includes(def.id);
  const falta = def.espera ? Math.max(0, (mascota.usos[def.id] || 0) + def.espera - Date.now()) : 0;
  return {
    aprendida,
    bloqueada: nivel < def.nivel,
    puedeAprender: !aprendida && nivel >= def.nivel && puntosDisponibles(mascota) >= def.costo,
    enEspera: falta,
  };
}

function aprenderHabilidad(id) {
  const mascota = leerVida();
  const def = HABILIDADES.find((h) => h.id === id);
  if (!def || !estadoHabilidad(def, mascota).puedeAprender) return false;
  mascota.habilidades.push(id);
  guardarVida(mascota);
  if (Mascota.el) {
    Mascota.animar('mascota--poder');
    Mascota.lanzarParticulas(['✨', def.icono, '✨', '⚡', '✨'], 'mascota-corazon', 1400);
    textoFlotante(`${def.icono} ¡Nueva habilidad!`);
  }
  return true;
}

// Proyeccion de gastos del mes al ritmo actual (habilidad Pronostico).
function pronosticoTexto() {
  const hoy = new Date();
  const mes = currentMonthKey(hoy);
  const dia = hoy.getDate();
  const diasMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0).getDate();
  const delMes = Storage.getMovimientos().filter((m) => m.fecha.startsWith(mes));
  const gastos = delMes.filter((m) => m.tipo === 'gasto').reduce((s, m) => s + m.valor, 0);
  const ingresos = delMes.filter((m) => m.tipo === 'ingreso').reduce((s, m) => s + m.valor, 0);
  if (!gastos) return '🔮 Aún no hay gastos este mes para hacer un pronóstico.';
  const proyeccion = (gastos / dia) * diasMes;
  let texto = `🔮 A este ritmo cerrarás ${MESES_LARGOS[hoy.getMonth()]} con ${formatCurrency(proyeccion)} en gastos`;
  if (ingresos > 0) {
    texto += proyeccion > ingresos ? `, más de lo que entró (${formatCurrency(ingresos)}). ¡Ojo!` : ` y te sobrarían ${formatCurrency(ingresos - proyeccion)}.`;
  } else {
    texto += '.';
  }
  if (dia < 5) texto += ' (Todavía es pronto, el cálculo puede cambiar.)';
  return texto;
}

// Devuelve un texto para mostrar en el menu (o null si se uso bien).
function usarHabilidad(id) {
  const mascota = leerVida();
  const def = HABILIDADES.find((h) => h.id === id);
  if (!def || def.tipo !== 'activa') return 'Esa habilidad no se usa así.';
  const estado = estadoHabilidad(def, mascota);
  if (!estado.aprendida) return 'Primero tienes que aprenderla.';
  if (estado.enEspera > 0) return `Está descansando: lista en ${duracionCorta(estado.enEspera)}.`;
  const necesitaVerla = id !== 'pronostico';
  if (necesitaVerla && !Mascota.el) return `Activa a ${mascota.nombre} en Configuración para verla en acción.`;

  mascota.usos[id] = Date.now();
  guardarVida(mascota);
  registrarEvento('habilidad');

  if (id === 'baile') {
    registrarEvento('baile');
    Mascota.estadoTemporal('feliz', 2500);
    Mascota.animar('mascota--baile');
    Mascota.mostrarMensaje('💃 ¡A bailar!', 2500);
  } else if (id === 'lluvia') {
    lluviaMonedas(8);
    Mascota.mostrarMensaje('🌧️ ¡Lluvia dorada!', 2000);
  } else if (id === 'pronostico') {
    if (Mascota.el) Mascota.mostrarMensaje(pronosticoTexto(), 10000);
    return pronosticoTexto();
  } else if (id === 'supersalto') {
    if (Mascota.modo === 'pared') Mascota.bajarDePared();
    const velocidad = Math.sqrt(2 * MASCOTA_GRAVEDAD * window.innerHeight * 0.6);
    Mascota.soltarEnAire((Math.random() - 0.5) * 400, velocidad, true);
    Mascota.el.classList.add('mascota--volteretas');
    Mascota.mostrarMensaje('🚀 ¡Súper salto!', 2000);
  }
  return null;
}

function duracionCorta(ms) {
  const min = Math.ceil(ms / 60000);
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  return `${h} h ${min % 60} min`;
}

// ---- Tienda y apariencia ----
function poseeItem(mascota, categoria, id) {
  return itemTienda(categoria, id).precio === 0 || mascota.inventario.includes(`${categoria}:${id}`);
}

// Equipa (comprando si hace falta). Devuelve un texto de resultado.
function equiparItem(categoria, id) {
  const mascota = leerVida();
  const item = TIENDA[categoria].find((i) => i.id === id);
  if (!item) return null;
  let compro = false;
  if (!poseeItem(mascota, categoria, id)) {
    if (item.nivel && nivelDeXp(mascota.xp) < item.nivel) return `🔒 Se desbloquea en el nivel ${item.nivel}.`;
    if (mascota.monedas < item.precio) return `Te faltan 🪙 ${item.precio - mascota.monedas} para comprarlo.`;
    mascota.monedas -= item.precio;
    mascota.inventario.push(`${categoria}:${id}`);
    compro = true;
  }
  const cambio = mascota.apariencia[categoria] !== id;
  mascota.apariencia[categoria] = id;
  guardarVida(mascota);
  if (cambio) registrarEvento('equipar');
  if (Mascota.el) {
    aplicarClasesVida(Mascota.el, mascota);
    Mascota.animar('mascota--poof');
    Mascota.lanzarParticulas(['✨', '💫', '✨', '⭐'], 'mascota-corazon', 1200);
    if (compro) textoFlotante(`−🪙${item.precio}`, 'mascota-xp mascota-xp-gasto');
  }
  return compro ? `🛍️ ¡Compraste ${item.nombre}!` : `${item.nombre} ✓`;
}

function comprarPunto() {
  const mascota = leerVida();
  const precio = 150;
  if (mascota.monedas < precio) return `Te faltan 🪙 ${precio - mascota.monedas}.`;
  mascota.monedas -= precio;
  mascota.puntosExtra = (mascota.puntosExtra || 0) + 1;
  guardarVida(mascota);
  return '✨ ¡Punto de habilidad comprado!';
}

// ---- Varias mascotas ----
function remontarMascota(entrada = false) {
  if (!Mascota.el) return;
  Mascota.desmontar();
  Mascota.montar();
  if (entrada && Mascota.el && !sinMovimiento()) {
    Mascota.y = window.innerHeight - Mascota.alto() - 10;
    Mascota.soltarEnAire(0, 0, true);
    Mascota.el.classList.add('mascota--volteretas');
    Mascota.lanzarParticulas(['💨', '✨', '💨', '✨'], 'mascota-corazon', 1200);
  }
}

function adoptarMascota(nombre) {
  const datos = leerMascotas();
  if (datos.mascotas.length >= MASCOTAS_MAX) return `Puedes tener hasta ${MASCOTAS_MAX} mascotas.`;
  const limpio = (nombre || '').trim().slice(0, 18);
  if (!limpio) return 'Ponle un nombre.';
  const nueva = nuevaMascota(limpio);
  datos.mascotas.push(nueva);
  datos.activa = nueva.id;
  guardarMascotas(datos);
  remontarMascota(true);
  if (Mascota.el) setTimeout(() => Mascota.mostrarMensaje(`¡Hola! Soy ${nueva.nombre} 🐣 ¡Gracias por adoptarme!`, 5000), 900);
  return null;
}

function activarMascota(id) {
  const datos = leerMascotas();
  if (!datos.mascotas.some((m) => m.id === id)) return;
  datos.activa = id;
  guardarMascotas(datos);
  remontarMascota(true);
  actualizarBadgeMisiones();
  if (Mascota.el) setTimeout(() => Mascota.mostrarMensaje(`¡Aquí estoy! 🌱`, 2500), 900);
}

function liberarMascota(id) {
  const datos = leerMascotas();
  if (datos.mascotas.length <= 1) return 'Necesitas al menos una mascota.';
  datos.mascotas = datos.mascotas.filter((m) => m.id !== id);
  if (datos.activa === id) datos.activa = datos.mascotas[0].id;
  guardarMascotas(datos);
  remontarMascota();
  actualizarBadgeMisiones();
  return null;
}

function renombrarMascota(nombre) {
  const limpio = (nombre || '').trim().slice(0, 18);
  if (!limpio) return 'El nombre no puede quedar vacío.';
  const mascota = leerVida();
  mascota.nombre = limpio;
  guardarVida(mascota);
  remontarMascota();
  return null;
}

// Cuidados basicos (tambien funcionan si la mascota esta oculta).
function regarDatos() {
  const mascota = leerVida();
  mascota.agua = 100;
  mascota.ultimaAgua = Date.now();
  mascota.stats.riegos++;
  const daXp = Date.now() - mascota.ultimoRiegoXp > 3600000;
  if (daXp) mascota.ultimoRiegoXp = Date.now();
  guardarVida(mascota);
  registrarEvento('regar');
  return daXp;
}

function mimarDatos() {
  const mascota = leerVida();
  mascota.stats.caricias++;
  const daXp = Date.now() - mascota.ultimaCaricia > 600000;
  if (daXp) mascota.ultimaCaricia = Date.now();
  guardarVida(mascota);
  registrarEvento('caricia');
  return daXp;
}

// ---- Se engancha a lo que ya hace la mascota ----
MASCOTA_ANIMACIONES['mascota-baile'] = 'mascota--baile';

const vidaOriginal = {
  montar: Mascota.montar,
  actualizar: Mascota.actualizar,
  reaccionar: Mascota.reaccionar,
  regar: Mascota.regar,
  cosquillas: Mascota.cosquillas,
  celebrar: Mascota.celebrar,
  caminarA: Mascota.caminarA,
  girar: Mascota.girar,
  soltarArrastre: Mascota.soltarArrastre,
  agarrarPared: Mascota.agarrarPared,
  alTocar: Mascota.alTocar,
};

Mascota.girar = function () {
  vidaOriginal.girar.call(this);
  registrarEvento('girar');
};

Mascota.soltarArrastre = function (e) {
  vidaOriginal.soltarArrastre.call(this, e);
  if (this.modo === 'aire' && this.vel && Math.hypot(this.vel.x, this.vel.y) > 900) registrarEvento('lanzar');
};

Mascota.agarrarPared = function (lado) {
  vidaOriginal.agarrarPared.call(this, lado);
  registrarEvento('trepar');
};

Mascota.alTocar = function () {
  const dormida = this.el?.classList.contains('mascota--dormida');
  vidaOriginal.alTocar.call(this);
  if (!dormida) registrarEvento('consejo');
};

Mascota.montar = function () {
  vidaOriginal.montar.call(this);
  if (!this.el) return;
  aplicarClasesVida(this.el);
  // +5 XP y un dia mas de racha por la primera visita del dia
  const mascota = leerVida();
  if (mascota.ultimaVisita !== todayIso()) {
    mascota.ultimaVisita = todayIso();
    guardarVida(mascota);
    registrarEvento('visita');
    setTimeout(() => ganarXp(5), 2500);
  }
};

// Si tiene sed se le nota; con Pronostico suma la proyeccion a sus consejos.
Mascota.actualizar = function () {
  vidaOriginal.actualizar.call(this);
  const mascota = leerVida();
  if (tieneHabilidad('pronostico', mascota)) this.mensajes.splice(1, 0, pronosticoTexto());
  if (aguaActual(mascota) >= VIDA_UMBRAL_SED || this.estadoBase === 'dormida') return;
  this.estadoBase = 'sediento';
  this.mensajes.unshift('Tengo sed… 🥺 Mantenme presionada para regarme 💧');
  if (!this.timerEstado) this.aplicarEstado('sediento');
};

Mascota.reaccionar = function (tipo, mensaje = '') {
  vidaOriginal.reaccionar.call(this, tipo);
  if (tipo === 'error' || /elimin|borr/i.test(mensaje)) return;
  ganarXp(/aporte/i.test(mensaje) ? 8 : 4);
  if (/movimiento guardado/i.test(mensaje)) registrarEvento('movimiento');
  const importados = mensaje.match(/importaron (\d+)/i);
  if (importados) registrarEvento('movimiento', Number(importados[1]));
  if (/aporte agregado|completaste/i.test(mensaje)) registrarEvento('aporte');
  if (/guardado|aporte agregado|importaron/i.test(mensaje)) lluviaMonedas(/importaron|aporte/i.test(mensaje) ? 6 : 4);
};

Mascota.regar = function () {
  vidaOriginal.regar.call(this);
  const daXp = regarDatos();
  setTimeout(() => {
    textoFlotante('💧 100%', 'mascota-xp mascota-xp-agua');
    this.actualizar();
    if (daXp) setTimeout(() => ganarXp(3), 600);
  }, 900);
};

Mascota.cosquillas = function () {
  vidaOriginal.cosquillas.call(this);
  if (mimarDatos()) ganarXp(1);
};

Mascota.celebrar = function (mensaje) {
  vidaOriginal.celebrar.call(this, mensaje);
  ganarXp(40);
};

// Pies ligeros: todo un 40% mas rapido.
Mascota.caminarA = function (destinoX, despues, velocidad = 70) {
  const factor = tieneHabilidad('veloz') ? 1.4 : 1;
  return vidaOriginal.caminarA.call(this, destinoX, despues, velocidad * factor);
};

// Ficha rapida en el globo
Mascota.mostrarEstado = function () {
  const mascota = leerVida();
  const nivel = nivelDeXp(mascota.xp);
  const actual = VIDA_NIVELES[nivel - 1];
  const siguiente = VIDA_NIVELES[nivel];
  const progreso = siguiente ? `${mascota.xp}/${siguiente.xp} XP` : `${mascota.xp} XP · ¡nivel máximo!`;
  this.animar('mascota--salto');
  this.mostrarMensaje(`${actual.emoji} Nivel ${nivel} · ${actual.nombre} · 💧 ${aguaActual(mascota)}% · ${progreso}`, 7000);
};

// ---- Minijuego: lluvia de monedas ----
const Monedas = { lista: [], corriendo: false, atrapadas: 0, total: 0, ultimo: 0 };
const MONEDA_TAM = 26;

function lluviaMonedas(cantidad) {
  if (!Mascota.el || sinMovimiento() || document.hidden) return;
  if (Mascota.modo === 'pared') Mascota.saltarDePared();
  for (let i = 0; i < cantidad; i++) {
    const el = document.createElement('div');
    el.className = 'moneda-lluvia';
    el.innerHTML = '<span class="moneda-cara">$</span>';
    document.body.appendChild(el);
    Monedas.lista.push({ el, x: window.innerWidth * (0.12 + Math.random() * 0.76), y: -40 - i * 90, vy: 0, estado: 'cae', desde: 0 });
  }
  Monedas.total += cantidad;
  Mascota.enJuego = true;
  if (!Monedas.corriendo) {
    Monedas.corriendo = true;
    Monedas.ultimo = performance.now();
    requestAnimationFrame(cicloMonedas);
  }
}

function cicloMonedas(ahora) {
  const dt = Math.min((ahora - Monedas.ultimo) / 1000, 0.05);
  Monedas.ultimo = ahora;
  if (!Mascota.el) {
    Monedas.lista.forEach((m) => m.el.remove());
    Monedas.lista = [];
  }
  const piso = window.innerHeight - (Mascota.el ? Mascota.alturaPiso() : 0);
  const caja = Mascota.btn?.getBoundingClientRect();
  const iman = tieneHabilidad('iman');
  const margen = iman ? -6 : 8;

  Monedas.lista.forEach((m) => {
    if (m.estado === 'cae') {
      m.vy += 1300 * dt;
      m.y += m.vy * dt;
      if (m.y + MONEDA_TAM >= piso) {
        m.y = piso - MONEDA_TAM;
        m.estado = 'suelo';
        m.desde = ahora;
        m.el.classList.add('moneda-rebota');
      }
    } else if (m.estado === 'suelo' && ahora - m.desde > 2800) {
      m.estado = 'perdida';
      m.el.classList.add('moneda-se-va');
      setTimeout(() => m.el.remove(), 400);
    }

    // Iman: las monedas cercanas se deslizan hacia la mascota
    if (iman && caja && (m.estado === 'cae' || m.estado === 'suelo')) {
      const dx = caja.left + caja.width / 2 - (m.x + MONEDA_TAM / 2);
      if (Math.abs(dx) < 260) m.x += Math.sign(dx) * Math.min(Math.abs(dx), 150 * dt);
    }
    m.el.style.transform = `translate(${m.x.toFixed(1)}px, ${m.y.toFixed(1)}px)`;

    if (caja && (m.estado === 'cae' || m.estado === 'suelo')) {
      const cx = m.x + MONEDA_TAM / 2;
      const cy = m.y + MONEDA_TAM / 2;
      if (cx > caja.left + margen && cx < caja.right - margen && cy > caja.top + margen && cy < caja.bottom + 6) {
        m.estado = 'atrapada';
        m.el.classList.add('moneda-atrapada');
        setTimeout(() => m.el.remove(), 450);
        Monedas.atrapadas++;
        Mascota.animar('mascota--moneda');
        textoFlotante('+1 🪙');
        const mascota = leerVida();
        mascota.monedas++;
        mascota.stats.monedasAtrapadas++;
        guardarVida(mascota);
        registrarEvento('moneda');
      }
    }
  });
  Monedas.lista = Monedas.lista.filter((m) => m.estado === 'cae' || m.estado === 'suelo');

  if (Monedas.lista.length) {
    perseguirMoneda();
    requestAnimationFrame(cicloMonedas);
  } else {
    terminarLluvia();
  }
}

// Corre hacia la moneda mas cercana al piso (y baja de la tarjeta si hace falta).
function perseguirMoneda() {
  if (!Mascota.el || Mascota.arrastre || Mascota.modo !== 'suelo') return;
  const m = Mascota.movimiento;
  if (m && m.tipo !== 'caminar') return;
  const objetivo = Monedas.lista.reduce((a, b) => (!a || b.y > a.y ? b : a), null);
  if (!objetivo) return;
  const destino = objetivo.x + MONEDA_TAM / 2 - Mascota.ancho() / 2;
  if (Mascota.superficie) {
    Mascota.saltarA(null, destino);
    return;
  }
  if (Math.abs(destino - Mascota.x) < 6) return;
  if (!m || Math.abs(m.destinoX - destino) > 8) Mascota.caminarA(destino, null, 260);
}

function terminarLluvia() {
  Monedas.corriendo = false;
  Mascota.enJuego = false;
  if (Mascota.movimiento?.tipo === 'caminar') Mascota.terminarMovimiento(false);
  const { atrapadas, total } = Monedas;
  Monedas.atrapadas = 0;
  Monedas.total = 0;
  if (!Mascota.el || !total) return;
  if (atrapadas === total) {
    Mascota.estadoTemporal('celebrando', 2500);
    Mascota.mostrarMensaje('¡Las atrapé todas! 💰✨', 3500);
    ganarXp(3);
  } else if (atrapadas > 0) {
    Mascota.mostrarMensaje(`¡Atrapé ${atrapadas} de ${total}! 🪙`, 3000);
  } else {
    Mascota.mostrarMensaje('Uy, se me escaparon todas 😅', 3000);
  }
  Mascota.programarPaseo();
}

// ---- Llamarla con doble clic en un espacio vacio ----
function venirA(cx, cy) {
  const marcador = document.createElement('span');
  marcador.className = 'mascota-marcador';
  marcador.style.left = `${cx}px`;
  marcador.style.top = `${cy}px`;
  document.body.appendChild(marcador);
  setTimeout(() => marcador.remove(), 700);

  if (Mascota.modo === 'pared') {
    Mascota.saltarDePared();
    return;
  }
  if (Mascota.modo !== 'suelo' || Mascota.movimiento?.tipo === 'saltar') return;

  const destino = cx - Mascota.ancho() / 2;
  const tarjeta = document.elementsFromPoint(cx, cy).find((el) => el.matches?.(MASCOTA_PLATAFORMAS));
  if (tarjeta && Mascota.esPlataformaValida(tarjeta)) {
    if (tarjeta === Mascota.superficie) Mascota.caminarA(destino, null, 240);
    else Mascota.saltarA(tarjeta, destino);
  } else if (Mascota.superficie) {
    Mascota.saltarA(null, destino);
  } else {
    Mascota.caminarA(destino, null, 240);
  }
  Mascota.mostrarMensaje(elegirAlAzar(['¡Voy! 🏃', '¡Ahí voy!', '¿Me llamaste? 🌱']), 1800);
  registrarEvento('llamar');
}

document.addEventListener('dblclick', (e) => {
  if (!Mascota.el || Mascota.arrastre || Mascota.enJuego) return;
  const interactivo = 'a, button, input, select, textarea, label, table, .mascota, .modal-overlay, .comandos-overlay, .pin-lock-overlay, .mascota-menu-overlay';
  if (e.target.closest(interactivo)) return;
  window.getSelection()?.removeAllRanges();
  venirA(e.clientX, e.clientY);
});

// ---- Se preocupa con los botones de borrar ----
let ultimoAvisoBorrar = 0;
document.addEventListener('pointerover', (e) => {
  if (!e.target.closest?.('.icon-btn-danger, .btn-danger')) return;
  if (!Mascota.el || !Mascota.burbuja.hidden || Date.now() - ultimoAvisoBorrar < 45000) return;
  ultimoAvisoBorrar = Date.now();
  Mascota.estadoTemporal('preocupada', 2000);
  Mascota.mostrarMensaje('¿Seguro? 😟 Eso no se puede deshacer.', 2600);
});

// Misiones de "revisar" paginas, y el contador de misiones por reclamar.
document.addEventListener('DOMContentLoaded', () => {
  const pagina = document.body.dataset.page;
  if (['dashboard', 'presupuestos', 'objetivos'].includes(pagina)) setTimeout(() => registrarEvento(`pagina-${pagina}`), 1500);
  actualizarBadgeMisiones();
});

// Revisa la sed cada 10 minutos por si la app queda abierta mucho rato.
setInterval(() => {
  if (Mascota.el) Mascota.actualizar();
}, 600000);

// ---- Estela: deja particulas al caminar, correr, volar o trepar ----
setInterval(() => {
  if (!Mascota.el || sinMovimiento() || document.hidden) return;
  const enMovimiento = Mascota.movimiento || Mascota.modo === 'aire' || Mascota.arrastre?.activo;
  if (!enMovimiento) return;
  const estela = itemTienda('estela', leerVida().apariencia.estela);
  if (!estela.particulas.length) return;
  const caja = Mascota.btn.getBoundingClientRect();
  const p = document.createElement('span');
  p.className = 'mascota-estela';
  p.textContent = elegirAlAzar(estela.particulas);
  p.style.left = `${caja.left + caja.width / 2 + (Math.random() - 0.5) * 40}px`;
  p.style.top = `${caja.bottom - 14 - Math.random() * 30}px`;
  p.style.setProperty('--dx', `${(Math.random() - 0.5) * 30}px`);
  document.body.appendChild(p);
  setTimeout(() => p.remove(), 1100);
}, 130);
