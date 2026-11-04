// Recompensas del RPG (se carga despues de mascota-vida.js y mascota-menu.js):
//  - Cofres comunes, raros, epicos y legendarios con animacion de apertura.
//    Pueden traer monedas, XP, puntos de habilidad y cosmeticos EXCLUSIVOS.
//  - Racha diaria: calendario de 7 dias (el dia 7 trae un cofre legendario).
//  - Mision relampago: una mision especial que cambia cada 3 horas.
//  - Bonos por completar todas las diarias o todas las semanales.
//  - Cofres de hito al llegar a ciertos niveles.
//  - Perfil del jugador con estadisticas y logros (con premio).
const PERFIL_KEY = 'financeAppPerfil';

const RAREZAS = {
  comun: { nombre: 'Común', orden: 1 },
  raro: { nombre: 'Raro', orden: 2 },
  epico: { nombre: 'Épico', orden: 3 },
  legendario: { nombre: 'Legendario', orden: 4 },
};

// item: probabilidad de traer un cosmetico exclusivo; punto: de traer un punto de habilidad
const COFRES = {
  comun: { monedas: [15, 30], xp: 8, item: 0.25, punto: 0 },
  raro: { monedas: [40, 70], xp: 20, item: 0.45, punto: 0 },
  epico: { monedas: [100, 160], xp: 50, item: 0.75, punto: 0.2 },
  legendario: { monedas: [220, 320], xp: 120, item: 1, punto: 1 },
};

const CALENDARIO = [
  { dia: 1, tipo: 'monedas', cantidad: 20 },
  { dia: 2, tipo: 'cofre', rareza: 'comun' },
  { dia: 3, tipo: 'monedas', cantidad: 40 },
  { dia: 4, tipo: 'cofre', rareza: 'raro' },
  { dia: 5, tipo: 'monedas', cantidad: 70 },
  { dia: 6, tipo: 'cofre', rareza: 'epico' },
  { dia: 7, tipo: 'cofre', rareza: 'legendario' },
];

const RELAMPAGOS = [
  { id: 'r-monedas', texto: 'Atrapa 10 monedas', evento: 'moneda', meta: 10 },
  { id: 'r-movimientos', texto: 'Registra 3 movimientos', evento: 'movimiento', meta: 3 },
  { id: 'r-caricias', texto: 'Mima a {n} 3 veces', evento: 'caricia', meta: 3 },
  { id: 'r-lanzar', texto: 'Lanza a {n} 2 veces por los aires', evento: 'lanzar', meta: 2 },
  { id: 'r-habilidades', texto: 'Usa 2 habilidades de {n}', evento: 'habilidad', meta: 2 },
  { id: 'r-aporte', texto: 'Haz un aporte a un objetivo de ahorro', evento: 'aporte', meta: 1 },
  { id: 'r-misiones', texto: 'Reclama 3 misiones', evento: 'mision', meta: 3 },
  { id: 'r-girar', texto: 'Haz girar a {n} 3 veces', evento: 'girar', meta: 3 },
];

// Cofre que se gana al llegar a ciertos niveles
const HITOS_NIVEL = { 3: 'raro', 5: 'epico', 7: 'epico', 10: 'legendario' };

const AVATARES = ['mascota', '🌱', '🌻', '🐱', '🦊', '🐼', '🐸', '🦉', '🐙', '🦄', '🐝', '😎'];

const LOGROS = [
  { id: 'primer-movimiento', icono: '📝', nombre: 'Primer paso', desc: 'Registra tu primer movimiento', valor: (c) => c.movimientos, meta: 1, premio: 20 },
  { id: 'movimientos-50', icono: '📚', nombre: 'Cuentas claras', desc: 'Registra 50 movimientos', valor: (c) => c.movimientos, meta: 50, premio: 60 },
  { id: 'movimientos-200', icono: '🏦', nombre: 'Archivista', desc: 'Registra 200 movimientos', valor: (c) => c.movimientos, meta: 200, premio: 150 },
  { id: 'objetivo', icono: '🎯', nombre: 'Meta cumplida', desc: 'Completa un objetivo de ahorro', valor: (c) => c.objetivos, meta: 1, premio: 80 },
  { id: 'verde', icono: '🟢', nombre: 'Todo en verde', desc: 'Ten todos tus presupuestos sin pasarte', valor: (c) => (c.presupuestosSanos ? 1 : 0), meta: 1, premio: 40 },
  { id: 'racha-3', icono: '🔥', nombre: 'Constancia', desc: 'Llega a una racha de 3 días', valor: (c) => c.mejorRacha, meta: 3, premio: 30 },
  { id: 'racha-7', icono: '☄️', nombre: 'Imparable', desc: 'Llega a una racha de 7 días', valor: (c) => c.mejorRacha, meta: 7, premio: 100 },
  { id: 'nivel-5', icono: '🌳', nombre: 'Jardinería', desc: 'Sube una mascota a nivel 5', valor: (c) => c.nivelMax, meta: 5, premio: 80 },
  { id: 'nivel-10', icono: '✨', nombre: 'Leyenda verde', desc: 'Sube una mascota a nivel 10', valor: (c) => c.nivelMax, meta: 10, premio: 300 },
  { id: 'misiones-25', icono: '🎖️', nombre: 'Aventura', desc: 'Reclama 25 misiones', valor: (c) => c.misiones, meta: 25, premio: 80 },
  { id: 'cofres-10', icono: '🎁', nombre: 'Cazatesoros', desc: 'Abre 10 cofres', valor: (c) => c.cofres, meta: 10, premio: 60 },
  { id: 'legendario', icono: '👑', nombre: 'Pura suerte', desc: 'Abre un cofre legendario', valor: (c) => c.legendarios, meta: 1, premio: 100 },
  { id: 'coleccion-10', icono: '👗', nombre: 'Con estilo', desc: 'Colecciona 10 cosméticos', valor: (c) => c.coleccion, meta: 10, premio: 50 },
  { id: 'coleccion-30', icono: '💎', nombre: 'Coleccionista', desc: 'Colecciona 30 cosméticos', valor: (c) => c.coleccion, meta: 30, premio: 150 },
  { id: 'exclusivos-5', icono: '🌈', nombre: 'Tesoros únicos', desc: 'Consigue 5 cosméticos exclusivos de cofre', valor: (c) => c.exclusivos, meta: 5, premio: 120 },
  { id: 'monedas-100', icono: '🪙', nombre: 'Atrapamonedas', desc: 'Atrapa 100 monedas', valor: (c) => c.monedasAtrapadas, meta: 100, premio: 50 },
  { id: 'mascotas-3', icono: '🐾', nombre: 'Familia grande', desc: 'Ten 3 mascotas', valor: (c) => c.mascotas, meta: 3, premio: 60 },
];

const TITULOS = [
  [0, 'Aprendiz del ahorro'],
  [3, 'Promesa del ahorro'],
  [7, 'Mente financiera'],
  [12, 'Leyenda de la plata'],
];

// ---- Perfil ----
function isoLocal(fecha) {
  return `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}-${String(fecha.getDate()).padStart(2, '0')}`;
}

function perfilBase() {
  return {
    nombre: '',
    avatar: 'mascota',
    creado: Date.now(),
    dias: 0,
    ultimoDiaUso: '',
    racha: { ultimo: '', dia: 0, actual: 0, mejor: 0 },
    logros: {},
    cofres: { total: 0, legendarios: 0 },
  };
}

function leerPerfil() {
  try {
    const p = JSON.parse(localStorage.getItem(PERFIL_KEY));
    if (p && typeof p === 'object') {
      const base = perfilBase();
      return { ...base, ...p, racha: { ...base.racha, ...(p.racha || {}) }, cofres: { ...base.cofres, ...(p.cofres || {}) }, logros: p.logros || {} };
    }
  } catch {
    // perfil corrupto: se crea de nuevo
  }
  return perfilBase();
}

function guardarPerfil(perfil) {
  try {
    localStorage.setItem(PERFIL_KEY, JSON.stringify(perfil));
  } catch {
    // sin localStorage el perfil no persiste
  }
}

function tituloPerfil(cantidadLogros) {
  return TITULOS.filter(([min]) => cantidadLogros >= min).pop()[1];
}

// ---- Calendario de racha ----
function estadoCalendario(perfil = leerPerfil()) {
  const hoy = todayIso();
  const ayer = isoLocal(new Date(Date.now() - 86400000));
  const r = perfil.racha;
  const reclamadoHoy = r.ultimo === hoy;
  const continua = r.ultimo === ayer;
  return {
    reclamadoHoy,
    dia: reclamadoHoy ? r.dia : continua ? (r.dia % 7) + 1 : 1,
    racha: reclamadoHoy || continua ? r.actual : 0,
    mejor: r.mejor,
  };
}

function calendarioPendiente() {
  return estadoCalendario().reclamadoHoy ? 0 : 1;
}

function reclamarCalendario() {
  const perfil = leerPerfil();
  const estado = estadoCalendario(perfil);
  if (estado.reclamadoHoy) return null;
  const ayer = isoLocal(new Date(Date.now() - 86400000));
  perfil.racha.actual = perfil.racha.ultimo === ayer ? perfil.racha.actual + 1 : 1;
  perfil.racha.mejor = Math.max(perfil.racha.mejor, perfil.racha.actual);
  perfil.racha.dia = estado.dia;
  perfil.racha.ultimo = todayIso();
  guardarPerfil(perfil);
  const premio = CALENDARIO[estado.dia - 1];
  if (premio.tipo === 'monedas') ganarMonedas(premio.cantidad);
  else abrirCofre(premio.rareza, `Día ${estado.dia} de tu racha 🔥`);
  actualizarBadgeMisiones();
  verificarLogrosPronto();
  return premio;
}

// ---- Mision relampago (cambia cada 3 horas) ----
function finRelampago() {
  const ahora = new Date();
  const fin = new Date(ahora);
  fin.setHours((Math.floor(ahora.getHours() / 3) + 1) * 3, 0, 0, 0);
  return fin;
}

function relampagoDe(mascota) {
  if (!mascota.misiones) asegurarMisiones(mascota);
  const clave = `${todayIso()}-b${Math.floor(new Date().getHours() / 3)}`;
  if (!mascota.misiones.relampago || mascota.misiones.relampago.clave !== clave) {
    mascota.misiones.relampago = { clave, id: elegirMisiones(RELAMPAGOS, 1, clave + mascota.id)[0], progreso: 0, reclamada: false };
    guardarVida(mascota);
  }
  const r = mascota.misiones.relampago;
  const def = RELAMPAGOS.find((x) => x.id === r.id) || RELAMPAGOS[0];
  const avance = Math.min(r.progreso, def.meta);
  return { ...def, texto: def.texto.replace('{n}', mascota.nombre), avance, completa: avance >= def.meta, reclamada: r.reclamada, fin: finRelampago(), rareza: 'raro' };
}

function reclamarRelampago() {
  const mascota = leerVida();
  const r = relampagoDe(mascota);
  if (!r.completa || r.reclamada) return false;
  mascota.misiones.relampago.reclamada = true;
  mascota.stats.misiones++;
  guardarVida(mascota);
  abrirCofre('raro', '⚡ Misión relámpago cumplida');
  actualizarBadgeMisiones();
  return true;
}

// ---- Bonos por completar todas las diarias / semanales ----
function bonusDe(mascota) {
  const { diarias, semanales } = misionesDe(mascota);
  const m = mascota.misiones;
  return {
    dia: { completas: diarias.filter((x) => x.completa).length, total: diarias.length, reclamado: m.bonusDia === m.dia, rareza: 'raro' },
    semana: { completas: semanales.filter((x) => x.completa).length, total: semanales.length, reclamado: m.bonusSemana === m.semana, rareza: 'epico' },
  };
}

function reclamarBonus(tipo) {
  const mascota = leerVida();
  const b = bonusDe(mascota)[tipo];
  if (b.reclamado || b.completas < b.total) return false;
  if (tipo === 'dia') mascota.misiones.bonusDia = mascota.misiones.dia;
  else mascota.misiones.bonusSemana = mascota.misiones.semana;
  guardarVida(mascota);
  abrirCofre(b.rareza, tipo === 'dia' ? '¡Completaste todas las diarias!' : '¡Completaste todas las semanales!');
  actualizarBadgeMisiones();
  return true;
}

// Lo que hay por reclamar fuera de las misiones normales.
function extrasPorReclamar(mascota) {
  const r = relampagoDe(mascota);
  const b = bonusDe(mascota);
  return (
    (r.completa && !r.reclamada ? 1 : 0) +
    (!b.dia.reclamado && b.dia.completas === b.dia.total ? 1 : 0) +
    (!b.semana.reclamado && b.semana.completas === b.semana.total ? 1 : 0)
  );
}

// ---- Cofres ----
function azarEntre([min, max]) {
  return Math.round(min + Math.random() * (max - min));
}

function exclusivosDe(mascota) {
  const lista = [];
  Object.entries(TIENDA).forEach(([cat, items]) => {
    items.forEach((item) => {
      if (item.exclusivo) lista.push({ cat, item, tiene: poseeItem(mascota, cat, item.id) });
    });
  });
  return lista;
}

// Elige un exclusivo que no tenga, de esa rareza o menor (mas probable el de su rareza).
function sortearItem(rareza, mascota) {
  const orden = RAREZAS[rareza].orden;
  const sinTener = exclusivosDe(mascota).filter((x) => !x.tiene && RAREZAS[x.item.exclusivo].orden <= orden);
  // Primero de su rareza o la anterior (un legendario no debe soltar cosas comunes);
  // si ya tiene todo eso, cualquiera de menor rareza.
  const cercanos = sinTener.filter((x) => RAREZAS[x.item.exclusivo].orden >= orden - 1);
  const candidatos = cercanos.length ? cercanos : sinTener;
  if (!candidatos.length) return null;
  const pesos = candidatos.map((x) => (x.item.exclusivo === rareza ? 3 : 1));
  let r = Math.random() * pesos.reduce((a, b) => a + b, 0);
  for (let i = 0; i < candidatos.length; i++) {
    r -= pesos[i];
    if (r <= 0) return candidatos[i];
  }
  return candidatos[candidatos.length - 1];
}

function generarPremio(rareza) {
  const c = COFRES[rareza];
  const mascota = leerVida();
  const premio = { rareza, monedas: azarEntre(c.monedas), xp: c.xp, item: null, punto: Math.random() < c.punto, extra: 0 };
  if (Math.random() < c.item) {
    premio.item = sortearItem(rareza, mascota);
    // Si ya tiene todos los exclusivos posibles, se compensa con monedas
    if (!premio.item) premio.extra = Math.round(premio.monedas * 0.6);
  }
  return premio;
}

function aplicarPremio(premio) {
  const mascota = leerVida();
  mascota.monedas += premio.monedas + premio.extra;
  if (premio.item) mascota.inventario.push(`${premio.item.cat}:${premio.item.item.id}`);
  if (premio.punto) mascota.puntosExtra = (mascota.puntosExtra || 0) + 1;
  guardarVida(mascota);
  const perfil = leerPerfil();
  perfil.cofres.total++;
  if (premio.rareza === 'legendario') perfil.cofres.legendarios++;
  guardarPerfil(perfil);
  ganarXp(premio.xp);
  if (Mascota.el) {
    Mascota.estadoTemporal('celebrando', 3000);
    Mascota.animar('mascota--nivel');
  }
  MenuMascota.refrescar();
  verificarLogrosPronto();
}

// Dibujo del cofre (los colores salen de la rareza, ver CSS .cofre-*)
function cofreSvg() {
  return `
    <svg viewBox="0 0 120 110" aria-hidden="true">
      <ellipse class="cofre-sombra" cx="60" cy="103" rx="44" ry="5"/>
      <g class="cofre-base">
        <rect class="cf-cuerpo" x="14" y="52" width="92" height="48" rx="8"/>
        <rect class="cf-sombra" x="16" y="54" width="88" height="10" rx="4"/>
        <rect class="cf-metal" x="26" y="52" width="10" height="48"/>
        <rect class="cf-metal" x="84" y="52" width="10" height="48"/>
        <rect class="cf-borde-linea" x="14" y="52" width="92" height="48" rx="8"/>
      </g>
      <g class="cofre-tapa">
        <path class="cf-cuerpo" d="M14 55 V40 Q14 18 60 18 Q106 18 106 40 V55 Z"/>
        <rect class="cf-metal" x="26" y="22" width="10" height="33"/>
        <rect class="cf-metal" x="84" y="22" width="10" height="33"/>
        <path class="cf-brillo" d="M22 36 Q60 22 98 36"/>
        <path class="cf-borde-linea" d="M14 55 V40 Q14 18 60 18 Q106 18 106 40 V55 Z"/>
      </g>
      <g class="cofre-candado">
        <rect class="cf-metal" x="51" y="45" width="18" height="18" rx="4"/>
        <circle class="cf-ojo" cx="60" cy="52.5" r="2.6"/>
        <rect class="cf-ojo" x="59" y="53.5" width="2" height="5"/>
      </g>
    </svg>`;
}

const colaCofres = [];
let cofreAbierto = false;

function abrirCofre(rareza, origen = '') {
  colaCofres.push({ rareza, origen });
  if (!cofreAbierto) siguienteCofre();
}

function siguienteCofre() {
  const siguiente = colaCofres.shift();
  if (!siguiente) {
    cofreAbierto = false;
    return;
  }
  cofreAbierto = true;
  mostrarCofre(siguiente.rareza, siguiente.origen);
}

function mostrarCofre(rareza, origen) {
  const premio = generarPremio(rareza);
  const overlay = document.createElement('div');
  overlay.className = `cofre-overlay cofre-${rareza}`;
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-label', `Cofre ${RAREZAS[rareza].nombre}`);
  overlay.innerHTML = `
    <div class="cofre-rayos"></div>
    <div class="cofre-luz"></div>
    <div class="cofre-escena">
      <p class="cofre-origen">${escapeHtml(origen)}</p>
      <h2 class="cofre-titulo">Cofre ${RAREZAS[rareza].nombre}</h2>
      <button type="button" class="cofre-caja" aria-label="Abrir el cofre">${cofreSvg()}</button>
      <p class="cofre-ayuda">✨ Toca el cofre para abrirlo ✨</p>
      <div class="cofre-premios"></div>
      <div class="cofre-botones"></div>
    </div>`;
  document.body.appendChild(overlay);

  const caja = overlay.querySelector('.cofre-caja');
  caja.focus();
  let abierto = false;
  const abrir = () => {
    if (abierto) return;
    abierto = true;
    aplicarPremio(premio);
    if (sinMovimiento()) {
      overlay.classList.add('abierto');
      mostrarPremios(overlay, premio);
      return;
    }
    overlay.classList.add('agitando');
    setTimeout(() => {
      overlay.classList.remove('agitando');
      overlay.classList.add('abierto');
      estallido(caja, rareza);
      if (rareza === 'epico' || rareza === 'legendario') lanzarConfeti();
      setTimeout(() => mostrarPremios(overlay, premio), 450);
    }, 700);
  };
  caja.addEventListener('click', abrir);
  overlay.addEventListener('keydown', (e) => {
    if ((e.key === 'Enter' || e.key === ' ') && !abierto) {
      e.preventDefault();
      abrir();
    }
    if (e.key === 'Escape' && abierto) cerrarCofre(overlay);
  });
}

// Particulas que salen disparadas del cofre al abrirse.
function estallido(caja, rareza) {
  const r = caja.getBoundingClientRect();
  const cx = r.left + r.width / 2;
  const cy = r.top + r.height * 0.4;
  const iconos = rareza === 'legendario' ? ['🌟', '✨', '🪙', '👑', '💎'] : rareza === 'epico' ? ['✨', '💜', '🪙', '⭐'] : ['✨', '🪙', '⭐'];
  const cantidad = rareza === 'legendario' ? 34 : rareza === 'epico' ? 26 : 18;
  for (let i = 0; i < cantidad; i++) {
    const p = document.createElement('span');
    p.className = 'cofre-chispa';
    p.textContent = iconos[i % iconos.length];
    document.body.appendChild(p);
    const angulo = (Math.PI * 2 * i) / cantidad + Math.random() * 0.3;
    const distancia = 120 + Math.random() * 160;
    p.animate(
      [
        { transform: `translate(${cx}px, ${cy}px) scale(0.3)`, opacity: 1 },
        { transform: `translate(${cx + Math.cos(angulo) * distancia}px, ${cy + Math.sin(angulo) * distancia - 40}px) scale(1.2) rotate(${Math.random() * 360}deg)`, opacity: 1, offset: 0.6 },
        { transform: `translate(${cx + Math.cos(angulo) * distancia * 1.2}px, ${cy + Math.sin(angulo) * distancia + 60}px) scale(0.6)`, opacity: 0 },
      ],
      { duration: 1300 + Math.random() * 500, easing: 'cubic-bezier(0.2, 0.7, 0.3, 1)', fill: 'forwards' }
    ).onfinish = () => p.remove();
  }
}

function mostrarPremios(overlay, premio) {
  const premios = [];
  premios.push(`<div class="premio"><span class="premio-icono">🪙</span><strong>+${premio.monedas + premio.extra}</strong><small>monedas</small></div>`);
  premios.push(`<div class="premio"><span class="premio-icono">⭐</span><strong>+${premio.xp}</strong><small>XP</small></div>`);
  if (premio.punto) premios.push('<div class="premio premio-punto"><span class="premio-icono">✨</span><strong>+1</strong><small>punto de habilidad</small></div>');
  if (premio.item) {
    const mascota = leerVida();
    const prueba = { ...mascota, apariencia: { ...mascota.apariencia, [premio.item.cat]: premio.item.item.id } };
    premios.push(`
      <div class="premio premio-item rareza-${premio.item.item.exclusivo}">
        <span class="premio-etiqueta">${RAREZAS[premio.item.item.exclusivo].nombre.toUpperCase()} · ¡NUEVO!</span>
        <div class="mascota-mini mascota--feliz ${clasesDeMascota(prueba)}" style="${estiloDeMascota(prueba)}"><div class="mascota-btn">${mascotaSvg('-cofre')}</div></div>
        <strong>${premio.item.item.icono || '🎨'} ${escapeHtml(premio.item.item.nombre)}</strong>
        <small>Exclusivo de cofre</small>
      </div>`);
  }
  if (premio.extra) premios.push(`<div class="premio"><span class="premio-icono">💰</span><strong>+${premio.extra}</strong><small>extra: ¡ya tenías todo!</small></div>`);

  const contenedor = overlay.querySelector('.cofre-premios');
  contenedor.innerHTML = premios.join('');
  contenedor.querySelectorAll('.premio').forEach((el, i) => {
    el.style.animationDelay = `${i * 0.18}s`;
  });

  const botones = overlay.querySelector('.cofre-botones');
  botones.innerHTML = `
    ${premio.item ? '<button type="button" class="btn btn-primary" data-cofre="equipar">✨ Ponérmelo</button>' : ''}
    <button type="button" class="btn ${premio.item ? 'btn-ghost' : 'btn-primary'}" data-cofre="cerrar">¡Genial!</button>`;
  botones.querySelector('[data-cofre="cerrar"]').focus();
  botones.addEventListener('click', (e) => {
    const b = e.target.closest('[data-cofre]');
    if (!b) return;
    if (b.dataset.cofre === 'equipar') equiparItem(premio.item.cat, premio.item.item.id);
    cerrarCofre(overlay);
  });
}

function cerrarCofre(overlay) {
  overlay.classList.add('saliendo');
  setTimeout(() => {
    overlay.remove();
    MenuMascota.refrescar();
    siguienteCofre();
  }, 300);
}

// ---- Logros ----
function contextoLogros() {
  const datos = leerMascotas();
  const perfil = leerPerfil();
  const coleccion = new Set();
  let exclusivos = 0;
  datos.mascotas.forEach((m) => m.inventario.forEach((i) => coleccion.add(i)));
  coleccion.forEach((clave) => {
    const [cat, id] = clave.split(':');
    if (TIENDA[cat]?.find((x) => x.id === id)?.exclusivo) exclusivos++;
  });
  return {
    movimientos: Storage.getMovimientos().length,
    objetivos: Storage.getObjetivos().filter((o) => Storage.getAhorradoObjetivo(o) >= o.meta).length,
    presupuestosSanos: CONDICIONES.presupuestosSanos(),
    mejorRacha: perfil.racha.mejor,
    nivelMax: Math.max(...datos.mascotas.map((m) => nivelDeXp(m.xp))),
    misiones: datos.mascotas.reduce((s, m) => s + (m.stats.misiones || 0), 0),
    cofres: perfil.cofres.total,
    legendarios: perfil.cofres.legendarios,
    coleccion: coleccion.size,
    exclusivos,
    monedasAtrapadas: datos.mascotas.reduce((s, m) => s + (m.stats.monedasAtrapadas || 0), 0),
    mascotas: datos.mascotas.length,
  };
}

let timerLogros = null;
function verificarLogrosPronto() {
  clearTimeout(timerLogros);
  timerLogros = setTimeout(verificarLogros, 500);
}

function verificarLogros() {
  const c = contextoLogros();
  const perfil = leerPerfil();
  const nuevos = LOGROS.filter((l) => !perfil.logros[l.id] && l.valor(c) >= l.meta);
  if (!nuevos.length) return;
  nuevos.forEach((l) => {
    perfil.logros[l.id] = todayIso();
  });
  guardarPerfil(perfil);
  const total = nuevos.reduce((s, l) => s + l.premio, 0);
  ganarMonedas(total);
  // Muchos de una vez (por ejemplo la primera vez con datos viejos): un solo aviso
  if (nuevos.length > 2) mostrarBannerLogro({ icono: '🏆', nombre: `¡${nuevos.length} logros desbloqueados!`, premio: total });
  else nuevos.forEach((l) => mostrarBannerLogro(l));
  MenuMascota.refrescar();
}

const colaBanners = [];
let bannerVisible = false;

function mostrarBannerLogro(logro) {
  colaBanners.push(logro);
  if (!bannerVisible) siguienteBanner();
}

function siguienteBanner() {
  const logro = colaBanners.shift();
  if (!logro) {
    bannerVisible = false;
    return;
  }
  bannerVisible = true;
  const b = document.createElement('div');
  b.className = 'logro-banner';
  b.setAttribute('role', 'status');
  b.innerHTML = `
    <span class="logro-banner-icono">${logro.icono}</span>
    <div class="logro-banner-texto">
      <small>🏆 ¡Logro desbloqueado!</small>
      <strong>${escapeHtml(logro.nombre)}</strong>
    </div>
    <span class="logro-banner-premio">+${logro.premio} 🪙</span>`;
  document.body.appendChild(b);
  if (Mascota.el) Mascota.animar('mascota--salto');
  setTimeout(() => b.classList.add('saliendo'), 3800);
  setTimeout(() => {
    b.remove();
    siguienteBanner();
  }, 4200);
}

// ---- Enganches con lo que ya existe ----
const recompensasBase = {
  registrarEvento,
  misionesPorReclamar,
  ganarXp,
  reclamarMision,
};

// Los eventos tambien avanzan la mision relampago y revisan logros.
registrarEvento = function (evento, cantidad = 1) {
  recompensasBase.registrarEvento(evento, cantidad);
  const mascota = leerVida();
  const r = relampagoDe(mascota);
  if (r.evento === evento && !r.reclamada && !r.completa) {
    mascota.misiones.relampago.progreso += cantidad;
    guardarVida(mascota);
    if (mascota.misiones.relampago.progreso >= r.meta && Mascota.el) {
      setTimeout(() => {
        Mascota.animar('mascota--poder');
        Mascota.mostrarMensaje('⚡ ¡Misión relámpago cumplida! Reclama tu cofre en mi menú 🎁', 5000);
      }, 1400);
    }
    actualizarBadgeMisiones();
    MenuMascota.refrescar();
  }
  verificarLogrosPronto();
};

misionesPorReclamar = function (mascota = leerVida()) {
  return recompensasBase.misionesPorReclamar(mascota) + extrasPorReclamar(mascota) + calendarioPendiente();
};

// Cofres al llegar a niveles importantes
ganarXp = function (cantidad) {
  const antes = nivelDeXp(leerVida().xp);
  recompensasBase.ganarXp(cantidad);
  const despues = nivelDeXp(leerVida().xp);
  for (let n = antes + 1; n <= despues; n++) {
    if (HITOS_NIVEL[n]) setTimeout(() => abrirCofre(HITOS_NIVEL[n], `🏅 Premio por llegar al nivel ${n}`), 2800);
  }
};

// A veces una mision trae un cofre sorpresa
reclamarMision = function (tipo, id) {
  const mision = recompensasBase.reclamarMision(tipo, id);
  if (mision && ((tipo === 'hora' && Math.random() < 0.25) || (tipo === 'dia' && Math.random() < 0.15))) {
    setTimeout(() => abrirCofre(tipo === 'hora' ? 'comun' : 'raro', '🎉 ¡Cofre sorpresa!'), 900);
  }
  return mision;
};

// ---- Pestañas del menu: Recompensas y Perfil ----
function cofreMini(rareza) {
  return `<span class="cofre-mini cofre-${rareza}">${cofreSvg()}</span>`;
}

function htmlMisionesEspeciales(mascota) {
  const r = relampagoDe(mascota);
  const b = bonusDe(mascota);
  const pct = Math.round((r.avance / r.meta) * 100);
  const botonRelampago = r.reclamada
    ? '<span class="mision-hecha">✓ Reclamada</span>'
    : r.completa
      ? '<button type="button" class="btn btn-primary btn-mini btn-reclamar" data-accion="relampago">🎁 Abrir cofre</button>'
      : `<span class="mision-avance">${r.avance}/${r.meta}</span>`;
  const bono = (tipo, datos, texto) => {
    const listo = datos.completas === datos.total && !datos.reclamado;
    return `
      <div class="bono${listo ? ' bono-listo' : ''}${datos.reclamado ? ' bono-hecho' : ''}">
        ${cofreMini(datos.rareza)}
        <div class="bono-texto">
          <strong>${texto}</strong>
          <span>${datos.completas}/${datos.total} completas · Cofre ${RAREZAS[datos.rareza].nombre.toLowerCase()}</span>
        </div>
        ${datos.reclamado ? '<span class="mision-hecha">✓ Abierto</span>' : listo ? `<button type="button" class="btn btn-primary btn-mini btn-reclamar" data-accion="bono" data-tipo="${tipo}">🎁 Abrir</button>` : '<span class="mision-avance">🔒</span>'}
      </div>`;
  };
  return `
    <div class="relampago${r.completa && !r.reclamada ? ' relampago-listo' : ''}${r.reclamada ? ' relampago-hecho' : ''}">
      <div class="relampago-cabecera">
        <span class="relampago-rayo">⚡</span>
        <strong>Misión relámpago</strong>
        <span class="relampago-tiempo">⏳ ${duracionCorta(r.fin - Date.now())}</span>
      </div>
      <div class="relampago-cuerpo">
        <div class="mision-texto">
          <span>${escapeHtml(r.texto)}</span>
          <div class="barra-rpg-pista"><div class="barra-rpg-relleno barra-xp" style="width:${pct}%"></div></div>
        </div>
        ${cofreMini('raro')}
        ${botonRelampago}
      </div>
    </div>
    <div class="bonos">
      ${bono('dia', b.dia, 'Completa todas las diarias')}
      ${bono('semana', b.semana, 'Completa todas las semanales')}
    </div>`;
}

Object.assign(MenuMascota, {
  pestana_recompensas() {
    const estado = estadoCalendario();
    const mascota = leerVida();
    const dias = CALENDARIO.map((d) => {
      const reclamado = d.dia < estado.dia || (d.dia === estado.dia && estado.reclamadoHoy);
      const esHoy = d.dia === estado.dia && !estado.reclamadoHoy;
      const premio = d.tipo === 'monedas' ? `<span class="dia-icono">🪙</span><strong>${d.cantidad}</strong>` : `${cofreMini(d.rareza)}<strong>${RAREZAS[d.rareza].nombre}</strong>`;
      return `
        <div class="dia${reclamado ? ' dia-hecho' : ''}${esHoy ? ' dia-hoy' : ''}${d.dia === 7 ? ' dia-final' : ''}">
          <span class="dia-numero">Día ${d.dia}</span>
          ${premio}
          ${esHoy ? '<button type="button" class="btn btn-primary btn-mini btn-reclamar" data-accion="calendario">¡Reclamar!</button>' : reclamado ? '<span class="dia-check">✓</span>' : '<span class="dia-check">🔒</span>'}
        </div>`;
    }).join('');

    const exclusivos = exclusivosDe(mascota);
    const tarjetasCofre = Object.entries(COFRES).map(([rareza, c]) => {
      const suyos = exclusivos.filter((x) => x.item.exclusivo === rareza);
      return `
        <div class="info-cofre cofre-${rareza}">
          ${cofreMini(rareza)}
          <div>
            <strong>${RAREZAS[rareza].nombre}</strong>
            <span>🪙 ${c.monedas[0]}–${c.monedas[1]} · ⭐ ${c.xp} XP${c.punto ? ` · ✨ ${Math.round(c.punto * 100)}%` : ''}</span>
            <span>🎨 ${Math.round(c.item * 100)}% de traer un exclusivo</span>
            <div class="exclusivos-lista">${suyos.map((x) => `<span class="exclusivo${x.tiene ? ' lo-tiene' : ''}" title="${escapeHtml(x.item.nombre)}${x.tiene ? ' (ya lo tienes)' : ''}">${x.item.icono || (x.item.colores ? '🎨' : '✨')}</span>`).join('')}</div>
          </div>
        </div>`;
    }).join('');
    const tengo = exclusivos.filter((x) => x.tiene).length;

    return `
      <div class="racha-cabecera">
        <span class="racha-fuego">🔥</span>
        <div><strong>${estado.racha} día${estado.racha === 1 ? '' : 's'} de racha</strong><span>Tu mejor racha: ${estado.mejor} · Entra cada día; si te saltas uno, vuelve al día 1.</span></div>
      </div>
      <div class="calendario">${dias}</div>
      <h3 class="menu-subtitulo">🎁 Cofres <span>· exclusivos conseguidos: ${tengo}/${exclusivos.length}</span></h3>
      <p class="menu-ayuda">Los cofres salen de la racha diaria, las misiones relámpago, los bonos de misiones, los niveles 3, 5, 7 y 10, y a veces de sorpresa al reclamar misiones. Lo <strong>exclusivo</strong> no se puede comprar.</p>
      <div class="info-cofres">${tarjetasCofre}</div>`;
  },

  pestana_perfil() {
    const perfil = leerPerfil();
    const c = contextoLogros();
    const logrados = LOGROS.filter((l) => perfil.logros[l.id]).length;
    const mascota = leerVida();
    const avatar = perfil.avatar === 'mascota'
      ? `<div class="mascota-mini mascota--feliz ${clasesDeMascota(mascota)}" style="${estiloDeMascota(mascota)}"><div class="mascota-btn">${mascotaSvg('-perfil')}</div></div>`
      : `<span class="perfil-emoji">${perfil.avatar}</span>`;
    const estado = estadoCalendario(perfil);
    const stats = [
      ['📝', c.movimientos, 'movimientos'],
      ['🎯', c.objetivos, 'objetivos cumplidos'],
      ['🎖️', c.misiones, 'misiones'],
      ['🎁', c.cofres, 'cofres abiertos'],
      ['🪙', c.monedasAtrapadas, 'monedas atrapadas'],
      ['👗', c.coleccion, 'cosméticos'],
      ['🌈', c.exclusivos, 'exclusivos'],
      ['📅', perfil.dias, 'días usando la app'],
    ];
    const logros = LOGROS.map((l) => {
      const fecha = perfil.logros[l.id];
      const valor = Math.min(l.valor(c), l.meta);
      return `
        <div class="logro${fecha ? ' logrado' : ''}">
          <span class="logro-icono">${l.icono}</span>
          <div class="logro-info">
            <strong>${l.nombre}</strong>
            <span>${escapeHtml(l.desc)}</span>
            ${fecha ? `<small>✓ ${formatDate(fecha)} · +${l.premio} 🪙</small>` : `<div class="barra-rpg-pista"><div class="barra-rpg-relleno barra-xp" style="width:${Math.round((valor / l.meta) * 100)}%"></div></div><small>${valor}/${l.meta} · premio 🪙${l.premio}</small>`}
          </div>
        </div>`;
    }).join('');
    return `
      <div class="perfil-cabecera">
        <div class="perfil-avatar">${avatar}</div>
        <div class="perfil-datos">
          <form class="menu-form" data-form="perfil">
            <input name="nombre" maxlength="24" placeholder="¿Cómo te llamas?" value="${escapeHtml(perfil.nombre)}" autocomplete="off" aria-label="Tu nombre">
            <button type="submit" class="btn btn-ghost btn-mini">Guardar</button>
          </form>
          <p class="perfil-titulo">🏅 ${tituloPerfil(logrados)}</p>
          <p class="perfil-sub">🔥 Racha ${estado.racha} · mejor ${estado.mejor} · 🏆 ${logrados}/${LOGROS.length} logros</p>
        </div>
      </div>
      <div class="avatares">${AVATARES.map((a) => `<button type="button" class="avatar-op${perfil.avatar === a ? ' activo' : ''}" data-accion="avatar" data-valor="${a}" aria-label="Avatar ${a === 'mascota' ? 'mi mascota' : a}">${a === 'mascota' ? '🪴' : a}</button>`).join('')}</div>
      <h3 class="menu-subtitulo">📊 Estadísticas</h3>
      <div class="estadisticas">${stats.map(([i, v, t]) => `<div class="estadistica"><span>${i}</span><strong>${v}</strong><small>${t}</small></div>`).join('')}</div>
      <h3 class="menu-subtitulo">🏆 Logros <span>· ${logrados} de ${LOGROS.length}</span></h3>
      <div class="logros">${logros}</div>`;
  },
});

// Acciones nuevas del menu
const accionMenuBase = MenuMascota.accion;
MenuMascota.accion = function (accion, datos, boton) {
  if (accion === 'calendario') {
    const premio = reclamarCalendario();
    if (premio?.tipo === 'monedas') {
      this.volarMonedas(boton, 6);
      this.efectoPrevia('previa-salto', ['🔥', '🪙', '✨']);
      this.avisar(`🔥 ¡Día ${premio.dia} reclamado! +${premio.cantidad} 🪙`);
    }
    this.render();
    return;
  }
  if (accion === 'relampago') {
    if (reclamarRelampago()) this.render();
    return;
  }
  if (accion === 'bono') {
    if (reclamarBonus(datos.tipo)) this.render();
    return;
  }
  if (accion === 'avatar') {
    const perfil = leerPerfil();
    perfil.avatar = datos.valor;
    guardarPerfil(perfil);
    this.render();
    return;
  }
  accionMenuBase.call(this, accion, datos, boton);
};

document.addEventListener('submit', (e) => {
  if (e.target.dataset?.form !== 'perfil') return;
  e.preventDefault();
  const perfil = leerPerfil();
  perfil.nombre = e.target.nombre.value.trim().slice(0, 24);
  guardarPerfil(perfil);
  MenuMascota.avisar(perfil.nombre ? `👋 ¡Hola, ${perfil.nombre}!` : 'Nombre borrado.');
});

// Dias de uso y primera revision de logros al abrir la app
document.addEventListener('DOMContentLoaded', () => {
  const perfil = leerPerfil();
  if (perfil.ultimoDiaUso !== todayIso()) {
    perfil.ultimoDiaUso = todayIso();
    perfil.dias++;
    guardarPerfil(perfil);
  }
  setTimeout(verificarLogros, 3500);
  setTimeout(() => {
    actualizarBadgeMisiones();
    // Recordatorio de la racha diaria
    if (calendarioPendiente() && Mascota.el && Mascota.burbuja.hidden) {
      Mascota.mostrarMensaje('🔥 ¡Tu recompensa diaria te espera! Ábrela en mi menú 🎁', 5000);
    }
  }, 4500);
});
