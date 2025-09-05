import { Link } from 'react-router-dom';

const DIAS_ORDEN = ['lunes','martes','miércoles','jueves','viernes','sábado','domingo'];
const idxDia = (d) => DIAS_ORDEN.indexOf((d || '').toString().toLowerCase());

// items: disponibilidades SOLO de ese profesional
export default function ProfesionalWeekView({ profesional, items = [], onDelete }) {
  // Agrupar por día y ordenar por hora
  const map = items.reduce((acc, d) => {
    const k = (d.diaSemana || '').toLowerCase();
    acc[k] = acc[k] || [];
    acc[k].push(d);
    return acc;
  }, {});

  const dias = DIAS_ORDEN.map(d => ({
    dia: d,
    rangos: (map[d] || []).sort((a,b) => (a.horaInicio || '').localeCompare(b.horaInicio || ''))
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
            {profesional?.email ? ` — ${profesional.email}` : ''}
          </h5>
        </div>

        <div className="row g-3">
          {dias.map(({ dia, rangos }) => (
            <div key={dia} className="col-12 col-md-6 col-lg-4">
              <div className="border rounded p-2 h-100">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <div className="fw-semibold text-capitalize">{dia}</div>
                  <span className={`badge ${rangos.length ? 'bg-success' : 'bg-secondary'}`}>
                    {rangos.length}
                  </span>
                </div>
                {rangos.length === 0 ? (
                  <div className="text-muted small">Sin rangos</div>
                ) : (
                  <ul className="mb-0 ps-3 small">
                    {rangos.map(r => (
                      <li key={r._id || `${r.horaInicio}-${r.horaFin}`}>
                        {r.horaInicio} — {r.horaFin}{' '}
                        <Link to={`/disponibilidad/${r._id}/editar`} className="btn btn-link btn-sm p-0 ms-1">
                          Editar
                        </Link>
                        <button
                          type="button"
                          className="btn btn-link btn-sm text-danger p-0 ms-2"
                          onClick={() => onDelete && onDelete(r._id)}
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
