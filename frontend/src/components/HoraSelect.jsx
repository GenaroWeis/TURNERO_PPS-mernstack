// Muestro un <select> de horarios a partir de rangos; uno las franjas en intervalos de 30 min y doy una pista textual del día.

import { unionSlots, summarizeRanges } from '../utils/scheduleUtils';

export default function HoraSelect({ ranges, value, onChange, disabled }) {
  const slots = unionSlots(ranges, 30);        // genero los horarios disponibles cada 30'
  const hint = summarizeRanges(ranges);        // resumen legible de los rangos (ej.: "09:00–12:00, 14:00–16:00")

  return (
    <div className="mb-3">
      <label className="form-label">Hora</label>
      <select
        name="hora"
        className={`form-select ${disabled || !slots.length ? 'is-invalid' : ''}`} // marco inválido si está deshabilitado o sin opciones
        value={value}                             // valor controlado
        onChange={onChange}                       // propago cambio al padre
        disabled={disabled || !slots.length}      // bloqueo si no hay horarios o si viene deshabilitado
      >
        <option value="">
          {slots.length ? 'Seleccioná un horario' : 'Sin horarios disponibles'}
        </option>
        {slots.map((h) => (
          <option key={h} value={h}>{h}</option>  // cada slot como opción "HH:MM"
        ))}
      </select>
      <div className="form-text">
        {hint ? `Disponibilidad del día: ${hint}` : 'No hay rangos para este día.'}
      </div>
    </div>
  );
}

/* -----------------------------------------
   Imports y props
   - unionSlots: helper que fusiona rangos y devuelve los horarios disponibles en intervalos (ej.: 30 min) como strings "HH:MM".
   - summarizeRanges: helper que genera un texto resumen de los rangos (ej.: "09:00–12:00, 14:00–16:00").
   - ranges (prop): array de rangos horarios del día (ej.: [{ horaInicio, horaFin }, ...]).
   - value (prop): hora seleccionada en formato "HH:MM".
   - onChange (prop): callback que recibe el cambio del <select>.
   - disabled (prop): booleano para deshabilitar el control.
----------------------------------------- */
