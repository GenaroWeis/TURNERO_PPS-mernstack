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

// Crear nueva disponibilidad (POST)
const createDisponibilidad = async (req, res) => {
  try {
    const { diaSemana, horaInicio, horaFin, profesional } = req.body;

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

// Obtener disponibilidad por ID (GET ID)
const getDisponibilidadById = async (req, res) => {
  try {
    const disponibilidad = await Disponibilidad.findById(req.params.id)
      .populate("profesional", "nombre especialidad");

    if (!disponibilidad) {
      return res.status(404).json({ status: "error", message: "Disponibilidad no encontrada" });
    }

    res.status(200).json({ status: "ok", data: disponibilidad });
  } catch (err) {
    res.status(500).json({ status: "error", message: "Error al buscar disponibilidad", error: err });
  }
};

// Obtener todas las disponibilidades de un profesional (GET por profesionalId)
const getDisponibilidadesPorProfesional = async (req, res) => {
  try {
    const disponibilidades = await Disponibilidad.find({ profesional: req.params.profesionalId })
      .populate("profesional", "nombre especialidad");

    if (!disponibilidades.length) {
      return res.status(404).json({
        status: "error",
        message: "No se encontraron disponibilidades para este profesional"
      });
    }

    res.status(200).json({ status: "ok", data: disponibilidades });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: "Error al buscar disponibilidades",
      error: err
    });
  }
};


// Actualizar disponibilidad (PUT ID)
const updateDisponibilidad = async (req, res) => {
  try {
    const actualizada = await Disponibilidad.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json({ status: "ok", data: actualizada });
  } catch (err) {
    res.status(400).json({ status: "error", message: "Error al actualizar disponibilidad", error: err });
  }
};

// Eliminar disponibilidad (DELETE ID)
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
  deleteDisponibilidad,
  getDisponibilidadesPorProfesional 
};
