import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';

import { 
  getTurnoById, 
  createTurno, 
  updateTurno 
} from '../services/turnoService';
import { listProfesionales } from '../services/profesionalService';
import { listClientes } from '../services/clienteService';
import { parseApiErrors } from '../utils/parseApiErrors';

// Estado inicial del formulario
const initialForm = {
  fecha: '',        // YYYY-MM-DD
  hora: '',         // HH:mm
  estado: 'pendiente',
  profesional: '',
  cliente: '',
};

// ISO → YYYY-MM-DD para input date
const toDateInput = (value) => {
  if (!value) return '';
  const d = new Date(value);
  return isNaN(d) ? '' : d.toISOString().slice(0, 10);
};

function TurnoFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [profesionales, setProfesionales] = useState([]);
  const [clientes, setClientes] = useState([]);
  const isEdit = Boolean(id);

  // Carga inicial (profesionales, clientes, y datos si es edición)
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [profs, clis] = await Promise.all([listProfesionales(), listClientes()]);
        setProfesionales(profs || []);
        setClientes(clis || []);

        if (id) {
          const data = await getTurnoById(id);
          setForm({
            fecha: toDateInput(data.fecha) || '',
            hora: data.hora || '',
            estado: data.estado || 'pendiente',
            profesional: data.profesional?._id || '',
            cliente: data.cliente?._id || '',
          });
        } else {
          setForm(initialForm);
        }
      } catch (err) {
        navigate('/turnos', { state: { message: 'No se pudo cargar el formulario de turno.' } });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, isEdit, navigate]);

  // Validación básica de front
  const validate = () => {
    const e = {};
    if (!form.profesional) e.profesional = 'Seleccioná un profesional.';
    if (!form.fecha) e.fecha = 'La fecha es obligatoria.';
    if (!form.hora) e.hora = 'La hora es obligatoria.';
    if (!form.cliente) e.cliente = 'Seleccioná un cliente.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // Cambios en inputs
  const handleChange = (ev) => {
    const { name, value } = ev.target;
    setForm(prev => ({ ...prev, [name]: value }));// actualizamos el campo
    setErrors(prev => ({ ...prev, [name]: undefined, _general: undefined }));// limpiamos error del campo y el general
  };

  // Envío
  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (submitting) return;// evitar doble clic
    setSubmitting(true);
    setErrors({});// limpiar errores previos

    if (!validate()) { setSubmitting(false); return; }// validación rápida

    try {
      if (isEdit) {
        await updateTurno(id, form);// actualizar turno
        navigate('/turnos', { state: { message: 'Turno actualizado correctamente.' } });
      } else {
        await createTurno(form);// crear turno
        navigate('/turnos', { state: { message: 'Turno creado correctamente.' } });
      }
    } catch (err) {
      // Muestra mensajes del backend, llegan en data.message → _general
      setErrors(parseApiErrors(err));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="container py-3">Cargando...</div>;

  return (
    <div className="container py-3">
      <h1 className="h3 mb-3">{isEdit ? 'Editar Turno' : 'Nuevo Turno'}</h1>

      {errors._general && <div className="alert alert-danger">{errors._general}</div>}

      <form onSubmit={handleSubmit} noValidate>
        {/* Profesional */}
        <div className="mb-3">
          <label className="form-label">Profesional</label>
          <select
            name="profesional"
            className={`form-select ${errors.profesional ? 'is-invalid' : ''}`}
            value={form.profesional}
            onChange={handleChange}
          >
            <option value="">Seleccioná un profesional</option>
            {profesionales.map((p) => (
              <option key={p._id} value={p._id}>
                {p.nombre} {p.especialidad ? `(${p.especialidad})` : ''}
              </option>
            ))}
          </select>
          {errors.profesional && <div className="invalid-feedback">{errors.profesional}</div>}
        </div>

        {/* Fecha */}
        <div className="mb-3">
          <label className="form-label">Fecha</label>
          <input
            type="date"
            name="fecha"
            className={`form-control ${errors.fecha ? 'is-invalid' : ''}`}
            value={form.fecha}
            onChange={handleChange}
          />
          {errors.fecha && <div className="invalid-feedback">{errors.fecha}</div>}
        </div>

        {/* Hora (simple, sin slots; el backend valida rango/disp.) */}
        <div className="mb-3">
          <label className="form-label">Hora</label>
          <input
            type="time"
            name="hora"
            className={`form-control ${errors.hora ? 'is-invalid' : ''}`}
            value={form.hora}
            onChange={handleChange}
            step={1800} 
          />
          {errors.hora && <div className="invalid-feedback">{errors.hora}</div>}
        </div>

        {/* Estado */}
        <div className="mb-3">
          <label className="form-label">Estado</label>
          <select
            name="estado"
            className="form-select"
            value={form.estado}
            onChange={handleChange}
          >
            <option value="pendiente">Pendiente</option>
            <option value="confirmado">Confirmado</option>
            <option value="cancelado">Cancelado</option>
          </select>
        </div>

        {/* Cliente */}
        <div className="mb-3">
          <label className="form-label">Cliente</label>
          <select
            name="cliente"
            className={`form-select ${errors.cliente ? 'is-invalid' : ''}`}
            value={form.cliente}
            onChange={handleChange}
          >
            <option value="">Seleccioná un cliente</option>
            {clientes.map((c) => (
              <option key={c._id} value={c._id}>
                {c.nombre} {c.dni ? `— DNI ${c.dni}` : (c.email ? `— ${c.email}` : '')}
              </option>
            ))}
          </select>
          {errors.cliente && <div className="invalid-feedback">{errors.cliente}</div>}
        </div>

        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? 'Guardando...' : isEdit ? 'Actualizar' : 'Crear'}
        </button>
        <Link to="/turnos" className="btn btn-secondary ms-2">Cancelar</Link>
      </form>
    </div>
  );
}

export default TurnoFormPage;
