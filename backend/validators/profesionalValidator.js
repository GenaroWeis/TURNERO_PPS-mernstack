const { body, param } = require("express-validator");

exports.validarCrearProfesional = [
  body("nombre")
    .notEmpty().withMessage("El nombre es obligatorio")
    .isLength({ min: 2 }).withMessage("El nombre debe tener al menos 2 caracteres")
    .matches(/^[A-Za-zÁÉÍÓÚÑáéíóúñ\s]+$/).withMessage("El nombre solo puede contener letras y espacios")
    .trim(),

  body("especialidad")
  .notEmpty().withMessage("La especialidad es obligatoria")
  .isString().withMessage("La especialidad debe ser texto")
  .custom(v => !/^\d+(\.\d+)?$/.test(String(v))).withMessage("La especialidad no puede ser solo números")
  .matches(/[A-Za-zÁÉÍÓÚÑáéíóúñ]/).withMessage("La especialidad debe contener letras")
  .trim(),

  body("email")
    .notEmpty().withMessage("El email es obligatorio")
    .isEmail().withMessage("Debe ser un email válido")
    .normalizeEmail(),

  body("telefono")
    .notEmpty().withMessage("El teléfono es obligatorio")
    .matches(/^\d+$/).withMessage("El teléfono solo debe contener números")
    .isLength({ min: 8, max: 15 }).withMessage("El teléfono debe tener entre 8 y 15 dígitos")
];

//------------------------------------------------------------

exports.validarIdProfesional = [
  param("id")
    .isMongoId().withMessage("ID inválido")
];

//------------------------------------------------------------

exports.validarActualizarProfesional = [
  param("id")
    .isMongoId().withMessage("ID inválido"),

  body("nombre")
    .optional()
    .isLength({ min: 2 }).withMessage("El nombre debe tener al menos 2 caracteres")
    .matches(/^[A-Za-zÁÉÍÓÚÑáéíóúñ\s]+$/).withMessage("El nombre solo puede contener letras y espacios")
    .trim(),

  body("especialidad")
    .optional()
    .isString().withMessage("La especialidad debe ser texto")
    .trim(),

  body("email")
    .optional()
    .isEmail().withMessage("Debe ser un email válido")
    .normalizeEmail(),

  body("telefono")
    .optional()
    .matches(/^\d+$/).withMessage("El teléfono solo debe contener números")
    .isLength({ min: 8, max: 15 }).withMessage("El teléfono debe tener entre 8 y 15 dígitos")
];

//------------------------------------------------------------

exports.validarEliminarProfesional = [
  param("id")
    .isMongoId().withMessage("ID inválido")
];

