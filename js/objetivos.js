document.addEventListener('DOMContentLoaded', () => {
  let editId = null;

  const els = {
    list: document.getElementById('objetivos-list'),
    empty: document.getElementById('objetivos-empty'),
    btnNuevo: document.getElementById('btn-nuevo-objetivo'),

    modalObjetivoOverlay: document.getElementById('modal-objetivo-overlay'),
    modalObjetivoTitle: document.getElementById('modal-objetivo-title'),
    modalObjetivoClose: document.getElementById('modal-objetivo-close'),
    btnObjetivoCancelar: document.getElementById('btn-objetivo-cancelar'),
    formObjetivo: document.getElementById('form-objetivo'),
    inputObjetivoId: document.getElementById('objetivo-id'),
    inputObjetivoNombre: document.getElementById('input-objetivo-nombre'),
    inputObjetivoMeta: document.getElementById('input-objetivo-meta'),
    inputObjetivoFecha: document.getElementById('input-objetivo-fecha'),

    modalAporteOverlay: document.getElementById('modal-aporte-overlay'),
    modalAporteClose: document.getElementById('modal-aporte-close'),
    btnAporteCancelar: document.getElementById('btn-aporte-cancelar'),
    formAporte: document.getElementById('form-aporte'),
    inputAporteObjetivoId: document.getElementById('aporte-objetivo-id'),
    inputAporteValor: document.getElementById('input-aporte-valor'),
    inputAporteFecha: document.getElementById('input-aporte-fecha'),
  };

  attachCurrencyMask(els.inputObjetivoMeta);
  attachCurrencyMask(els.inputAporteValor);

  function render() {
    const objetivos = Storage.getObjetivos();
    els.empty.hidden = objetivos.length > 0;

    els.list.innerHTML = objetivos
      .map((o) => {
        const ahorrado = Storage.getAhorradoObjetivo(o);
        const pct = Math.min(Math.round((ahorrado / o.meta) * 100), 100);
        return `
        <div class="card goal-card">
          <div class="goal-card-header">
            <h3>🎯 ${escapeHtml(o.nombre)}</h3>
            <div class="goal-card-actions">
              <button class="icon-btn" data-action="editar" data-id="${o.id}" aria-label="Editar">✎</button>
              <button class="icon-btn icon-btn-danger" data-action="eliminar" data-id="${o.id}" aria-label="Eliminar">🗑</button>
            </div>
          </div>
          <div class="progress-track"><div class="progress-fill" style="width:${pct}%"></div></div>
          <div class="goal-card-amounts">
            <span class="goal-card-ahorrado">${formatCurrency(ahorrado)}</span>
            <span class="goal-card-meta">de ${formatCurrency(o.meta)} (${pct}%)</span>
          </div>
          ${o.fechaObjetivo ? `<p class="goal-card-date">Meta para: ${formatDate(o.fechaObjetivo)}</p>` : ''}
          <button class="btn btn-ghost goal-card-aporte-btn" data-action="aportar" data-id="${o.id}">+ Agregar aporte</button>
        </div>`;
      })
      .join('');
  }

  // ---- Modal objetivo ----
  function abrirModalObjetivo(objetivo = null) {
    editId = objetivo ? objetivo.id : null;
    els.modalObjetivoTitle.textContent = objetivo ? 'Editar objetivo' : 'Nuevo objetivo';
    els.inputObjetivoId.value = objetivo ? objetivo.id : '';
    els.inputObjetivoNombre.value = objetivo ? objetivo.nombre : '';
    setCurrencyInputValue(els.inputObjetivoMeta, objetivo ? objetivo.meta : '');
    els.inputObjetivoFecha.value = objetivo && objetivo.fechaObjetivo ? objetivo.fechaObjetivo : '';
    clearFieldErrors(els.formObjetivo);
    els.modalObjetivoOverlay.hidden = false;
    els.inputObjetivoNombre.focus();
  }

  function cerrarModalObjetivo() {
    els.modalObjetivoOverlay.hidden = true;
    els.formObjetivo.reset();
    clearFieldErrors(els.formObjetivo);
    editId = null;
  }

  els.btnNuevo.addEventListener('click', () => abrirModalObjetivo());
  els.modalObjetivoClose.addEventListener('click', cerrarModalObjetivo);
  els.btnObjetivoCancelar.addEventListener('click', cerrarModalObjetivo);
  els.modalObjetivoOverlay.addEventListener('click', (e) => {
    if (e.target === els.modalObjetivoOverlay) cerrarModalObjetivo();
  });

  els.formObjetivo.addEventListener('submit', (e) => {
    e.preventDefault();
    clearFieldErrors(els.formObjetivo);

    const data = {
      nombre: els.inputObjetivoNombre.value,
      meta: parseCurrencyInput(els.inputObjetivoMeta.value),
      fechaObjetivo: els.inputObjetivoFecha.value || null,
    };

    let valido = true;
    if (!data.nombre.trim()) {
      showFieldError(els.inputObjetivoNombre, 'Escribe un nombre para el objetivo.');
      valido = false;
    }
    if (!data.meta || data.meta <= 0) {
      showFieldError(els.inputObjetivoMeta, 'Ingresa una meta mayor a 0.');
      valido = false;
    }
    if (!valido) return;

    if (editId) {
      Storage.updateObjetivo(editId, data);
      showToast('Objetivo actualizado.');
    } else {
      Storage.addObjetivo(data);
      showToast('Objetivo creado.');
    }
    cerrarModalObjetivo();
    render();
  });

  // ---- Modal aporte ----
  function abrirModalAporte(objetivoId) {
    els.inputAporteObjetivoId.value = objetivoId;
    els.inputAporteValor.value = '';
    els.inputAporteFecha.value = todayIso();
    clearFieldErrors(els.formAporte);
    els.modalAporteOverlay.hidden = false;
    els.inputAporteValor.focus();
  }

  function cerrarModalAporte() {
    els.modalAporteOverlay.hidden = true;
    els.formAporte.reset();
    clearFieldErrors(els.formAporte);
  }

  els.modalAporteClose.addEventListener('click', cerrarModalAporte);
  els.btnAporteCancelar.addEventListener('click', cerrarModalAporte);
  els.modalAporteOverlay.addEventListener('click', (e) => {
    if (e.target === els.modalAporteOverlay) cerrarModalAporte();
  });

  els.formAporte.addEventListener('submit', (e) => {
    e.preventDefault();
    clearFieldErrors(els.formAporte);

    const objetivoId = els.inputAporteObjetivoId.value;
    const valor = parseCurrencyInput(els.inputAporteValor.value);
    const fecha = els.inputAporteFecha.value;

    let valido = true;
    if (!valor || valor <= 0) {
      showFieldError(els.inputAporteValor, 'Ingresa un valor mayor a 0.');
      valido = false;
    }
    if (!fecha) {
      showFieldError(els.inputAporteFecha, 'Selecciona una fecha.');
      valido = false;
    }
    if (!valido) return;

    Storage.addAporte(objetivoId, { valor, fecha });
    cerrarModalAporte();
    render();
    showToast('Aporte agregado.');
  });

  // ---- Acciones sobre tarjetas ----
  els.list.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-action]');
    if (!btn) return;
    const { action, id } = btn.dataset;
    const objetivo = Storage.getObjetivos().find((o) => o.id === id);
    if (!objetivo) return;

    if (action === 'editar') {
      abrirModalObjetivo(objetivo);
    } else if (action === 'eliminar') {
      if (confirm(`¿Eliminar el objetivo "${objetivo.nombre}"? Se perderán sus aportes registrados.`)) {
        Storage.deleteObjetivo(id);
        render();
        showToast('Objetivo eliminado.');
      }
    } else if (action === 'aportar') {
      abrirModalAporte(id);
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (!els.modalObjetivoOverlay.hidden) cerrarModalObjetivo();
    if (!els.modalAporteOverlay.hidden) cerrarModalAporte();
  });

  render();
});
