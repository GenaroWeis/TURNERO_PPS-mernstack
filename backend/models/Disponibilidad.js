const mongoose = require("mongoose");

const DisponibilidadSchema = new mongoose.Schema({
  diaSemana: {
    type: String,
    required: true,
    enum: ["lunes", "martes", "miércoles", "jueves", "viernes", "sábado", "domingo"]
  },
  horaInicio: { type: String, required: true }, // ej: "09:00"
  horaFin: { type: String, required: true },     // ej: "13:00"
  profesional: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Profesional",
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model("Disponibilidad", DisponibilidadSchema);
