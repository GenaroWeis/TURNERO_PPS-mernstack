/*import { useEffect, useMemo, useState } from 'react';
// useState → estado local del form
// useMemo → para calcular vista filtrada/ordenada sin recalcular de más
// useEffect → cargar datos al montar
import { useNavigate, useParams, Link } from 'react-router-dom';
// useNavigate → redirigir después de crear/editar
// useParams → leer :id de la URL
import {
  getTurnoById,
  createTurno,
  updateTurno,
} from '../services/turnoService';
import { listProfesionales } from '../services/profesionalService';
import { listClientes } from '../services/clienteService';
import { listDisponibilidadesByProfesional } from '../services/disponibilidadService';
import { parseApiErrors } from '../utils/parseApiErrors';

// Estado inicial del formulario
const initialForm = {
  fecha: '',        
  hora: '',         
  estado: 'pendiente',
  profesional: '',  
  cliente: '',      
};

// normaliza el string (minúsculas + sin acentos) para comparar días sin errores
const normalizeDia = (s) =>
  s ? s.toString().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '') : '';



// Helper: convertir ISO → YYYY-MM-DD para el input date
const toDateInput = (value) => {
  if (!value) return '';
  const d = new Date(value);
  return isNaN(d) ? '' : d.toISOString().slice(0, 10);
};

// Convierte YYYY-MM-DD a nombre de día en español usando UTC 
const dayNameFromDate = (yyyyMMdd) => {
  if (!yyyyMMdd) return null;
  const dias = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
  const d = new Date(yyyyMMdd); // el input.date entrega "YYYY-MM-DD"
  const idx = d.getUTCDay(); // utilizo UTC para evitar que se mueva un dia
  return dias[idx];
};

// Genera intervalos HH:mm cada 'stepMinutes' dentro del rango [horaInicio, horaFin)
const genTimeSlots = (horaInicio, horaFin, stepMinutes = 30) => {
  if (!horaInicio || !horaFin) return [];
  const [hiH, hiM] = horaInicio.split(':').map(Number); // parseamos inicio
  const [hfH, hfM] = horaFin.split(':').map(Number);    // parseamos fin
  const start = hiH * 60 + (hiM || 0); // minutos totales inicio
  const end = hfH * 60 + (hfM || 0);   // minutos totales fin
  const out = [];
  for (let m = start; m < end; m += stepMinutes) {       // iteramos cada slot
    const h = Math.floor(m / 60);                        // horas
    const mm = m % 60;                                   // minutos
    out.push(String(h).padStart(2, '0') + ':' + String(mm).padStart(2, '0')); // HH:mm
  }
  return out; // lista de horarios válidos
};

function TurnoFormPage() {
  const { id } = useParams(); // si existe → edición
  const navigate = useNavigate();

  const [form, setForm] = useState(initialForm);             // valores del form
  const [errors, setErrors] = useState({});                  // errores por campo y _general
  const [loading, setLoading] = useState(true);              // loader inicial (cargamos listas y, si edita, el turno)
  const [submitting, setSubmitting] = useState(false);       // prevenir doble submit
  const [profesionales, setProfesionales] = useState([]);    // opciones del select
  const [clientes, setClientes] = useState([]);              // opciones del select
  const [disponibilidades, setDisponibilidades] = useState([]); // [{ diaSemana, horaInicio, horaFin }]
  const [horaOptions, setHoraOptions] = useState([]);           // slots HH:mm según fecha elegida
  const [franjaDelDia, setFranjaDelDia] = useState(null);       // {horaInicio, horaFin} del día elegido
  const isEdit = Boolean(id);

  // set (conjunto) de días disponibles del profesional (normalizados) para consultar rápido
const diasDisponibles = useMemo(
  () => new Set(disponibilidades.map(d => normalizeDia(d.diaSemana))), // mapeamos cada disponibilidad a su día normalizado
  [disponibilidades] // se recalcula cuando cambia la lista de disponibilidades
);

const diasOrden = ['lunes','martes','miércoles','jueves','viernes','sábado','domingo'];

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true); // comenzamos loader
        // Traer listas para los selects en paralelo
        const [profs, clis] = await Promise.all([
          listProfesionales(),
          listClientes(),
        ]);
        setProfesionales(profs || []);
        setClientes(clis || []);

        // Si es edición, traer el turno y pre-cargar el formulario
        if (id) {
          const data = await getTurnoById(id);
          const pf = data.profesional?._id || '';// id de profesional del turno
          const fecha = toDateInput(data.fecha) || '';// normalizamos fecha al input
          setForm({
         fecha,
            hora: data.hora || '',
            estado: data.estado || 'pendiente',
            profesional: pf,
            cliente: data.cliente?._id || '',
          });
           // Si hay profesional, traemos disponibilidades
          if (pf) {
            const disp = await listDisponibilidadesByProfesional(pf);// NUEVO
            setDisponibilidades(disp); // guardamos disponibilidades

            // Si hay fecha, generamos slots de ese día
            if (fecha) {
              const dia = dayNameFromDate(fecha); // obtenemos el nombre del día (UTC)
              const fran = disp.find(d => normalizeDia(d.diaSemana) === normalizeDia(dia)) || null; 
              setFranjaDelDia(fran || null); // guardamos la franja (o null si no hay)
              setHoraOptions(fran ? genTimeSlots(fran.horaInicio, fran.horaFin, 30) : []); // generamos slots HH:mm si hay franja
            }
          }
        } else {
          // creación: dejamos initialForm (estado pendiente por default)
          setForm(initialForm);
        }
      } catch (err) {
        // si falla cualquier carga necesaria, volvemos con mensaje
        navigate('/turnos', { state: { message: 'No se pudo cargar el formulario de turno.' } });
      } finally {
        setLoading(false); // fin loader
      }
    };
    load();
  }, [id, navigate]);

  // Cuando cambia el profesional: traer disponibilidades y reiniciar fecha/hora
  useEffect(() => {
    const syncDisp = async () => {
      if (!form.profesional) {// si no hay profesional, limpiamos todo
        setDisponibilidades([]);
        setHoraOptions([]);
        setFranjaDelDia(null);
        return;
      }
      const disp = await listDisponibilidadesByProfesional(form.profesional); // pedimos disponibilidades
      setDisponibilidades(disp);

      if (form.fecha) {                            // si ya hay fecha elegida
        const dia = dayNameFromDate(form.fecha); // día de la fecha elegida (UTC)
        // CAMBIO: buscamos la franja comparando con normalización
        const fran = disp.find(d => normalizeDia(d.diaSemana) === normalizeDia(dia)) || null; 
        setFranjaDelDia(fran || null); // guardamos franja (o null)
        setHoraOptions(fran ? genTimeSlots(fran.horaInicio, fran.horaFin, 30) : []); // slots válidos si hay franja
        // Si la hora actual ya no es válida para esta franja, la limpiamos
        if (form.hora && !(fran && genTimeSlots(fran.horaInicio, fran.horaFin, 30).includes(form.hora))) {
          setForm(prev => ({ ...prev, hora: '' })); // vaciamos la hora inválida
        }
      } else {
        setHoraOptions([]); // sin fecha, no hay horas
        setFranjaDelDia(null);
      }
    };
    syncDisp(); // ejecutamos la sincronización
    // (omitimos deps para no ejecutar en cada tecla; reaccionamos a cambios de profesional)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.profesional]);

  // Cuando cambia la fecha: recalcular franja y slots de ese día
  useEffect(() => {
  if (!form.fecha || disponibilidades.length === 0) {
    setHoraOptions([]);   // sin fecha o sin disponibilidades, no hay horas
    setFranjaDelDia(null);
    return;
  }
  const dia = dayNameFromDate(form.fecha); // calculamos el nombre del día (UTC)
// CAMBIO: comparación robusta con día normalizado
const fran = disponibilidades.find(d => normalizeDia(d.diaSemana) === normalizeDia(dia)) || null; 
setFranjaDelDia(fran || null); // guardamos franja (o null)
const slots = fran ? genTimeSlots(fran.horaInicio, fran.horaFin, 30) : []; // generamos slots válidos del día
setHoraOptions(slots); // guardamos las opciones de hora
// Si la hora elegida no pertenece a los nuevos slots, la limpiamos
if (form.hora && !slots.includes(form.hora)) {
  setForm(prev => ({ ...prev, hora: '' })); // reseteamos hora inválida
}

  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [form.fecha, disponibilidades]);

  // Validación básica de UX (campos obligatorios)
  const validate = () => {
    const e = {};
    if (!form.fecha) e.fecha = 'La fecha es obligatoria.';
    if (!form.hora) e.hora = 'La hora es obligatoria.';
    if (!form.profesional) e.profesional = 'Seleccioná un profesional.';
    if (!form.cliente) e.cliente = 'Seleccioná un cliente.';
    // estado tiene default 'pendiente'
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // Cambios en inputs
  const handleChange = (ev) => {
    const { name, value } = ev.target;
    setForm((prev) => ({ ...prev, [name]: value })); // actualizamos el campo
    setErrors((prev) => ({ ...prev, [name]: undefined, _general: undefined })); // limpiamos error del campo y el general
  };

  // Envío
  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (submitting) return; // evitar doble clic
    setSubmitting(true);
    setErrors({}); // limpiar errores previos

    if (!validate()) { setSubmitting(false); return; } // validación rápida

    try {
      if (isEdit) {
        await updateTurno(id, form); // actualizar turno
        navigate('/turnos', { state: { message: 'Turno actualizado correctamente.' } });
      } else {
        await createTurno(form); // crear turno
        navigate('/turnos', { state: { message: 'Turno creado correctamente.' } });
      }
    } catch (err) {
      // mensajes del controller (ej. “Ya hay un turno…”, “Horario fuera del rango…”) llegan en data.message → _general
      const fieldMap = parseApiErrors(err);
      setErrors(fieldMap);
    } finally {
      setSubmitting(false);
    }
  };

    // Mostrar resumen de disponibilidad del día seleccionado
const hintDisponibilidad = useMemo(() => {
  if (!form.profesional) return 'Seleccioná un profesional para ver disponibilidad.'; // guía
  if (!form.fecha) return 'Elegí una fecha para ver los horarios disponibles.';       // guía
  if (!franjaDelDia) return 'Sin disponibilidad para ese día.';                       // sin franja
  return `Disponibilidad: ${franjaDelDia.horaInicio} - ${franjaDelDia.horaFin}`;      // franja visible
}, [form.profesional, form.fecha, franjaDelDia]);

  if (loading) return <div className="container py-3">Cargando...</div>;

  return (
    <div className="container py-3">
      <h1 className="h3 mb-3">{isEdit ? 'Editar Turno' : 'Nuevo Turno'}</h1>

      {errors._general && <div className="alert alert-danger">{errors._general}</div>}

      <form onSubmit={handleSubmit} noValidate>
        {/* Profesional /}
        <div className="mb-3">
          <label className="form-label">Profesional</label>
          <select
            name="profesional"
            className={`form-select ${errors.profesional ? 'is-invalid' : ''}`}
            value={form.profesional}
            onChange={(e) => {
              // al cambiar profesional, reseteamos fecha/hora para evitar inconsistencias
              const value = e.target.value;
              setForm(prev => ({ ...prev, profesional: value, fecha: '', hora: '' }));
              setErrors(prev => ({ ...prev, profesional: undefined, fecha: undefined, hora: undefined, _general: undefined }));
              handleChange(e); // mantiene el patrón de limpieza
            }}
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

        {/* Fecha *}
        <div className="mb-1">
          <label className="form-label">Fecha</label>
          <input
            type="date"
            name="fecha"
            className={`form-control ${errors.fecha ? 'is-invalid' : ''}`}
            value={form.fecha}
            onChange={handleChange}
            disabled={!form.profesional} // hasta elegir profesional
          />
          {errors.fecha && <div className="invalid-feedback">{errors.fecha}</div>}
        </div>
        {/* Hint de disponibilidad del día *}
        <div className="form-text mb-3">{hintDisponibilidad}</div>

        {/* NUEVO: chips que marcan en color los días con disponibilidad del profesional *}
<div className="mb-2">
  <div className="form-text">Días con disponibilidad del profesional</div>
  <div className="d-flex flex-wrap gap-2">
    {diasOrden.map((lbl) => {
      const disponible = diasDisponibles.has(normalizeDia(lbl)); // ¿este día está en las disponibilidades?
      return (
        <span
          key={lbl} // clave única por día
          className={`badge ${disponible ? 'bg-success' : 'bg-secondary'}`} // verde si hay, gris si no
          title={disponible ? 'Disponible' : 'Sin disponibilidad'} // tooltip descriptivo
        >
          {lbl} {/* mostramos el nombre del día *}
        </span>
      );
    })}
  </div>
</div>


        {/* Hora: ahora un <select> con las opciones válidas del día *}
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
            {horaOptions.map((h) => (
              <option key={h} value={h}>{h}</option>
            ))}
          </select>
          {errors.hora && <div className="invalid-feedback">{errors.hora}</div>}
        </div>

        {/* Estado *}
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

        {/* Cliente *}
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

export default TurnoFormPage;*/
