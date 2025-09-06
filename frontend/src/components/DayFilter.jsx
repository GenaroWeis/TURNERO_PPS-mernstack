// Filtro de día: renderizo un <select> con los días de la semana o la opción "Todos" y notifico cambios al padre.

// Selecciona un día o "Todos"
const DIAS_ORDEN = ['lunes','martes','miércoles','jueves','viernes','sábado','domingo'];

export default function DayFilter({ value, onChange, className = '' }) {
  return (
    <div className={className}>
      <label className="form-label mb-1">Día</label>
      <select
        className="form-select"
        value={value}                                /* select controlado */
        onChange={(e) => onChange(e.target.value)}   /* propago el nuevo valor */
      >
        <option value="">Todos</option>              {/* sin filtro */}
        {DIAS_ORDEN.map((d) => (
          <option key={d} value={d}>{d}</option>     /* cada día como opción */
        ))}
      </select>
    </div>
  );
}

/* -----------------------------------------
   Imports y props
   - DIAS_ORDEN: array con los nombres de los días en el orden estándar de visualización.
   - value (prop): día seleccionado actualmente; "" aplica “Todos”.
   - onChange (prop): callback que recibe el nuevo día seleccionado ("" o un día de DIAS_ORDEN).
   - className (prop): clases extra para ajustar el contenedor en layouts responsivos.
----------------------------------------- */
