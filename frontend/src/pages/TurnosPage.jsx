import { useEffect, useMemo , useState } from 'react';
// useState → estado local
// useMemo → para calcular vista filtrada/ordenada sin recalcular de más
// useEffect → efectos al montar/actualizar
import { Link, useLocation } from 'react-router-dom';
// Link → navegación interna
// useLocation → leer mensajes pasados por navigate
import { listTurnos, removeTurno } from '../services/turnoService';

import SearchBar from '../components/SearchBar';
import EstadoFilter from '../components/EstadoFilter';
import EstadoBadge from '../components/EstadoBadge'

import { formatFecha, toYYYYMMDD } from '../utils/dateUtils';
import { includesSome, normalize } from '../utils/searchUtils';

function TurnosPage() {
  const [turnos, setTurnos] = useState([]);       // lista completa
  const [loading, setLoading] = useState(true);   // loader
  const [error, setError] = useState('');         // error general
  const [message, setMessage] = useState('');     // mensaje de éxito

  const [estadoFilter, setEstadoFilter] = useState(''); // filtro por estado
  const [query, setQuery] = useState('');         // búsqueda por profesional/cliente
  const [dateFilter, setDateFilter] = useState(''); // YYYY-MM-DD

  const location = useLocation();


  const formatHora = (h) => h || '-'; // hora ya viene HH:mm

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
      ? <span className="text-primary"> (DNI {c.dni})</span> // color sutil para lo entre paréntesis
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
  useEffect(() => { fetchData(); }, []);

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

 // Filtrado + orden
  const viewTurnos = useMemo(() => {
    let filtered = [...turnos];

    // 1) Estado
    if (estadoFilter) {
      filtered = filtered.filter(t => (t.estado || 'pendiente') === estadoFilter);
    }

    // 2) Fecha exacta (si se eligió en el date picker)
    if (dateFilter) {
      filtered = filtered.filter(t => toYYYYMMDD(t.fecha) === dateFilter);
    }

    // 3) Búsqueda de texto (prof/cli/dni/email/especialidad + fecha formateada)
    const q = query.trim();
    if (q) {
      filtered = filtered.filter(t => {
        const prof = t.profesional || {};
        const cli  = t.cliente || {};

        // Campos a matchear
        const fields = [
          prof.nombre, prof.especialidad, prof.email,
          cli.nombre, cli.email,
          String(cli.dni ?? ''),
          // también dejamos que matchee por fecha mostrada
          formatFecha(t.fecha),
          // y por hora si quisieras
          t.hora,
        ];
        return includesSome(q, fields);
      });
    }

    // 4) Orden: por fecha y hora asc
    filtered.sort((a, b) => {
      const da = a.fecha ? new Date(a.fecha).getTime() : 0;
      const db = b.fecha ? new Date(b.fecha).getTime() : 0;
      if (da !== db) return da - db;
      const ha = a.hora || '';
      const hb = b.hora || '';
      return ha.localeCompare(hb);
    });

    return filtered;
  }, [turnos, estadoFilter, dateFilter, query]);

  if (loading) return <div className="container py-3">Cargando...</div>;

  return (
    <div className="container py-3">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1 className="h3 m-0">Turnos</h1>
        <Link to="/turnos/nuevo" className="btn btn-primary">Nuevo turno</Link>
      </div>

      {/* Filtros */}
      <div className="row g-2 mb-3">
        <div className="col-12 col-md-9">
          <SearchBar
            labelText="Buscar por profesional, profesión, cliente, DNI o fecha"
            placeholder="Ej: Julieta, Colorista, juan@correo, 46613030, 12/09/2025"
            query={query}
            onQueryChange={setQuery}
            showDate
            dateValue={dateFilter}
            onDateChange={setDateFilter}
          />
        </div>
        <div className="col-12 col-md-3">
          <EstadoFilter value={estadoFilter} onChange={setEstadoFilter} />
        </div>
      </div>

      {/* Mensajes */}
      {error && <div className="alert alert-danger">{error}</div>}
      {message && <div className="alert alert-success">{message}</div>}

      {/* Tabla */}
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
                  <td><EstadoBadge estado={t.estado} /></td>
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
