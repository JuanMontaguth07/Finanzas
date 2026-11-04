// Menu RPG de la mascota: estado, misiones, habilidades, personalizacion
// (tienda) y mascotas. Se abre desde el boton "Mascota" del menu lateral, el
// comando /brote o el boton ☰ del globo. Toda la logica vive en
// js/mascota-vida.js; aqui solo se dibuja y se responde a los clics.
const MenuMascota = {
  overlay: null,
  panel: null,
  pestana: 'misiones',
  aviso: '',
  timerAviso: null,
  timerRefresco: null,

  abrir(pestana) {
    if (document.documentElement.classList.contains('bloqueado')) return;
    if (pestana) this.pestana = pestana;
    if (!this.overlay) this.construir();
    this.overlay.hidden = false;
    document.body.classList.add('mascota-menu-abierto');
    this.render();
    this.panel.focus();
    // Los tiempos de espera de las habilidades van bajando mientras esta abierto
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
    this.aviso = texto || '';
    clearTimeout(this.timerAviso);
    this.timerAviso = setTimeout(() => {
      this.aviso = '';
      this.refrescar();
    }, 4500);
    this.render();
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
      if (form.dataset.form === 'renombrar') this.avisar(renombrarMascota(form.nombre.value) || '✏️ Nombre actualizado.');
      if (form.dataset.form === 'adoptar') {
        const error = adoptarMascota(form.nombre.value);
        this.avisar(error || '🐣 ¡Bienvenida a la familia!');
      }
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.abierto()) this.cerrar();
    });
  },

  accion(accion, datos) {
    const mascota = leerVida();
    switch (accion) {
      case 'cerrar':
        this.cerrar();
        break;
      case 'pestana':
        this.pestana = datos.valor;
        this.render();
        break;
      case 'regar':
        if (Mascota.el) Mascota.regar();
        else if (regarDatos()) ganarXp(3);
        this.avisar(`💧 ${mascota.nombre} quedó feliz y con el agua al 100%.`);
        break;
      case 'mimar':
        if (Mascota.el) Mascota.cosquillas();
        else if (mimarDatos()) ganarXp(1);
        this.avisar(`💚 A ${mascota.nombre} le encantó.`);
        break;
      case 'consejo':
        if (Mascota.el) {
          this.cerrar();
          Mascota.siguienteMensaje();
        } else {
          this.avisar(Mascota.mensajes[0] || 'Activa la mascota en Configuración para recibir consejos.');
        }
        break;
      case 'reclamar': {
        const mision = reclamarMision(datos.tipo, datos.id);
        if (mision) {
          lanzarConfeti();
          this.avisar(`🎁 +${mision.xp} XP y 🪙 ${mision.monedas} por "${mision.texto}"`);
        }
        break;
      }
      case 'aprender': {
        const def = HABILIDADES.find((h) => h.id === datos.id);
        if (aprenderHabilidad(datos.id)) this.avisar(`${def.icono} ¡${mascota.nombre} aprendió ${def.nombre}!`);
        break;
      }
      case 'usar': {
        // Las habilidades que se ven en pantalla cierran el menu para poder mirarlas
        if (datos.id !== 'pronostico' && Mascota.el) this.cerrar();
        const resultado = usarHabilidad(datos.id);
        if (resultado) {
          if (!this.abierto()) this.abrir();
          this.avisar(resultado);
        }
        break;
      }
      case 'equipar':
        this.avisar(equiparItem(datos.cat, datos.id));
        break;
      case 'comprar-punto':
        this.avisar(comprarPunto());
        break;
      case 'activar':
        activarMascota(datos.id);
        this.avisar(`🐾 Ahora te acompaña ${leerVida().nombre}.`);
        break;
      case 'liberar': {
        const cual = leerMascotas().mascotas.find((m) => m.id === datos.id);
        if (cual && confirm(`¿Liberar a ${cual.nombre}? Perderás su nivel, monedas y accesorios.`)) {
          this.avisar(liberarMascota(datos.id) || `👋 ${cual.nombre} se fue a vivir a un jardín feliz.`);
        }
        break;
      }
      default:
        break;
    }
  },

  // ---- Dibujo ----
  render() {
    if (!this.panel) return;
    const mascota = leerVida();
    const nivel = nivelDeXp(mascota.xp);
    const actual = VIDA_NIVELES[nivel - 1];
    const siguiente = VIDA_NIVELES[nivel];
    const pctXp = siguiente ? Math.round(((mascota.xp - actual.xp) / (siguiente.xp - actual.xp)) * 100) : 100;
    const agua = aguaActual(mascota);
    const porReclamar = misionesPorReclamar(mascota);
    const pestanas = [
      ['misiones', `🎯 Misiones${porReclamar ? ` <span class="menu-badge">${porReclamar}</span>` : ''}`],
      ['habilidades', `✨ Habilidades${puntosDisponibles(mascota) > 0 ? ' <span class="menu-badge">!</span>' : ''}`],
      ['personalizar', '🎨 Personalizar'],
      ['mascotas', '🐾 Mascotas'],
    ];

    this.panel.innerHTML = `
      <div class="mascota-menu-barra">
        <i></i><i></i><i></i>
        <span>~/finanzas — ${escapeHtml(mascota.nombre.toLowerCase())}.rpg</span>
        <button type="button" class="mascota-menu-cerrar" data-accion="cerrar" aria-label="Cerrar menú">&times;</button>
      </div>
      <div class="mascota-menu-cuerpo">
        <aside class="mascota-menu-ficha">
          ${this.previa(mascota, '-menu', 'mascota-menu-previa mascota--feliz')}
          <h2 class="mascota-menu-nombre">${escapeHtml(mascota.nombre)}</h2>
          <p class="mascota-menu-titulo">${actual.emoji} Nivel ${nivel} · ${actual.nombre}</p>
          <div class="barra-rpg" title="Experiencia">
            <span class="barra-rpg-etiqueta">XP</span>
            <div class="barra-rpg-pista"><div class="barra-rpg-relleno barra-xp" style="width:${pctXp}%"></div></div>
            <span class="barra-rpg-valor">${siguiente ? `${mascota.xp}/${siguiente.xp}` : 'MAX'}</span>
          </div>
          <div class="barra-rpg" title="Agua">
            <span class="barra-rpg-etiqueta">💧</span>
            <div class="barra-rpg-pista"><div class="barra-rpg-relleno barra-agua${agua < VIDA_UMBRAL_SED ? ' barra-baja' : ''}" style="width:${agua}%"></div></div>
            <span class="barra-rpg-valor">${agua}%</span>
          </div>
          <div class="mascota-menu-recursos">
            <span title="Monedas">🪙 ${mascota.monedas}</span>
            <span title="Puntos de habilidad">✨ ${puntosDisponibles(mascota)}</span>
            <span title="Misiones cumplidas">🎯 ${mascota.stats.misiones}</span>
          </div>
          <div class="mascota-menu-acciones">
            <button type="button" class="btn btn-ghost" data-accion="regar">💧 Regar</button>
            <button type="button" class="btn btn-ghost" data-accion="mimar">💚 Mimar</button>
            <button type="button" class="btn btn-ghost" data-accion="consejo">💬 Consejo</button>
          </div>
        </aside>
        <section class="mascota-menu-contenido">
          <nav class="mascota-menu-pestanas" role="tablist">
            ${pestanas
              .map(([id, texto]) => `<button type="button" role="tab" class="menu-pestana${this.pestana === id ? ' activa' : ''}" aria-selected="${this.pestana === id}" data-accion="pestana" data-valor="${id}">${texto}</button>`)
              .join('')}
          </nav>
          <div class="mascota-menu-panel">${this[`pestana_${this.pestana}`](mascota)}</div>
        </section>
      </div>
      <p class="mascota-menu-aviso" aria-live="polite">${this.aviso ? `<span class="glifo-spinner">✻</span> ${escapeHtml(this.aviso)}` : ''}</p>`;
  },

  previa(mascota, sufijo, clases) {
    return `<div class="${clases} ${clasesDeMascota(mascota)}" style="${estiloDeMascota(mascota)}"><div class="mascota-btn">${mascotaSvg(sufijo)}</div></div>`;
  },

  pestana_misiones(mascota) {
    const { diarias, semanales } = misionesDe(mascota);
    const fila = (m) => {
      const pct = Math.round((m.avance / m.meta) * 100);
      const bloques = '▰'.repeat(Math.round(pct / 10)) + '▱'.repeat(10 - Math.round(pct / 10));
      const boton = m.reclamada
        ? '<span class="mision-hecha">✓ Reclamada</span>'
        : m.completa
          ? `<button type="button" class="btn btn-primary btn-mini" data-accion="reclamar" data-tipo="${m.tipo}" data-id="${m.id}">🎁 Reclamar</button>`
          : `<span class="mision-avance">${m.avance}/${m.meta}</span>`;
      return `
        <li class="mision${m.completa ? ' mision-completa' : ''}${m.reclamada ? ' mision-reclamada' : ''}">
          <div class="mision-texto">
            <span>${escapeHtml(m.texto)}</span>
            <span class="mision-barra" aria-hidden="true">${bloques}</span>
          </div>
          <span class="mision-premio">+${m.xp} XP · 🪙${m.monedas}</span>
          ${boton}
        </li>`;
    };
    const finDia = new Date();
    finDia.setHours(24, 0, 0, 0);
    return `
      <h3 class="menu-subtitulo">Diarias <span>· se renuevan en ${duracionCorta(finDia - Date.now())}</span></h3>
      <ul class="misiones">${diarias.map(fila).join('')}</ul>
      <h3 class="menu-subtitulo">Semanales <span>· se renuevan el lunes</span></h3>
      <ul class="misiones">${semanales.map(fila).join('')}</ul>`;
  },

  pestana_habilidades(mascota) {
    const puntos = puntosDisponibles(mascota);
    const tarjetas = HABILIDADES.map((h) => {
      const e = estadoHabilidad(h, mascota);
      let pie;
      if (e.bloqueada) pie = `<span class="hab-estado">🔒 Nivel ${h.nivel}</span>`;
      else if (!e.aprendida) {
        pie = e.puedeAprender
          ? `<button type="button" class="btn btn-primary btn-mini" data-accion="aprender" data-id="${h.id}">Aprender${h.costo ? ` · ✨${h.costo}` : ''}</button>`
          : '<span class="hab-estado">Necesitas ✨ 1 punto</span>';
      } else if (h.tipo === 'activa') {
        pie = e.enEspera > 0
          ? `<span class="hab-estado">⏳ ${duracionCorta(e.enEspera)}</span>`
          : `<button type="button" class="btn btn-primary btn-mini" data-accion="usar" data-id="${h.id}">Usar</button>`;
      } else {
        pie = '<span class="hab-estado hab-activa">✓ Activa siempre</span>';
      }
      return `
        <div class="habilidad${e.aprendida ? ' aprendida' : ''}${e.bloqueada ? ' bloqueada' : ''}">
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
      const opciones = TIENDA[categoria].map((item) => {
        const tiene = poseeItem(mascota, categoria, item.id);
        const equipado = mascota.apariencia[categoria] === item.id;
        const bloqueado = !tiene && item.nivel && nivel < item.nivel;
        let muestra;
        if (categoria === 'maceta') muestra = `<span class="muestra" style="background:linear-gradient(135deg, ${item.colores[0]}, ${item.colores[1]})"></span>`;
        else if (categoria === 'hojas') muestra = `<span class="muestra" style="background:linear-gradient(135deg, ${item.colores[1]}, ${item.colores[2]})"></span>`;
        else if (categoria === 'franja') muestra = `<span class="muestra" style="background:${item.color}"></span>`;
        else muestra = `<span class="muestra muestra-emoji">${item.icono}</span>`;
        const etiqueta = equipado ? '✓ Puesto' : tiene ? 'Usar' : bloqueado ? `🔒 Nv ${item.nivel}` : `🪙 ${item.precio}`;
        return `
          <button type="button" class="opcion${equipado ? ' equipada' : ''}${bloqueado ? ' bloqueada' : ''}" data-accion="equipar" data-cat="${categoria}" data-id="${item.id}" aria-pressed="${equipado}">
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
      <p class="menu-ayuda">Tienes <strong>🪙 ${mascota.monedas}</strong>. Gana más con misiones, atrapando monedas y subiendo de nivel.</p>
      ${grupo('maceta', '🪴 Maceta')}
      ${grupo('franja', '🎗️ Franja')}
      ${grupo('hojas', '🍃 Hojas')}
      ${grupo('accesorio', '🎩 Accesorio')}`;
  },

  pestana_mascotas() {
    const datos = leerMascotas();
    const tarjetas = datos.mascotas.map((m, i) => {
      const nivel = nivelDeXp(m.xp);
      const activa = m.id === datos.activa;
      return `
        <div class="ficha-mascota${activa ? ' activa' : ''}">
          ${this.previa(m, `-lista${i}`, 'mascota-mini mascota--feliz')}
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
