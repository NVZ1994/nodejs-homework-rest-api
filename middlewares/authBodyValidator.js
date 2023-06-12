const { HttpError } = require("../helpers");

const REQUIRED_FIELDS = ["name", "email", "password"];

function authValidatorWrapper(schema) {
  function authBodyValidator(req, res, next) {
    if (!Object.keys(req.body).length) {
      return res.status(400).json({ message: "missing fields" });
    }

    const missingFields = [];
    for (const field of REQUIRED_FIELDS) {
      if (!req.body[field]) {
        missingFields.push(field);
      }
    }
    if (missingFields.length > 0) {
      const errorMessage = `Missing required ${missingFields.join(
        " and "
      )} field(s)`;
      return res.status(400).json({ message: errorMessage });
    }

    const { error } = schema.validate(req.body);

    if (error) {
      next(HttpError(400, error.message));
    }

    next();
  }

  return authBodyValidator;
}

module.exports = authValidatorWrapper;
