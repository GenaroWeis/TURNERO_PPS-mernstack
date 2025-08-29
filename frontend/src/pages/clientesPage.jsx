import { useEffect, useState } from 'react';
// useState → para manejar estado dentro del componente
// useEffect → para ejecutar código en momentos específicos del ciclo de vida del componente
import { Link, useLocation } from 'react-router-dom';
// Link → para crear enlaces internos sin recargar la página
// useLocation → nos permite acceder al estado de la navegación (por ejemplo mensajes enviados al volver de otra página)
import { listClientes, removeCliente } from '../services/clienteService';
// importamos las funciones del service de clientes

function ClientesPage() {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const location = useLocation();

  // FUNCION PARA TRAER LOS CLIENTES DEL BACKEND
  const fetchData = async () => {
    try {
      setLoading(true); // Indicamos que estamos cargando
      setError(''); // Limpiamos errores anteriores
      const items = await listClientes(); // pedimos los clientes al backend
      setClientes(items); // guardamos la lista
    } catch (err) {
      const msg = err?.response?.data?.message || 'No se pudieron cargar los clientes.'; // Intentamos obtener mensaje del backend, si no usamos uno genérico
      setError(msg); // Guardamos el error en el estado
      setClientes([]); // Limpiamos la lista para no mostrar datos incompletos
    } finally {
      setLoading(false); // Indicamos que ya terminó de cargar, haya habido error o no
    }
  };

  // Ejecutamos fetchData al montar el componente
  useEffect(() => {
    fetchData();
  }, []);

  // Mostramos mensaje que venga de otra página
  useEffect(() => {
    if (location.state?.message) {
      setMessage(location.state.message); // Mostramos el mensaje al usuario
      window.history.replaceState({}, document.title); // Limpiamos el state de navegación
    }
  }, [location.state]);

  // FUNCION PARA ELIMINAR UN CLIENTE
  const handleDelete = async (id) => {
    const ok = window.confirm('¿Eliminar este cliente? Esta acción no se puede deshacer.');
    if (!ok) return; // Si el usuario cancela, salimos
    try {
      const done = await removeCliente(id); // Llamamos al service para eliminar
      if (done) {
        setMessage('Cliente eliminado correctamente.'); // Mensaje de éxito
        await fetchData(); // Recargamos la lista
      } else {
        setError('No se pudo eliminar el cliente.'); // Mensaje genérico si algo falló
      }
    } catch (err) {
      const msg = err?.response?.data?.message || 'No se pudo eliminar el cliente.'; // Obtenemos mensaje de error
      setError(msg); // Guardamos el error en el estado
    }
  };

  if (loading) return <div className="container py-3">Cargando...</div>;

  return (
    <div className="container py-3">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1 className="h3 m-0">Clientes</h1>
        <Link to="/clientes/nuevo" className="btn btn-primary">Nuevo cliente</Link>
      </div>

      {/* mostramos primero errores generales */}
      {error && <div className="alert alert-danger">{error}</div>}

      {/* mensaje de éxito */}
      {message && <div className="alert alert-success">{message}</div>}

      {clientes.length === 0 && !error ? ( // mostramos info solo si no hay error
        <div className="alert alert-info">No hay clientes cargados.</div>
      ) : (
        <div className="table-responsive">
          <table className="table table-striped align-middle">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Apellido</th>
                <th>Email</th>
                <th>Teléfono</th>
                <th>DNI</th>
                <th>Dirección</th>
                <th style={{ width: 160 }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {clientes.map((c) => (
                <tr key={c._id}>
                  <td>{c.nombre}</td>
                  <td>{c.apellido}</td>
                  <td>{c.email}</td>
                  <td>{c.telefono}</td>
                  <td>{c.dni || '-'}</td>
                  <td>{c.direccion || '-'}</td>
                  <td>
                    <Link to={`/clientes/${c._id}/editar`} className="btn btn-sm btn-secondary me-2">
                      Editar
                    </Link>
                    <button onClick={() => handleDelete(c._id)} className="btn btn-sm btn-danger">
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

export default ClientesPage;
