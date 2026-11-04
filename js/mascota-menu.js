// Menu RPG de la mascota: estado, misiones, habilidades, personalizacion
// (tienda) y mascotas. Se abre desde el boton "Mascota" del menu lateral, el
// comando /brote o el boton ☰ del globo. Toda la logica vive en
// js/mascota-vida.js; aqui solo se dibuja, se anima y se responde a los clics.
//
// El esqueleto (ficha de la izquierda y pestañas) se arma una sola vez y luego
// solo se actualiza lo que cambia, para que las animaciones de la vista previa
// no se corten con cada clic.
const MenuMascota = {
  overlay: null,
  panel: null,
  pestana: 'misiones',
  mascotaDibujada: null,
  valores: {},
  timerAviso: null,
  timerRefresco: null,

  abrir(pestana) {
    if (document.documentElement.classList.contains('bloqueado')) return;
    if (pestana) this.pestana = pestana;
    if (!this.overlay) this.construir();
    this.overlay.hidden = false;
    document.body.classList.add('mascota-menu-abierto');
    this.mascotaDibujada = null;
    this.render(true);
    this.panel.focus();
    // Los tiempos de espera y las misiones de hora se actualizan solos
    clearInterval(this.timerRefresco);
    this.timerRefresco = setInterval(() => this.render(), 30000);
  },

  cerrar() {
    if (!this.overlay) return;
    this.overlay.hidden = true;
    document.body.classList.remove('mascota-menu-abierto');
    clearInterval(this.timerRefresco);
  },

  abierto() {
    return Boolean(this.overlay && !this.overlay.hidden);
  },

  // Llamado desde mascota-vida.js cuando cambia algo (XP, monedas...).
  refrescar() {
    if (this.abierto()) this.render();
  },

  avisar(texto) {
    if (!this.panel) return;
    const el = this.panel.querySelector('.mascota-menu-aviso');
    if (!el) return;
    el.innerHTML = texto ? `<span class="glifo-spinner">✻</span> ${escapeHtml(texto)}` : '';
    el.classList.remove('aviso-entra');
    void el.offsetWidth;
    if (texto) el.classList.add('aviso-entra');
    clearTimeout(this.timerAviso);
    this.timerAviso = setTimeout(() => {
      el.innerHTML = '';
    }, 5000);
  },

  construir() {
    this.overlay = document.createElement('div');
    this.overlay.className = 'mascota-menu-overlay';
    this.overlay.hidden = true;
    this.overlay.innerHTML = '<div class="mascota-menu" role="dialog" aria-modal="true" aria-label="Menú de la mascota" tabindex="-1"></div>';
    document.body.appendChild(this.overlay);
    this.panel = this.overlay.querySelector('.mascota-menu');

    this.overlay.addEventListener('click', (e) => {
      if (e.target === this.overlay) {
        this.cerrar();
        return;
      }
      const boton = e.target.closest('[data-accion]');
      if (boton) this.accion(boton.dataset.accion, boton.dataset, boton);
    });
    this.overlay.addEventListener('submit', (e) => {
      e.preventDefault();
      const form = e.target;
      if (form.dataset.form === 'renombrar') {
        const error = renombrarMascota(form.nombre.value);
        this.render(true);
        this.efectoPrevia('previa-giro');
        this.avisar(error || '✏️ Nombre actualizado.');
      }
      if (form.dataset.form === 'adoptar') {
        const error = adoptarMascota(form.nombre.value);
        this.render(true);
        if (!error) this.efectoPrevia('previa-nace', ['🐣', '✨', '💨', '✨']);
        this.avisar(error || '🐣 ¡Bienvenida a la familia!');
      }
    });
    // Probador: al pasar el cursor por un cosmetico se ve en la vista previa
    this.overlay.addEventListener('pointerover', (e) => {
      const opcion = e.target.closest('.opcion[data-cat]');
      if (opcion) this.probar(opcion.dataset.cat, opcion.dataset.id);
    });
    this.overlay.addEventListener('pointerout', (e) => {
      const opcion = e.target.closest('.opcion[data-cat]');
      if (opcion && !opcion.contains(e.relatedTarget)) this.dejarDeProbar();
    });
    // Los ojos de la vista previa siguen al cursor
    this.overlay.addEventListener('pointermove', (e) => this.mirar(e));
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.abierto()) this.cerrar();
    });
  },

  accion(accion, datos, boton) {
    const mascota = leerVida();
    switch (accion) {
      case 'cerrar':
        this.cerrar();
        break;
      case 'pestana':
        if (this.pestana !== datos.valor) {
          this.pestana = datos.valor;
          this.renderPestana(true);
        }
        break;
      case 'previa':
        this.efectoPrevia('previa-salto', ['💚', '✨']);
        break;
      case 'regar':
        if (Mascota.el) Mascota.regar();
        else if (regarDatos()) ganarXp(3);
        this.efectoPrevia('previa-regada', null, 'regar');
        this.avisar(`💧 ${mascota.nombre} quedó feliz y con el agua al 100%.`);
        break;
      case 'mimar':
        if (Mascota.el) Mascota.cosquillas();
        else if (mimarDatos()) ganarXp(1);
        this.efectoPrevia('previa-risa', ['💚', '💙', '🤍', '💚', '💙']);
        this.avisar(`💚 A ${mascota.nombre} le encantó.`);
        break;
      case 'consejo':
        registrarEvento('consejo');
        if (Mascota.el) {
          this.cerrar();
          Mascota.animar('mascota--salto');
          Mascota.siguienteMensaje();
        } else {
          this.efectoPrevia('previa-salto');
          this.avisar(Mascota.mensajes[0] || 'Activa la mascota en Configuración para recibir consejos.');
        }
        break;
      case 'reclamar': {
        const mision = reclamarMision(datos.tipo, datos.id);
        if (mision) {
          this.volarMonedas(boton, Math.min(mision.monedas, 8));
          this.efectoPrevia('previa-salto', ['🎁', '✨', '🪙']);
          lanzarConfeti();
          this.avisar(`🎁 +${mision.xp} XP y 🪙 ${mision.monedas} por "${mision.texto}"`);
        }
        break;
      }
      case 'aprender': {
        const def = HABILIDADES.find((h) => h.id === datos.id);
        if (aprenderHabilidad(datos.id)) {
          this.render();
          this.efectoPrevia('previa-poder', ['✨', def.icono, '⚡', '✨']);
          this.panel.querySelector(`.habilidad[data-id="${datos.id}"]`)?.classList.add('recien');
          this.avisar(`${def.icono} ¡${mascota.nombre} aprendió ${def.nombre}!`);
        }
        break;
      }
      case 'usar': {
        // Las habilidades que se ven en pantalla cierran el menu para poder mirarlas
        if (datos.id !== 'pronostico' && Mascota.el) this.cerrar();
        const resultado = usarHabilidad(datos.id);
        if (resultado) {
          if (!this.abierto()) this.abrir();
          if (datos.id === 'pronostico') this.efectoPrevia('previa-poder', ['🔮', '✨']);
          this.avisar(resultado);
        }
        break;
      }
      case 'equipar': {
        const antes = mascota.monedas;
        const texto = equiparItem(datos.cat, datos.id);
        const ahora = leerVida();
        this.render();
        if (ahora.apariencia[datos.cat] === datos.id) {
          this.efectoPrevia('previa-giro', ['✨', '💫', '⭐']);
          if (ahora.monedas < antes) this.volarMonedas(boton, 4, true);
          this.panel.querySelector(`.opcion[data-cat="${datos.cat}"][data-id="${datos.id}"]`)?.classList.add('recien');
        } else {
          this.efectoPrevia('previa-no');
        }
        this.avisar(texto);
        break;
      }
      case 'comprar-punto': {
        const antes = mascota.monedas;
        const texto = comprarPunto();
        this.render();
        if (leerVida().monedas < antes) this.efectoPrevia('previa-poder', ['✨', '⭐']);
        else this.efectoPrevia('previa-no');
        this.avisar(texto);
        break;
      }
      case 'activar':
        activarMascota(datos.id);
        this.render(true);
        this.efectoPrevia('previa-nace', ['💨', '✨', '💨']);
        this.avisar(`🐾 Ahora te acompaña ${leerVida().nombre}.`);
        break;
      case 'liberar': {
        const cual = leerMascotas().mascotas.find((m) => m.id === datos.id);
        if (cual && confirm(`¿Liberar a ${cual.nombre}? Perderás su nivel, monedas y accesorios.`)) {
          const error = liberarMascota(datos.id);
          this.render(true);
          this.avisar(error || `👋 ${cual.nombre} se fue a vivir a un jardín feliz.`);
        }
        break;
      }
      default:
        break;
    }
  },

  // ---- Dibujo ----
  // completo = true vuelve a armar el esqueleto (al abrir o cambiar de mascota).
  render(completo = false) {
    if (!this.panel) return;
    const mascota = leerVida();
    if (completo || this.mascotaDibujada !== mascota.id || !this.panel.querySelector('.mascota-menu-cuerpo')) {
      this.esqueleto(mascota);
      this.mascotaDibujada = mascota.id;
      this.valores = {};
    }
    this.actualizarFicha(mascota);
    this.renderPestana(false);
  },

  esqueleto(mascota) {
    this.panel.innerHTML = `
      <div class="mascota-menu-barra">
        <i></i><i></i><i></i>
        <span class="menu-ruta"></span>
        <button type="button" class="mascota-menu-cerrar" data-accion="cerrar" aria-label="Cerrar menú">&times;</button>
      </div>
      <div class="mascota-menu-cuerpo">
        <aside class="mascota-menu-ficha">
          <div class="previa-escenario">
            <button type="button" class="previa-boton" data-accion="previa" aria-label="Saludar a la mascota">
              <div class="mascota-menu-previa mascota--feliz"><div class="mascota-btn">${mascotaSvg('-menu')}</div></div>
            </button>
          </div>
          <h2 class="mascota-menu-nombre"></h2>
          <p class="mascota-menu-titulo"></p>
          <div class="barra-rpg" title="Experiencia">
            <span class="barra-rpg-etiqueta">XP</span>
            <div class="barra-rpg-pista"><div class="barra-rpg-relleno barra-xp"></div></div>
            <span class="barra-rpg-valor valor-xp"></span>
          </div>
          <div class="barra-rpg" title="Agua">
            <span class="barra-rpg-etiqueta">💧</span>
            <div class="barra-rpg-pista"><div class="barra-rpg-relleno barra-agua"></div></div>
            <span class="barra-rpg-valor valor-agua"></span>
          </div>
          <div class="mascota-menu-recursos">
            <span title="Monedas">🪙 <b class="recurso-monedas">0</b></span>
            <span title="Puntos de habilidad">✨ <b class="recurso-puntos">0</b></span>
            <span title="Misiones cumplidas">🎯 <b class="recurso-misiones">0</b></span>
          </div>
          <div class="mascota-menu-acciones">
            <button type="button" class="btn btn-ghost" data-accion="regar">💧 Regar</button>
            <button type="button" class="btn btn-ghost" data-accion="mimar">💚 Mimar</button>
            <button type="button" class="btn btn-ghost" data-accion="consejo">💬 Consejo</button>
          </div>
        </aside>
        <section class="mascota-menu-contenido">
          <nav class="mascota-menu-pestanas" role="tablist"></nav>
          <div class="mascota-menu-panel"></div>
        </section>
      </div>
      <p class="mascota-menu-aviso" aria-live="polite"></p>`;
  },

  actualizarFicha(mascota) {
    const q = (sel) => this.panel.querySelector(sel);
    const nivel = nivelDeXp(mascota.xp);
    const actual = VIDA_NIVELES[nivel - 1];
    const siguiente = VIDA_NIVELES[nivel];
    const pctXp = siguiente ? Math.round(((mascota.xp - actual.xp) / (siguiente.xp - actual.xp)) * 100) : 100;
    const agua = aguaActual(mascota);

    q('.menu-ruta').textContent = `~/finanzas — ${mascota.nombre.toLowerCase()}.rpg`;
    q('.mascota-menu-nombre').textContent = mascota.nombre;
    q('.mascota-menu-titulo').textContent = `${actual.emoji} Nivel ${nivel} · ${actual.nombre}`;
    q('.barra-xp').style.width = `${pctXp}%`;
    q('.valor-xp').textContent = siguiente ? `${mascota.xp}/${siguiente.xp}` : 'MAX';
    q('.barra-agua').style.width = `${agua}%`;
    q('.barra-agua').classList.toggle('barra-baja', agua < VIDA_UMBRAL_SED);
    q('.valor-agua').textContent = `${agua}%`;

    // Contadores que suben (o bajan) animados
    this.contador(q('.recurso-monedas'), 'monedas', mascota.monedas);
    this.contador(q('.recurso-puntos'), 'puntos', puntosDisponibles(mascota));
    this.contador(q('.recurso-misiones'), 'misiones', mascota.stats.misiones);

    // La vista previa refleja la apariencia y el estado (sed) de la mascota
    if (!this.probando) this.vestirPrevia(mascota);
    const previa = q('.mascota-menu-previa');
    previa.classList.toggle('mascota--sediento', agua < VIDA_UMBRAL_SED);
    previa.classList.toggle('mascota--feliz', agua >= VIDA_UMBRAL_SED);

    // La recompensa diaria se cuenta en su propia pestaña
    const diaria = typeof calendarioPendiente === 'function' ? calendarioPendiente() : 0;
    const porReclamar = misionesPorReclamar(mascota) - diaria;
    const pestanas = [
      ['misiones', `🎯 Misiones${porReclamar ? ` <span class="menu-badge">${porReclamar}</span>` : ''}`],
      ['recompensas', `🎁 Recompensas${diaria ? ' <span class="menu-badge menu-badge-brilla">1</span>' : ''}`],
      ['habilidades', `✨ Habilidades${puntosDisponibles(mascota) > 0 ? ' <span class="menu-badge">!</span>' : ''}`],
      ['personalizar', '🎨 Personalizar'],
      ['mascotas', '🐾 Mascotas'],
      ['perfil', '👤 Perfil'],
    ];
    q('.mascota-menu-pestanas').innerHTML = pestanas
      .map(([id, texto]) => `<button type="button" role="tab" class="menu-pestana${this.pestana === id ? ' activa' : ''}" aria-selected="${this.pestana === id}" data-accion="pestana" data-valor="${id}">${texto}</button>`)
      .join('');
  },

  vestirPrevia(mascota, aparienciaExtra) {
    const previa = this.panel?.querySelector('.mascota-menu-previa');
    if (!previa) return;
    const copia = aparienciaExtra ? { ...mascota, apariencia: { ...mascota.apariencia, ...aparienciaExtra } } : mascota;
    [...previa.classList].filter((c) => /^mascota--(n\d|acc-|patron-|ojos-|diciembre)/.test(c)).forEach((c) => previa.classList.remove(c));
    clasesDeMascota(copia).split(' ').filter(Boolean).forEach((c) => previa.classList.add(c));
    previa.setAttribute('style', estiloDeMascota(copia));
  },

  probar(categoria, id) {
    this.probando = true;
    this.vestirPrevia(leerVida(), { [categoria]: id });
  },

  dejarDeProbar() {
    this.probando = false;
    this.vestirPrevia(leerVida());
  },

  contador(el, clave, valor) {
    if (!el) return;
    const antes = this.valores[clave];
    this.valores[clave] = valor;
    if (antes === undefined || antes === valor || sinMovimiento()) {
      el.textContent = valor;
      return;
    }
    const inicio = performance.now();
    const paso = (ahora) => {
      const t = Math.min((ahora - inicio) / 600, 1);
      el.textContent = Math.round(antes + (valor - antes) * (1 - Math.pow(1 - t, 3)));
      if (t < 1) requestAnimationFrame(paso);
    };
    requestAnimationFrame(paso);
    const contenedor = el.parentElement;
    contenedor.classList.remove('recurso-pulso', 'recurso-baja');
    void contenedor.offsetWidth;
    contenedor.classList.add(valor > antes ? 'recurso-pulso' : 'recurso-baja');
  },

  renderPestana(conTransicion) {
    const mascota = leerVida();
    const contenedor = this.panel.querySelector('.mascota-menu-panel');
    const scroll = contenedor.scrollTop;
    contenedor.innerHTML = this[`pestana_${this.pestana}`](mascota);
    this.panel.querySelectorAll('.menu-pestana').forEach((b) => {
      b.classList.toggle('activa', b.dataset.valor === this.pestana);
      b.setAttribute('aria-selected', b.dataset.valor === this.pestana);
    });
    // En movil la pestaña activa se desliza a la vista
    const barra = this.panel.querySelector('.mascota-menu-pestanas');
    const activa = barra.querySelector('.menu-pestana.activa');
    if (activa && barra.scrollWidth > barra.clientWidth) {
      barra.scrollTo({ left: activa.offsetLeft - barra.clientWidth / 2 + activa.offsetWidth / 2, behavior: 'smooth' });
    }
    if (conTransicion) {
      contenedor.scrollTop = 0;
      contenedor.classList.remove('panel-entra');
      void contenedor.offsetWidth;
      contenedor.classList.add('panel-entra');
    } else {
      contenedor.scrollTop = scroll;
    }
  },

  // ---- Efectos ----
  efectoPrevia(clase, particulas, especial) {
    const previa = this.panel?.querySelector('.mascota-menu-previa');
    const escenario = this.panel?.querySelector('.previa-escenario');
    if (!previa || sinMovimiento()) return;
    previa.classList.remove(clase);
    void previa.offsetWidth;
    previa.classList.add(clase);
    // Un temporizador por efecto: si haces clic rapido, el anterior no corta al nuevo
    this.timersPrevia = this.timersPrevia || {};
    clearTimeout(this.timersPrevia[clase]);
    this.timersPrevia[clase] = setTimeout(() => previa.classList.remove(clase), 1500);
    if (especial === 'regar') {
      const nube = document.createElement('span');
      nube.className = 'previa-nube';
      nube.textContent = '🌧️';
      escenario.appendChild(nube);
      setTimeout(() => nube.remove(), 1700);
      particulas = ['', '', '', '', '', ''];
    }
    (particulas || []).forEach((contenido, i) => {
      const p = document.createElement('span');
      p.className = especial === 'regar' ? 'previa-gota' : 'previa-particula';
      p.textContent = contenido;
      p.style.left = `${25 + Math.random() * 50}%`;
      p.style.setProperty('--dx', `${(Math.random() - 0.5) * 80}px`);
      p.style.animationDelay = `${i * 0.08}s`;
      escenario.appendChild(p);
      setTimeout(() => p.remove(), 1600);
    });
  },

  // Monedas que vuelan del boton al contador (o del contador al boton si gastas).
  volarMonedas(boton, cantidad, gastando = false) {
    const contador = this.panel?.querySelector('.recurso-monedas');
    if (!boton || !contador || sinMovimiento()) return;
    const a = boton.getBoundingClientRect();
    const b = contador.getBoundingClientRect();
    const [desde, hasta] = gastando ? [b, a] : [a, b];
    for (let i = 0; i < cantidad; i++) {
      const m = document.createElement('span');
      m.className = 'moneda-voladora';
      m.textContent = '🪙';
      document.body.appendChild(m);
      const x0 = desde.left + desde.width / 2 + (Math.random() - 0.5) * 30;
      const y0 = desde.top + desde.height / 2;
      const x1 = hasta.left + hasta.width / 2;
      const y1 = hasta.top + hasta.height / 2;
      const arco = -60 - Math.random() * 60;
      m.animate(
        [
          { transform: `translate(${x0}px, ${y0}px) scale(0.6)`, opacity: 0 },
          { transform: `translate(${(x0 + x1) / 2}px, ${Math.min(y0, y1) + arco}px) scale(1.2)`, opacity: 1, offset: 0.5 },
          { transform: `translate(${x1}px, ${y1}px) scale(0.7)`, opacity: 0.9 },
        ],
        { duration: 700 + i * 60, delay: i * 70, easing: 'cubic-bezier(0.4, 0, 0.2, 1)', fill: 'forwards' }
      ).onfinish = () => m.remove();
    }
  },

  // Cartel grande al subir de nivel (si el menu esta abierto).
  celebrarNivel(nivel) {
    if (!this.abierto() || sinMovimiento()) return;
    const cartel = document.createElement('div');
    cartel.className = 'menu-nivel';
    cartel.innerHTML = `<span>${VIDA_NIVELES[nivel - 1].emoji}</span><strong>¡NIVEL ${nivel}!</strong><small>${escapeHtml(VIDA_NIVELES[nivel - 1].nombre)} · ✨ +1 punto</small>`;
    this.panel.appendChild(cartel);
    this.efectoPrevia('previa-poder', ['⭐', '🌟', '✨', '⭐', '🌟']);
    setTimeout(() => cartel.remove(), 2600);
  },

  // Los ojos de la vista previa miran al cursor
  mirar(e) {
    if (this.rafMirar) return;
    this.rafMirar = requestAnimationFrame(() => {
      this.rafMirar = null;
      this.panel?.querySelectorAll('.mascota-menu-previa .mascota-pupila').forEach((pupila) => {
        const r = pupila.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2);
        const dy = e.clientY - (r.top + r.height / 2);
        const d = Math.hypot(dx, dy) || 1;
        const k = Math.min(d / 150, 1) * 2.6;
        pupila.setAttribute('transform', `translate(${((dx / d) * k).toFixed(2)} ${((dy / d) * k).toFixed(2)})`);
      });
    });
  },

  // ---- Pestañas ----
  pestana_misiones(mascota) {
    const { horarias, diarias, semanales } = misionesDe(mascota);
    const fila = (m, i) => {
      const pct = Math.round((m.avance / m.meta) * 100);
      const llenos = Math.round(pct / 10);
      const bloques = '▰'.repeat(llenos) + '▱'.repeat(10 - llenos);
      const boton = m.reclamada
        ? '<span class="mision-hecha">✓ Reclamada</span>'
        : m.completa
          ? `<button type="button" class="btn btn-primary btn-mini btn-reclamar" data-accion="reclamar" data-tipo="${m.tipo}" data-id="${m.id}">🎁 Reclamar</button>`
          : `<span class="mision-avance">${m.avance}/${m.meta}</span>`;
      return `
        <li class="mision${m.completa ? ' mision-completa' : ''}${m.reclamada ? ' mision-reclamada' : ''}" style="animation-delay:${i * 40}ms">
          <div class="mision-texto">
            <span>${escapeHtml(m.texto)}</span>
            <span class="mision-barra" aria-hidden="true">${bloques}</span>
          </div>
          <span class="mision-premio">+${m.xp} XP · 🪙${m.monedas}</span>
          ${boton}
        </li>`;
    };
    const ahora = new Date();
    const finHora = new Date(ahora);
    finHora.setMinutes(60, 0, 0);
    const finDia = new Date(ahora);
    finDia.setHours(24, 0, 0, 0);
    return `
      ${typeof htmlMisionesEspeciales === 'function' ? htmlMisionesEspeciales(mascota) : ''}
      <h3 class="menu-subtitulo">⏱️ De esta hora <span>· nuevas en ${duracionCorta(finHora - ahora)}</span></h3>
      <ul class="misiones misiones-hora">${horarias.map(fila).join('')}</ul>
      <h3 class="menu-subtitulo">📅 Diarias <span>· se renuevan en ${duracionCorta(finDia - ahora)}</span></h3>
      <ul class="misiones">${diarias.map(fila).join('')}</ul>
      <h3 class="menu-subtitulo">🗓️ Semanales <span>· se renuevan el lunes</span></h3>
      <ul class="misiones">${semanales.map(fila).join('')}</ul>`;
  },

  pestana_habilidades(mascota) {
    const puntos = puntosDisponibles(mascota);
    const tarjetas = HABILIDADES.map((h, i) => {
      const e = estadoHabilidad(h, mascota);
      let pie;
      if (e.bloqueada) pie = `<span class="hab-estado">🔒 Nivel ${h.nivel}</span>`;
      else if (!e.aprendida) {
        pie = e.puedeAprender
          ? `<button type="button" class="btn btn-primary btn-mini btn-aprender" data-accion="aprender" data-id="${h.id}">Aprender${h.costo ? ` · ✨${h.costo}` : ''}</button>`
          : '<span class="hab-estado">Necesitas ✨ 1 punto</span>';
      } else if (h.tipo === 'activa') {
        pie = e.enEspera > 0
          ? `<span class="hab-estado">⏳ ${duracionCorta(e.enEspera)}</span>`
          : `<button type="button" class="btn btn-primary btn-mini" data-accion="usar" data-id="${h.id}">Usar</button>`;
      } else {
        pie = '<span class="hab-estado hab-activa">✓ Activa siempre</span>';
      }
      return `
        <div class="habilidad${e.aprendida ? ' aprendida' : ''}${e.bloqueada ? ' bloqueada' : ''}" data-id="${h.id}" style="animation-delay:${i * 35}ms">
          <span class="hab-icono">${h.icono}</span>
          <div class="hab-info">
            <strong>${h.nombre}</strong>
            <span class="hab-tipo">${h.tipo === 'activa' ? 'Activa' : 'Pasiva'} · Nv ${h.nivel}</span>
            <p>${escapeHtml(h.desc.replace('{n}', mascota.nombre))}</p>
          </div>
          ${pie}
        </div>`;
    }).join('');
    return `
      <p class="menu-ayuda">Ganas <strong>✨ 1 punto</strong> cada vez que ${escapeHtml(mascota.nombre)} sube de nivel. Tienes <strong>✨ ${puntos}</strong>. ¡Elige bien, no alcanzan para todas!</p>
      <div class="habilidades">${tarjetas}</div>
      <div class="menu-extra">
        <span>¿Quieres más? Compra un punto en la tienda:</span>
        <button type="button" class="btn btn-ghost btn-mini" data-accion="comprar-punto">✨ +1 punto · 🪙150</button>
      </div>`;
  },

  pestana_personalizar(mascota) {
    const nivel = nivelDeXp(mascota.xp);
    const grupo = (categoria, titulo) => {
      const opciones = TIENDA[categoria].map((item, i) => {
        const tiene = poseeItem(mascota, categoria, item.id);
        const equipado = mascota.apariencia[categoria] === item.id;
        const bloqueado = !tiene && item.nivel && nivel < item.nivel;
        let muestra;
        if (item.colores) muestra = `<span class="muestra" style="background:linear-gradient(135deg, ${item.colores[categoria === 'hojas' ? 1 : 0]}, ${item.colores[categoria === 'hojas' ? 2 : 1]})"></span>`;
        else if (item.color) muestra = `<span class="muestra" style="background:${item.color}"></span>`;
        else muestra = `<span class="muestra muestra-emoji">${item.icono}</span>`;
        // Lo exclusivo solo sale en cofres: se muestra con su rareza (y brilla si ya lo tienes)
        const exclusivo = item.exclusivo && !tiene;
        const nombreRareza = item.exclusivo && typeof RAREZAS !== 'undefined' ? RAREZAS[item.exclusivo].nombre : '';
        const etiqueta = equipado ? '✓ Puesto' : tiene ? 'Usar' : exclusivo ? `🎁 Cofre ${nombreRareza}` : bloqueado ? `🔒 Nv ${item.nivel}` : `🪙 ${item.precio}`;
        return `
          <button type="button" class="opcion${equipado ? ' equipada' : ''}${bloqueado ? ' bloqueada' : ''}${!tiene && !bloqueado && !exclusivo ? ' en-venta' : ''}${item.exclusivo ? ` exclusiva rareza-${item.exclusivo}${exclusivo ? ' sin-tener' : ''}` : ''}" data-accion="equipar" data-cat="${categoria}" data-id="${item.id}" aria-pressed="${equipado}" style="animation-delay:${i * 25}ms">
            ${muestra}
            <span class="opcion-nombre">${item.nombre}</span>
            <span class="opcion-precio">${etiqueta}</span>
          </button>`;
      }).join('');
      return `<h3 class="menu-subtitulo">${titulo}</h3><div class="opciones">${opciones}</div>`;
    };
    return `
      <form class="menu-form" data-form="renombrar">
        <label for="mascota-nombre">Nombre</label>
        <input id="mascota-nombre" name="nombre" maxlength="18" value="${escapeHtml(mascota.nombre)}" autocomplete="off">
        <button type="submit" class="btn btn-ghost btn-mini">Guardar</button>
      </form>
      <p class="menu-ayuda">Tienes <strong>🪙 ${mascota.monedas}</strong>. Pasa el cursor por algo para <strong>probártelo</strong> antes de comprarlo.</p>
      ${CATEGORIAS_TIENDA.map(([cat, titulo]) => grupo(cat, titulo)).join('')}`;
  },

  pestana_mascotas() {
    const datos = leerMascotas();
    const tarjetas = datos.mascotas.map((m, i) => {
      const nivel = nivelDeXp(m.xp);
      const activa = m.id === datos.activa;
      return `
        <div class="ficha-mascota${activa ? ' activa' : ''}" style="animation-delay:${i * 50}ms">
          <div class="mascota-mini mascota--feliz ${clasesDeMascota(m)}" style="${estiloDeMascota(m)}"><div class="mascota-btn">${mascotaSvg(`-lista${i}`)}</div></div>
          <div class="ficha-mascota-info">
            <strong>${escapeHtml(m.nombre)}</strong>
            <span>${VIDA_NIVELES[nivel - 1].emoji} Nv ${nivel} · 🪙 ${m.monedas} · 💧 ${aguaActual(m)}%</span>
          </div>
          <div class="ficha-mascota-acciones">
            ${activa ? '<span class="hab-estado hab-activa">✓ Contigo</span>' : `<button type="button" class="btn btn-primary btn-mini" data-accion="activar" data-id="${m.id}">Elegir</button>`}
            ${datos.mascotas.length > 1 ? `<button type="button" class="btn btn-ghost btn-mini" data-accion="liberar" data-id="${m.id}" title="Liberar">👋</button>` : ''}
          </div>
        </div>`;
    }).join('');
    const puedeAdoptar = datos.mascotas.length < MASCOTAS_MAX;
    return `
      <p class="menu-ayuda">Cada mascota tiene su propio nivel, monedas, habilidades, misiones y apariencia. Viven en este navegador y viajan con el <strong>respaldo JSON</strong> (Configuración → Exportar respaldo) si quieres llevarlas a otro equipo.</p>
      <div class="fichas-mascotas">${tarjetas}</div>
      ${
        puedeAdoptar
          ? `<form class="menu-form" data-form="adoptar">
              <label for="mascota-nueva">Adoptar otra</label>
              <input id="mascota-nueva" name="nombre" maxlength="18" placeholder="Nombre de tu nueva mascota" autocomplete="off">
              <button type="submit" class="btn btn-primary btn-mini">🐣 Adoptar</button>
            </form>`
          : `<p class="menu-ayuda">Ya tienes ${MASCOTAS_MAX} mascotas, el máximo.</p>`
      }`;
  },
};

// Boton ☰ del globo de la mascota
document.addEventListener('click', (e) => {
  if (e.target.closest('.mascota-burbuja-menu')) MenuMascota.abrir();
});
