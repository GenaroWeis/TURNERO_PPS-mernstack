import { useEffect,  useMemo, useState } from 'react';
// useState → estado local
// useMemo → para calcular vista filtrada/ordenada sin recalcular de más
// useEffect → efectos al montar/actualizar
import { Link, useLocation } from 'react-router-dom';
// Link → navegación interna
// useLocation → leer mensajes pasados por navigate
import { listTurnos, removeTurno } from '../services/turnoService';
// funciones del service de turnos

function TurnosPage() {
  const [turnos, setTurnos] = useState([]);       // lista completa
  const [loading, setLoading] = useState(true);   // loader
  const [error, setError] = useState('');         // error general
  const [message, setMessage] = useState('');     // mensaje de éxito
  const [estadoFilter, setEstadoFilter] = useState(''); // filtro por estado
  const [query, setQuery] = useState('');         // búsqueda por profesional/cliente
  const location = useLocation();

  // Helpers de presentación
  const formatFecha = (iso) => {
    // formateo seguro de fecha a es-AR; si falla, mostramos '-'
    const d = iso ? new Date(iso) : null;
    return (d && !isNaN(d)) ? d.toLocaleDateString('es-AR') : '-';
  };

  const formatHora = (h) => h || '-'; // hora ya viene HH:mm

  const estadoBadgeClass = (estado) => {
    // mapeo simple a clases de Bootstrap
    if (estado === 'confirmado') return 'badge bg-success';
    if (estado === 'cancelado') return 'badge bg-danger';
    return 'badge bg-secondary'; // pendiente u otro
  };

  // profesional: Nombre (Especialidad) — email
  const renderProfesional = (p) => {
    if (!p) return '-';
    const nombre = p.nombre || '-';
    const esp = p.especialidad ? (
      <span className="text-primary"> ({p.especialidad})</span> // color sutil para lo entre paréntesis
    ) : null;
    return (
      <>
        {nombre}{esp}{p.email ? ` — ${p.email}` : ''}
      </>
    );
  };

  // cliente: Nombre (DNI 123... / email)
  const renderCliente = (c) => {
    if (!c) return '-';
    const nombre = c.nombre || '-';
    const extra = c.dni
      ? <span className="text-primary"> (DNI {c.dni})</span>   // color sutil para DNI entre paréntesis
      : (c.email ? ` (${c.email})` : '');
    return <>{nombre}{extra}</>;
  };

  // Traer turnos del backend
  const fetchData = async () => {
    try {
      setLoading(true); // comenzamos a cargar
      setError(''); // limpiamos errores previos
      const items = await listTurnos(); // pedimos al backend
      setTurnos(items); // guardamos la lista
    } catch (err) {
      const msg = err?.response?.data?.message || 'No se pudieron cargar los turnos.';
      setError(msg); // error general
      setTurnos([]); // limpiamos lista para no mostrar datos incompletos
    } finally {
      setLoading(false); // fin del loader
    }
  };

  // Cargar al montar
  useEffect(() => {
    fetchData();
  }, []);

  // Mensaje de éxito pasado por navigate (crear/editar/eliminar)
  useEffect(() => {
    if (location.state?.message) {
      setMessage(location.state.message);
      window.history.replaceState({}, document.title); // limpiar para que no reaparezca al refrescar
    }
  }, [location.state]);

  // Eliminar turno
  const handleDelete = async (id) => {
    const ok = window.confirm('¿Eliminar este turno? Esta acción no se puede deshacer.');
    if (!ok) return;
    try {
      const done = await removeTurno(id); // true si 204
      if (done) {
        setMessage('Turno eliminado correctamente.');
        await fetchData(); // recargar lista
      } else {
        setError('No se pudo eliminar el turno.');
      }
    } catch (err) {
      const msg = err?.response?.data?.message || 'No se pudo eliminar el turno.';
      setError(msg);
    }
  };

  // Vista filtrada y ordenada (orden asc por fecha y hora)
  const viewTurnos = useMemo(() => {
    const q = query.trim().toLowerCase();

    // filtro por estado (si se eligió alguno)
    let filtered = estadoFilter
      ? turnos.filter(t => (t.estado || 'pendiente') === estadoFilter)
      : [...turnos];

    // búsqueda simple por profesional/cliente (nombre, especialidad, email, dni)
    if (q) {
      filtered = filtered.filter(t => {
        const profNombre = t.profesional?.nombre?.toLowerCase() || '';
        const profEsp = t.profesional?.especialidad?.toLowerCase() || '';
        const profEmail = t.profesional?.email?.toLowerCase() || '';
        const cliNombre = t.cliente?.nombre?.toLowerCase() || '';
        const cliEmail = t.cliente?.email?.toLowerCase() || '';
        const cliDni = t.cliente?.dni?.toLowerCase?.() || String(t.cliente?.dni || '').toLowerCase();
        return (
          profNombre.includes(q) ||
          profEsp.includes(q) ||
          profEmail.includes(q) ||
          cliNombre.includes(q) ||
          cliEmail.includes(q) ||
          cliDni.includes(q)
        );
      });
    }

    // orden ascendente por fecha y luego hora
    filtered.sort((a, b) => {
      const da = a.fecha ? new Date(a.fecha).getTime() : 0;
      const db = b.fecha ? new Date(b.fecha).getTime() : 0;
      if (da !== db) return da - db;// hora viene "HH:mm" → sort de string funciona si está cero-pad
      const ha = a.hora || '';
      const hb = b.hora || '';
      return ha.localeCompare(hb);
    });

    return filtered;
  }, [turnos, estadoFilter, query]);

  if (loading) return <div className="container py-3">Cargando...</div>;

    return (
    <div className="container py-3">
      {/* Header con botón */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1 className="h3 m-0">Turnos</h1>
        <Link to="/turnos/nuevo" className="btn btn-primary">Nuevo turno</Link>
      </div>

      {/* Filtros: búsqueda + estado */}
      <div className="row g-2 mb-3">
        <div className="col-12 col-md-6">
          <label className="form-label mb-1">Buscar por profesional o cliente</label>
          <input
            type="text"
            className="form-control"
            placeholder="Ej: Julieta, Colorista, juan@correo, 46613030"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="col-12 col-md-3">
          <label className="form-label mb-1">Estado</label>
          <select
            className="form-select"
            value={estadoFilter}
            onChange={(e) => setEstadoFilter(e.target.value)}
          >
            <option value="">Todos</option>
            <option value="pendiente">Pendiente</option>
            <option value="confirmado">Confirmado</option>
            <option value="cancelado">Cancelado</option>
          </select>
        </div>
      </div>

      {/* Errores y mensajes */}
      {error && <div className="alert alert-danger">{error}</div>}
      {message && <div className="alert alert-success">{message}</div>}

      {viewTurnos.length === 0 && !error ? (
        <div className="alert alert-info">No hay turnos que coincidan con el filtro.</div>
      ) : (
        <div className="table-responsive">
          <table className="table table-striped align-middle">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Hora</th>
                <th>Estado</th>
                <th>Profesional</th>
                <th>Cliente</th>
                <th style={{ width: 160 }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {viewTurnos.map((t) => (
                <tr key={t._id}>
                  <td>{formatFecha(t.fecha)}</td>
                  <td>{formatHora(t.hora)}</td>
                  <td>
                    <span className={estadoBadgeClass(t.estado)}>
                      {t.estado || 'pendiente'}
                    </span>
                  </td>
                  <td>{renderProfesional(t.profesional)}</td>
                  <td>{renderCliente(t.cliente)}</td>
                  <td>
                    <Link to={`/turnos/${t._id}/editar`} className="btn btn-sm btn-secondary me-2">
                      Editar
                    </Link>
                    <button onClick={() => handleDelete(t._id)} className="btn btn-sm btn-danger">
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}


export default TurnosPage;
