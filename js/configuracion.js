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
});

function renderCategorias() {
  const categorias = Storage.getCategorias();
  document.getElementById('categorias-chips').innerHTML = categorias
    .map((c) => {
      const meta = getCategoryMeta(c);
      return `<span class="chip" style="background:${meta.color}20;color:${meta.color}">${meta.emoji} ${escapeHtml(c)}</span>`;
    })
    .join('');
}
