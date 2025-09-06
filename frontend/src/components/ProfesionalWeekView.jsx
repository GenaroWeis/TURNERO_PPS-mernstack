// Vista semanal de disponibilidad de un profesional: agrupo rangos por día, los ordeno por hora y muestro acciones de editar/eliminar.

import { Link } from 'react-router-dom';

const DIAS_ORDEN = ['lunes','martes','miércoles','jueves','viernes','sábado','domingo'];
const idxDia = (d) => DIAS_ORDEN.indexOf((d || '').toString().toLowerCase()); // índice del día según orden estándar (helper)

// items: disponibilidades SOLO de ese profesional
export default function ProfesionalWeekView({ profesional, items = [], onDelete }) {
  // Agrupar por día y ordenar por hora
  const map = items.reduce((acc, d) => {
    const k = (d.diaSemana || '').toLowerCase(); // clave canónica del día
    acc[k] = acc[k] || [];                       // inicializo array si no existe
    acc[k].push(d);                              // acumulo el rango en su día
    return acc;
  }, {});

  const dias = DIAS_ORDEN.map((d) => ({
    dia: d,
    rangos: (map[d] || []).sort((a, b) =>
      (a.horaInicio || '').localeCompare(b.horaInicio || '') // orden ascendente por hora de inicio
    ),
  }));

  return (
    <div className="card">
      <div className="card-body">
        <div className="mb-3">
          <h5 className="card-title m-0">
            {profesional?.nombre}
            {profesional?.especialidad ? (
              <span className="text-primary"> ({profesional.especialidad})</span>
            ) : null}
            {profesional?.email ? ` — ${profesional.email}` : ''} {/* complemento de info (opcional) */}
          </h5>
        </div>

        <div className="row g-3">
          {dias.map(({ dia, rangos }) => (
            <div key={dia} className="col-12 col-md-6 col-lg-4">
              <div className="border rounded p-2 h-100">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <div className="fw-semibold text-capitalize">{dia}</div>
                  <span className={`badge ${rangos.length ? 'bg-success' : 'bg-secondary'}`}>
                    {rangos.length} {/* cantidad de rangos del día */}
                  </span>
                </div>

                {rangos.length === 0 ? (
                  <div className="text-muted small">Sin rangos</div>
                ) : (
                  <ul className="mb-0 ps-3 small">
                    {rangos.map((r) => (
                      <li key={r._id || `${r.horaInicio}-${r.horaFin}`}>
                        {r.horaInicio} — {r.horaFin}{' '}
                        <Link
                          to={`/disponibilidad/${r._id}/editar`}
                          className="btn btn-link btn-sm p-0 ms-1"
                        >
                          Editar
                        </Link>
                        <button
                          type="button"
                          className="btn btn-link btn-sm text-danger p-0 ms-2"
                          onClick={() => onDelete && onDelete(r._id)} // notifico eliminación al padre
                        >
                          Eliminar
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* -----------------------------------------
   Imports y props
   - Link: componente de react-router-dom para navegación interna con estado de SPA.
   - DIAS_ORDEN: array con los nombres de los días en el orden estándar de visualización.
   - idxDia(d): helper que obtiene el índice de un día dentro de DIAS_ORDEN (no se utiliza en este render).
   - profesional (prop): objeto con datos del profesional (nombre, especialidad, email).
   - items (prop): array de disponibilidades del profesional [{ _id, diaSemana, horaInicio, horaFin }, ...].
   - onDelete (prop): callback para eliminar un rango por _id.
----------------------------------------- */
