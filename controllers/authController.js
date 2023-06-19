const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const gravatar = require("gravatar");
const fs = require("fs/promises");
const path = require("path");
const Jimp = require("jimp");

const UserModel = require("../models/userModel");
const { HttpError, controllerWrapper } = require("../helpers");
const { subscriptionTypes } = require("../CONSTANTS/constants");
const { SECRET_KEY } = process.env;

const avatarsFolderPath = path.resolve("public", "avatars");

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
    avatarURL,
  });

  res.status(201).json({
    user: {
      email: newUser.email,
      subscription: newUser.subscription,
      avatarURL,
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

async function changeAvatar(req, res, next) {
  const { _id } = req.user;

  const user = await UserModel.findOne({ _id });
  if (!user) {
    throw HttpError(401);
  }

  const { path: oldPath, filename } = req.file;
  const uniqueFileName = `${user.email}_${filename}`;

  try {
    const newPath = path.join(avatarsFolderPath, uniqueFileName);

    Jimp.read(oldPath, (err, filename) => {
      if (err) {
        throw HttpError();
      }
      filename.resize(250, 250).write(newPath);
    });

    await fs.unlink(oldPath, (err) => {
      if (err) {
        throw HttpError(500, "Failed to delete temporary file");
      }
    });

    const avatarURL = `/avatars/${uniqueFileName}`;
    user.avatarURL = avatarURL;
    await user.save();

    res.status(200).json({
      avatarURL,
    });
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
  changeAvatar: controllerWrapper(changeAvatar),
};
