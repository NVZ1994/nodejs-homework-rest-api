const Joi = require("joi");
const { subscriptionTypes } = require("../CONSTANTS/constants");

const userRegistrationSchema = Joi.object({
  email: Joi.string().required(),
  password: Joi.string().min(6).required(),
  subscription: Joi.string().valid(...subscriptionTypes),
});

const userLoginSchema = Joi.object({
  email: Joi.string().required(),
  password: Joi.string().min(6).required(),
});

module.exports = {
  userRegistrationSchema,
  userLoginSchema,
};
