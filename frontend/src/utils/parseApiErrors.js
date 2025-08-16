// src/utils/parseApiErrors.js
export function parseApiErrors(error) {
  const fallback = { _general: 'Ocurrió un error. Verificá los datos e intentá nuevamente.' };

  const data = error?.response?.data;
  if (!data) return fallback;

  // A) Errores de express-validator (tu middleware validateRequest)
  //    { status:"error", errors:[ { param | path, msg }, ... ] }
  if (Array.isArray(data.errors)) {
    const fieldErrors = {};
    for (const e of data.errors) {
      const key = e.param || e.path || '_general';
      fieldErrors[key] = fieldErrors[key] ? fieldErrors[key] + ' ' + e.msg : e.msg;
    }
    return Object.keys(fieldErrors).length ? fieldErrors : fallback;
  }

  // B) Otros errores de tus controllers (message + error)
  //    Mapear duplicado de Mongo (E11000) a email
  const rawErr = String(data.error || '');
  if (/E11000/i.test(rawErr) && /email/i.test(rawErr)) {
    return { email: 'Ese email ya está registrado.' };
  }

  if (typeof data.message === 'string' && data.message.trim()) {
    return { _general: data.message };
  }

  return fallback;
}
