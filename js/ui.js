// ---- Toasts ----
function getToastContainer() {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  return container;
}

function showToast(message, type = 'success') {
  const container = getToastContainer();
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  container.appendChild(toast);

  requestAnimationFrame(() => toast.classList.add('toast-visible'));

  setTimeout(() => {
    toast.classList.remove('toast-visible');
    setTimeout(() => toast.remove(), 200);
  }, 3200);
}

// ---- Currency-masked inputs ----
function attachCurrencyMask(input) {
  input.setAttribute('inputmode', 'numeric');
  input.setAttribute('autocomplete', 'off');
  input.addEventListener('input', () => {
    const raw = input.value.replace(/\D/g, '');
    input.value = raw ? Number(raw).toLocaleString('es-CO') : '';
  });
}

function setCurrencyInputValue(input, value) {
  const num = Number(value) || 0;
  input.value = num ? num.toLocaleString('es-CO') : '';
}

function parseCurrencyInput(value) {
  return Number(String(value).replace(/\D/g, '')) || 0;
}

// ---- Inline field errors ----
function showFieldError(input, message) {
  input.classList.add('input-error');
  const wrapper = input.closest('.form-field');
  if (!wrapper) return;
  let errorEl = wrapper.querySelector('.field-error');
  if (!errorEl) {
    errorEl = document.createElement('span');
    errorEl.className = 'field-error';
    wrapper.appendChild(errorEl);
  }
  errorEl.textContent = message;
}

function clearFieldErrors(form) {
  form.querySelectorAll('.input-error').forEach((el) => el.classList.remove('input-error'));
  form.querySelectorAll('.field-error').forEach((el) => el.remove());
}
