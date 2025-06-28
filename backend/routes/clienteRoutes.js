const express = require("express");
const router = express.Router();
const { body, param } = require('express-validator');
const clienteController = require("../controllers/clienteController");

// Validadores
const {
  validarCrearCliente,
  validarActualizarCliente,
  validarIdCliente,
  validarEliminarCliente
} = require("../validators/clienteValidator");

const validateRequest = require("../middleware/validateRequest");

// GET todos los clientes
router.get("/", clienteController.getClientes);

// POST crear cliente con validación
router.post(
  "/",
  validarCrearCliente,
  validateRequest,
  clienteController.createCliente
);

// GET cliente por ID con validación
router.get(
  "/:id",
  validarIdCliente,
  validateRequest,
  clienteController.getClienteById
);

// PUT actualizar cliente con validaciones
router.put(
  "/:id",
  validarActualizarCliente,
  validateRequest,
  clienteController.updateCliente
);

// DELETE eliminar cliente con validación de ID
router.delete(
  "/:id",
  validarEliminarCliente,
  validateRequest,
  clienteController.deleteCliente
);

module.exports = router;
