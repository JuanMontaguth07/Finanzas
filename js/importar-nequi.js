document.addEventListener('DOMContentLoaded', () => {
  const els = {
    btnAbrir: document.getElementById('btn-importar-extracto'),
    inputFile: document.getElementById('input-extracto-pdf'),
    overlay: document.getElementById('modal-importar-overlay'),
    close: document.getElementById('modal-importar-close'),
    cancelar: document.getElementById('btn-importar-cancelar'),
    confirmar: document.getElementById('btn-importar-confirmar'),
    body: document.getElementById('importar-body'),
  };

  let movimientosEncontrados = [];

  function abrirModal() {
    els.overlay.hidden = false;
  }

  function cerrarModal() {
    els.overlay.hidden = true;
    els.body.innerHTML = '<p class="empty-state-inline">Selecciona un PDF de extracto de Nequi para comenzar.</p>';
    els.confirmar.disabled = true;
    els.inputFile.value = '';
    movimientosEncontrados = [];
  }

  // Agrupa los items de texto del PDF (cada uno con su posición x/y) en líneas,
  // usando la coordenada Y con una tolerancia porque no siempre cae exacta.
  function agruparPorLineas(items) {
    const TOLERANCIA_Y = 3;
    const candidatos = items
      .filter((it) => it.str.trim())
      .map((it) => ({ str: it.str, x: it.transform[4], y: it.transform[5] }))
      .sort((a, b) => b.y - a.y || a.x - b.x);

    const lineas = [];
    let actual = null;
    candidatos.forEach((it) => {
      if (actual && Math.abs(it.y - actual.y) <= TOLERANCIA_Y) {
        actual.items.push(it);
      } else {
        actual = { y: it.y, items: [it] };
        lineas.push(actual);
      }
    });

    return lineas.map((linea) =>
      linea.items
        .sort((a, b) => a.x - b.x)
        .map((i) => i.str)
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim()
    );
  }

  // Si el PDF tiene contraseña, pdf.js llama a onPassword en vez de resolver
  // directamente. Pedimos la contraseña con un prompt y reintentamos; si el
  // usuario cancela, rechazamos con un error identificable para no mostrar
  // un mensaje de "error" cuando en realidad solo canceló.
  function abrirPdfConContrasena(pdfjsLib, buffer) {
    return new Promise((resolve, reject) => {
      const loadingTask = pdfjsLib.getDocument({ data: buffer });
      loadingTask.onPassword = (callback, reason) => {
        const mensaje =
          reason === pdfjsLib.PasswordResponses.INCORRECT_PASSWORD
            ? 'Contraseña incorrecta. Intenta de nuevo:'
            : 'Este PDF está protegido con contraseña. Ingrésala:';
        const password = window.prompt(mensaje);
        if (!password) {
          loadingTask.destroy();
          reject(new Error('IMPORTAR_CANCELADO'));
          return;
        }
        callback(password);
      };
      loadingTask.promise.then(resolve, reject);
    });
  }

  async function extraerLineasPdf(file) {
    const pdfjsLib = await import('../lib/pdfjs/pdf.min.mjs');
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'lib/pdfjs/pdf.worker.min.mjs';

    const buffer = await file.arrayBuffer();
    const pdf = await abrirPdfConContrasena(pdfjsLib, buffer);

    const lineas = [];
    for (let numPagina = 1; numPagina <= pdf.numPages; numPagina++) {
      const pagina = await pdf.getPage(numPagina);
      const contenido = await pagina.getTextContent();
      lineas.push(...agruparPorLineas(contenido.items));
    }
    return lineas;
  }

  function renderResultados() {
    const existentes = Storage.getMovimientos();

    if (movimientosEncontrados.length === 0) {
      els.body.innerHTML =
        '<p class="empty-state-inline">No pudimos reconocer movimientos en este PDF. Verifica que sea un extracto de Nequi con el formato esperado.</p>';
      els.confirmar.disabled = true;
      return;
    }

    const filas = movimientosEncontrados.map((m) => ({
      ...m,
      duplicado: esDuplicadoMovimiento(m, existentes),
    }));

    const numDuplicados = filas.filter((f) => f.duplicado).length;

    els.body.innerHTML = `
      <p>Se encontraron <strong>${filas.length}</strong> movimientos.${numDuplicados > 0 ? ` ${numDuplicados} ya existían y quedaron sin marcar.` : ''} Se importarán en la categoría "Otros" — puedes reclasificarlos después en la tabla.</p>
      <div class="import-preview-list">
        ${filas
          .map(
            (f, i) => `
          <label class="import-row${f.duplicado ? ' import-row-duplicado' : ''}">
            <input type="checkbox" data-index="${i}" ${f.duplicado ? '' : 'checked'}>
            <span class="import-row-fecha">${formatDate(f.fecha)}</span>
            <span class="import-row-desc">${escapeHtml(f.descripcion)}${f.duplicado ? ' <span class="import-row-tag">ya existe</span>' : ''}</span>
            <span class="import-row-valor valor-${f.tipo}">${f.tipo === 'gasto' ? '-' : '+'} ${formatCurrency(f.valor)}</span>
          </label>`
          )
          .join('')}
      </div>
    `;

    movimientosEncontrados = filas;
    actualizarBotonConfirmar();

    els.body.querySelectorAll('input[type="checkbox"]').forEach((chk) => {
      chk.addEventListener('change', actualizarBotonConfirmar);
    });
  }

  function actualizarBotonConfirmar() {
    const marcados = els.body.querySelectorAll('input[type="checkbox"]:checked').length;
    els.confirmar.disabled = marcados === 0;
    els.confirmar.textContent = marcados > 0 ? `Importar ${marcados} seleccionados` : 'Importar seleccionados';
  }

  els.btnAbrir.addEventListener('click', () => {
    abrirModal();
    els.inputFile.click();
  });

  els.inputFile.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    els.body.innerHTML = '<p class="empty-state-inline">Leyendo el PDF…</p>';
    els.confirmar.disabled = true;

    try {
      const lineas = await extraerLineasPdf(file);
      movimientosEncontrados = parsearLineasNequi(lineas);
      renderResultados();
    } catch (err) {
      if (err.message === 'IMPORTAR_CANCELADO') {
        els.body.innerHTML = '<p class="empty-state-inline">Importación cancelada.</p>';
        return;
      }
      console.error('Error leyendo el extracto:', err);
      els.body.innerHTML =
        '<p class="empty-state-inline">Hubo un error leyendo el PDF. Verifica que el archivo no esté dañado e inténtalo de nuevo.</p>';
    }
  });

  els.close.addEventListener('click', cerrarModal);
  els.cancelar.addEventListener('click', cerrarModal);
  els.overlay.addEventListener('click', (e) => {
    if (e.target === els.overlay) cerrarModal();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !els.overlay.hidden) cerrarModal();
  });

  els.confirmar.addEventListener('click', () => {
    const marcados = Array.from(els.body.querySelectorAll('input[type="checkbox"]:checked')).map((chk) =>
      Number(chk.dataset.index)
    );
    marcados.forEach((i) => Storage.addMovimiento(movimientosEncontrados[i]));

    cerrarModal();
    if (typeof renderTablaMovimientos === 'function') renderTablaMovimientos();
    showToast(`Se importaron ${marcados.length} movimiento${marcados.length === 1 ? '' : 's'}.`);
  });
});
