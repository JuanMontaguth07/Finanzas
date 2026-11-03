function getMovimientosDelMes(monthKey) {
  return Storage.getMovimientos().filter((m) => m.fecha.startsWith(monthKey));
}

function sumPorTipo(movimientos, tipo) {
  return movimientos.filter((m) => m.tipo === tipo).reduce((sum, m) => sum + m.valor, 0);
}

function getResumenMes(monthKey) {
  const movimientos = getMovimientosDelMes(monthKey);
  const ingresos = sumPorTipo(movimientos, 'ingreso');
  const gastos = sumPorTipo(movimientos, 'gasto');
  return { ingresos, gastos, balance: ingresos - gastos };
}

function getBalanceTotal() {
  const movimientos = Storage.getMovimientos();
  return sumPorTipo(movimientos, 'ingreso') - sumPorTipo(movimientos, 'gasto');
}

// hastaDia (opcional) limita a los gastos del dia 1 al hastaDia del mes.
function getGastosPorCategoria(monthKey, hastaDia = null) {
  const gastos = getMovimientosDelMes(monthKey).filter(
    (m) => m.tipo === 'gasto' && (hastaDia === null || Number(m.fecha.slice(8, 10)) <= hastaDia)
  );
  const porCategoria = {};
  gastos.forEach((m) => {
    porCategoria[m.categoria] = (porCategoria[m.categoria] || 0) + m.valor;
  });
  return Object.entries(porCategoria)
    .map(([categoria, total]) => ({ categoria, total }))
    .sort((a, b) => b.total - a.total);
}

// Los n meses que terminan en "hasta" (por defecto el mes actual).
function getUltimosMeses(n, hasta = currentMonthKey()) {
  const [year, month] = hasta.split('-').map(Number);
  const meses = [];
  for (let i = n - 1; i >= 0; i--) {
    meses.push(currentMonthKey(new Date(year, month - 1 - i, 1)));
  }
  return meses;
}

function getSerieIngresosGastos(n, hasta) {
  return getUltimosMeses(n, hasta).map((mes) => ({ mes, ...getResumenMes(mes) }));
}

function getAportesDelMes(monthKey) {
  return Storage.getObjetivos()
    .flatMap((o) => o.aportes)
    .filter((a) => a.fecha.startsWith(monthKey))
    .reduce((sum, a) => sum + a.valor, 0);
}

function getTasaAhorro(monthKey) {
  const resumen = getResumenMes(monthKey);
  if (resumen.ingresos <= 0) return null;
  const aportes = getAportesDelMes(monthKey);
  return {
    aportes,
    ingresos: resumen.ingresos,
    porcentaje: Math.round((aportes / resumen.ingresos) * 100),
  };
}

function mesAnterior(monthKey) {
  const [year, month] = monthKey.split('-').map(Number);
  return currentMonthKey(new Date(year, month - 2, 1));
}

// Si el mes es el actual (todavia en curso) se compara contra los mismos
// dias del mes anterior; comparar 3 dias de este mes contra el mes anterior
// completo daba variaciones engañosas (hasta con el signo al reves).
function getComparacionCategoria(monthKey) {
  const actual = getGastosPorCategoria(monthKey);
  const hastaDia = monthKey === currentMonthKey() ? new Date().getDate() : null;
  const anteriorMap = Object.fromEntries(
    getGastosPorCategoria(mesAnterior(monthKey), hastaDia).map((g) => [g.categoria, g.total])
  );
  return actual.map((d) => {
    const anterior = anteriorMap[d.categoria] || 0;
    const variacion = anterior > 0 ? Math.round(((d.total - anterior) / anterior) * 100) : null;
    return { ...d, anterior, variacion };
  });
}

function getDiasRestantesDelMes() {
  const hoy = new Date();
  const ultimoDia = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0).getDate();
  return ultimoDia - hoy.getDate() + 1;
}

function getAhorradoTotal() {
  return Storage.getObjetivos().reduce((sum, o) => sum + Storage.getAhorradoObjetivo(o), 0);
}

function getSerieAhorro(n, hasta) {
  const meses = getUltimosMeses(n, hasta);
  const todosAportes = Storage.getObjetivos().flatMap((o) => o.aportes);
  const primerMes = meses[0];

  let acumulado = todosAportes
    .filter((a) => a.fecha.slice(0, 7) < primerMes)
    .reduce((sum, a) => sum + a.valor, 0);

  return meses.map((mes) => {
    const delMes = todosAportes
      .filter((a) => a.fecha.slice(0, 7) === mes)
      .reduce((sum, a) => sum + a.valor, 0);
    acumulado += delMes;
    return { mes, acumulado };
  });
}
