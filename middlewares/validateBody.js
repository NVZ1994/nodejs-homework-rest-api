const { HttpError } = require("../helpers");

function validateBody(schema) {
  function bodyValidation(req, res, next) {
    const { error } = schema.validate(req.body);
    if (error) {
      next(HttpError(400, error.message));
    }
    next(error);
  }
  return bodyValidation;
}

module.exports = validateBody;
