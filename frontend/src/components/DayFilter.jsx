// Selecciona un día o "Todos"
const DIAS_ORDEN = ['lunes','martes','miércoles','jueves','viernes','sábado','domingo'];

export default function DayFilter({ value, onChange, className = '' }) {
  return (
    <div className={className}>
      <label className="form-label mb-1">Día</label>
      <select
        className="form-select"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">Todos</option>
        {DIAS_ORDEN.map(d => <option key={d} value={d}>{d}</option>)}
      </select>
    </div>
  );
}
