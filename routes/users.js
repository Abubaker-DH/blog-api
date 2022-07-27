const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");
const auth = require("../middleware/auth");
const { upload } = require("../middleware/upload");
const admin = require("../middleware/admin");
const {
  User,
  validateUser,
  validateLogin,
  validateRegister,
} = require("../models/user");
const express = require("express");
const validateObjectId = require("../middleware/validateObjectId");
const router = express.Router();

// NOTE: Get all users
router.get("/", [auth, admin], async (req, res) => {
  const user = await User.find().select("-password");

  res.send(user);
});

// INFO: Register or Create user route
router.post("/register", async (req, res, next) => {
  // NOTE: Check the user info
  const { error } = validateRegister(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let user = await User.findOne({ email: req.body.email });
  if (user) return res.status(400).send("User already registerd..");

  user = new User(req.body.name, req.body.email, req.body.password);
  // NOTE: Hash password
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);

  await user.save();
  // INFO: Generate token
  const token = user.generateAuthToken();

  res
    .setHeader("Access-Control-Allow-Headers", "Content-type, Authorization")
    .header("authorization", "bearer " + token)
    .status(201)
    .send(lodash.pick(user, ["_id", "name", "email", "profileImage"]));
});

// INFO: Login or signIn route
router.post("/login", async (req, res, next) => {
  // NOTE: Check the user data
  const { error } = validateLogin(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let user = await User.findOne({ email: req.body.email });
  if (!user) return res.status(400).send("Invalid email or password..");

  const isMatch = await user.matchPassword(req.body.password);
  if (!isMatch) return res.status(400).send("Invalid email or password..");

  // NOTE: Generate token
  const token = user.generateAuthToken();
  res.send(token);
});

// NOTE: Get one user by ID
router.get("/:id", [auth, admin, validateObjectId], async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user)
    return res.status(404).send("The user with given ID was not found.");

  res.send(user);
});

// NOTE: Update user route
router.patch(
  "/:id",
  [auth, validateObjectId, upload.single("profileImage")],
  async (req, res) => {
    let user = await User.findById({ _id: req.params.id });
    if (!user)
      return res.status(404).send("The user with given ID was not found");

    // INFO: The user can not change his role
    if (req.body.role && req.user.role !== "admin") {
      return res.status(403).send("method not allowed.");
    }

    // INFO: Get the profile image from req.file
    if (req.file) {
      clearImage(user.profileImage);
      req.body.profileImage = req.file.path;
    }

    const { error } = validateUser(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    //  INFO: Delete the old image
    if (user.profileImage) clearImage(user.profileImage);

    // INFO: The Owner or Admin can Update
    if (
      req.user._id.toString() === req.params.id.toString() ||
      req.user.role === "admin"
    ) {
      user = await User.findByIdAndUpdate(
        { _id: req.params.id },
        {
          name: req.body.name,
          role: req.body.role,
          profileImage: req.body.profileImage,
        },
        { new: true }
      );
      res.send(user);
    } else {
      return res.status(403).send("method not allowed.");
    }
  }
);

// NOTE: Delete User By ID
router.delete("/:id", [auth, admin, validateObjectId], async (req, res) => {
  const user = await User.findByIdAndRemove({
    _id: req.params.id,
    isAdmin: false,
  });

  if (!user)
    return res.status(404).send("The User with given ID was not found.");

  if (user.profileImage) {
    clearImage(user.profileImage);
  }
  res.send(user);
});

// NOTE: Delete profile image from images Folder
const clearImage = (filePath) => {
  filePath = path.join(__dirname, "..", filePath);
  fs.unlink(filePath, (err) => {
    return err;
  });
};
module.exports = router;
