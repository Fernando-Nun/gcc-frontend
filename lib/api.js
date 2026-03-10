const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

function getToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('gcc_token');
}

async function request(path, options = {}) {
  const token = getToken();

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  let res;
  try {
    res = await fetch(`${BASE}${path}`, { ...options, headers });
  } catch (err) {
    throw new Error('No se pudo conectar al servidor. Verifica que el backend esté corriendo.');
  }

  if (res.status === 401) {
    localStorage.removeItem('gcc_token');
    localStorage.removeItem('gcc_user');
    window.location.href = '/login';
    throw new Error('Sesión expirada');
  }

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || `Error ${res.status}`);
  return data;
}

// ── Auth ──────────────────────────────────────────────────────────
export const authAPI = {
  login: (email, password) =>
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  registro: (nombre, email, password) =>
    request('/auth/registro', {
      method: 'POST',
      body: JSON.stringify({ nombre, email, password }),
    }),

  me: () => request('/auth/me'),
};

// ── Upload ────────────────────────────────────────────────────────
export const uploadAPI = {
  subir: (formData) => {
    const token = getToken();
    return fetch(`${BASE}/upload`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    }).then(async (r) => {
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || `Error ${r.status}`);
      return d;
    }).catch(err => {
      if (err.message.includes('fetch')) {
        throw new Error('No se pudo conectar al servidor.');
      }
      throw err;
    });
  },
};

// ── Órdenes ───────────────────────────────────────────────────────
export const ordenesAPI = {
  listar: (params = {}) => {
    const qs = new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined && v !== ''))
    ).toString();
    return request(`/ordenes?${qs}`);
  },

  estadisticas: () => request('/ordenes/estadisticas'),
};

// ── Correos ───────────────────────────────────────────────────────
export const correosAPI = {
  enviar: (ordenes, asunto_custom, cuerpo_custom) =>
    request('/correos/enviar', {
      method: 'POST',
      body: JSON.stringify({ ordenes, asunto_custom, cuerpo_custom }),
    }),

  historial: (page = 1) =>
    request(`/correos/historial?page=${page}&limit=20`),
};

// ── IA ────────────────────────────────────────────────────────────
export const iaAPI = {
  redactarCorreo: (ordenes) =>
    request('/ia/redactar-correo', {
      method: 'POST',
      body: JSON.stringify({ ordenes }),
    }),

  resumenEjecutivo: (opciones) =>
    request('/ia/resumen-ejecutivo', {
      method: 'POST',
      body: JSON.stringify({ opciones }),
    }),

  analizarComentarios: (comentarios) =>
    request('/ia/analizar-comentarios', {
      method: 'POST',
      body: JSON.stringify({ comentarios }),
    }),

  predecirRiesgo: (ordenes) =>
    request('/ia/predecir-riesgo', {
      method: 'POST',
      body: JSON.stringify({ ordenes }),
    }),

  chat: (mensaje, historial) =>
    request('/ia/chat', {
      method: 'POST',
      body: JSON.stringify({ mensaje, historial }),
    }),
};