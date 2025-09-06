const Turno = require("../models/Turno");
const Disponibilidad = require("../models/Disponibilidad");
const Profesional = require("../models/profesional");
const Cliente = require("../models/Cliente");
const {
  toHHmm,
  horaDentroDeRangos,
  weekdayEsUTC,
  rangesLabel,
} = require("../utils/timeUtils");
const { fieldError } = require("../utils/fieldError");


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

    // Normalizar hora
    const hTurno = toHHmm(hora);
    const horasCheck = (hora && hora !== hTurno) ? [hTurno, hora] : [hTurno];

    // Duplicado exacto (prof + fecha + hora)
    const existeTurno = await Turno.findOne({ profesional, fecha, hora: { $in: horasCheck } });
    if (existeTurno) {
      return res.status(400).json(fieldError("hora", "Ya hay un turno agendado para ese horario con ese profesional"));
    }

    // Existencia de cliente/profesional
    const existeCliente = await Cliente.findById(cliente);
    const existeProfesional = await Profesional.findById(profesional);
    if (!existeCliente || !existeProfesional) {
      const errors = [];
      if (!existeCliente) errors.push({ param: "cliente", msg: "Cliente inexistente" });
      if (!existeProfesional) errors.push({ param: "profesional", msg: "Profesional inexistente" });
      return res.status(404).json({ status: "error", errors });
    }

    // Día ES (UTC) y disponibilidades del día
    const diaTurno = weekdayEsUTC(fecha);
    const disponibilidades = await Disponibilidad.find({ profesional, diaSemana: diaTurno });
    if (!disponibilidades.length) {
      return res.status(400).json(fieldError("fecha", `El profesional no tiene disponibilidad registrada para el día ${diaTurno}`));
    }

    // Validar que la hora caiga en ALGÚN rango
    const okEnAlguno = horaDentroDeRangos(hTurno, disponibilidades);
    if (!okEnAlguno) {
     return res.status(400).json(fieldError("hora", `Horario fuera del rango disponible (${rangesLabel(disponibilidades)})`));
    }

    // Crear (hora normalizada)
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

    const turnoActual = await Turno.findById(id);
    if (!turnoActual) {
      return res.status(404).json({ status: "error", message: "Turno no encontrado" });
    }

    // Resolver nuevos valores (fallback a los actuales)
    const nuevaFecha = (req.body.fecha ?? turnoActual.fecha);
    const nuevaHora  = (req.body.hora ?? turnoActual.hora);
    const nuevoProf  = (req.body.profesional ?? turnoActual.profesional);
    const nuevoCli   = (req.body.cliente ?? turnoActual.cliente);
    const nuevoEstado= (req.body.estado ?? turnoActual.estado);

    // Existencia
    const existeCliente = await Cliente.findById(nuevoCli);
    const existeProfesional = await Profesional.findById(nuevoProf);
    if (!existeCliente || !existeProfesional) {
      const errors = [];
      if (!existeCliente) errors.push({ param: "cliente", msg: "Cliente inexistente" });
      if (!existeProfesional) errors.push({ param: "profesional", msg: "Profesional inexistente" });
      return res.status(404).json({ status: "error", errors });
    }

    // Disponibilidades del día
    const diaTurno = weekdayEsUTC(nuevaFecha);
    const disponibilidades = await Disponibilidad.find({ profesional: nuevoProf, diaSemana: diaTurno });
    if (!disponibilidades.length) {
      return res.status(400).json(fieldError("fecha", `El profesional no tiene disponibilidad registrada para el día ${diaTurno}`));
    }

    // Validar hora contra rangos
    const hTurno = toHHmm(nuevaHora);
    const okEnAlguno = horaDentroDeRangos(hTurno, disponibilidades);
    if (!okEnAlguno) {
      return res.status(400).json(fieldError("hora", `Horario fuera del rango disponible (${rangesLabel(disponibilidades)})`));
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
      return res.status(400).json(fieldError("hora", "Ya hay un turno agendado para ese horario con ese profesional"));
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
    return res.status(500).json({ status: "error", message: "Error al actualizar turno", error: err });
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
