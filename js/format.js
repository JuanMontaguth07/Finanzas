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

const CATEGORY_DEFAULT = { emoji: '🏷️', color: '#94a3b8' };

// El emoji/color de cada categoria ahora vive en Storage (el usuario los
// puede editar desde Configuración), asi que se consulta ahi en vez de un
// mapa fijo en el codigo.
function getCategoryMeta(categoria) {
  return Storage.getCategoriaMeta(categoria) || CATEGORY_DEFAULT;
}
