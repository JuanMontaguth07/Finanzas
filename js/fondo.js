// Fondo: una oficina con ventanales grandes dibujada con un shader WebGL.
// Por las ventanas se ve el cielo y la ciudad; de dia hay sol, nubes y rayos
// de luz con polvo flotando, y de noche (modo oscuro) estrellas, luna, luces
// de la ciudad y lamparas encendidas. Al cambiar de tema el cielo pasa por un
// atardecer. El shader se dibuja a media resolucion y se desenfoca con CSS
// (.fondo-dinamico) para que parezca una foto fuera de foco. Encima van dos
// plantas de oficina en SVG, tambien desenfocadas, con un poco de parallax.
(function () {
  const ESCALA = 0.5;
  const FPS_MS = 1000 / 30;
  const DURACION_CAMBIO = 1.6; // segundos que tarda en hacerse de noche/dia

  const VERTEX = `
    attribute vec2 a_pos;
    void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }
  `;

  const FRAGMENT = `
    precision mediump float;
    uniform vec2 u_res;
    uniform float u_time;
    uniform float u_noche;
    uniform vec2 u_mouse;

    float hash(vec2 p) {
      p = fract(p * vec2(123.34, 456.21));
      p += dot(p, p + 45.32);
      return fract(p.x * p.y);
    }

    float noise(vec2 p) {
      vec2 i = floor(p);
      vec2 f = fract(p);
      vec2 u = f * f * (3.0 - 2.0 * f);
      return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
                 mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
    }

    float fbm(vec2 p) {
      float v = 0.0;
      float a = 0.5;
      for (int i = 0; i < 4; i++) {
        v += a * noise(p);
        p = p * 2.03 + 7.1;
        a *= 0.5;
      }
      return v;
    }

    // Cielo visto por los ventanales. s.y va de 0 (abajo) a 1 (arriba).
    vec3 cielo(vec2 s, float n, float t) {
      float tarde = sin(n * 3.14159);
      vec3 dia = mix(vec3(0.84, 0.91, 0.97), vec3(0.50, 0.70, 0.91), smoothstep(0.0, 1.0, s.y));
      vec3 noche = mix(vec3(0.09, 0.14, 0.27), vec3(0.02, 0.04, 0.11), smoothstep(0.0, 1.0, s.y));
      vec3 col = mix(dia, noche, n);
      vec3 atardecer = mix(vec3(0.98, 0.66, 0.50), vec3(0.48, 0.46, 0.72), smoothstep(0.0, 0.9, s.y));
      col = mix(col, atardecer, tarde * 0.65);

      // El sol baja durante el atardecer y de noche queda la luna
      vec2 astro = vec2(0.30, mix(0.80, 0.72, n) - tarde * 0.3);
      // s esta escalado distinto en X (0.55) que en Y (alto de ventana 0.7):
      // se corrige para que el sol y la luna queden redondos en pantalla.
      vec2 ds = (s - astro) * vec2(1.0 / 0.55, 0.7);
      float d = length(ds);
      vec3 colSol = mix(vec3(1.0, 0.96, 0.86), vec3(1.0, 0.7, 0.45), tarde);
      vec3 sol = colSol * (smoothstep(0.052, 0.042, d) + exp(-d * 7.0) * 0.45);
      vec3 luna = vec3(0.86, 0.91, 1.0) * (smoothstep(0.032, 0.027, d) * 0.95 + exp(-d * 13.0) * 0.2);
      col += sol * (1.0 - n) + luna * smoothstep(0.5, 1.0, n);

      float nube = fbm(vec2(s.x * 2.2 + t * 0.012, s.y * 5.0 - t * 0.003));
      nube = smoothstep(0.48, 0.8, nube) * smoothstep(0.2, 0.65, s.y);
      vec3 colNube = mix(vec3(1.0), vec3(0.15, 0.19, 0.3), n);
      colNube = mix(colNube, vec3(1.0, 0.76, 0.66), tarde * 0.5);
      col = mix(col, colNube, nube * 0.75);

      vec2 g = s * vec2(90.0, 50.0);
      vec2 id = floor(g);
      float h = hash(id);
      float estrella = step(0.975, h) * smoothstep(0.32, 0.0, length(fract(g) - 0.5));
      estrella *= 0.55 + 0.45 * sin(t * (1.5 + h * 3.0) + h * 40.0);
      col += vec3(0.9, 0.93, 1.0) * estrella * smoothstep(0.55, 1.0, n) * smoothstep(0.3, 0.6, s.y) * (1.0 - nube);
      return col;
    }

    // Silueta de la ciudad: dos capas de edificios, con ventanitas encendidas de noche.
    vec3 ciudad(vec2 s, vec3 col, float n, float t) {
      float tarde = sin(n * 3.14159);
      float x1 = s.x * 9.0;
      float h1 = 0.18 + hash(vec2(floor(x1), 3.0)) * 0.22;
      float e1 = smoothstep(h1 + 0.004, h1 - 0.004, s.y);
      vec3 c1 = mix(vec3(0.72, 0.79, 0.87), vec3(0.06, 0.09, 0.17), n);
      c1 = mix(c1, vec3(0.62, 0.52, 0.62), tarde * 0.4);
      col = mix(col, c1, e1 * 0.9);

      float x2 = s.x * 5.0 + 0.37;
      float id2 = floor(x2);
      float h2 = 0.08 + hash(vec2(id2, 9.0)) * 0.2;
      float hueco = step(0.08, fract(x2)) * step(fract(x2), 0.94);
      float e2 = smoothstep(h2 + 0.004, h2 - 0.004, s.y) * hueco;
      vec3 c2 = mix(vec3(0.60, 0.68, 0.78), vec3(0.03, 0.05, 0.10), n);
      col = mix(col, c2, e2);

      vec2 v = vec2(fract(x2) * 8.0, s.y * 70.0);
      vec2 vid = floor(v) + vec2(id2 * 13.0, 0.0);
      float encendida = step(0.62, hash(vid + floor(t * 0.05 + hash(vid) * 10.0)));
      float forma = step(0.3, fract(v.x)) * step(fract(v.x), 0.75) * step(0.35, fract(v.y)) * step(fract(v.y), 0.8);
      float dentro = e2 * step(s.y, h2 - 0.01);
      col += vec3(1.0, 0.86, 0.55) * encendida * forma * dentro * n * 0.9;
      col += vec3(0.85, 0.92, 1.0) * forma * dentro * (1.0 - n) * 0.12;
      return col;
    }

    // Discos de luz fuera de foco, como el bokeh de una camara.
    vec3 bokeh(vec2 p, vec3 col, float n, float t) {
      for (int capa = 0; capa < 2; capa++) {
        float fc = float(capa);
        vec2 g = p * (3.0 + fc * 2.0) + vec2(t * 0.01 * (fc + 1.0), fc * 3.7);
        vec2 id = floor(g);
        float h = hash(id + fc * 17.0);
        vec2 centro = vec2(hash(id + 1.3), hash(id + 7.9)) * 0.6 + 0.2;
        float r = 0.12 + h * 0.2;
        float d = length(fract(g) - centro);
        float disco = smoothstep(r, r * 0.8, d) * step(0.55, h);
        float borde = smoothstep(r * 0.75, r * 0.95, d) * disco;
        vec3 tono = mix(vec3(1.0, 0.97, 0.9), mix(vec3(1.0, 0.8, 0.5), vec3(0.6, 0.75, 1.0), hash(id + 3.1)), n);
        float intensidad = mix(0.05, 0.2, n) * (0.6 + 0.4 * sin(t * 0.6 + h * 30.0));
        col += tono * (disco * 0.7 + borde * 0.5) * intensidad;
      }
      return col;
    }

    void main() {
      vec2 uv = gl_FragCoord.xy / u_res;
      float aspect = u_res.x / u_res.y;
      vec2 p = vec2((uv.x - 0.5) * aspect, uv.y - 0.5);
      float n = u_noche;
      float t = u_time;
      float tarde = sin(n * 3.14159);

      // Parallax: el exterior (lejos) se corre mas que los marcos de la ventana.
      vec2 pm = p + u_mouse * 0.012;
      vec2 pc = p + u_mouse * 0.035;
      float yPiso = -0.30;
      float yTecho = 0.40;

      vec3 col = mix(vec3(0.91, 0.93, 0.95), vec3(0.05, 0.07, 0.11), n);

      // ---- Ventanales ----
      float anchoPanel = 0.42;
      float celda = fract(pm.x / anchoPanel + 0.5);
      float dBorde = min(celda, 1.0 - celda) * anchoPanel;
      float montante = smoothstep(0.016, 0.010, dBorde);
      float travesano = smoothstep(0.008, 0.004, abs(pm.y - 0.17));
      float enVentana = smoothstep(yPiso - 0.004, yPiso + 0.004, pm.y) * smoothstep(yTecho + 0.004, yTecho - 0.004, pm.y);
      float vidrio = enVentana * (1.0 - montante) * (1.0 - travesano);

      vec2 s = vec2(pc.x * 0.55, (pc.y - yPiso) / (yTecho - yPiso));
      vec3 exterior = ciudad(s, cielo(s, n, t), n, t);
      float reflejo = pow(max(0.0, sin((pm.x + pm.y * 0.7) * 9.0)), 14.0);
      exterior += reflejo * mix(0.07, 0.03, n);

      vec3 marco = mix(vec3(0.36, 0.41, 0.48), vec3(0.09, 0.11, 0.16), n);
      col = mix(col, marco, enVentana);
      col = mix(col, exterior, vidrio);

      // ---- Techo con lamparas (apagadas de dia, encendidas de noche) ----
      float techo = smoothstep(yTecho - 0.004, yTecho + 0.004, pm.y);
      col = mix(col, mix(vec3(0.95, 0.96, 0.97), vec3(0.04, 0.05, 0.08), n), techo);
      for (int i = -3; i <= 3; i++) {
        vec2 lp = vec2(float(i) * 0.62, 0.44);
        float dl = length((pm - lp) * vec2(1.0, 2.4));
        col = mix(col, mix(vec3(0.80, 0.83, 0.87), vec3(1.0, 0.95, 0.86), n), smoothstep(0.05, 0.04, dl));
        col += vec3(1.0, 0.9, 0.75) * exp(-length(pm - lp) * 3.5) * 0.35 * n;
      }

      // ---- Piso brillante que refleja los ventanales ----
      float piso = smoothstep(yPiso + 0.004, yPiso - 0.004, pm.y);
      float prof = clamp((yPiso - pm.y) / 0.25, 0.0, 1.0);
      vec2 sr = vec2(s.x, (yPiso - pm.y) * 1.6 / (yTecho - yPiso));
      vec3 reflejoPiso = ciudad(sr, cielo(sr, n, t), n, t);
      vec3 colPiso = mix(vec3(0.86, 0.88, 0.91), vec3(0.04, 0.05, 0.08), n);
      colPiso = mix(colPiso, reflejoPiso, 0.22 * (1.0 - prof * 0.7));
      // Manchas de sol que entran por las ventanas
      float xSol = pm.x + (yPiso - pm.y) * 1.1;
      float celdaSol = fract(xSol / anchoPanel + 0.5);
      float luzSol = smoothstep(0.02, 0.06, min(celdaSol, 1.0 - celdaSol) * anchoPanel) * (1.0 - prof);
      colPiso += mix(vec3(1.0, 0.95, 0.85), vec3(1.0, 0.65, 0.45), tarde) * luzSol * 0.18 * (1.0 - n * 0.85);
      col = mix(col, colPiso, piso);

      // ---- Rayos de luz y polvo flotando (de dia) ----
      float rayo = pow(max(0.0, sin((p.x * 0.9 + p.y * 0.55) * 11.0 + 1.3)), 6.0);
      rayo *= smoothstep(-0.5, 0.4, p.y) * (0.6 + 0.4 * fbm(p * 3.0 + t * 0.02));
      col += mix(vec3(1.0, 0.97, 0.9), vec3(1.0, 0.7, 0.5), tarde) * rayo * 0.08 * (1.0 - n);
      vec2 gp = (p + vec2(t * 0.004, t * 0.006)) * 40.0;
      float polvo = step(0.985, hash(floor(gp))) * smoothstep(0.25, 0.0, length(fract(gp) - 0.5));
      col += polvo * rayo * 0.6 * (1.0 - n);

      col = bokeh(p, col, n, t);

      // Vineta y grano de pelicula
      col *= 1.0 - 0.56 * dot(uv - 0.5, uv - 0.5);
      col += (hash(gl_FragCoord.xy + fract(t) * 100.0) - 0.5) * 0.025;
      gl_FragColor = vec4(col, 1.0);
    }
  `;

  // Hojas genericas para las plantas en SVG (la base de la hoja queda en 0,0)
  const HOJA_ANCHA = 'M0 0 C18 -22 60 -26 95 0 C60 26 18 22 0 0 Z';
  const HOJA_LANZA = 'M0 0 C-7 -70 -3 -150 5 -215 C13 -150 15 -70 10 0 Z';

  function hoja(d, x, y, rot, escala, color, retraso) {
    return `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${escala})"><path class="oficina-hoja" style="animation-delay:${retraso}s" d="${d}" fill="${color}"/></g>`;
  }

  // Planta grande de hojas anchas en maceta blanca (esquina izquierda)
  const PLANTA_IZQ = `
    <svg viewBox="0 0 300 420" aria-hidden="true">
      <g stroke="#2f7a4b" stroke-width="5" stroke-linecap="round" fill="none">
        <path d="M150 340 Q140 260 110 190"/><path d="M150 340 Q158 240 175 150"/>
        <path d="M150 340 Q175 290 225 245"/><path d="M150 340 Q120 300 75 275"/>
        <path d="M150 340 Q150 250 150 110"/>
      </g>
      ${hoja(HOJA_ANCHA, 75, 275, -165, 1.15, '#3f8f5c', 0)}
      ${hoja(HOJA_ANCHA, 110, 190, -140, 1.2, '#5fae7a', -1.5)}
      ${hoja(HOJA_ANCHA, 150, 110, -100, 1.1, '#4f9e6b', -3)}
      ${hoja(HOJA_ANCHA, 175, 150, -55, 1.25, '#6fbf8a', -2)}
      ${hoja(HOJA_ANCHA, 225, 245, -20, 1.1, '#4f9e6b', -4)}
      ${hoja(HOJA_ANCHA, 150, 230, -75, 0.9, '#7cc795', -2.5)}
      ${hoja(HOJA_ANCHA, 150, 260, -120, 0.85, '#3f8f5c', -0.5)}
      <path d="M85 335 H215 L202 420 H98 Z" fill="#eef2f6"/>
      <rect x="78" y="325" width="144" height="20" rx="6" fill="#f8fafc"/>
      <path d="M90 380 H210 L207 395 H93 Z" fill="#3b5e91" opacity="0.85"/>
    </svg>`;

  // Planta de hojas tipo lanza en maceta gris (esquina derecha)
  const PLANTA_DER = `
    <svg viewBox="0 0 260 360" aria-hidden="true">
      ${hoja(HOJA_LANZA, 95, 285, -14, 1.0, '#3f8f5c', -1)}
      ${hoja(HOJA_LANZA, 115, 285, -4, 1.18, '#5fae7a', -2.5)}
      ${hoja(HOJA_LANZA, 135, 285, 6, 1.05, '#4f9e6b', 0)}
      ${hoja(HOJA_LANZA, 150, 285, 16, 0.9, '#6fbf8a', -3.5)}
      ${hoja(HOJA_LANZA, 105, 285, -24, 0.75, '#4f9e6b', -1.8)}
      <path d="M70 280 H190 L180 360 H80 Z" fill="#cfd8e3"/>
      <rect x="64" y="272" width="132" height="16" rx="5" fill="#dfe6ee"/>
    </svg>`;

  let canvas = null;
  let gl = null;
  let u = null;
  let plantas = [];
  let noche = 0;
  let objetivoNoche = 0;
  const mouse = { x: 0, y: 0, suaveX: 0, suaveY: 0 };
  const inicio = performance.now();
  let ultimo = 0;

  function sinMovimiento() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function esNoche() {
    if (typeof esOscuroActivo === 'function') return esOscuroActivo();
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  function compilar(tipo, codigo) {
    const shader = gl.createShader(tipo);
    gl.shaderSource(shader, codigo);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      throw new Error(gl.getShaderInfoLog(shader));
    }
    return shader;
  }

  function prepararWebGL() {
    gl = canvas.getContext('webgl', { antialias: false, alpha: false, powerPreference: 'low-power' });
    if (!gl) return false;
    const programa = gl.createProgram();
    gl.attachShader(programa, compilar(gl.VERTEX_SHADER, VERTEX));
    gl.attachShader(programa, compilar(gl.FRAGMENT_SHADER, FRAGMENT));
    gl.linkProgram(programa);
    if (!gl.getProgramParameter(programa, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(programa));
    gl.useProgram(programa);

    // Un triangulo que cubre toda la pantalla
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const aPos = gl.getAttribLocation(programa, 'a_pos');
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    u = {
      res: gl.getUniformLocation(programa, 'u_res'),
      time: gl.getUniformLocation(programa, 'u_time'),
      noche: gl.getUniformLocation(programa, 'u_noche'),
      mouse: gl.getUniformLocation(programa, 'u_mouse'),
    };
    return true;
  }

  function redimensionar() {
    const r = canvas.getBoundingClientRect();
    canvas.width = Math.max(1, Math.round(r.width * ESCALA));
    canvas.height = Math.max(1, Math.round(r.height * ESCALA));
    gl.viewport(0, 0, canvas.width, canvas.height);
  }

  function dibujar(ahora) {
    gl.uniform2f(u.res, canvas.width, canvas.height);
    gl.uniform1f(u.time, (ahora - inicio) / 1000);
    gl.uniform1f(u.noche, noche);
    gl.uniform2f(u.mouse, mouse.suaveX, mouse.suaveY);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  function moverPlantas() {
    plantas.forEach((planta, i) => {
      const profundidad = i === 0 ? 18 : 14;
      planta.style.transform = `translate(${(-mouse.suaveX * profundidad).toFixed(1)}px, ${(mouse.suaveY * profundidad * 0.5).toFixed(1)}px)`;
    });
  }

  function bucle(ahora) {
    requestAnimationFrame(bucle);
    if (ahora - ultimo < FPS_MS) return;
    const dt = Math.min((ahora - ultimo) / 1000, 0.1);
    ultimo = ahora;

    // Transicion suave entre dia y noche
    const pasoNoche = dt / DURACION_CAMBIO;
    if (Math.abs(objetivoNoche - noche) <= pasoNoche) noche = objetivoNoche;
    else noche += Math.sign(objetivoNoche - noche) * pasoNoche;

    mouse.suaveX += (mouse.x - mouse.suaveX) * 0.05;
    mouse.suaveY += (mouse.y - mouse.suaveY) * 0.05;
    dibujar(ahora);
    moverPlantas();
  }

  function alCambiarTema() {
    objetivoNoche = esNoche() ? 1 : 0;
    if (sinMovimiento() && gl) {
      noche = objetivoNoche;
      dibujar(performance.now());
    }
  }

  function montarPlantas() {
    const capa = document.createElement('div');
    capa.className = 'oficina-plantas';
    capa.setAttribute('aria-hidden', 'true');
    capa.innerHTML = `
      <div class="oficina-planta oficina-planta-izq">${PLANTA_IZQ}</div>
      <div class="oficina-planta oficina-planta-der">${PLANTA_DER}</div>`;
    document.body.prepend(capa);
    plantas = Array.from(capa.querySelectorAll('.oficina-planta'));
  }

  function iniciar() {
    montarPlantas();

    canvas = document.createElement('canvas');
    canvas.className = 'fondo-dinamico';
    canvas.setAttribute('aria-hidden', 'true');
    document.body.prepend(canvas);

    try {
      if (!prepararWebGL()) throw new Error('WebGL no disponible');
    } catch (err) {
      // Sin WebGL queda el degradado de respaldo del body en CSS.
      console.warn('Fondo animado desactivado:', err.message);
      canvas.remove();
      return;
    }

    noche = objetivoNoche = esNoche() ? 1 : 0;
    redimensionar();
    window.addEventListener('resize', () => {
      redimensionar();
      if (sinMovimiento()) dibujar(performance.now());
    });

    new MutationObserver(alCambiarTema).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', alCambiarTema);

    if (sinMovimiento()) {
      dibujar(performance.now());
      return;
    }

    document.addEventListener('pointermove', (e) => {
      mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -((e.clientY / window.innerHeight) * 2 - 1);
    });
    requestAnimationFrame(bucle);
  }

  document.addEventListener('DOMContentLoaded', iniciar);
})();
