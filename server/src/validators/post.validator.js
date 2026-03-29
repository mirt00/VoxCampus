const Joi = require("joi");

const createPostSchema = Joi.object({
  title: Joi.string().trim().min(7).max(150).pattern(/^[a-zA-Z0-9\s]+$/).required()
    .messages({
      "string.empty": "Title cannot be empty",
      "string.min": "Title must be at least 7 characters",
      "string.pattern.base": "Title must contain only letters and numbers",
    }),
  body: Joi.string().trim().min(15).max(2000).pattern(/^[a-zA-Z0-9\s]+$/).required()
    .messages({
      "string.empty": "Description cannot be empty",
      "string.min": "Description must be at least 15 characters",
      "string.pattern.base": "Description must contain only letters and numbers",
    }),
  category: Joi.string().valid(...[
    "Academic / Exam Issues",
    "Facilities / Maintenance",
    "Infrastructure / Burst Pipe",
    "Safety / Emergency",
    "Services / Admin",
    "General Suggestion",
  ]).required().messages({
    "any.only": "Please select a valid category",
    "any.required": "Category is required",
  }),
  authorType: Joi.string().valid("registered", "anonymous").required(),
  attachments: Joi.array().items(Joi.string()).max(3).optional(),
});

module.exports = { createPostSchema };
