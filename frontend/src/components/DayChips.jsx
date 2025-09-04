// Muestro chips (badges) para los 7 días en el orden definido.
// Pinto cada día en verde si está disponible; en gris si no.

import { DIAS_ORDEN, normalizeDia } from '../utils/scheduleUtils';

export default function DayChips({ availableDaysSet }) {
  return (
    <div className="d-flex flex-wrap gap-2">
      {DIAS_ORDEN.map((lbl) => {
        const ok = availableDaysSet?.has(normalizeDia(lbl)); // chequeo disponibilidad del día normalizado
        return (
          <span
            key={lbl} // key estable por día
            className={`badge ${ok ? 'bg-success' : 'bg-secondary'}`} // estilo según disponibilidad
            title={ok ? 'Disponible' : 'Sin disponibilidad'} // tooltip accesible
          >
            {lbl}
          </span>
        );
      })}
    </div>
  );
}

/* -----------------------------------------
   Imports y props (qué es cada cosa)
   - DIAS_ORDEN: array con los nombres de los días en el orden estándar de visualización.
   - normalizeDia: función que normaliza el nombre del día a un formato consistente para comparar.
   - availableDaysSet (prop): Set de strings con días ya normalizados (ej.: "lunes", "martes").
----------------------------------------- */

