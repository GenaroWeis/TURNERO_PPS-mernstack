const Cliente = require("../models/Cliente");

// Obtener todos los clientes (GET)
const getClientes = async (req, res) => {
  try {
    const clientes = await Cliente.find();
    res.status(200).json({
      status: "ok",
      data: clientes
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Error al obtener clientes",
      error
    });
  }
};

// Crear un nuevo cliente (POST)
const createCliente = async (req, res) => {
  try {
    const nuevoCliente = new Cliente(req.body);
    const clienteGuardado = await nuevoCliente.save();
    res.status(201).json({
      status: "ok",
      data: clienteGuardado
    });
  } catch (error) {
    res.status(400).json({
      status: "error",
      message: "Error al crear cliente",
      error
    });
  }
};

// Obtener cliente por ID (GET ID)
const getClienteById = async (req, res) => {
  try {
    const cliente = await Cliente.findById(req.params.id);
    if (!cliente) {
      return res.status(404).json({
        status: "error",
        message: "Cliente no encontrado"
      });
    }
    res.status(200).json({
      status: "ok",
      data: cliente
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Error al buscar cliente",
      error
    });
  }
};
 
// Actualizar cliente (PUT ID)
const updateCliente = async (req, res) => {
  try {
    const clienteActualizado = await Cliente.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json({
      status: "ok",
      data: clienteActualizado
    });
  } catch (error) {
    res.status(400).json({
      status: "error",
      message: "Error al actualizar cliente",
      error
    });
  }
};

// Eliminar cliente (DELETE ID)
const deleteCliente = async (req, res) => {
  try {
    await Cliente.findByIdAndDelete(req.params.id);
    res.status(204).json({
      status: "ok",
      message: "Cliente eliminado"
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Error al eliminar cliente",
      error
    });
  }
};

module.exports = {
  getClientes,
  createCliente,
  getClienteById,
  updateCliente,
  deleteCliente
};
