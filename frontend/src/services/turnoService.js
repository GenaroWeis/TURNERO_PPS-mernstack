import api from './api'; // usa process.env.REACT_APP_API_URL como base

const RESOURCE = '/turnos'; // ruta base del recurso turnos

// GET ALL 
export const listTurnos = async () => {
  const res = await api.get(RESOURCE); // esperamos { status, data: [...] }
  return Array.isArray(res.data?.data) ? res.data.data : [];
  // Nota: vienen populateados profesional y cliente con el controller
};

// GET ID 
export const getTurnoById = async (id) => {
  const res = await api.get(`${RESOURCE}/${id}`); // { status, data: { ... } }
  return res.data?.data;
};

// POST 
export const createTurno = async (payload) => {// Espera payload con: { fecha, hora, profesional, cliente, (opcional) estado }
  const res = await api.post(RESOURCE, payload); // { status, data: { ...nuevo } }
  return res.data?.data;
};

// PUT - actualizar un turno
export const updateTurno = async (id, payload) => {
  const res = await api.put(`${RESOURCE}/${id}`, payload); // { status, data: { ...actualizado } | null }
  const updated = res.data?.data;
  if (!updated) {
    const err = new Error('No encontrado');
    err.response = { data: { message: 'Turno no encontrado' } };
    throw err;
  }
  return updated;
};

// DELETE - eliminar un turno
export const removeTurno = async (id) => {
  const res = await api.delete(`${RESOURCE}/${id}`); // controller responde 204 (No Content)
  return res.status === 204; // true si se eliminó
};



