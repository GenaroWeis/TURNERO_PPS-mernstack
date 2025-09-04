// Campo de texto reutilizable con label, control “controlado” y visualización de error.

export default function InputField({
  label,
  name,
  type = 'text',
  value,
  onChange,
  error,
  placeholder = '',
  disabled = false,
}) {
  return (
    <div className="mb-3">
      <label className="form-label" htmlFor={name}>{label}</label> {/* asocio el label al input */}
      <input
        id={name}
        type={type}
        name={name}
        className={`form-control ${error ? 'is-invalid' : ''}`}  /* clase de error si hay mensaje */
        value={value}                       /* input controlado */
        onChange={onChange}                 /* propago cambios al padre */
        placeholder={placeholder}
        disabled={disabled}
        autoComplete="off"                  /* evito autocompletado por defecto */
      />
      {error && <div className="invalid-feedback">{error}</div>}   {/* feedback de error */}
    </div>
  );
}

/* -----------------------------------------
   Imports y props
   - label (prop): texto de la etiqueta asociada al input.
   - name (prop): nombre/identificador del control; también se usa en htmlFor/id.
   - type (prop): tipo de input (por defecto, "text").
   - value (prop): valor actual del input (controlado por el padre).
   - onChange (prop): callback para actualizar el estado en el padre.
   - error (prop): mensaje de error; si existe, muestra estilo inválido y feedback.
   - placeholder (prop): texto guía dentro del campo.
   - disabled (prop): deshabilita el control cuando es true.
----------------------------------------- */
