const Joi = require("joi");
const { subscription } = require("../CONSTANTS/constants");

const userRegistrationSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().required(),
  password: Joi.string().min(6).required(),
  subscription: Joi.string().valid(...subscription),
});

const userLoginSchema = Joi.object({
  email: Joi.string().required(),
  password: Joi.string().min(6).required(),
});

module.exports = {
  userRegistrationSchema,
  userLoginSchema,
};
