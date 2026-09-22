document.addEventListener('DOMContentLoaded', () => {
  renderCategorias();

  document.getElementById('btn-exportar-excel').addEventListener('click', exportarExcel);
  document.getElementById('btn-exportar-respaldo').addEventListener('click', exportarRespaldoJson);

  const inputImportar = document.getElementById('input-importar-respaldo');
  let modoImportacion = 'combinar';

  document.getElementById('btn-importar-combinar').addEventListener('click', () => {
    modoImportacion = 'combinar';
    inputImportar.click();
  });
  document.getElementById('btn-importar-reemplazar').addEventListener('click', () => {
    modoImportacion = 'reemplazar';
    inputImportar.click();
  });

  inputImportar.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const mensajeConfirm =
      modoImportacion === 'combinar'
        ? 'Se combinarán los movimientos, presupuestos y objetivos de este archivo con los datos actuales, sin duplicar. ¿Continuar?'
        : 'Esto borrará todos los datos actuales de este navegador y los reemplazará por los del archivo. ¿Continuar?';

    if (!confirm(mensajeConfirm)) {
      inputImportar.value = '';
      return;
    }

    importarRespaldoJson(file, modoImportacion, (ok, errorMsg) => {
      if (ok) {
        showToast(modoImportacion === 'combinar' ? 'Datos combinados correctamente.' : 'Respaldo importado correctamente.');
        renderCategorias();
      } else {
        showToast(`No se pudo importar el respaldo: ${errorMsg}`, 'error');
      }
      inputImportar.value = '';
    });
  });

  const modalOverlay = document.getElementById('modal-borrar-overlay');
  const abrirModalBorrar = () => { modalOverlay.hidden = false; };
  const cerrarModalBorrar = () => { modalOverlay.hidden = true; };

  document.getElementById('btn-borrar-datos').addEventListener('click', abrirModalBorrar);
  document.getElementById('btn-borrar-close').addEventListener('click', cerrarModalBorrar);
  document.getElementById('btn-borrar-cancelar').addEventListener('click', cerrarModalBorrar);
  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) cerrarModalBorrar();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !modalOverlay.hidden) cerrarModalBorrar();
  });

  document.getElementById('btn-borrar-confirmar').addEventListener('click', () => {
    Storage.resetState();
    cerrarModalBorrar();
    renderCategorias();
    showToast('Todos los datos han sido eliminados.');
  });

  document.getElementById('btn-buscar-duplicados').addEventListener('click', buscarDuplicados);
});

function buscarDuplicados() {
  const movimientos = Storage.getMovimientos();
  const grupos = new Map();

  movimientos.forEach((m) => {
    const llave = `${m.fecha}|${m.descripcion}|${m.tipo}|${m.valor}`;
    if (!grupos.has(llave)) grupos.set(llave, []);
    grupos.get(llave).push(m);
  });

  const duplicados = Array.from(grupos.values()).filter((grupo) => grupo.length > 1);
  const contenedor = document.getElementById('duplicados-resultado');

  if (duplicados.length === 0) {
    contenedor.innerHTML = '<p class="empty-state-inline">No se encontraron movimientos duplicados. 🎉</p>';
    return;
  }

  const totalSobrantes = duplicados.reduce((sum, grupo) => sum + (grupo.length - 1), 0);

  contenedor.innerHTML = `
    <p class="settings-hint" style="color: var(--danger); font-weight: 600;">
      Se encontraron ${duplicados.length} movimiento(s) repetidos (${totalSobrantes} copia(s) de más).
    </p>
    <div class="import-preview-list">
      ${duplicados
        .map(
          (grupo) => `
        <div class="import-row" style="cursor: default;">
          <span></span>
          <span class="import-row-fecha">${formatDate(grupo[0].fecha)}</span>
          <span class="import-row-desc">${escapeHtml(grupo[0].descripcion)} <span class="import-row-tag">× ${grupo.length}</span></span>
          <span class="import-row-valor valor-${grupo[0].tipo}">${formatCurrency(grupo[0].valor)}</span>
        </div>`
        )
        .join('')}
    </div>
    <div class="settings-actions" style="margin-top: 14px;">
      <button class="btn btn-danger" id="btn-borrar-duplicados">Dejar solo una copia de cada uno</button>
    </div>
  `;

  document.getElementById('btn-borrar-duplicados').addEventListener('click', () => {
    if (!confirm(`Esto eliminará ${totalSobrantes} movimiento(s) duplicados, dejando solo una copia de cada uno. ¿Continuar?`)) return;

    duplicados.forEach((grupo) => {
      grupo.slice(1).forEach((m) => Storage.deleteMovimiento(m.id));
    });

    showToast(`Se eliminaron ${totalSobrantes} movimiento(s) duplicados.`);
    buscarDuplicados();
  });
}

function renderCategorias() {
  const categorias = Storage.getCategorias();
  document.getElementById('categorias-chips').innerHTML = categorias
    .map((c) => {
      const meta = getCategoryMeta(c);
      return `<span class="chip" style="background:${meta.color}20;color:${meta.color}">${meta.emoji} ${escapeHtml(c)}</span>`;
    })
    .join('');
}
