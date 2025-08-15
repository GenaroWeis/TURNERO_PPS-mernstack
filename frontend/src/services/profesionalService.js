import api from './api'; //api toma "process.env.REACT_APP_API_URL"

const RESOURCE = '/profesionales';

export const listProfesionales = async () => {
  const res = await api.get(RESOURCE);
  // Esperamos { status, data: [...] }
  return Array.isArray(res.data?.data) ? res.data.data : [];
};

export const getProfesionalById = async (id) => {
  const res = await api.get(`${RESOURCE}/${id}`);
  // Esperamos { status, data: { ... } }
  return res.data?.data;
};

export const createProfesional = async (payload) => {
  const res = await api.post(RESOURCE, payload);
  // { status, data: { ...nuevo } }
  return res.data?.data;
};

export const updateProfesional = async (id, payload) => {
  const res = await api.put(`${RESOURCE}/${id}`, payload);
  // { status, data: { ...actualizado } }
  return res.data?.data;
};

export const removeProfesional = async (id) => {
  const res = await api.delete(`${RESOURCE}/${id}`);
  // Tu controller usa 204 (No Content).
  // Con 204, res.data suele venir vacío -> devolvemos true si status 204.
  return res.status === 204;
};