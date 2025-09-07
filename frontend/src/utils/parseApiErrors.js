// Parser de errores de API: toma un error de Axios y devuelve un objeto campo→mensaje listo para mostrar en UI.

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
  //Duplicados de Mongo (E11000)
  const raw = String(data.error || data.message || '');
  const keyValue = data?.error?.keyValue || data?.keyValue; // a veces viene así desde Mongoose

  // 1) Si viene keyValue estructurado, es lo más confiable
  if (keyValue && typeof keyValue === 'object') {
    const [dupKey] = Object.keys(keyValue);
    if (dupKey) {
      const msg = dupKey === 'email'
        ? 'Ese email ya está registrado.'
        : dupKey === 'dni'
        ? 'Ese DNI ya está registrado.'
        : 'Dato único duplicado.';
      return { [dupKey]: msg };
    }
  }

  // 2) Si no, parseo el string del error
  if (/E11000/i.test(raw)) {
    const lower = raw.toLowerCase();
    if (lower.includes('email'))    return { email: 'Ese email ya está registrado.' };
    if (lower.includes('dni'))      return { dni: 'Ese DNI ya está registrado.' };
    return { _general: 'Dato único duplicado.' };
  }

  if (typeof data.message === 'string' && data.message.trim()) { // Si el backend envió un mensaje general, lo usamos como error general
    return { _general: data.message };
  }

  return fallback; // Si nada de lo anterior aplicó, devolvemos el mensaje por defecto                                                                                                                     
}
