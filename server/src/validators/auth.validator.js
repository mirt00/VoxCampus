const Joi = require("joi");

const registerSchema = Joi.object({
  name: Joi.string().min(3).max(50).pattern(/^[a-zA-Z\s]+$/).required()
    .messages({ "string.pattern.base": "Name must contain only alphabets" }),
  email: Joi.string().email().required(),
  password: Joi.string().min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .required()
    .messages({ "string.pattern.base": "Password must include uppercase, lowercase, number and special character" }),
  faculty: Joi.string().valid("BCA", "CSIT", "BBM", "BBA", "B.Ed").required(),
  studentId: Joi.string().pattern(/^[A-Za-z0-9-]+$/).required()
    .messages({ "string.pattern.base": "Student ID must be alphanumeric (e.g. VC-2026-001)" }),
  phone: Joi.string().pattern(/^\d{10}$/).required()
    .messages({ "string.pattern.base": "Phone must be exactly 10 digits" }),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const forgotSchema = Joi.object({
  email: Joi.string().email().required(),
});

const resetSchema = Joi.object({
  password: Joi.string().min(6).required(),
});

const changePasswordSchema = Joi.object({
  oldPassword: Joi.string().required(),
  newPassword: Joi.string().min(6).required(),
});

module.exports = { registerSchema, loginSchema, forgotSchema, resetSchema, changePasswordSchema };
