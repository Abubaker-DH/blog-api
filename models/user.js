const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const Joi = require("joi");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      minlength: 4,
      maxlength: 10,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
      maxlength: 1024,
    },
    profileImage: { type: String },
    role: {
      type: String,
      enum: ["user", "admin", "author", "contributor", "editor"],
      default: "user",
    },
  },
  { timestamps: true }
);

function validateUser(user) {
  const schema = Joi.object({
    name: Joi.string().min(4).max(10),
    profileImage: Joi.string(),
    role: Joi.string(),
  });
  return schema.validate(user);
}

function validateRegister(user) {
  const schema = Joi.object({
    name: Joi.string().required().min(4).max(10),
    email: Joi.string().required().email(),
    password: Joi.string().required().min(6).max(255),
  });
  return schema.validate(user);
}

function validateLogin(user) {
  const schema = Joi.object({
    email: Joi.string().required().email(),
    password: Joi.string().required().min(6).max(255),
  });
  return schema.validate(user);
}

userSchema.methods.generateAuthToken = function () {
  const token = jwt.sign(
    { _id: this._id, email: this.email, role: this.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE }
  );
  return token;
};

userSchema.methods.matchPassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

module.exports.User = mongoose.model("User", userSchema);
module.exports.validateRegister = validateRegister;
module.exports.validateUser = validateUser;
module.exports.validateLogin = validateLogin;
