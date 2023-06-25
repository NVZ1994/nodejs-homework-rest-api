const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const gravatar = require("gravatar");
const fs = require("fs/promises");
const path = require("path");
const Jimp = require("jimp");
const { nanoid } = require("nanoid");

const UserModel = require("../models/userModel");
const { HttpError, controllerWrapper, sendEmail } = require("../helpers");
const { subscriptionTypes } = require("../CONSTANTS/constants");
const { SECRET_KEY, BASE_URL } = process.env;

const avatarsFolderPath = path.resolve("public", "avatars");

async function register(req, res, next) {
  const { email, password } = req.body;
  const user = await UserModel.findOne({ email });
  if (user) {
    throw HttpError(409, "Email in use");
  }

  const avatarURL = gravatar.url(email);
  const hashPassword = await bcrypt.hash(password, 10);
  const verificationToken = nanoid();

  const newUser = await UserModel.create({
    ...req.body,
    password: hashPassword,
    avatarURL,
    verificationToken,
  });

  const verifyEmail = {
    to: email,
    subject: "Email verification",
    html: `<p>Click <a target="_blank" href="${BASE_URL}/users/verify/${verificationToken}">HERE</a> to verify you email</p>`,
  };

  await sendEmail(verifyEmail);

  res.status(201).json({
    user: {
      email: newUser.email,
      subscription: newUser.subscription,
      avatarURL,
    },
  });
}

async function verify(req, res, net) {
  const { verificationToken } = req.params;
  const user = await UserModel.findOne({ verificationToken });

  if (!user) {
    throw HttpError(404, "User not found");
  }

  await UserModel.findByIdAndUpdate(user._id, {
    verify: true,
    verificationToken: null,
  });

  res.json({ message: "Verification successful" });
}

async function resendVerify(req, res, next) {
  const { email } = req.body;
  const user = await UserModel.findOne({ email });
  if (!user) {
    throw HttpError(400);
  }

  if (user.verify) {
    throw HttpError(400, "Verification has already been passed");
  }

  const verifyEmail = {
    to: email,
    subject: "Email verification",
    html: `<p>Click <a target="_blank" href="${BASE_URL}/users/verify/${user.verificationToken}">HERE</a> to verify you email</p>`,
  };

  await sendEmail(verifyEmail);

  res.json({
    message: "Verification email sent",
  });
}

async function login(req, res, next) {
  const { email, password } = req.body;
  const user = await UserModel.findOne({ email });
  const passwordComparing = await bcrypt.compare(password, user.password);

  if (!user.verify) {
    throw HttpError(401, "Please verify your email first");
  }

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

  try {
    const user = await UserModel.findById({ _id });

    if (!user) {
      throw HttpError(401);
    }

    const { path: oldPath, filename } = req.file;
    const uniqueFileName = `${user.email}_${filename}`;

    const newPath = path.join(avatarsFolderPath, uniqueFileName);
    const image = await Jimp.read(oldPath);

    await image.resize(250, 250).writeAsync(newPath);

    await fs.unlink(oldPath);

    const avatarURL = `/avatars/${uniqueFileName}`;
    user.avatarURL = avatarURL;

    await user.save();

    res.json({
      avatarURL,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  register: controllerWrapper(register),
  verify: controllerWrapper(verify),
  resendVerify: controllerWrapper(resendVerify),
  login: controllerWrapper(login),
  current: controllerWrapper(current),
  changeSubscription: controllerWrapper(changeSubscription),
  changeAvatar: controllerWrapper(changeAvatar),
  logout: controllerWrapper(logout),
};
