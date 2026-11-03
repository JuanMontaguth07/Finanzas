document.addEventListener('DOMContentLoaded', () => {
  const monthKey = currentMonthKey();

  renderSaludo();
  renderKpis(monthKey);
  renderObjetivosResumen();
  renderGastosPorCategoria(monthKey);
  renderIngresosVsGastos();
  renderEvolucionAhorro();
});

function renderSaludo() {
  const ahora = new Date();
  const hora = ahora.getHours();
  let saludo = '¡Buenas noches! 🌙';
  if (hora >= 5 && hora < 12) saludo = '¡Buenos días! ☀️';
  else if (hora >= 12 && hora < 19) saludo = '¡Buenas tardes! 🌤️';

  const mes = ahora.toLocaleDateString('es-CO', { month: 'long' });
  document.getElementById('saludo').textContent = saludo;
  document.getElementById('saludo-sub').textContent = `Así va tu plata en ${mes}`;
}

// Hace que la cifra "cuente" desde 0 hasta el valor final al cargar.
function animarMonto(el, valor) {
  if (!valor || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    el.textContent = formatCurrency(valor);
    return;
  }
  const duracion = 900;
  const inicio = performance.now();
  function paso(ahora) {
    const t = Math.min((ahora - inicio) / duracion, 1);
    const suavizado = 1 - Math.pow(1 - t, 3);
    el.textContent = formatCurrency(valor * suavizado);
    if (t < 1) requestAnimationFrame(paso);
  }
  requestAnimationFrame(paso);
}

function renderKpis(monthKey) {
  const resumenMes = getResumenMes(monthKey);
  const balanceTotal = getBalanceTotal();
  const ahorroTotal = getAhorradoTotal();
  const limiteObligaciones = Storage.getLimitePorCategoria('Obligaciones');
  const gastosCategoria = getGastosPorCategoria(monthKey);
  const gastadoObligaciones = gastosCategoria.find((g) => g.categoria === 'Obligaciones')?.total || 0;

  animarMonto(document.getElementById('kpi-disponible'), balanceTotal);
  animarMonto(document.getElementById('kpi-ingresos'), resumenMes.ingresos);
  animarMonto(document.getElementById('kpi-gastos'), resumenMes.gastos);
  animarMonto(document.getElementById('kpi-ahorro'), ahorroTotal);

  const chipMes = document.getElementById('hero-balance-mes');
  if (resumenMes.ingresos > 0 || resumenMes.gastos > 0) {
    const positivo = resumenMes.balance >= 0;
    chipMes.textContent = `${positivo ? '▲ +' : '▼ −'}${formatCurrency(Math.abs(resumenMes.balance))} este mes`;
    chipMes.hidden = false;
  }

  const tasaAhorro = getTasaAhorro(monthKey);
  const kpiTasa = document.getElementById('kpi-tasa-ahorro');
  const kpiTasaSub = document.getElementById('kpi-tasa-ahorro-sub');
  if (tasaAhorro === null) {
    kpiTasa.textContent = '—';
    kpiTasaSub.textContent = 'Sin ingresos registrados este mes';
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
      const pct = Math.min(Math.round((ahorrado / o.meta) * 100), 100);
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
    container.innerHTML = '<p class="empty-state-inline">Sin gastos registrados este mes.</p>';
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

function renderIngresosVsGastos() {
  const serie = getSerieIngresosGastos(6);
  const container = document.getElementById('chart-ingresos-gastos');

  if (serie.every((s) => s.ingresos === 0 && s.gastos === 0)) {
    container.innerHTML = '<p class="empty-state-inline">Aún no hay movimientos para mostrar la tendencia.</p>';
    return;
  }

  const max = Math.max(...serie.flatMap((s) => [s.ingresos, s.gastos]), 1);
  container.innerHTML = serie
    .map(
      (s) => `
    <a class="chart-bar-group" href="movimientos.html?mes=${s.mes}" title="Ver movimientos de ${monthLabel(s.mes)} en detalle">
      <div class="chart-bar-pair">
        <div class="chart-bar chart-bar-ingreso" style="height:${(s.ingresos / max) * 100}%" title="Ingresos: ${formatCurrency(s.ingresos)}"></div>
        <div class="chart-bar chart-bar-gasto" style="height:${(s.gastos / max) * 100}%" title="Gastos: ${formatCurrency(s.gastos)}"></div>
      </div>
      <span class="chart-bar-label">${monthLabel(s.mes)}</span>
    </a>`
    )
    .join('');
}

function renderEvolucionAhorro() {
  const serie = getSerieAhorro(6);
  const container = document.getElementById('chart-ahorro');

  if (serie.every((s) => s.acumulado === 0)) {
    container.innerHTML = '<p class="empty-state-inline">Aún no tienes aportes de ahorro registrados.</p>';
    return;
  }

  const max = Math.max(...serie.map((s) => s.acumulado), 1);
  container.innerHTML = serie
    .map(
      (s) => `
    <div class="chart-bar-group">
      <div class="chart-bar-pair">
        <div class="chart-bar chart-bar-ahorro" style="height:${(s.acumulado / max) * 100}%" title="${formatCurrency(s.acumulado)}"></div>
      </div>
      <span class="chart-bar-label">${monthLabel(s.mes)}</span>
    </div>`
    )
    .join('');
}
