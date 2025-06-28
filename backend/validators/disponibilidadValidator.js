const { body, param } = require("express-validator");

exports.validarCrearDisponibilidad = [
  body("diaSemana")
    .notEmpty().withMessage("El día de la semana es obligatorio")
    .isIn(["lunes", "martes", "miércoles", "jueves", "viernes", "sábado", "domingo"])
    .withMessage("El día debe ser uno válido (lunes a domingo)"),

  body("horaInicio")
    .notEmpty().withMessage("La hora de inicio es obligatoria")
    .matches(/^([01]\d|2[0-3]):[0-5]\d$/)
    .withMessage("El formato de la hora de inicio debe ser HH:MM (ej: 09:00)"),

  body("horaFin")
    .notEmpty().withMessage("La hora de fin es obligatoria")
    .matches(/^([01]\d|2[0-3]):[0-5]\d$/)
    .withMessage("El formato de la hora de fin debe ser HH:MM (ej: 14:30)"),

  body("profesional")
    .notEmpty().withMessage("El profesional es obligatorio")
    .isMongoId().withMessage("ID del profesional inválido")
];

//------------------------------------------------------------

exports.validarActualizarDisponibilidad = [
  param("id")
    .isMongoId().withMessage("ID de disponibilidad inválido"),

  body("diaSemana")
    .optional()
    .isIn(["lunes", "martes", "miércoles", "jueves", "viernes", "sábado", "domingo"])
    .withMessage("El día debe ser uno válido (lunes a domingo)"),

  body("horaInicio")
    .optional()
    .matches(/^([01]\d|2[0-3]):[0-5]\d$/)
    .withMessage("El formato de la hora de inicio debe ser HH:MM"),

  body("horaFin")
    .optional()
    .matches(/^([01]\d|2[0-3]):[0-5]\d$/)
    .withMessage("El formato de la hora de fin debe ser HH:MM"),

  body("profesional")
    .optional()
    .isMongoId().withMessage("ID del profesional inválido")
];

//------------------------------------------------------------

exports.validarIdDisponibilidad = [
  param("id")
    .isMongoId().withMessage("ID de disponibilidad inválido")
];

exports.validarEliminarDisponibilidad = exports.validarIdDisponibilidad;

//------------------------------------------------------------

exports.validarIdProfesionalDisponibilidad = [
  param("profesionalId")
    .isMongoId().withMessage("ID del profesional inválido")
];
