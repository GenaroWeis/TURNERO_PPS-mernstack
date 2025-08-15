import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { listProfesionales, removeProfesional } from '../services/profesionalService';

function ProfesionalesPage() {
  const [profesionales, setProfesionales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const location = useLocation();

  const fetchData = async () => {
    try {
      setLoading(true);
      const items = await listProfesionales();
      setProfesionales(items);
      setError('');
    } catch (err) {
      const msg = err?.response?.data?.message || 'No se pudieron cargar los profesionales.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(); // <--- cargar al montar
  }, []);

  useEffect(() => {
    if (location.state?.message) {
      setMessage(location.state.message);
      // limpiamos el state de navegación para que no reaparezca al refrescar
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const handleDelete = async (id) => {
    const ok = window.confirm('¿Eliminar este profesional? Esta acción no se puede deshacer.');
    if (!ok) return;
    try {
      const done = await removeProfesional(id); // true si 204
      if (done) {
        setMessage('Profesional eliminado correctamente.');
        await fetchData();
      } else {
        setError('No se pudo eliminar el profesional.');
      }
    } catch (err) {
      const msg = err?.response?.data?.message || 'No se pudo eliminar el profesional.';
      setError(msg);
    }
  };

  if (loading) return <div className="container py-3">Cargando...</div>;

  return (
    <div className="container py-3">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1 className="h3 m-0">Profesionales</h1>
        <Link to="/profesionales/nuevo" className="btn btn-primary">Nuevo profesional</Link>
      </div>

      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-danger">{error}</div>}

      {profesionales.length === 0 ? (
        <div className="alert alert-info">No hay profesionales cargados.</div>
      ) : (
        <div className="table-responsive">
          <table className="table table-striped align-middle">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Especialidad</th>
                <th>Email</th>
                <th>Teléfono</th>
                <th style={{ width: 160 }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {profesionales.map((p) => (
                <tr key={p._id}>
                  <td>{p.nombre}</td>
                  <td>{p.especialidad}</td>
                  <td>{p.email}</td>
                  <td>{p.telefono}</td>
                  <td>
                    <Link to={`/profesionales/${p._id}/editar`} className="btn btn-sm btn-secondary me-2">
                      Editar
                    </Link>
                    <button onClick={() => handleDelete(p._id)} className="btn btn-sm btn-danger">
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

export default ProfesionalesPage;
