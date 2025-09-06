// Helper para construir una respuesta de error de campo compatible con express-validator.

const fieldError = (param, msg) => ({
  status: "error",
  errors: [{ param, msg }], // un solo error para el campo indicado
});

// formato de express-validator
/* Ejemplo de salida:
{
  status: "error",
  errors: [
    { param: "email", msg: "El email es obligatorio." }
  ]
}
*/

/* -----------------------------------------
   Imports y props
   - (sin imports): utilidad pura para estandarizar errores por campo.
   - fieldError(param, msg): genera un payload de error compatible con express-validator.
----------------------------------------- */
