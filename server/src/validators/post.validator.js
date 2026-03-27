const Joi = require("joi");

const createPostSchema = Joi.object({
  title: Joi.string().min(5).max(150).required(),
  body: Joi.string().min(10).max(2000).required(),
  category: Joi.string().required(),
  authorType: Joi.string().valid("registered", "anonymous").required(),
  attachments: Joi.array().items(Joi.string()).max(3).optional(),
});

module.exports = { createPostSchema };
