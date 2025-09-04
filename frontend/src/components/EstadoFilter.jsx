// permite filtrar por estado (todos/pendiente/confirmado/cancelado) y notifica el cambio al padre.

export default function EstadoFilter({ value, onChange }) {
  return (
    <div>
      <label className="form-label mb-1">Estado</label>
      {/* select controlado: el valor viene de props y cada cambio dispara onChange del padre */}
      <select
        className="form-select"
        value={value}                       // valor actual del filtro
        onChange={(e) => onChange(e.target.value)} // propago el nuevo estado seleccionado
      >
        <option value="">Todos</option>         {/* sin filtro */}
        <option value="pendiente">Pendiente</option>
        <option value="confirmado">Confirmado</option>
        <option value="cancelado">Cancelado</option>
      </select>
    </div>
  );
}

/* -----------------------------------------
   Imports y props 
   - value (prop): cadena con el estado seleccionado actualmente; "" aplica “Todos”.
   - onChange (prop): callback que recibe el nuevo valor ("", "pendiente", "confirmado" o "cancelado").
----------------------------------------- */
