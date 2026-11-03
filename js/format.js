function formatCurrency(value) {
  const rounded = Math.round(Number(value) || 0);
  return `$ ${rounded.toLocaleString('es-CO')}`;
}

function formatDate(isoDate) {
  if (!isoDate) return '';
  const [year, month, day] = isoDate.split('-');
  return `${day}/${month}/${year}`;
}

// Fecha de hoy en hora local. (toISOString() usa UTC: en Colombia, despues
// de las 7 pm ya devolvia la fecha de mañana.)
function todayIso() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// Porcentaje de avance redondeado hacia abajo y con tope de 100: asi solo
// muestra 100% cuando de verdad se llego (99,7% se ve como 99%, no 100%).
function porcentajeProgreso(actual, total) {
  if (!total) return 0;
  return Math.min(Math.floor((actual / total) * 100), 100);
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
