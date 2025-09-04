import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { getTurnoById, createTurno, updateTurno } from '../services/turnoService';
import { listProfesionales } from '../services/profesionalService';
import { listClientes } from '../services/clienteService';
import { parseApiErrors } from '../utils/parseApiErrors';
import InputField from '../components/InputField';
import DisponibilidadQuickView from '../components/DisponibilidadQuickView';
import useDisponibilidad from '../hooks/useDisponibilidad';
import DayChips from '../components/DayChips';
import HoraSelect from '../components/HoraSelect';
import { unionSlots, dayNameUTC, normalizeDia } from '../utils/scheduleUtils';
import { toYYYYMMDD } from '../utils/dateUtils';



// Estado inicial del formulario
const initialForm = {
  fecha: '',        // YYYY-MM-DD
  hora: '',         // HH:mm
  estado: 'pendiente',
  profesional: '',
  cliente: '',
};

function TurnoFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [profesionales, setProfesionales] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [isOpenQV, setIsOpenQV] = useState(false);

  // disponibilidad reactiva al profesional
  const { byDay, availableDaysSet } = useDisponibilidad(form.profesional);
  const dayKey = form.fecha ? normalizeDia(dayNameUTC(form.fecha)) : null;
  const rangesForDay = dayKey ? (byDay.get(dayKey) || []) : [];

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
            fecha: toYYYYMMDD(data.fecha) || '',
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
    if (form.fecha && (!rangesForDay || rangesForDay.length === 0)) {// si hay fecha y no hay rangos para ese día, adelantamos el mensaje (guía + límite)
      e.fecha = 'Ese día el profesional no tiene disponibilidad.';}
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

  // Si cambia la fecha y la hora actual no pertenece a los rangos, la vaciamos
  useEffect(() => {
    if (!form.fecha || !form.hora) return;
    const key = normalizeDia(dayNameUTC(form.fecha));
    const ranges = byDay.get(key) || [];
    // slots del día
    const slots = new Set(unionSlots(ranges, 30));
    if (form.hora && !slots.has(form.hora)) {
      setForm(prev => ({ ...prev, hora: '' }));
    }
  }, [form.fecha, byDay]);

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
          <div className="d-flex gap-2">
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
          <div className="mb-2">
            <div className="form-text">Días con disponibilidad</div>
            {form.profesional
              ? <DayChips availableDaysSet={availableDaysSet} />
              : <small className="text-muted">Seleccioná un profesional para ver sus días.</small>}
          </div>

          {errors.profesional && <div className="invalid-feedback">{errors.profesional}</div>}
        </div>

        {/* Fecha */}
        <InputField
          label="Fecha"
          name="fecha"
          type="date"
          value={form.fecha}
          onChange={handleChange}
          error={errors.fecha}
          disabled={!form.profesional}
        />
            
        {/* Hora – limitado por rangos del día */}
        <HoraSelect
          ranges={rangesForDay}
          value={form.hora}
          onChange={handleChange}
          disabled={!form.profesional || !form.fecha}
        />


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
      {/* Modal de vista rápida */}
      <DisponibilidadQuickView
        isOpen={isOpenQV}
        onClose={() => setIsOpenQV(false)}
        profesionalId={form.profesional}
      />
    </div>
  );
}

export default TurnoFormPage;
