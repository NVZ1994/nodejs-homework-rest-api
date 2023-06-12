const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const UserModel = require("../models/userModel");
const { HttpError, controllerWrapper } = require("../helpers");
const { SECRET_KEY } = process.env;

async function signup(req, res, next) {
  const { email, password } = req.body;
  const user = await UserModel.findOne({ email });
  if (user) {
    throw HttpError(409, `User with email '${email}' already exists`);
  }

  const hashPassword = await bcrypt.hash(password, 10);

  const newUser = await UserModel.create({
    ...req.body,
    password: hashPassword,
  });

  res.status(201).json({
    name: newUser.name,
    email: newUser.email,
  });
}

async function signin(req, res, next) {
  const { email, password } = req.body;
  const user = await UserModel.findOne({ email });
  if (!user) {
    throw HttpError(401);
  }

  const passwordComparing = await bcrypt.compare(password, user.password);
  if (!passwordComparing) {
    throw HttpError(401);
  }

  const payload = {
    id: user._id,
  };
  const token = jwt.sign(payload, SECRET_KEY, { expiresIn: "1d" });

  res.json({ token });
}

module.exports = {
  signup: controllerWrapper(signup),
  signin: controllerWrapper(signin),
};
