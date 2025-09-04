import { useEffect, useState } from 'react';
// useState → para manejar estado dentro del componente
// useEffect → para ejecutar código en momentos específicos del ciclo de vida del componente
import { useNavigate, useParams, Link } from 'react-router-dom';
// useNavigate → permite redirigir programáticamente a otra ruta
// useParams → obtiene parámetros de la URL, como el id del profesional
// Link → para generar enlaces que no recargan la página
import {getClienteById, createCliente, updateCliente } from '../services/clienteService';
import { parseApiErrors } from '../utils/parseApiErrors';
import InputField from '../components/InputField';

// Estado inicial del formulario: todos los campos vacíos
const initialForm = {
  nombre: '',
  apellido: '',
  email: '',
  telefono: '',
  dni: '',
  direccion: '',
};

function ClienteFormPage() {
  const { id } = useParams(); // si existe -> estamos editando un cliente
  const navigate = useNavigate(); // para redirigir luego de crear/editar

  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(Boolean(id));
  const [submitting, setSubmitting] = useState(false);
  const isEdit = Boolean(id);

  useEffect(() => {
    const load = async () => {
      try {
        if (!id) return; // Si no hay id, es creación → no cargamos nada
        const data = await getClienteById(id); // Llamamos al backend para traer los datos
        setForm({
          nombre: data.nombre || '',
          apellido: data.apellido || '',
          email: data.email || '',
          telefono: data.telefono || '',
          dni: data.dni || '',
          direccion: data.direccion || '',
        });
        // Actualizamos el formulario con los datos recibidos
      } catch (err) {
        // Si falla, volvemos al listado con un error
        navigate('/clientes', { state: { message: 'No se pudo cargar el cliente.' } });
      } finally {
        setLoading(false);// Terminamos de cargar
      }
    };
    load();
  }, [id, navigate]);// esto se ejecuta al montar el componente o si cambia el id

  const validate = () => {
    const e = {};
    if (!form.nombre.trim()) e.nombre = 'El nombre es obligatorio.';
    if (!form.apellido.trim()) e.apellido = 'El apellido es obligatorio.';
    if (!form.email.trim()) e.email = 'El email es obligatorio.';
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = 'Formato de email inválido.';
    if (!form.telefono.trim()) e.telefono = 'El teléfono es obligatorio.';
    if (!form.dni.trim()) e.dni = 'El DNI es obligatorio.';
    if (!form.direccion.trim()) e.direccion = 'La dirección es obligatoria.';
    // Validaciones básicas del front: no vacíos y formato de email 
    setErrors(e);
    return Object.keys(e).length === 0;
    // Devuelve true si no hay errores (longitud 0)
  };

  const handleChange = (ev) => {
    const { name, value } = ev.target;
    setForm((prev) => ({ ...prev, [name]: value }));// Actualizamos el campo que cambió sin tocar los otros
    setErrors((prev) => ({ ...prev, [name]: undefined, _general: undefined }));// Limpiamos el error de este campo en tiempo real
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();// Evita que la página se recargue
    if (submitting) return;// prevenimos doble submit
    setSubmitting(true);
    setErrors({});// limpiamos errores anteriores

    if (!validate()) { setSubmitting(false); return; }// Validación rápida de UX antes de llamar al backend

    try {
      if (isEdit) {
        await updateCliente(id, form);// Actualizamos el cliente en el backend
        navigate('/clientes', { state: { message: 'Cliente actualizado correctamente.' } });// Redirigimos al listado con mensaje de éxito
      } else {
        await createCliente(form);// Creamos un nuevo cliente en el backend
        navigate('/clientes', { state: { message: 'Cliente creado correctamente.' } });// Redirigimos al listado con mensaje de éxito
      }
    } catch (err) {
      const fieldMap = parseApiErrors(err);
      setErrors(fieldMap);// Si hay errores del backend, los mostramos por campo
    } finally {
      setSubmitting(false);// Terminamos de enviar, para reactivar botones
    }
  };

  if (loading) return <div className="container py-3">Cargando...</div>;// Mientras estamos cargando datos (solo en edición), mostramos cartel y no renderizamos el form

  return (
    <div className="container py-3">
      <h1 className="h3 mb-3">{isEdit ? 'Editar Cliente' : 'Nuevo Cliente'}</h1>

      {errors._general && <div className="alert alert-danger">{errors._general}</div>}

      <form onSubmit={handleSubmit} noValidate>
        <InputField
          label="Nombre"
          name="nombre"
          value={form.nombre}
          onChange={handleChange}
          error={errors.nombre}
          placeholder="Ej: Julieta"
        />

        <InputField
          label="Apellido"
          name="apellido"
          value={form.apellido}
          onChange={handleChange}
          error={errors.apellido}
          placeholder="Ej: Romeo"
        />

        <InputField
          label="Email"
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          error={errors.email}
          placeholder="ejemplo@mail.com"
        />

        <InputField
          label="Teléfono"
          name="telefono"
          value={form.telefono}
          onChange={handleChange}
          error={errors.telefono}
          placeholder="Ej: 351-555-1234"
        />

        <InputField
          label="DNI"
          name="dni"
          value={form.dni}
          onChange={handleChange}
          error={errors.dni}
          placeholder="Solo números"
        />

        <InputField
          label="Dirección"
          name="direccion"
          value={form.direccion}
          onChange={handleChange}
          error={errors.direccion}
          placeholder="Calle 123, Barrio..."
        />

        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? 'Guardando...' : isEdit ? 'Actualizar' : 'Crear'}
        </button>
        <Link to="/clientes" className="btn btn-secondary ms-2">Cancelar</Link>
      </form>
    </div>
  );
}

export default ClienteFormPage;
