const jwt = require("jsonwebtoken");

const { HttpError } = require("../helpers");

const UserModel = require("../models/userModel");

const { SECRET_KEY } = process.env;

async function authenticate(req, res, next) {
  const { authorization = "" } = req.headers;
  const [bearer, token] = authorization.split(" ");
  if (bearer !== "Bearer") {
    next(HttpError(401));
  }

  try {
    const { id } = jwt.verify(token, SECRET_KEY);
    const user = await UserModel.findById(id);

    if (!user || !user.token) {
      next(HttpError(401));
    }
    req.user = user;
    next();
  } catch {
    next(HttpError(401));
  }
}

module.exports = authenticate;
