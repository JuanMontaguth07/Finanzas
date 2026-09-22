const STORAGE_KEY = 'personalFinanceApp:v1';

const DEFAULT_CATEGORIES = [
  'Comida',
  'Transporte',
  'Gym',
  'Regalos',
  'Entretenimiento',
  'Obligaciones',
  'Chile',
  'Otros',
];

function defaultState() {
  return {
    version: 1,
    config: {
      moneda: 'COP',
      categorias: [...DEFAULT_CATEGORIES],
    },
    movimientos: [],
    presupuestos: [],
    objetivos: [],
  };
}

function generateId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw);
    return { ...defaultState(), ...parsed };
  } catch (err) {
    console.error('No se pudo leer el almacenamiento local, se usará un estado limpio.', err);
    return defaultState();
  }
}

function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

const Storage = {
  getState: loadState,
  setState: saveState,

  resetState() {
    saveState(defaultState());
  },

  getMovimientos() {
    return loadState().movimientos;
  },

  addMovimiento(data) {
    const state = loadState();
    const movimiento = {
      id: generateId(),
      fecha: data.fecha,
      descripcion: data.descripcion.trim(),
      categoria: data.categoria,
      tipo: data.tipo,
      valor: Number(data.valor),
      createdAt: new Date().toISOString(),
    };
    state.movimientos.push(movimiento);
    saveState(state);
    return movimiento;
  },

  // Guarda varios movimientos en una sola lectura/escritura (usado por la
  // importacion de extractos) en vez de una por movimiento, para que sea
  // rapido con lotes grandes y para que un fallo a mitad de camino no deje
  // el guardado a medias sin avisar.
  addMovimientos(dataArray) {
    const state = loadState();
    const nuevos = dataArray.map((data) => ({
      id: generateId(),
      fecha: data.fecha,
      descripcion: data.descripcion.trim(),
      categoria: data.categoria,
      tipo: data.tipo,
      valor: Number(data.valor),
      createdAt: new Date().toISOString(),
    }));
    state.movimientos.push(...nuevos);
    saveState(state);
    return nuevos;
  },

  updateMovimiento(id, data) {
    const state = loadState();
    const idx = state.movimientos.findIndex((m) => m.id === id);
    if (idx === -1) return null;
    state.movimientos[idx] = {
      ...state.movimientos[idx],
      fecha: data.fecha,
      descripcion: data.descripcion.trim(),
      categoria: data.categoria,
      tipo: data.tipo,
      valor: Number(data.valor),
      updatedAt: new Date().toISOString(),
    };
    saveState(state);
    return state.movimientos[idx];
  },

  deleteMovimiento(id) {
    const state = loadState();
    state.movimientos = state.movimientos.filter((m) => m.id !== id);
    saveState(state);
  },

  getCategorias() {
    return loadState().config.categorias;
  },

  // ---- Presupuestos ----
  getPresupuestos() {
    return loadState().presupuestos;
  },

  getLimitePorCategoria(categoria) {
    const presupuesto = loadState().presupuestos.find((p) => p.categoria === categoria);
    return presupuesto ? presupuesto.limite : null;
  },

  setPresupuesto(categoria, limite) {
    const state = loadState();
    const idx = state.presupuestos.findIndex((p) => p.categoria === categoria);
    const valor = Number(limite);
    if (!valor || valor <= 0) {
      if (idx !== -1) state.presupuestos.splice(idx, 1);
    } else if (idx === -1) {
      state.presupuestos.push({ categoria, limite: valor });
    } else {
      state.presupuestos[idx].limite = valor;
    }
    saveState(state);
  },

  // ---- Objetivos ----
  getObjetivos() {
    return loadState().objetivos;
  },

  addObjetivo(data) {
    const state = loadState();
    const objetivo = {
      id: generateId(),
      nombre: data.nombre.trim(),
      meta: Number(data.meta),
      fechaObjetivo: data.fechaObjetivo || null,
      aportes: [],
      createdAt: new Date().toISOString(),
    };
    state.objetivos.push(objetivo);
    saveState(state);
    return objetivo;
  },

  updateObjetivo(id, data) {
    const state = loadState();
    const objetivo = state.objetivos.find((o) => o.id === id);
    if (!objetivo) return null;
    objetivo.nombre = data.nombre.trim();
    objetivo.meta = Number(data.meta);
    objetivo.fechaObjetivo = data.fechaObjetivo || null;
    saveState(state);
    return objetivo;
  },

  deleteObjetivo(id) {
    const state = loadState();
    state.objetivos = state.objetivos.filter((o) => o.id !== id);
    saveState(state);
  },

  addAporte(objetivoId, data) {
    const state = loadState();
    const objetivo = state.objetivos.find((o) => o.id === objetivoId);
    if (!objetivo) return null;
    objetivo.aportes.push({
      id: generateId(),
      valor: Number(data.valor),
      fecha: data.fecha,
    });
    saveState(state);
    return objetivo;
  },

  getAhorradoObjetivo(objetivo) {
    return objetivo.aportes.reduce((sum, a) => sum + a.valor, 0);
  },
};
