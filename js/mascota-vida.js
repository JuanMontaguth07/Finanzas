// Vida de Brote (se carga despues de js/mascota.js y extiende a Mascota):
//  - Crece: gana XP con tus buenos habitos y sube de nivel (le salen hojitas,
//    un capullo, una flor y al final monedas doradas).
//  - Tiene sed: pierde agua con las horas; si no la riegas se pone mustia.
//  - Minijuego: al guardar movimientos/aportes llueven monedas y corre a atraparlas.
//  - La puedes llamar con doble clic en un espacio vacio.
//  - Se preocupa si pasas el cursor por un boton de borrar.
const VIDA_KEY = 'financeAppBroteVida';
const VIDA_SED_POR_HORA = 3; // % de agua que pierde por hora (vacia en ~33 h)
const VIDA_UMBRAL_SED = 35;
const VIDA_NIVELES = [
  { xp: 0, nombre: 'Brotecito', emoji: '🌱' },
  { xp: 40, nombre: 'Plantita', emoji: '🌿' },
  { xp: 120, nombre: 'Capullo', emoji: '🌷' },
  { xp: 260, nombre: 'En flor', emoji: '🌸' },
  { xp: 500, nombre: 'Árbol de la plata', emoji: '🌳' },
];

function leerVida() {
  try {
    const vida = JSON.parse(localStorage.getItem(VIDA_KEY));
    if (vida && Number.isFinite(vida.xp)) return vida;
  } catch {
    // datos corruptos o sin localStorage: se empieza de cero
  }
  return { xp: 0, agua: 100, ultimaAgua: Date.now(), ultimoRiegoXp: 0, ultimaCaricia: 0, ultimaVisita: '' };
}

function guardarVida(vida) {
  try {
    localStorage.setItem(VIDA_KEY, JSON.stringify(vida));
  } catch {
    // sin localStorage la vida de Brote no persiste
  }
}

function aguaActual(vida) {
  const horas = (Date.now() - vida.ultimaAgua) / 3600000;
  return Math.max(0, Math.round(vida.agua - horas * VIDA_SED_POR_HORA));
}

function nivelDeXp(xp) {
  let nivel = 1;
  VIDA_NIVELES.forEach((n, i) => {
    if (xp >= n.xp) nivel = i + 1;
  });
  return nivel;
}

// Clases que muestran las partes de cada nivel (y el gorro de diciembre).
// Tambien las usa la Brote de la pantalla de PIN (js/pin.js).
function clasesVidaBrote() {
  const nivel = nivelDeXp(leerVida().xp);
  const clases = [];
  for (let i = 2; i <= nivel; i++) clases.push(`mascota--n${i}`);
  if (new Date().getMonth() === 11) clases.push('mascota--diciembre');
  return clases.join(' ');
}

function aplicarClasesVida(el) {
  if (!el) return;
  for (let i = 2; i <= VIDA_NIVELES.length; i++) el.classList.remove(`mascota--n${i}`);
  el.classList.remove('mascota--diciembre');
  clasesVidaBrote()
    .split(' ')
    .filter(Boolean)
    .forEach((c) => el.classList.add(c));
}

function textoFlotante(texto, clase = 'mascota-xp') {
  if (!Mascota.el) return;
  const span = document.createElement('span');
  span.className = clase;
  span.textContent = texto;
  Mascota.el.appendChild(span);
  setTimeout(() => span.remove(), 1200);
}

function ganarXp(cantidad) {
  const vida = leerVida();
  const antes = nivelDeXp(vida.xp);
  vida.xp += cantidad;
  guardarVida(vida);
  const despues = nivelDeXp(vida.xp);
  if (!Mascota.el) return;
  textoFlotante(`+${cantidad} XP`);
  aplicarClasesVida(Mascota.el);
  if (despues > antes) {
    const nivel = VIDA_NIVELES[despues - 1];
    setTimeout(() => {
      lanzarConfeti();
      Mascota.estadoTemporal('celebrando', 4500);
      Mascota.animar('mascota--salto');
      Mascota.mostrarMensaje(`¡Subí a nivel ${despues}: ${nivel.nombre}! ${nivel.emoji}`, 6000);
    }, 500);
  }
}

// ---- Se engancha a lo que ya hace Brote ----
const vidaOriginal = {
  montar: Mascota.montar,
  actualizar: Mascota.actualizar,
  reaccionar: Mascota.reaccionar,
  regar: Mascota.regar,
  cosquillas: Mascota.cosquillas,
  celebrar: Mascota.celebrar,
};

Mascota.montar = function () {
  vidaOriginal.montar.call(this);
  if (!this.el) return;
  aplicarClasesVida(this.el);
  // +5 XP por la primera visita del dia
  const vida = leerVida();
  if (vida.ultimaVisita !== todayIso()) {
    vida.ultimaVisita = todayIso();
    guardarVida(vida);
    setTimeout(() => ganarXp(5), 2500);
  }
};

// Si tiene sed, se le nota y lo primero que dice es que quiere agua.
Mascota.actualizar = function () {
  vidaOriginal.actualizar.call(this);
  if (aguaActual(leerVida()) >= VIDA_UMBRAL_SED || this.estadoBase === 'dormida') return;
  this.estadoBase = 'sediento';
  this.mensajes.unshift('Tengo sed… 🥺 Mantenme presionada para regarme 💧');
  if (!this.timerEstado) this.aplicarEstado('sediento');
};

Mascota.reaccionar = function (tipo, mensaje = '') {
  vidaOriginal.reaccionar.call(this, tipo);
  if (tipo === 'error' || /elimin|borr/i.test(mensaje)) return;
  ganarXp(/aporte/i.test(mensaje) ? 8 : 4);
  if (/guardado|aporte agregado|importaron/i.test(mensaje)) lluviaMonedas(/importaron|aporte/i.test(mensaje) ? 6 : 4);
};

Mascota.regar = function () {
  vidaOriginal.regar.call(this);
  const vida = leerVida();
  vida.agua = 100;
  vida.ultimaAgua = Date.now();
  const daXp = Date.now() - vida.ultimoRiegoXp > 3600000;
  if (daXp) vida.ultimoRiegoXp = Date.now();
  guardarVida(vida);
  setTimeout(() => {
    textoFlotante('💧 100%', 'mascota-xp mascota-xp-agua');
    this.actualizar();
    if (daXp) setTimeout(() => ganarXp(3), 600);
  }, 900);
};

Mascota.cosquillas = function () {
  vidaOriginal.cosquillas.call(this);
  const vida = leerVida();
  if (Date.now() - vida.ultimaCaricia < 600000) return;
  vida.ultimaCaricia = Date.now();
  guardarVida(vida);
  ganarXp(1);
};

Mascota.celebrar = function (mensaje) {
  vidaOriginal.celebrar.call(this, mensaje);
  ganarXp(40);
};

// Ficha de Brote (comando /brote)
Mascota.mostrarEstado = function () {
  const vida = leerVida();
  const nivel = nivelDeXp(vida.xp);
  const actual = VIDA_NIVELES[nivel - 1];
  const siguiente = VIDA_NIVELES[nivel];
  const progreso = siguiente ? `${vida.xp}/${siguiente.xp} XP` : `${vida.xp} XP · ¡nivel máximo!`;
  this.animar('mascota--salto');
  this.mostrarMensaje(`${actual.emoji} Nivel ${nivel} · ${actual.nombre} · 💧 ${aguaActual(vida)}% · ${progreso}`, 7000);
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
    Monedas.lista.push({
      el,
      x: window.innerWidth * (0.12 + Math.random() * 0.76),
      y: -40 - i * 90,
      vy: 0,
      estado: 'cae',
      desde: 0,
    });
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
    m.el.style.transform = `translate(${m.x.toFixed(1)}px, ${m.y.toFixed(1)}px)`;

    // ¿La toco Brote?
    if (caja && (m.estado === 'cae' || m.estado === 'suelo')) {
      const centroX = m.x + MONEDA_TAM / 2;
      const centroY = m.y + MONEDA_TAM / 2;
      if (centroX > caja.left + 8 && centroX < caja.right - 8 && centroY > caja.top + 10 && centroY < caja.bottom + 6) {
        m.estado = 'atrapada';
        m.el.classList.add('moneda-atrapada');
        setTimeout(() => m.el.remove(), 450);
        Monedas.atrapadas++;
        Mascota.animar('mascota--moneda');
        textoFlotante('+1 🪙');
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

// Brote corre hacia la moneda mas cercana al piso (y baja de la tarjeta si hace falta).
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
}

document.addEventListener('dblclick', (e) => {
  if (!Mascota.el || Mascota.arrastre || Mascota.enJuego) return;
  const interactivo = 'a, button, input, select, textarea, label, table, .mascota, .modal-overlay, .comandos-overlay, .pin-lock-overlay';
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

// Revisa la sed cada 10 minutos por si la app queda abierta mucho rato.
setInterval(() => {
  if (Mascota.el) Mascota.actualizar();
}, 600000);
