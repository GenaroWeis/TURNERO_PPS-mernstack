const Turno = require("../models/Turno");
const Disponibilidad = require("../models/Disponibilidad");
const Profesional = require('../models/profesional');
const Cliente = require("../models/Cliente");

// --- helpers de hora ---
const pad2 = (s) => s?.toString().padStart(2, '0');             // agrega 0 a la izquierda si hace falta (→ "09")
const toHHmm = (hhmm) => {
  if (!hhmm) return '';                                         // sin valor → cadena vacía (evito "undefined")
  const [h, m = '00'] = hhmm.split(':');                        // si no viene minuto, asumo "00"
  return `${pad2(h)}:${pad2(m)}`;                               // aseguro formato "HH:mm"
};
const toMinutes = (hhmm) => {
  if (!hhmm) return -1;                                         // sin valor → -1 (indicador inválido)
  const [h, m = '0'] = hhmm.split(':').map(Number);             // parseo a números; minuto opcional
  return (h * 60) + (m || 0);                                   // minutos totales desde 00:00
};

// Para mensajes claros cuando hay múltiples rangos
const rangesLabel = (list=[]) => list.map(d => `${toHHmm(d.horaInicio)} - ${toHHmm(d.horaFin)}`).join(', ');

// Obtener todos los turnos (GET)
const getTurnos = async (req, res) => {
  try {
    const turnos = await Turno.find()
      .populate("profesional", "nombre especialidad email")
      .populate("cliente", "nombre email dni");
    res.status(200).json({ status: "ok", data: turnos });
  } catch (err) {
    res.status(500).json({ status: "error", message: "Error al obtener turnos", error: err });
  }
};

// Crear un nuevo turno (POST)
const createTurno = async (req, res) => {
  try {
    const { fecha, hora, profesional, cliente } = req.body;

    // Normalizar hora y tolerar duplicados con/ sin padding
    const hTurno = toHHmm(hora);
    const horasCheck = (hora && hora !== hTurno) ? [hTurno, hora] : [hTurno];

    // Duplicado exacto (mismo prof, fecha y hora)
    const existeTurno = await Turno.findOne({ profesional, fecha, hora: { $in: horasCheck } });
    if (existeTurno) {
      return res.status(400).json({
        status: "error",
        message: "Ya hay un turno agendado para ese horario con ese profesional"
      });
    }

    // Verificar existencia de cliente/profesional
    const existeCliente = await Cliente.findById(cliente);
    const existeProfesional = await Profesional.findById(profesional);
    if (!existeCliente || !existeProfesional) {
      return res.status(404).json({ status: "error", message: "Cliente o profesional inexistente" });
    }

    // Día de la semana (UTC)
    const dias = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
    const d = new Date(fecha);
    const diaTurno = dias[d.getUTCDay()];

    // Traer TODAS las disponibilidades del día para ese profesional
    const disponibilidades = await Disponibilidad.find({ profesional, diaSemana: diaTurno });
    if (!disponibilidades.length) {
      return res.status(400).json({
        status: "error",
        message: `El profesional no tiene disponibilidad registrada para el día ${diaTurno}`
      });
    }

    // Validar que la hora caiga en ALGÚN rango
    const val = toMinutes(hTurno);
    const okEnAlguno = disponibilidades.some(d => {
      const ini = toMinutes(toHHmm(d.horaInicio));
      const fin = toMinutes(toHHmm(d.horaFin));
      return val >= ini && val < fin;
    });
    if (!okEnAlguno) {
      return res.status(400).json({
        status: "error",
        message: `Horario fuera del rango disponible (${rangesLabel(disponibilidades)})`
      });
    }

    // Crear y guardar (hora normalizada)
    const nuevoTurno = new Turno({ ...req.body, hora: hTurno });
    const turnoGuardado = await nuevoTurno.save();
    return res.status(201).json({ status: "ok", data: turnoGuardado });
  } catch (err) {
    return res.status(500).json({ status: "error", message: "Error al crear turno", error: err });
  }
};

// Obtener turno por ID (GET ID)
const getTurnoById = async (req, res) => {
  try {
    const turno = await Turno.findById(req.params.id)
      .populate("profesional", "nombre especialidad email")
      .populate("cliente", "nombre email dni");

    if (!turno) {
      return res.status(404).json({ status: "error", message: "Turno no encontrado" });
    }

    res.status(200).json({ status: "ok", data: turno });
  } catch (err) {
    res.status(500).json({ status: "error", message: "Error al buscar turno", error: err });
  }
};

// Actualizar turno (PUT ID)
const updateTurno = async (req, res) => {
  try {
    const { id } = req.params;

    // Traer el turno actual
    const turnoActual = await Turno.findById(id);
    if (!turnoActual) {
      return res.status(404).json({ status: "error", message: "Turno no encontrado" });
    }

    // Resolver nuevos valores (si no vienen, usamos los actuales)
    const nuevaFecha = (typeof req.body.fecha !== 'undefined') ? req.body.fecha : turnoActual.fecha;
    const nuevaHora  = (typeof req.body.hora  !== 'undefined') ? req.body.hora  : turnoActual.hora;
    const nuevoProf  = (typeof req.body.profesional !== 'undefined') ? req.body.profesional : turnoActual.profesional;
    const nuevoCli   = (typeof req.body.cliente !== 'undefined') ? req.body.cliente : turnoActual.cliente;
    const nuevoEstado= (typeof req.body.estado !== 'undefined') ? req.body.estado : turnoActual.estado;

    // Verificar existencia de cliente/profesional
    const existeCliente = await Cliente.findById(nuevoCli);
    const existeProfesional = await Profesional.findById(nuevoProf);
    if (!existeCliente || !existeProfesional) {
      return res.status(404).json({ status: "error", message: "Cliente o profesional inexistente" });
    }

    // Día de semana en UTC 
    const dias = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
    const d = new Date(nuevaFecha);
    const diaTurno = dias[d.getUTCDay()];

    // Traer TODAS las disponibilidades del día para ese profesional
    const disponibilidades = await Disponibilidad.find({ profesional: nuevoProf, diaSemana: diaTurno });
    if (!disponibilidades.length) {
      return res.status(400).json({
        status: "error",
        message: `El profesional no tiene disponibilidad registrada para el día ${diaTurno}`
      });
    }

    // Normalizar y validar hora contra cualquiera de los rangos
    const hTurno = toHHmm(nuevaHora);
    const val = toMinutes(hTurno);
    const okEnAlguno = disponibilidades.some(d => {
      const ini = toMinutes(toHHmm(d.horaInicio));
      const fin = toMinutes(toHHmm(d.horaFin));
      return val >= ini && val < fin;
    });
    if (!okEnAlguno) {
      return res.status(400).json({
        status: "error",
        message: `Horario fuera del rango disponible (${rangesLabel(disponibilidades)})`
      });
    }

    // Choque con otro turno (tolerante a padding previo)
    const horasCheck = (nuevaHora && nuevaHora !== hTurno) ? [hTurno, nuevaHora] : [hTurno];
    const choque = await Turno.findOne({
      _id: { $ne: id },
      profesional: nuevoProf,
      fecha: nuevaFecha,
      hora: { $in: horasCheck }
    });
    if (choque) {
      return res.status(400).json({
        status: "error",
        message: "Ya hay un turno agendado para ese horario con ese profesional"
      });
    }

    // Persistir normalizado y devolver populado 
    turnoActual.fecha = nuevaFecha;
    turnoActual.hora = hTurno;
    turnoActual.estado = nuevoEstado;
    turnoActual.profesional = nuevoProf;
    turnoActual.cliente = nuevoCli;

    const turnoActualizado = await turnoActual.save();
    const turnoConPopulate = await Turno.findById(turnoActualizado._id)
      .populate("profesional", "nombre especialidad email")
      .populate("cliente", "nombre email dni");

    return res.status(200).json({ status: "ok", data: turnoConPopulate });
  } catch (err) {
    return res.status(400).json({ status: "error", message: "Error al actualizar turno", error: err });
  }
};

// Eliminar turno (DELETE ID)
const deleteTurno = async (req, res) => {
  try {
    await Turno.findByIdAndDelete(req.params.id);
    res.status(204).json({ status: "ok", message: "Turno eliminado" });
  } catch (err) {
    res.status(500).json({ status: "error", message: "Error al eliminar turno", error: err });
  }
};

module.exports = {
  getTurnos,
  createTurno,
  getTurnoById,
  updateTurno,
  deleteTurno
};
