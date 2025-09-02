// src/pages/TurnoFormPage.jsx
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { getTurnoById, createTurno, updateTurno } from '../services/turnoService';
import { listProfesionales } from '../services/profesionalService';
import { listClientes } from '../services/clienteService';
import { listDisponibilidadesByProfesional } from '../services/disponibilidadService';
import { parseApiErrors } from '../utils/parseApiErrors';

// Estado inicial
const initialForm = { fecha: '', hora: '', estado: 'pendiente', profesional: '', cliente: '' };

// Normalizar días (minúsculas + sin acentos)
const normalizeDia = (s) =>
  s ? s.toString().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '') : '';

// YYYY-MM-DD → nombre de día (UTC)
const dayNameFromDate = (yyyyMMdd) => {
  if (!yyyyMMdd) return null;
  const dias = ['domingo','lunes','martes','miércoles','jueves','viernes','sábado'];
  const d = new Date(yyyyMMdd);       // input date entrega YYYY-MM-DD (UTC midnight)
  return dias[d.getUTCDay()];          // usamos UTC para evitar corrimientos
};

// ISO → YYYY-MM-DD para input date
const toDateInput = (value) => {
  if (!value) return '';
  const d = new Date(value);
  return isNaN(d) ? '' : d.toISOString().slice(0, 10);
};

// Generar HH:mm en pasos dentro [inicio, fin)
const genTimeSlots = (horaInicio, horaFin, stepMinutes = 30) => {
  if (!horaInicio || !horaFin) return [];
  const [hiH, hiM] = horaInicio.split(':').map(Number);
  const [hfH, hfM] = horaFin.split(':').map(Number);
  const start = hiH * 60 + (hiM || 0);
  const end = hfH * 60 + (hfM || 0);
  const out = [];
  for (let m = start; m < end; m += stepMinutes) {
    const h = Math.floor(m / 60), mm = m % 60;
    out.push(String(h).padStart(2,'0') + ':' + String(mm).padStart(2,'0'));
  }
  return out;
};

function TurnoFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  // Estado base del form y catálogos
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [profesionales, setProfesionales] = useState([]);
  const [clientes, setClientes] = useState([]);

  // Disponibilidades y vista
  const [disponibilidades, setDisponibilidades] = useState([]); // [{ diaSemana, horaInicio, horaFin }]
  const [franjaDelDia, setFranjaDelDia] = useState(null);       // { horaInicio, horaFin }
  const [horaOptions, setHoraOptions] = useState([]);            // ['09:00','09:30',...]

  // Chips (días en verde/gris)
  const diasDisponibles = useMemo(
    () => new Set(disponibilidades.map(d => normalizeDia(d.diaSemana))),
    [disponibilidades]
  );
  const diasOrden = ['lunes','martes','miércoles','jueves','viernes','sábado','domingo'];

  // Helper: dada una fecha y una lista de disp, devuelve { franja, slots }
  const computeFranjaYSlots = (yyyyMMdd, disp) => {
    if (!yyyyMMdd || !disp?.length) return { franja: null, slots: [] };
    const dia = dayNameFromDate(yyyyMMdd);
    const franja = disp.find(d => normalizeDia(d.diaSemana) === normalizeDia(dia)) || null;
    const slots = franja ? genTimeSlots(franja.horaInicio, franja.horaFin, 30) : [];
    return { franja, slots };
  };

  // Carga inicial
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [profs, clis] = await Promise.all([listProfesionales(), listClientes()]);
        setProfesionales(profs || []);
        setClientes(clis || []);

        if (id) {
          const data = await getTurnoById(id);
          const pf = data.profesional?._id || '';
          const fecha = toDateInput(data.fecha) || '';
          setForm({
            fecha,
            hora: data.hora || '',
            estado: data.estado || 'pendiente',
            profesional: pf,
            cliente: data.cliente?._id || '',
          });

          if (pf) {
            const disp = await listDisponibilidadesByProfesional(pf);
            setDisponibilidades(disp);
            const { franja, slots } = computeFranjaYSlots(fecha, disp);
            setFranjaDelDia(franja);
            setHoraOptions(slots);
          }
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
  }, [id, navigate]);

  // Al cambiar profesional: traer sus disponibilidades y resetear fecha/hora
  useEffect(() => {
    const sync = async () => {
      if (!form.profesional) {
        setDisponibilidades([]); setFranjaDelDia(null); setHoraOptions([]); return;
      }
      const disp = await listDisponibilidadesByProfesional(form.profesional);
      setDisponibilidades(disp);

      // Recalcular franja/horas si ya hay fecha elegida
      if (form.fecha) {
        const { franja, slots } = computeFranjaYSlots(form.fecha, disp);
        setFranjaDelDia(franja);
        setHoraOptions(slots);
        if (form.hora && !slots.includes(form.hora)) setForm(prev => ({ ...prev, hora: '' }));
      } else {
        setFranjaDelDia(null); setHoraOptions([]);
      }
    };
    sync();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.profesional]);

  // Al cambiar fecha: recalcular franja/horas
  useEffect(() => {
    if (!form.fecha || disponibilidades.length === 0) {
      setFranjaDelDia(null); setHoraOptions([]); return;
    }
    const { franja, slots } = computeFranjaYSlots(form.fecha, disponibilidades);
    setFranjaDelDia(franja);
    setHoraOptions(slots);
    if (form.hora && !slots.includes(form.hora)) setForm(prev => ({ ...prev, hora: '' }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.fecha, disponibilidades]);

  // Validación básica
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
    setForm(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: undefined, _general: undefined }));
  };

  // Cambio específico de profesional: resetea fecha/hora (evitamos doble setState)
  const handleChangeProfesional = (ev) => {
    const value = ev.target.value;
    setForm(prev => ({ ...prev, profesional: value, fecha: '', hora: '' }));
    setErrors(prev => ({ ...prev, profesional: undefined, fecha: undefined, hora: undefined, _general: undefined }));
  };

  // Envío
  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setErrors({});
    if (!validate()) { setSubmitting(false); return; }
    try {
      if (id) {
        await updateTurno(id, form);
        navigate('/turnos', { state: { message: 'Turno actualizado correctamente.' } });
      } else {
        await createTurno(form);
        navigate('/turnos', { state: { message: 'Turno creado correctamente.' } });
      }
    } catch (err) {
      setErrors(parseApiErrors(err));
    } finally {
      setSubmitting(false);
    }
  };

  // Hint informativo
  const hintDisponibilidad = useMemo(() => {
    if (!form.profesional) return 'Seleccioná un profesional para ver disponibilidad.';
    if (!form.fecha) return 'Elegí una fecha para ver los horarios disponibles.';
    if (!franjaDelDia) return 'Sin disponibilidad para ese día.';
    return `Disponibilidad: ${franjaDelDia.horaInicio} - ${franjaDelDia.horaFin}`;
  }, [form.profesional, form.fecha, franjaDelDia]);

  if (loading) return <div className="container py-3">Cargando...</div>;

  return (
    <div className="container py-3">
      <h1 className="h3 mb-3">{id ? 'Editar Turno' : 'Nuevo Turno'}</h1>

      {errors._general && <div className="alert alert-danger">{errors._general}</div>}

      <form onSubmit={handleSubmit} noValidate>
        {/* Profesional */}
        <div className="mb-3">
          <label className="form-label">Profesional</label>
          <select
            name="profesional"
            className={`form-select ${errors.profesional ? 'is-invalid' : ''}`}
            value={form.profesional}
            onChange={handleChangeProfesional} // ← resetea fecha/hora
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

        {/* Chips de días con disponibilidad */}
        <div className="mb-2">
          <div className="form-text">Días con disponibilidad del profesional</div>
          <div className="d-flex flex-wrap gap-2">
            {diasOrden.map((lbl) => {
              const disponible = diasDisponibles.has(normalizeDia(lbl));
              return (
                <span
                  key={lbl}
                  className={`badge ${disponible ? 'bg-success' : 'bg-secondary'}`}
                  title={disponible ? 'Disponible' : 'Sin disponibilidad'}
                >
                  {lbl}
                </span>
              );
            })}
          </div>
        </div>

        {/* Fecha */}
        <div className="mb-1">
          <label className="form-label">Fecha</label>
          <input
            type="date"
            name="fecha"
            className={`form-control ${errors.fecha ? 'is-invalid' : ''}`}
            value={form.fecha}
            onChange={handleChange}
            disabled={!form.profesional}
          />
          {errors.fecha && <div className="invalid-feedback">{errors.fecha}</div>}
        </div>
        <div className="form-text mb-3">{hintDisponibilidad}</div>

        {/* Hora (solo slots válidos del día) */}
        <div className="mb-3">
          <label className="form-label">Hora</label>
          <select
            name="hora"
            className={`form-select ${errors.hora ? 'is-invalid' : ''}`}
            value={form.hora}
            onChange={handleChange}
            disabled={!form.profesional || !form.fecha || horaOptions.length === 0}
          >
            <option value="">{horaOptions.length ? 'Seleccioná un horario' : 'Sin horarios disponibles'}</option>
            {horaOptions.map((h) => <option key={h} value={h}>{h}</option>)}
          </select>
          {errors.hora && <div className="invalid-feedback">{errors.hora}</div>}
        </div>

        {/* Estado */}
        <div className="mb-3">
          <label className="form-label">Estado</label>
          <select name="estado" className="form-select" value={form.estado} onChange={handleChange}>
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
          {submitting ? 'Guardando...' : id ? 'Actualizar' : 'Crear'}
        </button>
        <Link to="/turnos" className="btn btn-secondary ms-2">Cancelar</Link>
      </form>
    </div>
  );
}

export default TurnoFormPage;
