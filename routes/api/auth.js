const express = require("express");

const authController = require("../../controllers/authController");

const schemas = require("../../schemas/users");
const {
  authValidatorWrapper,
  signInValidatorWrapper,
  authenticate,
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

router.post("/logout", authenticate, authController.logout);

router.patch("/subscription", authenticate, authController.changeSubscription);

module.exports = router;
