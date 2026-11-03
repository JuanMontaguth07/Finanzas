// Fondo animado: manchas de luz calida que se mueven despacio (y se corren un
// poco con el cursor) y simbolos tipo terminal (✻ ✢ · $ +) que flotan hacia
// arriba y se apartan del puntero. Hacer clic en un espacio vacio suelta una
// rafaga de chispas. Los colores salen de variables CSS (--fondo-*), asi que
// cambia solo con el tema claro/oscuro.
(function () {
  const GLIFOS = ['✻', '✢', '✳', '✶', '·', '$', '+', '✽'];
  const FPS_MS = 1000 / 40;
  const RADIO_PUNTERO = 120;

  const MANCHAS = [
    { color: 1, cx: 0.85, cy: 0.12, radio: 0.42, ax: 0.1, ay: 0.08, vel: 0.00011, fase: 0 },
    { color: 2, cx: 0.12, cy: 0.88, radio: 0.38, ax: 0.08, ay: 0.1, vel: 0.00009, fase: 2 },
    { color: 3, cx: 0.5, cy: 0.5, radio: 0.3, ax: 0.22, ay: 0.16, vel: 0.00007, fase: 4 },
  ];

  let canvas;
  let ctx;
  let ancho = 0;
  let alto = 0;
  let dpr = 1;
  let colores = null;
  let particulas = [];
  let chispas = [];
  let ultimo = 0;
  const puntero = { x: -9999, y: -9999, px: 0.5, py: 0.5, suaveX: 0.5, suaveY: 0.5 };

  function sinMovimiento() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function leerColores() {
    const css = getComputedStyle(document.documentElement);
    const leer = (nombre) => css.getPropertyValue(nombre).trim() || '201, 100, 66';
    colores = {
      1: leer('--fondo-mancha-1'),
      2: leer('--fondo-mancha-2'),
      3: leer('--fondo-mancha-3'),
      glifo: leer('--fondo-glifo'),
      intensidad: parseFloat(css.getPropertyValue('--fondo-intensidad')) || 0.2,
    };
  }

  function nuevaParticula(desdeAbajo) {
    return {
      x: Math.random() * ancho,
      y: desdeAbajo ? alto + 20 : Math.random() * alto,
      vy: -(0.12 + Math.random() * 0.3),
      vx: (Math.random() - 0.5) * 0.12,
      empujeX: 0,
      empujeY: 0,
      rot: Math.random() * Math.PI * 2,
      vrot: (Math.random() - 0.5) * 0.01,
      tam: 11 + Math.random() * 12,
      glifo: GLIFOS[Math.floor(Math.random() * GLIFOS.length)],
      alfa: 0.18 + Math.random() * 0.3,
    };
  }

  function redimensionar() {
    dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    ancho = window.innerWidth;
    alto = window.innerHeight;
    canvas.width = Math.round(ancho * dpr);
    canvas.height = Math.round(alto * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const cantidad = Math.max(14, Math.min(42, Math.round((ancho * alto) / 36000)));
    while (particulas.length < cantidad) particulas.push(nuevaParticula(false));
    particulas.length = cantidad;
  }

  function dibujarManchas(t) {
    const lado = Math.max(ancho, alto);
    MANCHAS.forEach((m) => {
      // Parallax suave: las manchas se corren un poco hacia donde esta el cursor.
      const x = (m.cx + Math.sin(t * m.vel + m.fase) * m.ax + (puntero.suaveX - 0.5) * 0.06) * ancho;
      const y = (m.cy + Math.cos(t * m.vel * 1.3 + m.fase) * m.ay + (puntero.suaveY - 0.5) * 0.06) * alto;
      const r = m.radio * lado;
      const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
      grad.addColorStop(0, `rgba(${colores[m.color]}, ${colores.intensidad})`);
      grad.addColorStop(1, `rgba(${colores[m.color]}, 0)`);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, ancho, alto);
    });
  }

  function dibujarGlifo(p, alfa) {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);
    ctx.fillStyle = `rgba(${colores.glifo}, ${alfa})`;
    ctx.font = `${p.tam}px ui-monospace, Consolas, monospace`;
    ctx.fillText(p.glifo, -p.tam / 3, p.tam / 3);
    ctx.restore();
  }

  function actualizarParticulas(paso) {
    particulas.forEach((p, i) => {
      const dx = p.x - puntero.x;
      const dy = p.y - puntero.y;
      const dist = Math.hypot(dx, dy);
      if (dist < RADIO_PUNTERO && dist > 0) {
        const fuerza = (1 - dist / RADIO_PUNTERO) * 0.9;
        p.empujeX += (dx / dist) * fuerza;
        p.empujeY += (dy / dist) * fuerza;
      }
      p.empujeX *= 0.92;
      p.empujeY *= 0.92;
      p.x += (p.vx + p.empujeX) * paso;
      p.y += (p.vy + p.empujeY) * paso;
      p.rot += p.vrot * paso;
      if (p.y < -30 || p.x < -40 || p.x > ancho + 40) particulas[i] = nuevaParticula(true);
    });

    chispas = chispas.filter((c) => c.vida > 0);
    chispas.forEach((c) => {
      c.x += c.vx * paso;
      c.y += c.vy * paso;
      c.vy += 0.04 * paso;
      c.vx *= 0.98;
      c.rot += c.vrot * paso;
      c.vida -= 0.018 * paso;
    });
  }

  function dibujar(t) {
    ctx.clearRect(0, 0, ancho, alto);
    dibujarManchas(t);
    particulas.forEach((p) => dibujarGlifo(p, p.alfa));
    chispas.forEach((c) => dibujarGlifo(c, Math.max(c.vida, 0) * 0.85));
  }

  function bucle(ahora) {
    requestAnimationFrame(bucle);
    if (ahora - ultimo < FPS_MS) return;
    const paso = Math.min((ahora - ultimo) / 16.7, 4);
    ultimo = ahora;
    puntero.suaveX += (puntero.px - puntero.suaveX) * 0.04;
    puntero.suaveY += (puntero.py - puntero.suaveY) * 0.04;
    actualizarParticulas(paso);
    dibujar(ahora);
  }

  function rafaga(x, y) {
    for (let i = 0; i < 10; i++) {
      const angulo = (Math.PI * 2 * i) / 10 + Math.random() * 0.4;
      const velocidad = 1.5 + Math.random() * 2.5;
      chispas.push({
        x,
        y,
        vx: Math.cos(angulo) * velocidad,
        vy: Math.sin(angulo) * velocidad - 1.5,
        rot: Math.random() * Math.PI,
        vrot: (Math.random() - 0.5) * 0.2,
        tam: 12 + Math.random() * 8,
        glifo: GLIFOS[Math.floor(Math.random() * 4)],
        vida: 1,
      });
    }
  }

  function iniciar() {
    canvas = document.createElement('canvas');
    canvas.className = 'fondo-dinamico';
    canvas.setAttribute('aria-hidden', 'true');
    document.body.prepend(canvas);
    ctx = canvas.getContext('2d');

    leerColores();
    redimensionar();
    window.addEventListener('resize', redimensionar);

    // Recolorear al cambiar de tema (boton, Configuracion o el sistema).
    new MutationObserver(leerColores).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', leerColores);

    if (sinMovimiento()) {
      dibujar(0);
      return;
    }

    document.addEventListener('pointermove', (e) => {
      puntero.x = e.clientX;
      puntero.y = e.clientY;
      puntero.px = e.clientX / ancho;
      puntero.py = e.clientY / alto;
    });
    document.addEventListener('pointerleave', () => {
      puntero.x = -9999;
      puntero.y = -9999;
    });
    document.addEventListener('click', (e) => {
      const interactivo = e.target.closest('a, button, input, select, textarea, label, .card, .modal, .mascota, .hero-balance, .sidebar, .pin-lock-card');
      if (!interactivo) rafaga(e.clientX, e.clientY);
    });

    requestAnimationFrame(bucle);
  }

  document.addEventListener('DOMContentLoaded', iniciar);
})();
