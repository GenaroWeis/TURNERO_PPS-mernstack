import api from './api';

export const getTurnos = async () => {
  const response = await api.get('/turnos');
  return response.data;
};


