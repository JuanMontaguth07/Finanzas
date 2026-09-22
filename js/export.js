function construirLibroExcel() {
  const movimientos = Storage.getMovimientos();
  const objetivos = Storage.getObjetivos();
  const monthKey = currentMonthKey();
  const resumenMes = getResumenMes(monthKey);
  const gastosPorCategoria = getGastosPorCategoria(monthKey);
  const ahorroTotal = getAhorradoTotal();

  const movimientosRows = movimientos
    .slice()
    .sort((a, b) => a.fecha.localeCompare(b.fecha))
    .map((m) => ({
      Fecha: formatDate(m.fecha),
      Descripción: m.descripcion,
      Categoría: m.categoria,
      Tipo: m.tipo === 'ingreso' ? 'Ingreso' : 'Gasto',
      Valor: m.valor,
    }));
  const hojaMovimientos = XLSX.utils.json_to_sheet(movimientosRows);
  hojaMovimientos['!cols'] = [{ wch: 12 }, { wch: 32 }, { wch: 16 }, { wch: 10 }, { wch: 14 }];

  const resumenRows = [
    { Concepto: `Ingresos del mes (${monthKey})`, Valor: resumenMes.ingresos },
    { Concepto: 'Gastos del mes', Valor: resumenMes.gastos },
    { Concepto: 'Balance del mes', Valor: resumenMes.balance },
    { Concepto: 'Ahorro total (todos los objetivos)', Valor: ahorroTotal },
    { Concepto: '', Valor: '' },
    { Concepto: 'Gastos por categoría (mes actual)', Valor: '' },
    ...gastosPorCategoria.map((g) => ({ Concepto: g.categoria, Valor: g.total })),
  ];
  const hojaResumen = XLSX.utils.json_to_sheet(resumenRows);
  hojaResumen['!cols'] = [{ wch: 34 }, { wch: 16 }];

  const objetivosRows = objetivos.map((o) => {
    const ahorrado = Storage.getAhorradoObjetivo(o);
    return {
      Nombre: o.nombre,
      Meta: o.meta,
      Ahorrado: ahorrado,
      Falta: Math.max(o.meta - ahorrado, 0),
      'Progreso (%)': Math.min(Math.round((ahorrado / o.meta) * 100), 100),
    };
  });
  const hojaObjetivos = XLSX.utils.json_to_sheet(objetivosRows);
  hojaObjetivos['!cols'] = [{ wch: 24 }, { wch: 14 }, { wch: 14 }, { wch: 14 }, { wch: 14 }];

  const libro = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(libro, hojaMovimientos, 'Movimientos');
  XLSX.utils.book_append_sheet(libro, hojaResumen, 'Resumen');
  XLSX.utils.book_append_sheet(libro, hojaObjetivos, 'Objetivos');
  return libro;
}

function exportarExcel() {
  if (typeof XLSX === 'undefined') {
    alert('No se pudo cargar el generador de Excel. Revisa que el archivo lib/xlsx.full.min.js esté presente.');
    return;
  }
  const libro = construirLibroExcel();
  XLSX.writeFile(libro, `finanzas-${todayIso()}.xlsx`);
  showToast('Excel exportado.');
}

function exportarRespaldoJson() {
  const state = Storage.getState();
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `finanzas-respaldo-${todayIso()}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  showToast('Respaldo exportado.');
}

function importarRespaldoJson(file, modo, callback) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(reader.result);
      if (!data || !Array.isArray(data.movimientos) || !data.config) {
        throw new Error('El archivo no tiene el formato de respaldo esperado.');
      }
      if (modo === 'combinar') {
        Storage.setState(mergeState(Storage.getState(), data));
      } else {
        Storage.setState(data);
      }
      callback(true);
    } catch (err) {
      callback(false, err.message);
    }
  };
  reader.onerror = () => callback(false, 'No se pudo leer el archivo.');
  reader.readAsText(file);
}

// Combina un respaldo importado con el estado actual sin duplicar registros,
// usando el id único de cada movimiento/objetivo/aporte como llave.
function mergeState(actual, importado) {
  return {
    version: actual.version,
    config: {
      moneda: actual.config.moneda,
      categorias: Array.from(new Set([...actual.config.categorias, ...(importado.config?.categorias || [])])),
    },
    movimientos: mergeMovimientos(actual.movimientos, importado.movimientos || []),
    presupuestos: mergePresupuestos(actual.presupuestos, importado.presupuestos || []),
    objetivos: mergeObjetivos(actual.objetivos, importado.objetivos || []),
  };
}

function mergeMovimientos(actuales, importados) {
  const map = new Map(actuales.map((m) => [m.id, m]));
  importados.forEach((m) => {
    const existente = map.get(m.id);
    if (!existente) {
      map.set(m.id, m);
    } else if ((m.updatedAt || m.createdAt) > (existente.updatedAt || existente.createdAt)) {
      map.set(m.id, m);
    }
  });
  return Array.from(map.values());
}

function mergePresupuestos(actuales, importados) {
  const map = new Map(actuales.map((p) => [p.categoria, p]));
  importados.forEach((p) => {
    if (!map.has(p.categoria)) map.set(p.categoria, p);
  });
  return Array.from(map.values());
}

function mergeObjetivos(actuales, importados) {
  const map = new Map(actuales.map((o) => [o.id, o]));
  importados.forEach((o) => {
    const existente = map.get(o.id);
    if (!existente) {
      map.set(o.id, o);
      return;
    }
    const aportesMap = new Map(existente.aportes.map((a) => [a.id, a]));
    o.aportes.forEach((a) => {
      if (!aportesMap.has(a.id)) aportesMap.set(a.id, a);
    });
    map.set(o.id, { ...existente, aportes: Array.from(aportesMap.values()) });
  });
  return Array.from(map.values());
}
