const { HttpError } = require("../helpers");

const REQUIRED_FIELDS = ["email", "password"];

function signInValidatorWrapper(schema) {
  function signInBodyValidator(req, res, next) {
    if (!Object.keys(req.body).length) {
      return res.status(400).json({ message: "Missing fields" });
    }

    for (const field of REQUIRED_FIELDS) {
      if (!req.body[field] === undefined) {
        res.status(400).json({ message: `Field '${field}' must be filled` });
        return;
      }
    }

    const { error } = schema.validate(req.body);

    if (error) {
      next(HttpError(400, error.message));
    }

    next();
  }

  return signInBodyValidator;
}

module.exports = signInValidatorWrapper;
