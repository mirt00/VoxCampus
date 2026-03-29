const Joi = require("joi");

const createPostSchema = Joi.object({
  title: Joi.string().trim().min(3).max(150).required()
    .messages({ "string.empty": "Title cannot be empty or just spaces" }),
  body: Joi.string().trim().min(3).max(2000).required()
    .messages({ "string.empty": "Description cannot be empty or just spaces" }),
  category: Joi.string().allow("").optional(),
  authorType: Joi.string().valid("registered", "anonymous").required(),
  attachments: Joi.array().items(Joi.string()).max(3).optional(),
});

module.exports = { createPostSchema };
