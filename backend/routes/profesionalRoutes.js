const express = require("express");
const router = express.Router();
const profesionalController = require("../controllers/profesionalController");

// Validadores
const {
  validarCrearProfesional,
  validarActualizarProfesional,
  validarEliminarProfesional,
  validarIdProfesional
} = require("../validators/profesionalValidator");

const validateRequest = require("../middleware/validateRequest");

// GET todos los profesionales
router.get("/", profesionalController.getProfesionales);

// POST crear profesional con validación
router.post(
  "/",
  validarCrearProfesional,
  validateRequest,
  profesionalController.createProfesional
);

// GET profesional por ID con validación de ID
router.get(
  "/:id",
  validarIdProfesional,
  validateRequest,
  profesionalController.getProfesionalById
);

// PUT actualizar profesional con validaciones
router.put(
  "/:id",
  validarActualizarProfesional,
  validateRequest,
  profesionalController.updateProfesional
);

// DELETE eliminar profesional con validación de ID
router.delete(
  "/:id",
  validarEliminarProfesional,
  validateRequest,
  profesionalController.deleteProfesional
);

module.exports = router;
