const express = require("express");
const router = express.Router();
const disponibilidadController = require("../controllers/disponibilidadController");

// GET todas las disponibilidades
router.get("/", disponibilidadController.getDisponibilidades);

// POST crear una nueva disponibilidad
router.post("/", disponibilidadController.createDisponibilidad);

// GET por ID
router.get("/:id", disponibilidadController.getDisponibilidadById);

// PUT actualizar
router.put("/:id", disponibilidadController.updateDisponibilidad);

// DELETE eliminar
router.delete("/:id", disponibilidadController.deleteDisponibilidad);

module.exports = router;
