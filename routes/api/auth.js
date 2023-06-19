const express = require("express");

const authController = require("../../controllers/authController");

const schemas = require("../../schemas/users");
const {
  authValidatorWrapper,
  signInValidatorWrapper,
  authenticate,
  upload,
} = require("../../middlewares");

const router = express.Router();

router.post(
  "/register",
  authValidatorWrapper(schemas.userRegistrationSchema),
  authController.register
);

router.post(
  "/login",
  signInValidatorWrapper(schemas.userLoginSchema),
  authController.login
);

router.get("/current", authenticate, authController.current);

router.patch("/subscription", authenticate, authController.changeSubscription);

router.patch(
  "/avatars",
  authenticate,
  upload.single("avatar"),
  authController.changeAvatar
);

router.post("/logout", authenticate, authController.logout);

module.exports = router;
