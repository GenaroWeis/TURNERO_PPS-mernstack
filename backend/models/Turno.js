const mongoose = require("mongoose");

const TurnoSchema = new mongoose.Schema({
  fecha: { type: Date, required: true },
  hora: { type: String, required: true },
  estado: {
    type: String,
    enum: ["pendiente", "confirmado", "cancelado"],
    default: "pendiente"
  },
  profesional: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Profesional",
    required: true
  },
  cliente: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Cliente",
    required: true
  }
}, { timestamps: true });//timestamps agrega automáticamente createdAt y updatedAt.

module.exports = mongoose.model("Turno", TurnoSchema);