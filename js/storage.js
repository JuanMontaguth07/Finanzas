const STORAGE_KEY = 'personalFinanceApp:v1';

const DEFAULT_CATEGORIES = [
  { nombre: 'Comida', emoji: '🍔', color: '#fb923c' },
  { nombre: 'Transporte', emoji: '🚌', color: '#38bdf8' },
  { nombre: 'Gym', emoji: '🏋️', color: '#34d399' },
  { nombre: 'Regalos', emoji: '🎁', color: '#f472b6' },
  { nombre: 'Entretenimiento', emoji: '🎮', color: '#a78bfa' },
  { nombre: 'Obligaciones', emoji: '📄', color: '#64748b' },
  { nombre: 'Chile', emoji: '✈️', color: '#22d3ee' },
  { nombre: 'Otros', emoji: '📦', color: '#94a3b8' },
];

function defaultState() {
  return {
    version: 1,
    config: {
      moneda: 'COP',
      categorias: DEFAULT_CATEGORIES.map((c) => ({ ...c })),
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

// Las categorias solian guardarse como un arreglo de strings. Si detectamos
// ese formato viejo en datos ya guardados, los convertimos a objetos
// {nombre, emoji, color} usando los valores por defecto conocidos (o un
// generico si es una categoria que el usuario ya habia agregado).
function migrarCategorias(categorias) {
  if (!Array.isArray(categorias) || categorias.length === 0) {
    return DEFAULT_CATEGORIES.map((c) => ({ ...c }));
  }
  return categorias.map((c) => {
    if (typeof c === 'string') {
      const conocida = DEFAULT_CATEGORIES.find((d) => d.nombre === c);
      return conocida ? { ...conocida } : { nombre: c, emoji: '🏷️', color: '#94a3b8' };
    }
    return c;
  });
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw);
    const state = { ...defaultState(), ...parsed };
    state.config = { ...defaultState().config, ...parsed.config };
    state.config.categorias = migrarCategorias(state.config.categorias);
    return state;
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
    // Solo los nombres, para selects/filtros que no necesitan el emoji/color.
    return loadState().config.categorias.map((c) => c.nombre);
  },

  getCategoriasConMeta() {
    return loadState().config.categorias;
  },

  getCategoriaMeta(nombre) {
    const cat = loadState().config.categorias.find((c) => c.nombre === nombre);
    return cat ? { emoji: cat.emoji, color: cat.color } : null;
  },

  addCategoria({ nombre, emoji, color }) {
    const state = loadState();
    const nombreLimpio = (nombre || '').trim();
    if (!nombreLimpio) throw new Error('El nombre no puede estar vacío.');
    if (state.config.categorias.some((c) => c.nombre.toLowerCase() === nombreLimpio.toLowerCase())) {
      throw new Error('Ya existe una categoría con ese nombre.');
    }
    state.config.categorias.push({
      nombre: nombreLimpio,
      emoji: emoji || '🏷️',
      color: color || '#94a3b8',
    });
    saveState(state);
  },

  updateCategoria(nombreActual, { emoji, color }) {
    const state = loadState();
    const cat = state.config.categorias.find((c) => c.nombre === nombreActual);
    if (!cat) return;
    cat.emoji = emoji || cat.emoji;
    cat.color = color || cat.color;
    saveState(state);
  },

  deleteCategoria(nombre) {
    const state = loadState();
    const enUso =
      state.movimientos.some((m) => m.categoria === nombre) ||
      state.presupuestos.some((p) => p.categoria === nombre);
    if (enUso) {
      throw new Error('No se puede eliminar: hay movimientos o presupuestos usando esta categoría.');
    }
    state.config.categorias = state.config.categorias.filter((c) => c.nombre !== nombre);
    saveState(state);
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
      prioritario: false,
      aportes: [],
      createdAt: new Date().toISOString(),
    };
    state.objetivos.push(objetivo);
    saveState(state);
    return objetivo;
  },

  toggleObjetivoPrioritario(id) {
    const state = loadState();
    const objetivo = state.objetivos.find((o) => o.id === id);
    if (!objetivo) return null;
    objetivo.prioritario = !objetivo.prioritario;
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
