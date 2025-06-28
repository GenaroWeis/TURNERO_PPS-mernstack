const express = require("express");
const router = express.Router();
const turnoController = require("../controllers/turnoController");

// Validadores
const {
  validarCrearTurno,
  validarActualizarTurno,
  validarIdTurno,
  validarEliminarTurno
} = require("../validators/turnoValidator");

const validateRequest = require("../middleware/validateRequest");

// GET todos los turnos
router.get("/", turnoController.getTurnos);

// POST crear turno con validación
router.post(
  "/",
  validarCrearTurno,
  validateRequest,
  turnoController.createTurno
);

// GET turno por ID con validación
router.get(
  "/:id",
  validarIdTurno,
  validateRequest,
  turnoController.getTurnoById
);

// PUT actualizar turno con validación
router.put(
  "/:id",
  validarActualizarTurno,
  validateRequest,
  turnoController.updateTurno
);

// DELETE eliminar turno con validación
router.delete(
  "/:id",
  validarIdTurno,
  validateRequest,
  turnoController.deleteTurno
);

module.exports = router;
