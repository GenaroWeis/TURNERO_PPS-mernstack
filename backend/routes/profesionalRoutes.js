const express = require("express");
const router = express.Router();
const profesionalController = require("../controllers/profesionalController");

// GET todos los profesionales
router.get("/", profesionalController.getProfesionales);

// POST crear profesional
router.post("/", profesionalController.createProfesional);

// GET por ID
router.get("/:id", profesionalController.getProfesionalById);

// PUT actualizar
router.put("/:id", profesionalController.updateProfesional);

// DELETE eliminar
router.delete("/:id", profesionalController.deleteProfesional);

module.exports = router;
