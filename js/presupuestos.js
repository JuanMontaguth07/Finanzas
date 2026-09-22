document.addEventListener('DOMContentLoaded', () => {
  render();
});

function render() {
  const monthKey = currentMonthKey();
  const categorias = Storage.getCategorias();
  const gastoMap = Object.fromEntries(getGastosPorCategoria(monthKey).map((g) => [g.categoria, g.total]));
  const diasRestantes = getDiasRestantesDelMes();
  const container = document.getElementById('presupuestos-list');

  container.innerHTML = categorias
    .map((categoria) => {
      const limite = Storage.getLimitePorCategoria(categoria);
      const gastado = gastoMap[categoria] || 0;
      const superado = limite && gastado > limite;
      const pct = limite ? Math.min(Math.round((gastado / limite) * 100), 100) : 0;

      let lineaDisponible = '';
      if (limite && !superado) {
        const diario = Math.floor((limite - gastado) / diasRestantes);
        lineaDisponible = `<p class="budget-row-daily">Disponible para gastar: ${formatCurrency(diario)}/día · quedan ${diasRestantes} días</p>`;
      }

      const progreso = limite
        ? `
          <div class="progress-track${superado ? ' progress-track-danger' : ''}">
            <div class="progress-fill${superado ? ' progress-fill-danger' : ''}" style="width:${pct}%"></div>
          </div>
          <p class="budget-row-sub${superado ? ' budget-row-sub-danger' : ''}">
            ${formatCurrency(gastado)} / ${formatCurrency(limite)}${superado ? ' · ¡Presupuesto superado!' : ` · ${pct}%`}
          </p>
          ${lineaDisponible}`
        : `<p class="budget-row-sub">Sin límite definido · gastado este mes: ${formatCurrency(gastado)}</p>`;

      const meta = getCategoryMeta(categoria);
      return `
      <div class="budget-row">
        <div class="budget-row-main">
          <span class="budget-category">${meta.emoji} ${escapeHtml(categoria)}</span>
          <div class="currency-input-wrap">
            <span>$</span>
            <input type="text" class="budget-input" data-categoria="${categoria}" value="${limite ? limite.toLocaleString('es-CO') : ''}" placeholder="Sin límite">
          </div>
        </div>
        ${progreso}
      </div>`;
    })
    .join('');

  container.querySelectorAll('.budget-input').forEach((input) => {
    attachCurrencyMask(input);
    input.addEventListener('change', (e) => {
      Storage.setPresupuesto(e.target.dataset.categoria, parseCurrencyInput(e.target.value));
      render();
      showToast(`Presupuesto de ${e.target.dataset.categoria} actualizado.`);
    });
  });
}
