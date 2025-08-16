// src/pages/ProfesionalFormPage.jsx
import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  getProfesionalById,
  createProfesional,
  updateProfesional,
} from '../services/profesionalService';
import { parseApiErrors } from '../utils/parseApiErrors'; // <--- NUEVO

const initialForm = {
  nombre: '',
  especialidad: '',
  email: '',
  telefono: '',
};

function ProfesionalFormPage() {
  const { id } = useParams(); // si existe -> editar
  const navigate = useNavigate();

  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(Boolean(id));
  const [submitting, setSubmitting] = useState(false); // <--- opcional
  const isEdit = Boolean(id);

  useEffect(() => {
    const load = async () => {
      try {
        if (!id) return;
        const data = await getProfesionalById(id);
        setForm({
          nombre: data.nombre || '',
          especialidad: data.especialidad || '',
          email: data.email || '',
          telefono: data.telefono || '',
        });
      } catch (err) {
        // Si falla, volvemos al listado con un error
        navigate('/profesionales', { state: { message: 'No se pudo cargar el profesional.' } });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, navigate]);

  const validate = () => {
    const e = {};
    if (!form.nombre.trim()) e.nombre = 'El nombre es obligatorio.';
    if (!form.especialidad.trim()) e.especialidad = 'La especialidad es obligatoria.';
    if (!form.email.trim()) e.email = 'El email es obligatorio.';
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = 'Formato de email inválido.';
    if (!form.telefono.trim()) e.telefono = 'El teléfono es obligatorio.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (ev) => {
    const { name, value } = ev.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined })); // <--- limpiar error del campo
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    setSubmitting(true);
    setErrors({});

    // Podés mantener esta validación básica de UX rápida:
    if (!validate()) { setSubmitting(false); return; }

    try {
      if (isEdit) {
        await updateProfesional(id, form);
        navigate('/profesionales', { state: { message: 'Profesional actualizado correctamente.' } });
      } else {
        await createProfesional(form);
        navigate('/profesionales', { state: { message: 'Profesional creado correctamente.' } });
      }
    } catch (err) {
      // En vez de alert, mostramos los mensajes del backend por campo
      const fieldMap = parseApiErrors(err);
      setErrors(fieldMap);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="container py-3">Cargando...</div>;

  return (
    <div className="container py-3">
      <h1 className="h4 mb-3">{isEdit ? 'Editar profesional' : 'Nuevo profesional'}</h1>

      {/* Error general del backend */}
      {errors._general && (
        <div className="alert alert-danger" role="alert">
          {errors._general}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <div className="mb-3">
          <label className="form-label">Nombre</label>
          <input
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
            name="email"
            type="email"
            className={`form-control ${errors.email ? 'is-invalid' : ''}`}
            value={form.email}
            onChange={handleChange}
          />
          {errors.email && <div className="invalid-feedback">{errors.email}</div>}
        </div>

        <div className="mb-3">
          <label className="form-label">Teléfono</label>
          <input
            name="telefono"
            className={`form-control ${errors.telefono ? 'is-invalid' : ''}`}
            value={form.telefono}
            onChange={handleChange}
          />
          {errors.telefono && <div className="invalid-feedback">{errors.telefono}</div>}
        </div>

        <div className="d-flex gap-2">
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {isEdit ? 'Guardar cambios' : 'Crear profesional'}
          </button>
          <Link to="/profesionales" className="btn btn-outline-secondary">Cancelar</Link>
        </div>
      </form>
    </div>
  );
}

export default ProfesionalFormPage;
