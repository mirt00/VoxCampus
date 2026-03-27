const Joi = require("joi");

const registerSchema = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  faculty: Joi.string().allow("").optional(),
  department: Joi.string().allow("").optional(),
  studentId: Joi.string().allow("").optional(),
  phone: Joi.string().allow("").optional(),
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
