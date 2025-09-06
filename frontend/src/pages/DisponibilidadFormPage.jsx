// src/pages/DisponibilidadFormPage.jsx
import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';

import {
  getDisponibilidadById,
  createDisponibilidad,
  updateDisponibilidad,
} from '../services/disponibilidadService';

import { listProfesionales } from '../services/profesionalService';
import { parseApiErrors } from '../utils/parseApiErrors';

import DisponibilidadQuickView from '../components/DisponibilidadQuickView';
import InputField from '../components/InputField';

const DIAS_ORDEN = ['lunes','martes','miércoles','jueves','viernes','sábado','domingo'];

const initialForm = {
  diaSemana: '',
  horaInicio: '',
  horaFin: '',
  profesional: '',
};

function DisponibilidadFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  // estado base
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(Boolean(id)); // si edita, carga primero
  const [submitting, setSubmitting] = useState(false);

  // catálogos
  const [profesionales, setProfesionales] = useState([]);
  const [loadingProfs, setLoadingProfs] = useState(true);

  // QuickView modal
  const [isOpenQV, setIsOpenQV] = useState(false);

  // cargar catálogos + si es edición, la disponibilidad
  useEffect(() => {
    const load = async () => {
      try {
        setLoadingProfs(true);
        const profs = await listProfesionales();
        setProfesionales(Array.isArray(profs) ? profs : []);
      } catch {
        setProfesionales([]);
      } finally {
        setLoadingProfs(false);
      }

      if (!id) {
        setLoading(false);
        return;
      }

      try {
        const data = await getDisponibilidadById(id);
        setForm({
          diaSemana: data.diaSemana || '',
          horaInicio: data.horaInicio || '',
          horaFin: data.horaFin || '',
          profesional: data.profesional?._id || '',
        });
      } catch {
        navigate('/disponibilidad', { state: { message: 'No se pudo cargar la disponibilidad.' } });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, navigate]);

  // validaciones simples de front
  const validate = () => {
    const e = {};
    if (!form.diaSemana) e.diaSemana = 'El día es obligatorio.';

    // type="time" ya valida formato, pero reforzamos por seguridad
    const hhmm = /^([01]\d|2[0-3]):[0-5]\d$/;
    if (!form.horaInicio) e.horaInicio = 'La hora de inicio es obligatoria.';
    else if (!hhmm.test(form.horaInicio)) e.horaInicio = 'Formato inválido (HH:mm).';

    if (!form.horaFin) e.horaFin = 'La hora de fin es obligatoria.';
    else if (!hhmm.test(form.horaFin)) e.horaFin = 'Formato inválido (HH:mm).';

    // rango coherente
    if (hhmm.test(form.horaInicio) && hhmm.test(form.horaFin)) {
      if (form.horaInicio >= form.horaFin) {
        e.horaFin = 'La hora de fin debe ser mayor a la de inicio.';
      }
    }

    if (!form.profesional) e.profesional = 'El profesional es obligatorio.';

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // handlers
  const handleChange = (ev) => {
    const { name, value } = ev.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined, _general: undefined }));
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setErrors({});

    if (!validate()) { setSubmitting(false); return; }

    try {
      if (isEdit) {
        await updateDisponibilidad(id, form);
        navigate('/disponibilidad', { state: { message: 'Disponibilidad actualizada correctamente.' } });
      } else {
        await createDisponibilidad(form);
        navigate('/disponibilidad', { state: { message: 'Disponibilidad creada correctamente.' } });
      }
    } catch (err) {
      setErrors(parseApiErrors(err)); // backend: solapamientos, duplicados, etc.
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="container py-3">Cargando...</div>;

  // hint simple de rango
  const rangoHint = form.horaInicio && form.horaFin
    ? `Rango: ${form.horaInicio} — ${form.horaFin}`
    : 'Seleccioná un rango horario';

  return (
    <div className="container py-3">
      <h1 className="h3 mb-3">{isEdit ? 'Editar Disponibilidad' : 'Nueva Disponibilidad'}</h1>

      {errors._general && <div className="alert alert-danger">{errors._general}</div>}

      <form onSubmit={handleSubmit} noValidate>
        {/* Profesional + QuickView */}
        <div className="mb-3">
          <label className="form-label">Profesional</label>
          <div className="d-flex gap-2">
            <select
              name="profesional"
              className={`form-select ${errors.profesional ? 'is-invalid' : ''}`}
              value={form.profesional}
              onChange={handleChange}
              disabled={loadingProfs}
            >
              <option value="">{loadingProfs ? 'Cargando...' : 'Seleccioná un profesional'}</option>
              {profesionales.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.nombre} {p.especialidad ? `(${p.especialidad})` : ''}
                </option>
              ))}
            </select>
            <button
              type="button"
              className="btn btn-outline-secondary"
              disabled={!form.profesional}
              onClick={() => setIsOpenQV(true)}
              title="Ver disponibilidad del profesional"
            >
              Ver disponibilidad
            </button>
          </div>
          {errors.profesional && <div className="invalid-feedback d-block">{errors.profesional}</div>}
        </div>

        {/* Día de semana */}
        <div className="mb-3">
          <label className="form-label">Día</label>
          <select
            name="diaSemana"
            className={`form-select ${errors.diaSemana ? 'is-invalid' : ''}`}
            value={form.diaSemana}
            onChange={handleChange}
          >
            <option value="">Seleccioná un día</option>
            {DIAS_ORDEN.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
          {errors.diaSemana && <div className="invalid-feedback">{errors.diaSemana}</div>}
        </div>

        {/* Horas (con InputField) */}
        <div className="row g-2">
          <div className="col-12 col-md-6">
            <InputField
              label="Hora inicio"
              name="horaInicio"
              type="time"
              value={form.horaInicio}
              onChange={handleChange}
              error={errors.horaInicio}
            />
          </div>
          <div className="col-12 col-md-6">
            <InputField
              label="Hora fin"
              name="horaFin"
              type="time"
              value={form.horaFin}
              onChange={handleChange}
              error={errors.horaFin}
            />
          </div>
        </div>
        <div className="form-text mb-3">{rangoHint}</div>

        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? 'Guardando...' : isEdit ? 'Actualizar' : 'Crear'}
        </button>
        <Link to="/disponibilidad" className="btn btn-secondary ms-2">Cancelar</Link>
      </form>

      {/* Modal de vista rápida del profesional */}
      <DisponibilidadQuickView
        isOpen={isOpenQV}
        onClose={() => setIsOpenQV(false)}
        profesionalId={form.profesional}
      />
    </div>
  );
}

export default DisponibilidadFormPage;
