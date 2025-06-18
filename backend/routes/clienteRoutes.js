const express = require("express");
const router = express.Router();
const clienteController = require("../controllers/clienteController");

// GET todos los clientes
router.get("/", clienteController.getClientes);

// POST crear cliente
router.post("/", clienteController.createCliente);

// GET por ID
router.get("/:id", clienteController.getClienteById);

// PUT actualizar
router.put("/:id", clienteController.updateCliente);

// DELETE eliminar
router.delete("/:id", clienteController.deleteCliente);

module.exports = router;
