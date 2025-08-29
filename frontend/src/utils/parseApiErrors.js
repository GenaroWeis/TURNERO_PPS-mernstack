export function parseApiErrors(error) {

  const fallback = { _general: 'Ocurrió un error. Verificá los datos e intentá nuevamente.' };// Mensaje de error default

  const data = error?.response?.data;// Intentamos acceder a la información de error que devuelve Axios del backend
  if (!data) return fallback;// Si no hay datos, devolvemos el mensaje por defecto

  // A) Errores de express-validator (del middleware validateRequest)
  // EJEMPLO
  //  {status:"error", 
  //  errors:[ 
  //    { "param": "nombre", "msg": "El nombre es obligatorio." }] }

  if (Array.isArray(data.errors)) {
    const fieldErrors = {};// Objeto donde guardamos errores por campo
    for (const e of data.errors) {
      const key = e.param || e.path || '_general';// Elegimos la clave del campo: param o path, si no existe usamos _general
      fieldErrors[key] = fieldErrors[key] ? fieldErrors[key] + ' ' + e.msg : e.msg;// Si ya hay error para el campo, lo concatenamos, sino ponemos el nuevo mensaje
    }
    return Object.keys(fieldErrors).length ? fieldErrors : fallback;// Si hay errores devolvemos el objeto, si no devolvemos el fallback (default)
  }

  // B) Otros errores de los controllers (Mongo, etc)
  // Convertir el error a string para poder buscar patrones (como duplicados en Mongo)
  const rawErr = String(data.error || '');
  if (/E11000/i.test(rawErr) && /email/i.test(rawErr)) {// Si es error de duplicado de email en Mongo (E11000), devolvemos un mensaje
    return { email: 'Ese email ya está registrado.' };
  }

  if (typeof data.message === 'string' && data.message.trim()) { // Si el backend envió un mensaje general, lo usamos como error general
    return { _general: data.message };
  }

  return fallback; // Si nada de lo anterior aplicó, devolvemos el mensaje por defecto                                                                                                                     
}
