// Reconoce líneas de movimiento en el extracto de Nequi, por ejemplo:
// "31/08/2026 Pago recibido de DISTRIBUIDORA $929,801.00 $1,503,982.61"
// "29/08/2026 Para NILSON MATINEZ LOPEZ $-18,000.00 $14,023.61"
const RE_MOVIMIENTO_NEQUI = /^(\d{2}\/\d{2}\/\d{4})\s+(.+?)\s+\$(-?[\d,]+\.\d{2})\s+\$(-?[\d,]+\.\d{2})$/;

function parsearValorNequi(valorStr) {
  return Number(valorStr.replace(/,/g, ''));
}

function parsearFechaNequi(fechaStr) {
  const [dd, mm, yyyy] = fechaStr.split('/');
  return `${yyyy}-${mm}-${dd}`;
}

// Recibe un arreglo de líneas de texto (ya extraídas del PDF) y devuelve
// los movimientos reconocidos. Las líneas que no matchean (encabezados,
// resumen del extracto, etc.) simplemente se ignoran.
function parsearLineasNequi(lineas) {
  const movimientos = [];
  lineas.forEach((linea) => {
    const match = linea.trim().match(RE_MOVIMIENTO_NEQUI);
    if (!match) return;

    const [, fechaStr, descripcionRaw, valorStr] = match;
    const valor = parsearValorNequi(valorStr);
    if (!valor) return;

    movimientos.push({
      fecha: parsearFechaNequi(fechaStr),
      descripcion: descripcionRaw.trim(),
      valor: Math.abs(valor),
      tipo: valor < 0 ? 'gasto' : 'ingreso',
      categoria: 'Otros',
    });
  });
  return movimientos;
}

// Un movimiento importado se considera duplicado de uno ya guardado si
// coinciden fecha, descripción, tipo y valor exactos.
function esDuplicadoMovimiento(nuevo, existentes) {
  return existentes.some(
    (m) =>
      m.fecha === nuevo.fecha &&
      m.descripcion === nuevo.descripcion &&
      m.tipo === nuevo.tipo &&
      m.valor === nuevo.valor
  );
}
