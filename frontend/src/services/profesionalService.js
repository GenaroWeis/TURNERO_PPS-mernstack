import api from './api'; //api toma "process.env.REACT_APP_API_URL", Esto nos permite hacer llamadas a la API usando 'api.get', 'api.post', etc

const RESOURCE = '/profesionales';//Definimos la ruta base del recurso profesionales en el backend, Así si cambia la ruta solo cambiamos esta constante

//GET ALL
export const listProfesionales = async () => {
  const res = await api.get(RESOURCE);//GET A PROFESIONALES: Esperamos { status, data: [...] }
  return Array.isArray(res.data?.data) ? res.data.data : [];// Si res.data.data (osea el array de profecionales) es un array lo devolvemos, si no, devolvemos un array vacío para que no rompa el front
};

//GET ID
export const getProfesionalById = async (id) => {
  const res = await api.get(`${RESOURCE}/${id}`);//GET A PROFESIONAL ID: Esperamos { status, data: { ... } }
  return res.data?.data;//el objeto profesional que vino en data
};

//POST
export const createProfesional = async (payload) => {
  const res = await api.post(RESOURCE, payload);//POST A PROFESIONAL enviando los datos del nuevo profesional: Esperamos { status, data: { ...nuevo } }
  return res.data?.data;//el profesional creado
};

//PUT
export const updateProfesional = async (id, payload) => {
  const res = await api.put(`${RESOURCE}/${id}`, payload);//PUT A PROFESIONAL enviando los datos actualizados
  const updated = res.data?.data;// Guardamos la respuesta, el profesional actualizado
  if (!updated) {//si el id es inexistente
    const err = new Error('No encontrado');//Creamos un error
    err.response = { data: { message: 'Profesional no encontrado' } };//Le agregamos un mensaje al error
    throw err;//Lanzamos el error para que el front lo capture
  }
  return updated;//el profesional actualizado
};

//DELETE
export const removeProfesional = async (id) => {
  const res = await api.delete(`${RESOURCE}/${id}`);//DELETE A PROFESIONAL
  // el controller usa 204 (No Content). Con 204, res.data viene vacío así que devolvemos true si status 204.
  return res.status === 204;//el profesional se elimino
};

//res es la respuesta completa (res.status, header o data), acá, para el front, solo se necesita la data del backend
//optional chaining (res.data?.data): Si res.data existe, dame res.data.data. Si no existe, dame undefined sin tirar error.