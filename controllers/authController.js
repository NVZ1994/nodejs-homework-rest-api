const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const gravatar = require("gravatar");

const UserModel = require("../models/userModel");
const { HttpError, controllerWrapper } = require("../helpers");
const { subscriptionTypes } = require("../CONSTANTS/constants");
const { SECRET_KEY } = process.env;

async function register(req, res, next) {
  const { email, password } = req.body;
  const user = await UserModel.findOne({ email });
  if (user) {
    throw HttpError(409, "Email in use");
  }

  const avatarURL = gravatar.url(email);

  const hashPassword = await bcrypt.hash(password, 10);

  const newUser = await UserModel.create({
    ...req.body,
    password: hashPassword,
    avatarURL: avatarURL,
  });

  res.status(201).json({
    user: {
      email: newUser.email,
      subscription: newUser.subscription,
    },
  });
}

async function login(req, res, next) {
  const { email, password } = req.body;
  const user = await UserModel.findOne({ email });
  const passwordComparing = await bcrypt.compare(password, user.password);

  if (!user || !passwordComparing) {
    throw HttpError(401, "Email or password is wrong");
  }

  const { _id: id } = user;

  const payload = {
    id,
  };
  const token = jwt.sign(payload, SECRET_KEY, { expiresIn: "1d" });
  await UserModel.findByIdAndUpdate(id, { token });
  res.json({
    token,
    user: {
      email: user.email,
      subscription: user.subscription,
    },
  });
}

async function current(req, res, next) {
  const { subscription, email } = req.user;

  res.json({
    email,
    subscription,
  });
}

async function logout(req, res, next) {
  const { _id } = req.user;
  await UserModel.findByIdAndUpdate(_id, { token: "" });

  res.status(204).json({
    message: "Logout success",
  });
}

async function changeSubscription(req, res, next) {
  const { subscription } = req.body;
  const { _id, email } = req.user;

  try {
    if (!subscriptionTypes.includes(subscription)) {
      throw HttpError(400, "Invalid subscription value");
    }

    const updatedUser = await UserModel.findByIdAndUpdate(
      _id,
      { subscription },
      { new: true }
    );

    res.json({ email, subscription: updatedUser.subscription });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  register: controllerWrapper(register),
  login: controllerWrapper(login),
  current: controllerWrapper(current),
  logout: controllerWrapper(logout),
  changeSubscription: controllerWrapper(changeSubscription),
};
