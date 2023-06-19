const mongooseErrorHandler = require("../middlewares/mongooseErrorHandler");
const { Schema, model } = require("mongoose");

const { subscription } = require("../CONSTANTS/constants");

const userSchema = new Schema(
  {
    password: {
      type: String,
      minlength: 6,
      required: [true, "Password is required"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
    },
    subscription: {
      type: String,
      enum: subscription,
      default: "starter",
    },
    token: {
      type: String,
      default: null,
    },
    avatarURL: { type: String },
  },
  { versionKey: false, timestamps: true }
);

userSchema.post("save", mongooseErrorHandler);

const UserModel = model("user", userSchema);

module.exports = UserModel;
