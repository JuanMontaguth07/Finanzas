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

function getGastosPorCategoria(monthKey) {
  const gastos = getMovimientosDelMes(monthKey).filter((m) => m.tipo === 'gasto');
  const porCategoria = {};
  gastos.forEach((m) => {
    porCategoria[m.categoria] = (porCategoria[m.categoria] || 0) + m.valor;
  });
  return Object.entries(porCategoria)
    .map(([categoria, total]) => ({ categoria, total }))
    .sort((a, b) => b.total - a.total);
}

function getUltimosMeses(n) {
  const meses = [];
  const base = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(base.getFullYear(), base.getMonth() - i, 1);
    meses.push(currentMonthKey(d));
  }
  return meses;
}

function getSerieIngresosGastos(n) {
  return getUltimosMeses(n).map((mes) => ({ mes, ...getResumenMes(mes) }));
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

function getComparacionCategoria(monthKey) {
  const actual = getGastosPorCategoria(monthKey);
  const anteriorMap = Object.fromEntries(
    getGastosPorCategoria(mesAnterior(monthKey)).map((g) => [g.categoria, g.total])
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

function getSerieAhorro(n) {
  const meses = getUltimosMeses(n);
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
