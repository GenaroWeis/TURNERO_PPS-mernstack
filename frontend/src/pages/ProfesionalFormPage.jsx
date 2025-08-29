import { useEffect, useState } from 'react';
// useState → para manejar estado dentro del componente
// useEffect → para ejecutar código en momentos específicos del ciclo de vida del componente
import { useNavigate, useParams, Link } from 'react-router-dom';
// useNavigate → permite redirigir programáticamente a otra ruta
// useParams → obtiene parámetros de la URL, como el id del profesional
// Link → para generar enlaces que no recargan la página
import {
  getProfesionalById,
  createProfesional,
  updateProfesional,
} from '../services/profesionalService';
// Importamos funciones del service para interactuar con el backend
import { parseApiErrors } from '../utils/parseApiErrors';
// importamos el adaptador de errores

// Estado inicial del formulario: todos los campos vacíos
const initialForm = {
  nombre: '',
  especialidad: '',
  email: '',
  telefono: '',
};

function ProfesionalFormPage() {
  const { id } = useParams(); // si existe -> estamos editando un profesional
  const navigate = useNavigate(); // para redirigir luego de crear/editar

  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(Boolean(id));
  const [submitting, setSubmitting] = useState(false); // <--- opcional
  const isEdit = Boolean(id);

  useEffect(() => {
    const load = async () => {
      try {
        if (!id) return;// Si no hay id, es creación → no cargamos nada
        const data = await getProfesionalById(id); // Llamamos al backend para traer los datos del profesional
        setForm({
          nombre: data.nombre || '',
          especialidad: data.especialidad || '',
          email: data.email || '',
          telefono: data.telefono || '',
        });
        // Actualizamos el formulario con los datos recibidos
      } catch (err) {
        // Si falla, volvemos al listado con un error
        navigate('/profesionales', { state: { message: 'No se pudo cargar el profesional.' } });
      } finally {
        setLoading(false);// Terminamos de cargar
      }
    };
    load();
  }, [id, navigate]);// esto se ejecuta al montar el componente o si cambia el id

  const validate = () => {
    const e = {};
    if (!form.nombre.trim()) e.nombre = 'El nombre es obligatorio.';
    if (!form.especialidad.trim()) e.especialidad = 'La especialidad es obligatoria.';
    if (!form.email.trim()) e.email = 'El email es obligatorio.';
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = 'Formato de email inválido.';
    if (!form.telefono.trim()) e.telefono = 'El teléfono es obligatorio.';
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
    if (submitting) return; // prevenimos doble submit
    setSubmitting(true);
    setErrors({}); // limpiamos errores anteriores

    if (!validate()) { setSubmitting(false); return; }// Validación rápida de UX antes de llamar al backend

    try {
      if (isEdit) {
        await updateProfesional(id, form); // Actualizamos el profesional en el backend
        navigate('/profesionales', { state: { message: 'Profesional actualizado correctamente.' } });// Redirigimos al listado con mensaje de éxito
      } else {
        await createProfesional(form);// Creamos un nuevo profesional en el backend
        navigate('/profesionales', { state: { message: 'Profesional creado correctamente.' } });// Redirigimos al listado con mensaje de éxito
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
      <h1 className="h3 mb-3">{isEdit ? 'Editar Profesional' : 'Nuevo Profesional'}</h1>

      {/* mensaje general de error del backend */}
      {errors._general && <div className="alert alert-danger">{errors._general}</div>}

      <form onSubmit={handleSubmit} noValidate>
        <div className="mb-3">
          <label className="form-label">Nombre</label>
          <input
            type="text"
            name="nombre"
            className={`form-control ${errors.nombre ? 'is-invalid' : ''}`}
            value={form.nombre}
            onChange={handleChange}
          />
          {errors.nombre && <div className="invalid-feedback">{errors.nombre}</div>}
        </div>

        <div className="mb-3">
          <label className="form-label">Especialidad</label>
          <input
            type="text"
            name="especialidad"
            className={`form-control ${errors.especialidad ? 'is-invalid' : ''}`}
            value={form.especialidad}
            onChange={handleChange}
          />
          {errors.especialidad && <div className="invalid-feedback">{errors.especialidad}</div>}
        </div>

        <div className="mb-3">
          <label className="form-label">Email</label>
          <input
            type="email"
            name="email"
            className={`form-control ${errors.email ? 'is-invalid' : ''}`}
            value={form.email}
            onChange={handleChange}
          />
          {errors.email && <div className="invalid-feedback">{errors.email}</div>}
        </div>

        <div className="mb-3">
          <label className="form-label">Teléfono</label>
          <input
            type="text"
            name="telefono"
            className={`form-control ${errors.telefono ? 'is-invalid' : ''}`}
            value={form.telefono}
            onChange={handleChange}
          />
          {errors.telefono && <div className="invalid-feedback">{errors.telefono}</div>}
        </div>

        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? 'Guardando...' : isEdit ? 'Actualizar' : 'Crear'}
        </button>
        <Link to="/profesionales" className="btn btn-secondary ms-2">Cancelar</Link>
      </form>
    </div>
  );
}

export default ProfesionalFormPage;
