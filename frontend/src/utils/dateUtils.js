// Formatea un ISO (o Date-compatible) a "DD/MM/AAAA" (es-AR).
export const formatFecha = (iso) => {
  const d = iso ? new Date(iso) : null;                     // creo Date solo si viene valor
  return (d && !isNaN(d)) ? d.toLocaleDateString('es-AR')   // si es válido, formateo con locale argentino
                          : '-';                             // fallback cuando no hay fecha/fecha inválida
};

// Extrae "YYYY-MM-DD" de un ISO/Date para comparaciones exactas por fecha.
export const toYYYYMMDD = (iso) => {
  if (!iso) return '';                       // sin valor → cadena vacía
  const d = new Date(iso);                   // admito ISO o Date-compatible
  if (isNaN(d)) return '';                   // fecha inválida → cadena vacía
  return d.toISOString().slice(0, 10);       // tomo la parte de fecha en UTC (YYYY-MM-DD)
};


