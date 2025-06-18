const express = require("express");
const router = express.Router();
const turnoController = require("../controllers/turnoController");

// GET todos los turnos
router.get("/", turnoController.getTurnos);

// POST crear un nuevo turno
router.post("/", turnoController.createTurno);

// GET por ID
router.get("/:id", turnoController.getTurnoById);

// PUT actualizar 
router.put("/:id", turnoController.updateTurno);

// DELETE eliminar 
router.delete("/:id", turnoController.deleteTurno);

module.exports = router;
