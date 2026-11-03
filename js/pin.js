const PIN_KEY = 'financeAppPin';
const PIN_UNLOCK_KEY = 'financeAppUnlocked';

function generarSalt() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

async function hashPin(pin, salt) {
  const texto = `${pin}:${salt}`;
  if (window.crypto && window.crypto.subtle && window.isSecureContext) {
    const buffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(texto));
    return Array.from(new Uint8Array(buffer))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  }
  // Fallback no criptográfico para contextos no seguros (ej. abrir con file://).
  let hash = 0;
  for (let i = 0; i < texto.length; i++) {
    hash = (hash << 5) - hash + texto.charCodeAt(i);
    hash |= 0;
  }
  return `fallback:${hash}`;
}

function getPinConfig() {
  try {
    const raw = localStorage.getItem(PIN_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function pinActivo() {
  return getPinConfig() !== null;
}

async function establecerPin(pin) {
  const salt = generarSalt();
  const hash = await hashPin(pin, salt);
  localStorage.setItem(PIN_KEY, JSON.stringify({ hash, salt }));
}

function quitarPin() {
  localStorage.removeItem(PIN_KEY);
  try {
    sessionStorage.removeItem(PIN_UNLOCK_KEY);
  } catch {
    // ignorar
  }
}

async function verificarPin(pin) {
  const config = getPinConfig();
  if (!config) return true;
  const hash = await hashPin(pin, config.salt);
  return hash === config.hash;
}

// Brote (js/mascota.js) acompaña la pantalla de PIN si la mascota esta activa:
// cierra los ojos mientras escribes, se preocupa si fallas y florece al acertar.
function conMascotaEnBloqueo() {
  return typeof mascotaSvg === 'function' && typeof mascotaVisible === 'function' && mascotaVisible();
}

function mostrarPantallaBloqueo() {
  const conMascota = conMascotaEnBloqueo();
  const overlay = document.createElement('div');
  overlay.id = 'pin-lock-overlay';
  overlay.className = 'pin-lock-overlay';
  overlay.innerHTML = `
    <div class="pin-lock-card">
      ${
        conMascota
          ? `<div class="pin-mascota mascota--feliz" id="pin-mascota"><div class="mascota-btn">${mascotaSvg('-pin')}</div></div>
             <p class="pin-mascota-dice" id="pin-mascota-dice" aria-live="polite">¡Hola de nuevo! Te estaba esperando.</p>`
          : '<span class="logo-mark pin-lock-logo">$<span class="logo-cursor">_</span></span>'
      }
      <h2>Ingresa tu PIN</h2>
      <p class="settings-hint">Para proteger tus datos financieros.</p>
      <input type="password" inputmode="numeric" pattern="[0-9]*" maxlength="6" id="pin-lock-input" class="pin-lock-input" autocomplete="off" aria-label="PIN">
      <p class="pin-lock-error" id="pin-lock-error" hidden>PIN incorrecto, intenta de nuevo.</p>
      <button class="btn btn-primary pin-lock-btn" id="pin-lock-btn">Desbloquear</button>
    </div>
  `;
  document.body.appendChild(overlay);

  const input = document.getElementById('pin-lock-input');
  const btn = document.getElementById('pin-lock-btn');
  const error = document.getElementById('pin-lock-error');
  const mascota = document.getElementById('pin-mascota');
  const dice = document.getElementById('pin-mascota-dice');

  function ponerMascota(estado, texto) {
    if (!mascota) return;
    mascota.className = `pin-mascota mascota--${estado}`;
    if (texto) dice.textContent = texto;
  }

  function animarMascota(clase) {
    if (!mascota) return;
    mascota.classList.remove(clase);
    void mascota.offsetWidth;
    mascota.classList.add(clase);
  }

  // Mientras hay digitos escritos Brote se tapa los ojos para no ver el PIN.
  input.addEventListener('input', () => {
    error.hidden = true;
    if (input.value) ponerMascota('tapada', 'No estoy mirando… 🙈');
    else ponerMascota('feliz', '¡Hola de nuevo! Te estaba esperando.');
  });

  async function intentar() {
    const ok = await verificarPin(input.value);
    if (ok) {
      try {
        sessionStorage.setItem(PIN_UNLOCK_KEY, 'true');
      } catch {
        // si sessionStorage no esta disponible, igual desbloqueamos esta carga
      }
      const desbloquear = () => {
        document.documentElement.classList.remove('bloqueado');
        overlay.remove();
      };
      if (mascota) {
        ponerMascota('celebrando', '¡Bienvenido! 🌸');
        animarMascota('mascota--salto');
        btn.disabled = true;
        setTimeout(desbloquear, 750);
      } else {
        desbloquear();
      }
    } else {
      error.hidden = false;
      input.value = '';
      ponerMascota('preocupada', 'Mmm… ese no es. Intenta otra vez.');
      animarMascota('mascota--sacudida');
      input.focus();
    }
  }

  btn.addEventListener('click', intentar);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') intentar();
  });
  input.focus();
}

document.addEventListener('DOMContentLoaded', () => {
  if (document.documentElement.classList.contains('bloqueado')) {
    mostrarPantallaBloqueo();
  }
});
