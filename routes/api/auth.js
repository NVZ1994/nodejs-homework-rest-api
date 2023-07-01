const express = require("express");

const authController = require("../../controllers/authController");

const schemas = require("../../schemas/users");
const { validateBody, authenticate, upload } = require("../../middlewares");

const router = express.Router();

router.post(
  "/register",
  validateBody(schemas.userRegistrationSchema),
  authController.register
);

router.get("/verify/:verificationToken", authController.verify);

router.post(
  "/login",
  validateBody(schemas.userLoginSchema),
  authController.login
);

router.post(
  "/verify",
  validateBody(schemas.userEmailSchema),
  authController.resendVerify
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
