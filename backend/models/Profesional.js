const mongoose = require("mongoose");

const ProfesionalSchema = new mongoose.Schema({
  nombre: { type: String, required: true, trim: true },
  especialidad: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, trim: true },
  telefono: { type: String, required: true, trim: true },
});

module.exports = mongoose.model("Profesional", ProfesionalSchema);