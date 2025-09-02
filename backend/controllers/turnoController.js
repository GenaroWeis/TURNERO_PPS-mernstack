const Turno = require("../models/Turno");
const Disponibilidad = require("../models/Disponibilidad");
const Profesional = require('../models/profesional');
const Cliente = require("../models/Cliente");

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

    // Verificar si ya existe un turno con ese profesional en esa fecha y hora
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

    // Obtener el día de la semana
    const dias = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
    const d = new Date(fecha);
    const idx = d.getUTCDay(); // ← Día corrido fix
    const diaTurno = dias[idx];

    // Verificar que el profesional tiene disponibilidad ese día
    const disponibilidad = await Disponibilidad.findOne({ profesional, diaSemana: diaTurno });
    if (!disponibilidad) {
      return res.status(400).json({
        status: "error",
        message: `El profesional no tiene disponibilidad registrada para el día ${diaTurno}`
      });
    }

    // Verificar que la hora esté dentro del rango de disponibilidad
    if (hora < disponibilidad.horaInicio || hora >= disponibilidad.horaFin) {
      return res.status(400).json({
        status: "error",
        message: `Horario fuera del rango disponible (${disponibilidad.horaInicio} - ${disponibilidad.horaFin})`
      });
    }

    // Crear y guardar el nuevo turno
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

    // Determinar nuevos valores (si no vienen, usamos los actuales)
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
    const idx = d.getUTCDay();
    const diaTurno = dias[idx];

    // Validar disponibilidad del profesional en ese día
    const disponibilidad = await Disponibilidad.findOne({ profesional: nuevoProf, diaSemana: diaTurno });
    if (!disponibilidad) {
      return res.status(400).json({
        status: "error",
        message: `El profesional no tiene disponibilidad registrada para el día ${diaTurno}`
      });
    }

    // Validar rango horario
    if (nuevaHora < disponibilidad.horaInicio || nuevaHora >= disponibilidad.horaFin) {
      return res.status(400).json({
        status: "error",
        message: `Horario fuera del rango disponible (${disponibilidad.horaInicio} - ${disponibilidad.horaFin})`
      });
    }

    // Validar choque con otro turno (excluyendo el propio)
    const choque = await Turno.findOne({
      _id: { $ne: id },
      profesional: nuevoProf,
      fecha: nuevaFecha,
      hora: nuevaHora
    });
    if (choque) {
      return res.status(400).json({
        status: "error",
        message: "Ya hay un turno agendado para ese horario con ese profesional"
      });
    }

    // Si todo OK, actualizamos y devolvemos el nuevo
    turnoActual.fecha = nuevaFecha;
    turnoActual.hora = nuevaHora;
    turnoActual.estado = nuevoEstado;
    turnoActual.profesional = nuevoProf;
    turnoActual.cliente = nuevoCli;

    const turnoActualizado = await turnoActual.save();

    // devolver populado igual que GET
    const turnoConPopulate = await Turno.findById(turnoActualizado._id)
      .populate("profesional", "nombre especialidad email")
      .populate("cliente", "nombre email dni");

    res.status(200).json({ status: "ok", data: turnoConPopulate });
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
