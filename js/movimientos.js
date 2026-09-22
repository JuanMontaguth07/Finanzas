document.addEventListener('DOMContentLoaded', () => {
  const state = {
    filtros: { mes: '', categoria: '', tipo: '', busqueda: '' },
    editId: null,
  };
  let tipoSeleccionado = 'gasto';

  const els = {
    tbody: document.getElementById('tabla-movimientos-body'),
    empty: document.getElementById('movimientos-empty'),
    filtroMes: document.getElementById('filtro-mes'),
    filtroCategoria: document.getElementById('filtro-categoria'),
    filtroTipo: document.getElementById('filtro-tipo'),
    filtroBusqueda: document.getElementById('filtro-busqueda'),
    btnLimpiar: document.getElementById('btn-limpiar-filtros'),
    btnNuevo: document.getElementById('btn-nuevo-movimiento'),
    modalOverlay: document.getElementById('modal-overlay'),
    modalTitle: document.getElementById('modal-title'),
    modalClose: document.getElementById('modal-close'),
    btnCancelar: document.getElementById('btn-cancelar'),
    form: document.getElementById('form-movimiento'),
    inputId: document.getElementById('movimiento-id'),
    inputFecha: document.getElementById('input-fecha'),
    inputDescripcion: document.getElementById('input-descripcion'),
    inputCategoria: document.getElementById('input-categoria'),
    inputValor: document.getElementById('input-valor'),
    tipoSegmented: document.getElementById('tipo-segmented'),
  };

  attachCurrencyMask(els.inputValor);

  function poblarCategorias() {
    const categorias = Storage.getCategorias();
    els.inputCategoria.innerHTML = categorias
      .map((c) => `<option value="${c}">${c}</option>`)
      .join('');
    els.filtroCategoria.innerHTML =
      '<option value="">Todas</option>' +
      categorias.map((c) => `<option value="${c}">${c}</option>`).join('');
  }

  function setTipoSeleccionado(tipo) {
    tipoSeleccionado = tipo;
    els.tipoSegmented.querySelectorAll('.segmented-option').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.tipo === tipo);
    });
  }

  function abrirModal(movimiento = null) {
    state.editId = movimiento ? movimiento.id : null;
    els.modalTitle.textContent = movimiento ? 'Editar movimiento' : 'Nuevo movimiento';
    els.inputId.value = movimiento ? movimiento.id : '';
    els.inputFecha.value = movimiento ? movimiento.fecha : todayIso();
    els.inputDescripcion.value = movimiento ? movimiento.descripcion : '';
    els.inputCategoria.value = movimiento ? movimiento.categoria : Storage.getCategorias()[0];
    setCurrencyInputValue(els.inputValor, movimiento ? movimiento.valor : '');
    setTipoSeleccionado(movimiento ? movimiento.tipo : 'gasto');
    clearFieldErrors(els.form);
    els.modalOverlay.hidden = false;
    els.inputDescripcion.focus();
  }

  function cerrarModal() {
    els.modalOverlay.hidden = true;
    els.form.reset();
    clearFieldErrors(els.form);
    state.editId = null;
  }

  function obtenerMovimientosFiltrados() {
    const { mes, categoria, tipo, busqueda } = state.filtros;
    return Storage.getMovimientos()
      .filter((m) => !mes || m.fecha.startsWith(mes))
      .filter((m) => !categoria || m.categoria === categoria)
      .filter((m) => !tipo || m.tipo === tipo)
      .filter((m) => !busqueda || m.descripcion.toLowerCase().includes(busqueda.toLowerCase()))
      .sort((a, b) => b.fecha.localeCompare(a.fecha));
  }

  function renderTabla() {
    const movimientos = obtenerMovimientosFiltrados();
    els.empty.hidden = movimientos.length > 0;
    els.tbody.innerHTML = movimientos
      .map((m) => {
        const meta = getCategoryMeta(m.categoria);
        return `
      <tr>
        <td>${formatDate(m.fecha)}</td>
        <td>${escapeHtml(m.descripcion)}</td>
        <td><span class="badge badge-categoria" style="background:${meta.color}20;color:${meta.color}">${meta.emoji} ${escapeHtml(m.categoria)}</span></td>
        <td><span class="badge badge-${m.tipo}">${m.tipo === 'ingreso' ? '↑ Ingreso' : '↓ Gasto'}</span></td>
        <td class="valor-${m.tipo}">${m.tipo === 'gasto' ? '-' : '+'} ${formatCurrency(m.valor)}</td>
        <td class="acciones">
          <button class="icon-btn" data-action="editar" data-id="${m.id}" aria-label="Editar">✎</button>
          <button class="icon-btn icon-btn-danger" data-action="eliminar" data-id="${m.id}" aria-label="Eliminar">🗑</button>
        </td>
      </tr>`;
      })
      .join('');
  }

  // Filtros
  els.filtroMes.addEventListener('change', (e) => {
    state.filtros.mes = e.target.value;
    renderTabla();
  });
  els.filtroCategoria.addEventListener('change', (e) => {
    state.filtros.categoria = e.target.value;
    renderTabla();
  });
  els.filtroTipo.addEventListener('change', (e) => {
    state.filtros.tipo = e.target.value;
    renderTabla();
  });
  els.filtroBusqueda.addEventListener('input', (e) => {
    state.filtros.busqueda = e.target.value;
    renderTabla();
  });
  els.btnLimpiar.addEventListener('click', () => {
    state.filtros = { mes: '', categoria: '', tipo: '', busqueda: '' };
    els.filtroMes.value = '';
    els.filtroCategoria.value = '';
    els.filtroTipo.value = '';
    els.filtroBusqueda.value = '';
    renderTabla();
  });

  // Modal
  els.btnNuevo.addEventListener('click', () => abrirModal());
  els.modalClose.addEventListener('click', cerrarModal);
  els.btnCancelar.addEventListener('click', cerrarModal);
  els.modalOverlay.addEventListener('click', (e) => {
    if (e.target === els.modalOverlay) cerrarModal();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !els.modalOverlay.hidden) cerrarModal();
  });
  els.tipoSegmented.addEventListener('click', (e) => {
    const btn = e.target.closest('.segmented-option');
    if (btn) setTipoSeleccionado(btn.dataset.tipo);
  });

  // Acciones de tabla
  els.tbody.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-action]');
    if (!btn) return;
    const { action, id } = btn.dataset;
    if (action === 'editar') {
      const movimiento = Storage.getMovimientos().find((m) => m.id === id);
      if (movimiento) abrirModal(movimiento);
    } else if (action === 'eliminar') {
      if (confirm('¿Eliminar este movimiento? Esta acción no se puede deshacer.')) {
        Storage.deleteMovimiento(id);
        renderTabla();
        showToast('Movimiento eliminado.');
      }
    }
  });

  // Formulario
  els.form.addEventListener('submit', (e) => {
    e.preventDefault();
    clearFieldErrors(els.form);

    const data = {
      fecha: els.inputFecha.value,
      descripcion: els.inputDescripcion.value,
      categoria: els.inputCategoria.value,
      tipo: tipoSeleccionado,
      valor: parseCurrencyInput(els.inputValor.value),
    };

    let valido = true;
    if (!data.fecha) {
      showFieldError(els.inputFecha, 'Selecciona una fecha.');
      valido = false;
    }
    if (!data.descripcion.trim()) {
      showFieldError(els.inputDescripcion, 'Escribe una descripción.');
      valido = false;
    }
    if (!data.valor || data.valor <= 0) {
      showFieldError(els.inputValor, 'Ingresa un valor mayor a 0.');
      valido = false;
    }
    if (!valido) return;

    if (state.editId) {
      Storage.updateMovimiento(state.editId, data);
      showToast('Movimiento actualizado.');
    } else {
      Storage.addMovimiento(data);
      showToast('Movimiento guardado.');
    }
    cerrarModal();
    renderTabla();
  });

  poblarCategorias();
  renderTabla();
});
