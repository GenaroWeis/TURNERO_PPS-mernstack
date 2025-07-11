const Turno = require("../models/Turno");
const Disponibilidad = require("../models/Disponibilidad");
const Profesional = require('../models/profesional');
const Cliente = require("../models/Cliente");

// Obtener todos los turnos (GET)
const getTurnos = async (req, res) => {
  try {
    const turnos = await Turno.find()
      .populate("profesional", "nombre especialidad")
      .populate("cliente", "nombre email");
    res.status(200).json({ status: "ok", data: turnos });
  } catch (err) {
    res.status(500).json({ status: "error", message: "Error al obtener turnos", error: err });
  }
};

// Crear un nuevo turno (POST)
const createTurno = async (req, res) => {
  try {
    const { fecha, hora, profesional, cliente } = req.body;

    // Validaciones básicas
    if (!fecha || !hora || !profesional || !cliente) {
      return res.status(400).json({ status: "error", message: "Faltan datos obligatorios" });
    }

    const existeTurno = await Turno.findOne({ profesional, fecha, hora });
    if (existeTurno) {
        return res.status(400).json({
            status: "error",
            message: "Ya hay un turno agendado para ese horario con ese profesional"
        });
    }

    // Verificar que cliente y profesional existan
    const existeCliente = await Cliente.findById(cliente);
    const existeProfesional = await Profesional.findById(profesional);
    if (!existeCliente || !existeProfesional) {
      return res.status(404).json({ status: "error", message: "Cliente o profesional inexistente" });
    }

    // Validar formato de hora (hh:mm)
    const horaRegex = /^([0-1]\d|2[0-3]):[0-5]\d$/;
    if (!horaRegex.test(hora)) {
      return res.status(400).json({ status: "error", message: "El formato de la hora debe ser HH:MM (24h)" });
    }

    // Obtener el día de la semana
    const dias = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
    const diaTurno = dias[new Date(fecha).getDay()];

    // Verificar que el profesional tiene disponibilidad ese día
    const disponibilidad = await Disponibilidad.findOne({ profesional, diaSemana: diaTurno });
    if (!disponibilidad) {
      return res.status(400).json({
        status: "error",
        message: `El profesional no tiene disponibilidad registrada para el día ${diaTurno}`
      });
    }

    // Validar que la hora solicitada esté dentro del rango
    if (hora < disponibilidad.horaInicio || hora >= disponibilidad.horaFin) {
      return res.status(400).json({
        status: "error",
        message: `Horario fuera del rango disponible (${disponibilidad.horaInicio} - ${disponibilidad.horaFin})`
      });
    }

    // Verificar que el turno no esté duplicado (profesional ya ocupado en esa fecha y hora)
    const turnoExistente = await Turno.findOne({ fecha, hora, profesional });
    if (turnoExistente) {
      return res.status(400).json({
        status: "error",
        message: "El profesional ya tiene un turno asignado en esa fecha y hora"
      });
    }

    // Crear el turno
    const nuevoTurno = new Turno(req.body);
    const turnoGuardado = await nuevoTurno.save();
    res.status(201).json({ status: "ok", data: turnoGuardado });
  } catch (err) {
    res.status(500).json({ status: "error", message: "Error al crear turno", error: err });
  }
};

// Obtener turno por ID (GET ID)
const getTurnoById = async (req, res) => {
  try {
    const turno = await Turno.findById(req.params.id)
      .populate("profesional", "nombre especialidad")
      .populate("cliente", "nombre email");

    // Validación básica-----------------------------------------
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
    const turnoActualizado = await Turno.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json({ status: "ok", data: turnoActualizado });
  } catch (err) {
    res.status(400).json({ status: "error", message: "Error al actualizar turno", error: err });
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
