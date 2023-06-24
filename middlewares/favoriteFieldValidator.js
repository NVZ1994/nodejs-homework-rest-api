const { HttpError } = require("../helpers");

function favoriteFieldValidationWrapper(schema) {
  function favoriteFieldValidator(req, res, next) {
    if (!Object.keys(req.body).length) {
      res.status(400).json({ message: "missing field favorite" });
    }

    const { error } = schema.validate(req.body);

    if (error) {
      next(HttpError(400, error.message));
    }

    next();
  }
  return favoriteFieldValidator;
}

module.exports = favoriteFieldValidationWrapper;
