// El dashboard muestra un mes a la vez (por defecto el actual). Se cambia con
// las flechas ‹ ›, tocando una barra del grafico "Ingresos vs gastos" o con
// ?mes=YYYY-MM en la URL (por ejemplo desde la paleta de comandos /mes).
// "Dinero disponible", "Ahorro total" y los objetivos son globales: no
// dependen del mes elegido.

// Verbos que se muestran mientras "cuentan" las cifras, como los de Claude Code.
const VERBOS_CARGA = ['Contando monedas…', 'Cuadrando cuentas…', 'Sumando centavos…', 'Revisando el bolsillo…', 'Haciendo cuentas…'];

let mesSeleccionado = currentMonthKey();

// Ejecuta cada parte del dashboard por separado: si una falla (por ejemplo
// porque el navegador mezclo un index.html viejo con este archivo), las
// demas igual se dibujan en vez de quedarse todas en "$ 0".
function seguro(fn, ...args) {
  try {
    fn(...args);
  } catch (err) {
    console.error(`Dashboard: falló ${fn.name}`, err);
  }
}

// Asigna una propiedad solo si el elemento existe.
function fijar(id, prop, valor) {
  const el = document.getElementById(id);
  if (el) el[prop] = valor;
}

document.addEventListener('DOMContentLoaded', () => {
  const mesUrl = new URLSearchParams(window.location.search).get('mes');
  if (/^\d{4}-\d{2}$/.test(mesUrl || '') && mesUrl <= currentMonthKey()) mesSeleccionado = mesUrl;

  seguro(renderGlobales);
  seguro(renderObjetivosResumen);
  renderMes();

  const enClic = (id, fn) => document.getElementById(id)?.addEventListener('click', fn);
  enClic('mes-anterior', () => cambiarMes(sumarMeses(mesSeleccionado, -1)));
  enClic('mes-siguiente', () => cambiarMes(sumarMeses(mesSeleccionado, 1)));
  enClic('mes-hoy', () => cambiarMes(currentMonthKey()));
  enClic('chart-ingresos-gastos', (e) => {
    const barra = e.target.closest('[data-mes]');
    if (barra) cambiarMes(barra.dataset.mes);
  });
  // Botones "ver octubre →" del aviso de mes sin movimientos
  document.querySelector('.kpi-grid')?.addEventListener('click', (e) => {
    const boton = e.target.closest('[data-ir-mes]');
    if (boton) cambiarMes(boton.dataset.irMes);
  });
});

function cambiarMes(monthKey) {
  if (monthKey > currentMonthKey() || monthKey === mesSeleccionado) return;
  mesSeleccionado = monthKey;
  // Mision de la mascota: revisar otro mes
  if (typeof registrarEvento === 'function') registrarEvento('mes');
  const url = new URL(window.location.href);
  if (monthKey === currentMonthKey()) url.searchParams.delete('mes');
  else url.searchParams.set('mes', monthKey);
  history.replaceState(null, '', url);
  renderMes();
}

function renderMes() {
  const monthKey = mesSeleccionado;
  const esActual = monthKey === currentMonthKey();
  const nombreMes = MESES_LARGOS[Number(monthKey.split('-')[1]) - 1];

  seguro(renderSaludo, monthKey);
  fijar('mes-label', 'textContent', monthLabelLargo(monthKey));
  fijar('mes-siguiente', 'disabled', esActual);
  fijar('mes-hoy', 'hidden', esActual);
  fijar('mes-ver-movimientos', 'href', `movimientos.html?mes=${monthKey}`);
  document.querySelectorAll('.kpi-mes').forEach((el) => {
    el.textContent = esActual ? 'del mes' : `de ${nombreMes}`;
  });
  fijar('titulo-categorias', 'textContent', `(${esActual ? 'este mes' : monthLabelLargo(monthKey)})`);
  fijar('titulo-ingresos-gastos', 'textContent', `(6 meses hasta ${monthLabel(monthKey).toLowerCase()})`);
  fijar('titulo-ahorro', 'textContent', `(6 meses hasta ${monthLabel(monthKey).toLowerCase()})`);

  seguro(renderKpisMes, monthKey);
  seguro(renderGastosPorCategoria, monthKey);
  seguro(renderIngresosVsGastos, monthKey);
  seguro(renderEvolucionAhorro, monthKey);
}

// Ultimo mes (anterior al dado) que tiene movimientos, o null.
function ultimoMesConMovimientos(antesDe) {
  const meses = Storage.getMovimientos()
    .map((m) => m.fecha.slice(0, 7))
    .filter((mes) => mes < antesDe);
  return meses.length ? meses.sort().pop() : null;
}

function renderSaludo(monthKey) {
  const ahora = new Date();
  const hora = ahora.getHours();
  let saludo = 'Buenas noches';
  if (hora >= 5 && hora < 12) saludo = 'Buenos días';
  else if (hora >= 12 && hora < 19) saludo = 'Buenas tardes';

  document.getElementById('saludo').textContent = saludo;
  document.getElementById('saludo-sub').textContent =
    monthKey === currentMonthKey()
      ? `Así va tu plata en ${MESES_LARGOS[ahora.getMonth()]}`
      : `Así te fue en ${monthLabelLargo(monthKey)}`;
}

// Hace que la cifra "cuente" desde el valor que tenia hasta el nuevo.
function animarMonto(el, valor) {
  const desde = Number(el.dataset.valor) || 0;
  el.dataset.valor = valor;
  if (desde === valor || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    el.textContent = formatCurrency(valor);
    return;
  }
  const duracion = 900;
  const inicio = performance.now();
  function paso(ahora) {
    const t = Math.min((ahora - inicio) / duracion, 1);
    const suavizado = 1 - Math.pow(1 - t, 3);
    el.textContent = formatCurrency(desde + (valor - desde) * suavizado);
    if (t < 1) requestAnimationFrame(paso);
  }
  requestAnimationFrame(paso);
}

function renderGlobales() {
  const etiqueta = document.getElementById('hero-label-texto');
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    etiqueta.textContent = VERBOS_CARGA[Math.floor(Math.random() * VERBOS_CARGA.length)];
    setTimeout(() => {
      etiqueta.textContent = 'Dinero disponible';
    }, 1100);
  }
  animarMonto(document.getElementById('kpi-disponible'), getBalanceTotal());
  animarMonto(document.getElementById('kpi-ahorro'), getAhorradoTotal());
}

function renderKpisMes(monthKey) {
  const esActual = monthKey === currentMonthKey();
  const resumenMes = getResumenMes(monthKey);
  const limiteObligaciones = Storage.getLimitePorCategoria('Obligaciones');
  const gastadoObligaciones = getGastosPorCategoria(monthKey).find((g) => g.categoria === 'Obligaciones')?.total || 0;

  animarMonto(document.getElementById('kpi-ingresos'), resumenMes.ingresos);
  animarMonto(document.getElementById('kpi-gastos'), resumenMes.gastos);

  // Debajo: cuantos movimientos hay, o un aviso si el mes esta vacio (pasa
  // al empezar el mes, antes de registrar o importar el extracto).
  const delMes = getMovimientosDelMes(monthKey);
  const subIngresos = document.getElementById('kpi-ingresos-sub');
  const subGastos = document.getElementById('kpi-gastos-sub');
  if (subIngresos && subGastos) {
    if (delMes.length === 0) {
      const anterior = ultimoMesConMovimientos(monthKey);
      const nombre = MESES_LARGOS[Number(monthKey.split('-')[1]) - 1];
      subIngresos.innerHTML = anterior
        ? `Sin movimientos en ${nombre} · <button type="button" class="kpi-link" data-ir-mes="${anterior}">ver ${monthLabelLargo(anterior)} →</button>`
        : `Sin movimientos en ${nombre}`;
      subGastos.textContent = `Sin movimientos en ${nombre}`;
    } else {
      const nIngresos = delMes.filter((m) => m.tipo === 'ingreso').length;
      const nGastos = delMes.length - nIngresos;
      subIngresos.textContent = `${nIngresos} ingreso${nIngresos === 1 ? '' : 's'}`;
      subGastos.textContent = `${nGastos} gasto${nGastos === 1 ? '' : 's'}`;
    }
  }

  const chipMes = document.getElementById('hero-balance-mes');
  chipMes.classList.remove('hero-chip-positivo', 'hero-chip-negativo');
  if (resumenMes.ingresos > 0 || resumenMes.gastos > 0) {
    const positivo = resumenMes.balance >= 0;
    const cuando = esActual ? 'este mes' : `en ${monthLabelLargo(monthKey)}`;
    chipMes.textContent = `${positivo ? '+' : '−'}${formatCurrency(Math.abs(resumenMes.balance))} ${cuando}`;
    chipMes.classList.add(positivo ? 'hero-chip-positivo' : 'hero-chip-negativo');
    chipMes.hidden = false;
  } else {
    chipMes.hidden = true;
  }

  const tasaAhorro = getTasaAhorro(monthKey);
  const kpiTasa = document.getElementById('kpi-tasa-ahorro');
  const kpiTasaSub = document.getElementById('kpi-tasa-ahorro-sub');
  if (tasaAhorro === null) {
    kpiTasa.textContent = '—';
    kpiTasaSub.textContent = esActual ? 'Sin ingresos registrados este mes' : 'Sin ingresos registrados ese mes';
  } else {
    kpiTasa.textContent = `${tasaAhorro.porcentaje}%`;
    kpiTasaSub.textContent = `${formatCurrency(tasaAhorro.aportes)} de ${formatCurrency(tasaAhorro.ingresos)}`;
  }

  const kpiObligaciones = document.getElementById('kpi-obligaciones');
  const kpiObligacionesSub = document.getElementById('kpi-obligaciones-sub');
  if (limiteObligaciones) {
    const pendiente = Math.max(limiteObligaciones - gastadoObligaciones, 0);
    animarMonto(kpiObligaciones, pendiente);
    kpiObligacionesSub.textContent =
      pendiente === 0
        ? '¡Presupuesto de Obligaciones cubierto!'
        : `de ${formatCurrency(limiteObligaciones)} presupuestados`;
  } else {
    delete kpiObligaciones.dataset.valor;
    kpiObligaciones.textContent = '—';
    kpiObligacionesSub.innerHTML = 'Define un límite en <a href="presupuestos.html">Presupuestos</a>';
  }
}

function renderObjetivosResumen() {
  const objetivos = Storage.getObjetivos();
  const container = document.getElementById('objetivos-resumen');

  if (objetivos.length === 0) {
    container.innerHTML =
      '<p class="empty-state-inline">Aún no tienes objetivos. <a href="objetivos.html">Crea el primero</a>.</p>';
    return;
  }

  container.innerHTML = objetivos
    .map((o) => {
      const ahorrado = Storage.getAhorradoObjetivo(o);
      const pct = porcentajeProgreso(ahorrado, o.meta);
      return `
      <div class="goal-mini">
        <div class="goal-mini-header">
          <span>${escapeHtml(o.nombre)}</span>
          <span>${pct}%</span>
        </div>
        <div class="progress-track"><div class="progress-fill${pct === 100 ? ' progress-fill-completo' : ''}" style="width:${pct}%"></div></div>
        <div class="goal-mini-sub">${formatCurrency(ahorrado)} / ${formatCurrency(o.meta)}</div>
      </div>`;
    })
    .join('');
}

function renderGastosPorCategoria(monthKey) {
  const datos = getComparacionCategoria(monthKey);
  const container = document.getElementById('chart-gastos-categoria');

  if (datos.length === 0) {
    container.innerHTML = `<p class="empty-state-inline">Sin gastos registrados en ${monthLabelLargo(monthKey)}.</p>`;
    return;
  }

  const max = datos[0].total;
  container.innerHTML = datos
    .map((d) => {
      const meta = getCategoryMeta(d.categoria);
      let delta = '<span class="hbar-delta hbar-delta-neutral">nuevo</span>';
      if (d.variacion !== null) {
        const sube = d.variacion > 0;
        const signo = sube ? '+' : '';
        const clase = d.variacion === 0 ? 'hbar-delta-neutral' : sube ? 'hbar-delta-up' : 'hbar-delta-down';
        delta = `<span class="hbar-delta ${clase}">${signo}${d.variacion}%</span>`;
      }
      return `
    <div class="hbar-row">
      <span class="hbar-label">${meta.emoji} ${escapeHtml(d.categoria)}</span>
      <div class="hbar-track"><div class="hbar-fill" style="width:${(d.total / max) * 100}%;background:${meta.color}"></div></div>
      <span class="hbar-value">${formatCurrency(d.total)}</span>
      ${delta}
    </div>`;
    })
    .join('');
}

function renderIngresosVsGastos(monthKey) {
  const serie = getSerieIngresosGastos(6, monthKey);
  const container = document.getElementById('chart-ingresos-gastos');

  // Solo se muestra el mensaje vacio si no hay ningun movimiento; si hay
  // datos en otros meses se dibujan las barras (aunque esten en cero) para
  // poder seguir navegando tocandolas.
  if (Storage.getMovimientos().length === 0) {
    container.innerHTML = '<p class="empty-state-inline">Aún no hay movimientos para mostrar la tendencia.</p>';
    return;
  }

  const max = Math.max(...serie.flatMap((s) => [s.ingresos, s.gastos]), 1);
  container.innerHTML = serie
    .map(
      (s) => `
    <button type="button" class="chart-bar-group${s.mes === monthKey ? ' chart-bar-group-activo' : ''}" data-mes="${s.mes}"
      aria-pressed="${s.mes === monthKey}"
      title="${monthLabelLargo(s.mes)} · ingresos ${formatCurrency(s.ingresos)} · gastos ${formatCurrency(s.gastos)}">
      <div class="chart-bar-pair">
        <div class="chart-bar chart-bar-ingreso" style="height:${(s.ingresos / max) * 100}%"></div>
        <div class="chart-bar chart-bar-gasto" style="height:${(s.gastos / max) * 100}%"></div>
      </div>
      <span class="chart-bar-label">${monthLabel(s.mes)}</span>
    </button>`
    )
    .join('');
}

function renderEvolucionAhorro(monthKey) {
  const serie = getSerieAhorro(6, monthKey);
  const container = document.getElementById('chart-ahorro');

  if (getAhorradoTotal() === 0) {
    container.innerHTML = '<p class="empty-state-inline">Aún no tienes aportes de ahorro registrados.</p>';
    return;
  }

  const max = Math.max(...serie.map((s) => s.acumulado), 1);
  container.innerHTML = serie
    .map(
      (s) => `
    <div class="chart-bar-group${s.mes === monthKey ? ' chart-bar-group-activo' : ''}">
      <div class="chart-bar-pair">
        <div class="chart-bar chart-bar-ahorro" style="height:${(s.acumulado / max) * 100}%" title="${formatCurrency(s.acumulado)}"></div>
      </div>
      <span class="chart-bar-label">${monthLabel(s.mes)}</span>
    </div>`
    )
    .join('');
}
