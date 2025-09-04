// Barra de búsqueda reutilizable con campo de texto y, opcionalmente, un selector de fecha.

export default function SearchBar({
  query, onQueryChange,
  placeholder = 'Buscar...',
  showDate = false,
  dateValue = '', onDateChange,
  labelText = 'Buscar'
}) {
  return (
    <div className="row g-2">
      <div className={showDate ? 'col-12 col-md-6' : 'col-12'}>
        <label className="form-label mb-1">{labelText}</label>
        <input
          type="text"
          className="form-control"
          placeholder={placeholder}
          value={query}                                 // input controlado
          onChange={(e) => onQueryChange(e.target.value)} // propago cambios al padre
        />
      </div>

      {showDate && ( // renderizo fecha solo si se solicita
        <div className="col-12 col-md-3">
          <label className="form-label mb-1">Fecha</label>
          <input
            type="date"
            className="form-control"
            value={dateValue}                             // date controlado
            onChange={(e) => onDateChange(e.target.value)} // propago cambio de fecha
          />
        </div>
      )}
    </div>
  );
}

/* -----------------------------------------
   Imports y props
   - query (prop): texto de búsqueda actual.
   - onQueryChange (prop): callback que recibe el nuevo texto de búsqueda.
   - placeholder (prop): texto guía del campo de búsqueda.
   - showDate (prop): habilita/deshabilita el filtro por fecha.
   - dateValue (prop): valor actual del input tipo date (YYYY-MM-DD).
   - onDateChange (prop): callback que recibe la nueva fecha seleccionada.
   - labelText (prop): etiqueta a mostrar sobre el campo de búsqueda.
----------------------------------------- */
