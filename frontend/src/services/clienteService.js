import api from './api'; // api toma "process.env.REACT_APP_API_URL", permite hacer llamadas a la API usando api.get, api.post, etc.

const RESOURCE = '/clientes'; // Ruta base del recurso clientes en el backend. Si cambia la ruta, solo actualizamos esta constante

// GET ALL - Obtener todos los clientes
export const listClientes = async () => {
  const res = await api.get(RESOURCE); // GET a /clientes: esperamos { status, data: [...] }
  return Array.isArray(res.data?.data) ? res.data.data : []; // Si res.data.data es un array, lo devolvemos; si no, devolvemos array vacío para no romper el front
};

// GET ID - Obtener un cliente por su ID
export const getClienteById = async (id) => {
  const res = await api.get(`${RESOURCE}/${id}`); // GET a /clientes/:id: esperamos { status, data: { ... } }
  return res.data?.data; // Devolvemos el objeto cliente que vino en data
};

// POST - Crear un nuevo cliente
export const createCliente = async (payload) => {
  const res = await api.post(RESOURCE, payload);// POST a /clientes enviando los datos del nuevo cliente: esperamos { status, data: { ...nuevo } }
  return res.data?.data; // Devolvemos el cliente creado
};

// PUT - Actualizar un cliente existente
export const updateCliente = async (id, payload) => {
  const res = await api.put(`${RESOURCE}/${id}`, payload);// PUT a /clientes/:id enviando los datos actualizados
  const updated = res.data?.data; // Guardamos el cliente actualizado
  if (!updated) { // Si el ID no existe
    const err = new Error('No encontrado'); // Creamos un error
    err.response = { data: { message: 'Cliente no encontrado' } }; // Agregamos mensaje al error 
    throw err; // Lanzamos el error para que el front lo capture
  }
  return updated; // el cliente actualizado
};

// DELETE - Eliminar un cliente
export const removeCliente = async (id) => {
  const res = await api.delete(`${RESOURCE}/${id}`); // DELETE a /clientes/:id
    // El controller usa 204 (No Content). Con 204, res.data viene vacío, devolvemos true si status 204
  return res.status === 204; // True si se eliminó correctamente
};

