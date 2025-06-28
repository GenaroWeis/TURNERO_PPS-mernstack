const { body, param } = require("express-validator");

exports.validarCrearTurno = [
  body("fecha")
    .notEmpty().withMessage("La fecha es obligatoria")
    .isISO8601().withMessage("La fecha debe tener formato válido (YYYY-MM-DD)"),

  body("hora")
    .notEmpty().withMessage("La hora es obligatoria")
    .matches(/^([0-1]\d|2[0-3]):[0-5]\d$/).withMessage("La hora debe estar en formato HH:MM (24h)"),

  body("profesional")
    .notEmpty().withMessage("El ID del profesional es obligatorio")
    .isMongoId().withMessage("El ID del profesional no es válido"),

  body("cliente")
    .notEmpty().withMessage("El ID del cliente es obligatorio")
    .isMongoId().withMessage("El ID del cliente no es válido"),

  body("estado")
    .optional()
    .isIn(["pendiente", "confirmado", "cancelado"]).withMessage("El estado debe ser 'pendiente', 'confirmado' o 'cancelado'")
];

//------------------------------------------------------------

exports.validarActualizarTurno = [
  param("id")
    .isMongoId().withMessage("ID del turno inválido"),

  body("fecha")
    .optional()
    .isISO8601().withMessage("La fecha debe tener formato válido (YYYY-MM-DD)"),

  body("hora")
    .optional()
    .matches(/^([0-1]\d|2[0-3]):[0-5]\d$/).withMessage("La hora debe estar en formato HH:MM (24h)"),

  body("profesional")
    .optional()
    .isMongoId().withMessage("El ID del profesional no es válido"),

  body("cliente")
    .optional()
    .isMongoId().withMessage("El ID del cliente no es válido"),

  body("estado")
    .optional()
    .isIn(["pendiente", "confirmado", "cancelado"]).withMessage("El estado debe ser 'pendiente', 'confirmado' o 'cancelado'")
];

//------------------------------------------------------------

exports.validarIdTurno = [
  param("id")
    .isMongoId().withMessage("ID del turno inválido")
];
