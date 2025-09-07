const Profesional = require('../models/Profesional');

// Obtener todos los profesionales (GET)
const getProfesionales = async (req, res) => {
  try {
    const profesionales = await Profesional.find();
    res.status(200).json({
      status: "ok",
      data: profesionales
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: "Error al obtener profesionales",
      error: err
    });
  }
};

// Crear un nuevo profesional (POST)
const createProfesional = async (req, res) => {
  try {
    const nuevoProfesional = new Profesional(req.body);
    const profesionalGuardado = await nuevoProfesional.save();
    res.status(201).json({
      status: "ok",
      data: profesionalGuardado
    });
  } catch (err) {
    res.status(400).json({
      status: "error",
      message: "Error al crear profesional",
      error: err.message || err
    });
  }
};


// Obtener un profesional por ID (GET ID)
const getProfesionalById = async (req, res) => {
  try {
    const profesional = await Profesional.findById(req.params.id);
    if (!profesional) {
      return res.status(404).json({
        status: "error",
        message: "Profesional no encontrado"
      });
    }
    res.status(200).json({
      status: "ok",
      data: profesional
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: "Error al buscar profesional",
      error: err
    });
  }
};


// Actualizar un profesional (PUT ID)
const updateProfesional = async (req, res) => {
  try {
    const actualizado = await Profesional.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json({
      status: "ok",
      data: actualizado
    });
  } catch (err) {
    res.status(400).json({
      status: "error",
      message: "Error al actualizar profesional",
      error: err
    });
  }
};

// Eliminar un profesional (DELETE ID)
const deleteProfesional = async (req, res) => {
  try {
    await Profesional.findByIdAndDelete(req.params.id);
    res.status(204).json({
      status: "ok",
      message: "Profesional eliminado"
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: "Error al eliminar profesional",
      error: err
    });
  }
};

module.exports = {
  getProfesionales,
  createProfesional,
  getProfesionalById,
  updateProfesional,
  deleteProfesional,
};
