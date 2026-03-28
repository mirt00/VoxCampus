const Joi = require("joi");

const createPostSchema = Joi.object({
  title: Joi.string().min(3).max(150).required(),
  body: Joi.string().min(3).max(2000).required(),
  category: Joi.string().allow("").optional(),
  authorType: Joi.string().valid("registered", "anonymous").required(),
  attachments: Joi.array().items(Joi.string()).max(3).optional(),
});

module.exports = { createPostSchema };
