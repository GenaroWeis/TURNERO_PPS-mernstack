import api from './api'; // misma instancia que el resto de services

const RESOURCE = '/disponibilidades'; // ruta base del recurso disponibilidades

// GET ALL - listar todas las disponibilidades
export const listDisponibilidades = async () => {
  const res = await api.get(RESOURCE); // { status, data: [...] }
  return Array.isArray(res.data?.data) ? res.data.data : [];
};

// GET ID - obtener una disponibilidad por id
export const getDisponibilidadById = async (id) => {
  const res = await api.get(`${RESOURCE}/${id}`); // { status, data: { ... } }
  return res.data?.data;
};

// POST - crear una disponibilidad
export const createDisponibilidad = async (payload) => {// payload esperado: { diaSemana, horaInicio, horaFin, profesional }
  const res = await api.post(RESOURCE, payload); // { status, data: { ...nuevo } }
  return res.data?.data;
};

// PUT - actualizar una disponibilidad
export const updateDisponibilidad = async (id, payload) => {
  const res = await api.put(`${RESOURCE}/${id}`, payload); // { status, data: { ...actualizada } | null }
  const updated = res.data?.data;
  if (!updated) {
    const err = new Error('No encontrado');
    err.response = { data: { message: 'Disponibilidad no encontrada' } };
    throw err;
  }
  return updated;
};

// DELETE - eliminar una disponibilidad
export const removeDisponibilidad = async (id) => {
  const res = await api.delete(`${RESOURCE}/${id}`); // backend responde 204 (No Content)
  return res.status === 204; // true si se eliminó
};

// GET por profesional - listar disponibilidades de un profesional
export const listDisponibilidadesByProfesional = async (profesionalId) => {
  try {
    // /disponibilidades/profesional/:profesionalId
    const res = await api.get(`${RESOURCE}/profesional/${profesionalId}`);
    return Array.isArray(res.data?.data) ? res.data.data : [];
  } catch (err) {
    if (err?.response?.status === 404) return [];
    throw err; // otros errores sí se propagan
  }
};
