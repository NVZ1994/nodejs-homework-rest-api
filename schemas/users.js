const Joi = require("joi");
const { subscriptionTypes } = require("../CONSTANTS/constants");

const userRegistrationSchema = Joi.object({
  email: Joi.string().required().messages({
    "any.required": "Missing required field email",
  }),
  password: Joi.string().min(6).required().messages({
    "any.required": "Missing required field password",
  }),
  subscription: Joi.string().valid(...subscriptionTypes),
});

const userLoginSchema = Joi.object({
  email: Joi.string().required().messages({
    "any.required": "Missing required field email",
  }),
  password: Joi.string().min(6).required().messages({
    "any.required": "Missing required field password",
  }),
});

const userEmailSchema = Joi.object({
  email: Joi.string().required().messages({
    "any.required": "Missing required field email",
  }),
});

module.exports = {
  userRegistrationSchema,
  userLoginSchema,
  userEmailSchema,
};
