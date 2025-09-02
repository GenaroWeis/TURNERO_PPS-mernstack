const express = require("express");
const router = express.Router();
const disponibilidadController = require("../controllers/disponibilidadController");

// Validadores
const {
  validarCrearDisponibilidad,
  validarActualizarDisponibilidad,
  validarIdDisponibilidad,
  validarEliminarDisponibilidad,
  validarIdProfesionalDisponibilidad
} = require("../validators/disponibilidadValidator");

const validateRequest = require("../middleware/validateRequest");

// GET todas las disponibilidades
router.get("/", disponibilidadController.getDisponibilidades);

// GET todas las disponibilidades de un profesional específico
router.get(
  "/profesional/:profesionalId",
  validarIdProfesionalDisponibilidad,
  validateRequest,
  disponibilidadController.getDisponibilidadesPorProfesional
);

// POST crear una nueva disponibilidad con validaciones
router.post(
  "/",
  validarCrearDisponibilidad,
  validateRequest,
  disponibilidadController.createDisponibilidad
);

// GET por ID con validación
router.get(
  "/:id",
  validarIdDisponibilidad,
  validateRequest,
  disponibilidadController.getDisponibilidadById
);




// PUT actualizar con validaciones
router.put(
  "/:id",
  validarActualizarDisponibilidad,
  validateRequest,
  disponibilidadController.updateDisponibilidad
);

// DELETE eliminar con validación
router.delete(
  "/:id",
  validarEliminarDisponibilidad,
  validateRequest,
  disponibilidadController.deleteDisponibilidad
);

module.exports = router;
