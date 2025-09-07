const mongoose = require("mongoose");

const ClienteSchema = new mongoose.Schema({
  nombre: { type: String, required: true, trim: true },
  apellido: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, trim: true },
  telefono: { type: String, required: true, trim: true },
  dni: { type: String, required: false, trim: true, unique: true},
  direccion: { type: String, required: false, trim: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Cliente", ClienteSchema);
