const { body, param } = require("express-validator");

exports.validarCrearCliente = [
  body("nombre")
    .notEmpty().withMessage("El nombre es obligatorio")
    .isLength({ min: 2 }).withMessage("El nombre debe tener al menos 2 caracteres")
    .matches(/^[A-Za-zÁÉÍÓÚÑáéíóúñ\s]+$/).withMessage("El nombre solo puede contener letras y espacios")
    .trim(),

  body("apellido")
    .notEmpty().withMessage("El apellido es obligatorio")
    .isLength({ min: 2 }).withMessage("El apellido debe tener al menos 2 caracteres")
    .matches(/^[A-Za-zÁÉÍÓÚÑáéíóúñ\s]+$/).withMessage("El apellido solo puede contener letras y espacios")
    .trim(),

  body("email")
    .notEmpty().withMessage("El email es obligatorio")
    .isEmail().withMessage("Debe ser un email válido")
    .normalizeEmail(),

  body("telefono")
    .notEmpty().withMessage("El teléfono es obligatorio")
    .matches(/^\d+$/).withMessage("El teléfono solo debe contener números")
    .isLength({ min: 8, max: 15 }).withMessage("El teléfono debe tener entre 8 y 15 dígitos"),

  body("dni")
    .optional()
    .isNumeric().withMessage("El DNI debe ser numérico")
    .isLength({ min: 7, max: 9 }).withMessage("El DNI debe tener entre 7 y 9 dígitos"),

  body("direccion")
    .optional()
    .isString().withMessage("La dirección debe ser texto")
    .trim()
];

//------------------------------------------------------------

exports.validarActualizarCliente = [
  param("id")
    .isMongoId().withMessage("ID inválido"),

  body("nombre")
    .optional()
    .isLength({ min: 2 }).withMessage("El nombre debe tener al menos 2 caracteres")
    .matches(/^[A-Za-zÁÉÍÓÚÑáéíóúñ\s]+$/).withMessage("El nombre solo puede contener letras y espacios")
    .trim(),

  body("apellido")
    .optional()
    .isLength({ min: 2 }).withMessage("El apellido debe tener al menos 2 caracteres")
    .matches(/^[A-Za-zÁÉÍÓÚÑáéíóúñ\s]+$/).withMessage("El apellido solo puede contener letras y espacios")
    .trim(),

  body("email")
    .optional()
    .isEmail().withMessage("Debe ser un email válido")
    .normalizeEmail(),

  body("telefono")
    .optional()
    .matches(/^\d+$/).withMessage("El teléfono solo debe contener números")
    .isLength({ min: 8, max: 15 }).withMessage("El teléfono debe tener entre 8 y 15 dígitos"),

  body("dni")
    .optional()
    .isNumeric().withMessage("El DNI debe ser numérico")
    .isLength({ min: 7, max: 9 }).withMessage("El DNI debe tener entre 7 y 9 dígitos"),

  body("direccion")
    .optional()
    .isString().withMessage("La dirección debe ser texto")
    .trim()
];

//------------------------------------------------------------

exports.validarIdCliente = [
  param("id")
    .isMongoId().withMessage("ID inválido")
];

//------------------------------------------------------------

exports.validarEliminarCliente = [
  param("id")
    .isMongoId()
    .withMessage("El ID del cliente no es válido")
];
