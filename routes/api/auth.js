const express = require("express");

const authController = require("../../controllers/authController");

const schemas = require("../../schemas/users");
const {
  authValidatorWrapper,
  signInValidatorWrapper,
} = require("../../middlewares");

const router = express.Router();

router.post(
  "/signup",
  authValidatorWrapper(schemas.userRegistrationSchema),
  authController.signup
);

router.post(
  "/signin",
  signInValidatorWrapper(schemas.userLoginSchema),
  authController.signin
);

module.exports = router;
