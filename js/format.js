function formatCurrency(value) {
  const rounded = Math.round(Number(value) || 0);
  return `$ ${rounded.toLocaleString('es-CO')}`;
}

function formatDate(isoDate) {
  if (!isoDate) return '';
  const [year, month, day] = isoDate.split('-');
  return `${day}/${month}/${year}`;
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function currentMonthKey(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

const MESES_CORTOS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

function monthLabel(monthKey) {
  const month = Number(monthKey.split('-')[1]);
  return MESES_CORTOS[month - 1];
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

const CATEGORY_META = {
  Comida: { emoji: '🍔', color: '#fb923c' },
  Transporte: { emoji: '🚌', color: '#38bdf8' },
  Gym: { emoji: '🏋️', color: '#34d399' },
  Regalos: { emoji: '🎁', color: '#f472b6' },
  Entretenimiento: { emoji: '🎮', color: '#a78bfa' },
  Obligaciones: { emoji: '📄', color: '#64748b' },
  Chile: { emoji: '✈️', color: '#22d3ee' },
  Otros: { emoji: '📦', color: '#94a3b8' },
};

const CATEGORY_DEFAULT = { emoji: '🏷️', color: '#94a3b8' };

function getCategoryMeta(categoria) {
  return CATEGORY_META[categoria] || CATEGORY_DEFAULT;
}
