const bodyValidatorWrapper = require("./bodyValidator");
const authValidatorWrapper = require("./authBodyValidator");
const signInValidatorWrapper = require("./signInBodyValidation");
const mongooseErrorHandler = require("./mongooseErrorHandler");
const isValidId = require("./isValidId");
const favoriteFieldValidationWrapper = require("./favoriteFieldValidator");
const authenticate = require("./authenticate");

module.exports = {
  bodyValidatorWrapper,
  favoriteFieldValidationWrapper,
  mongooseErrorHandler,
  isValidId,
  authValidatorWrapper,
  signInValidatorWrapper,
  authenticate,
};
