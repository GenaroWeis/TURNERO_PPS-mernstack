const Disponibilidad = require("../models/Disponibilidad");
const Profesional = require("../models/profesional");

const { toHHmm, toMinutes } = require("../utils/timeUtils");
const { fieldError } = require("../utils/fieldError");

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

    // Normalizar horas
    const hIni = toHHmm(horaInicio);
    const hFin = toHHmm(horaFin);

    // Validar fin > inicio
    const mi = toMinutes(hIni);
    const mf = toMinutes(hFin);
    if (mf <= mi) {
      return res.status(400).json(fieldError("horaFin", "La hora de fin debe ser mayor a la de inicio"));
    }

    // Profesional existente
    const existsProf = await Profesional.findById(profesional);
    if (!existsProf) {
      return res.status(404).json({ status: "error", message: "Profesional inexistente" });
    }

    // Existentes (mismo día/prof)
    const existentes = await Disponibilidad.find({ profesional, diaSemana });

    // Duplicado exacto
    const duplicadoExacto = existentes.find(d =>
      toHHmm(d.horaInicio) === hIni && toHHmm(d.horaFin) === hFin
    );
    if (duplicadoExacto) {
      return res.status(400).json(fieldError("horaInicio", "Ya existe una disponibilidad con ese mismo rango horario para ese día"));
    }

    // Solapamiento [ini, fin) con cualquiera
    const seSolapa = existentes.some(d => {
      const eIni = toMinutes(toHHmm(d.horaInicio));
      const eFin = toMinutes(toHHmm(d.horaFin));
      return (mi < eFin && mf > eIni);
    });
    if (seSolapa) {
      return res.status(400).json(fieldError("horaInicio", "El rango horario se superpone con otra disponibilidad del mismo día"));
    }

    // Guardar normalizado
    const nueva = new Disponibilidad({ diaSemana, horaInicio: hIni, horaFin: hFin, profesional });
    const guardada = await nueva.save();

    return res.status(201).json({ status: "ok", data: guardada });
  } catch (err) {
    return res.status(500).json({ status: "error", message: "Error al crear disponibilidad", error: err });
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
    const { id } = req.params;

    const actual = await Disponibilidad.findById(id);
    if (!actual) {
      return res.status(404).json({ status: "error", message: "Disponibilidad no encontrada" });
    }

    // Resolver nuevos valores (fallback a los actuales)
    const diaSemana   = (req.body.diaSemana ?? actual.diaSemana);
    const horaInicioR = (req.body.horaInicio ?? actual.horaInicio);
    const horaFinR    = (req.body.horaFin ?? actual.horaFin);
    const profesional = (req.body.profesional ?? actual.profesional);

    // Normalizar horas
    const hIni = toHHmm(horaInicioR);
    const hFin = toHHmm(horaFinR);

    // Validar fin > inicio
    const mi = toMinutes(hIni);
    const mf = toMinutes(hFin);
    if (mf <= mi) {
      return res.status(400).json(fieldError("horaFin", "La hora de fin debe ser mayor a la de inicio"));
    }

    // Profesional existente
    const existsProf = await Profesional.findById(profesional);
    if (!existsProf) {
      return res.status(404).json({ status: "error", message: "Profesional inexistente" });
    }

    // Otras disponibilidades del mismo prof/día (excluyendo la actual)
    const existentes = await Disponibilidad.find({
      _id: { $ne: id },
      profesional,
      diaSemana
    });

    // Duplicado exacto
    const duplicadoExacto = existentes.find(d =>
      toHHmm(d.horaInicio) === hIni && toHHmm(d.horaFin) === hFin
    );
    if (duplicadoExacto) {
      return res.status(400).json(fieldError("horaInicio", "Ya existe una disponibilidad con ese mismo rango horario para ese día"));
    }

    // Solapamiento
    const seSolapa = existentes.some(d => {
      const eIni = toMinutes(toHHmm(d.horaInicio));
      const eFin = toMinutes(toHHmm(d.horaFin));
      return (mi < eFin && mf > eIni);
    });
    if (seSolapa) {
      return res.status(400).json(fieldError("horaInicio", "El rango horario se superpone con otra disponibilidad del mismo día"));
    }

    // Guardar normalizado
    actual.diaSemana   = diaSemana;
    actual.horaInicio  = hIni;
    actual.horaFin     = hFin;
    actual.profesional = profesional;

    const actualizada = await actual.save();
    return res.status(200).json({ status: "ok", data: actualizada });
  } catch (err) {
    return res.status(400).json({ status: "error", message: "Error al actualizar disponibilidad", error: err });
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
