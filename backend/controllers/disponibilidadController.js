const Disponibilidad = require("../models/Disponibilidad");

// Obtener todas las disponibilidades (GET)
const getDisponibilidades = async (req, res) => {
  try {
    const disponibilidades = await Disponibilidad.find()
      .populate("profesional", "nombre especialidad");
    res.status(200).json({ status: "ok", data: disponibilidades });
  } catch (err) {
    res.status(500).json({ status: "error", message: "Error al obtener disponibilidades", error: err });
  }
};

const createDisponibilidad = async (req, res) => {
  try {
    const { diaSemana, horaInicio, horaFin, profesional } = req.body;

    if (!diaSemana || !horaInicio || !horaFin || !profesional) {
      return res.status(400).json({ status: "error", message: "Faltan datos obligatorios" });
    }

    // Validar formato hh:mm
    const horaRegex = /^([01]\d|2[0-3]):[0-5]\d$/;
    if (!horaRegex.test(horaInicio) || !horaRegex.test(horaFin)) {
      return res.status(400).json({
        status: "error",
        message: "El formato de hora debe ser HH:MM (ej: 09:00, 14:30)"
      });
    }

    // Validar que horaInicio < horaFin
    if (horaInicio >= horaFin) {
      return res.status(400).json({
        status: "error",
        message: "La hora de inicio debe ser menor que la de fin"
      });
    }

    // Buscar disponibilidades existentes del profesional ese día
    const existentes = await Disponibilidad.find({ profesional, diaSemana });

    // Verificar duplicado exacto
    const duplicadoExacto = existentes.find(d =>
      d.horaInicio === horaInicio && d.horaFin === horaFin
    );
    if (duplicadoExacto) {
      return res.status(400).json({
        status: "error",
        message: "Ya existe una disponibilidad con ese mismo rango horario para ese día"
      });
    }

    // Verificar solapamiento de horarios
    const seSolapa = existentes.some(d =>
      (horaInicio < d.horaFin && horaFin > d.horaInicio)
    );
    if (seSolapa) {
      return res.status(400).json({
        status: "error",
        message: "El rango horario se superpone con otra disponibilidad del mismo día"
      });
    }

    // Guardar disponibilidad
    const nueva = new Disponibilidad(req.body);
    const guardada = await nueva.save();

    res.status(201).json({ status: "ok", data: guardada });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: "Error al crear disponibilidad",
      error: err
    });
  }
};

// Obtener por ID (GET ID)
const getDisponibilidadById = async (req, res) => {
  try {
    const disponibilidad = await Disponibilidad.findById(req.params.id)
      .populate("profesional", "nombre especialidad");

    // Validación básica-----------------------------------------
    if (!disponibilidad) {
      return res.status(404).json({ status: "error", message: "Disponibilidad no encontrada" });
    }

    res.status(200).json({ status: "ok", data: disponibilidad });
  } catch (err) {
    res.status(500).json({ status: "error", message: "Error al buscar disponibilidad", error: err });
  }
};

// Actualizar (PUT ID)
const updateDisponibilidad = async (req, res) => {
  try {
    const actualizada = await Disponibilidad.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json({ status: "ok", data: actualizada });
  } catch (err) {
    res.status(400).json({ status: "error", message: "Error al actualizar disponibilidad", error: err });
  }
};

// Eliminar (DELETE ID)
const deleteDisponibilidad = async (req, res) => {
  try {
    await Disponibilidad.findByIdAndDelete(req.params.id);
    res.status(204).json({ status: "ok", message: "Disponibilidad eliminada" });
  } catch (err) {
    res.status(500).json({ status: "error", message: "Error al eliminar disponibilidad", error: err });
  }
};

module.exports = {
  getDisponibilidades,
  createDisponibilidad,
  getDisponibilidadById,
  updateDisponibilidad,
  deleteDisponibilidad
};
