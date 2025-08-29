import { useEffect, useState } from 'react';
// useState → para manejar estado dentro del componente
// useEffect → para ejecutar código en momentos específicos del ciclo de vida del componente
import { Link, useLocation } from 'react-router-dom';
// Link → para crear enlaces internos sin recargar la página
// useLocation → nos permite acceder al estado de la navegación (por ejemplo mensajes enviados al volver de otra página)
import { listProfesionales, removeProfesional } from '../services/profesionalService';
//las 2 que se usan acá. las otras estan en formpage

//DEFINIR EL COMPONENTE PRINCIPAL DE LA PAGINA
function ProfesionalesPage() {
  const [profesionales, setProfesionales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const location = useLocation();

// FUNCION PARA TRAER LOS PROFESIONALES DEL BACKEND
  const fetchData = async () => {
    try {
      setLoading(true);// Indicamos que estamos cargando
      setError(''); // limpiamos errores anteriores
      const items = await listProfesionales(); // pedimos los profesionales al backend
      setProfesionales(items); // guardamos la lista
    } catch (err) {
      const msg = err?.response?.data?.message || 'No se pudieron cargar los profesionales.';// Intentamos obtener un mensaje del backend, si no existe usamos uno genérico
      setError(msg);// Guardamos el mensaje de error en el estado
      setProfesionales([]); // limpiamos la lista para no mostrar datos incompletos
    } finally {
      setLoading(false);// Indicamos que ya terminó de cargar, haya habido error o no
    }
  };


  useEffect(() => {
    fetchData(); // Ejecutamos fetchData al montar el componente
  }, []);  // Esto se ejecuta solo una vez al montar

  useEffect(() => {
    if (location.state?.message) {// Si venimos de otra página con un mensaje en el state
      setMessage(location.state.message);// Mostramos ese mensaje al usuario
      window.history.replaceState({}, document.title);// Limpiamos el state de navegación para que no reaparezca al refrescar
    }
  }, [location.state]);// Este efecto se ejecuta cada vez que cambia location.state


  //FUNCION PARA ELIMINAR UN PROFESIONAL
  const handleDelete = async (id) => {
    const ok = window.confirm('¿Eliminar este profesional? Esta acción no se puede deshacer.');// Mostramos confirmación de eliminación
    if (!ok) return;// Si el usuario cancela, salimos
    try {
      const done = await removeProfesional(id); // Llamamos al service para eliminar, devuelve true si fue exitoso (204)
      if (done) {
        setMessage('Profesional eliminado correctamente.');// Mostramos mensaje de éxito
        await fetchData();// Recargamos la lista para reflejar los cambios
      } else {
        setError('No se pudo eliminar el profesional.');// Mensaje genérico si algo falló
      }
    } catch (err) {
      const msg = err?.response?.data?.message || 'No se pudo eliminar el profesional.';// Obtenemos mensaje de error del backend o usamos uno genérico
      setError(msg);// Guardamos el error en el estado
    }
  };

  if (loading) return <div className="container py-3">Cargando...</div>;

    return (
    <div className="container py-3">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1 className="h3 m-0">Profesionales</h1>
        <Link to="/profesionales/nuevo" className="btn btn-primary">Nuevo profesional</Link>
      </div>

      {/* mostramos primero errores generales */}
      {error && <div className="alert alert-danger">{error}</div>}

      {/* mensaje de éxito */}
      {message && <div className="alert alert-success">{message}</div>}

      {profesionales.length === 0 && !error ? ( // mostramos info solo si no hay error
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
