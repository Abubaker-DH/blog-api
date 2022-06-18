require("dotenv").config();
const path = require("path");
const express = require("express");
const Joi = require("joi");
const winston = require("winston");
const mongoose = require("mongoose");
const multer = require("multer");
const errors = require("./middleware/error");
const users = require("./routes/users");
const articles = require("./routes/articles");
const comments = require("./routes/comments");
const categories = require("./routes/categories");

const app = express();

Joi.objectId = require("joi-objectid")(Joi);
app.use(express.json());

// INFO: Setup image folder and image URL
const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images");
  },
  filename: (req, file, cb) => {
    cb(
      null,
      new Date().toISOString().replace(/[\/\\:]/g, "-") +
        "-" +
        file.originalname
    );
  },
});

// INFO: Type of file that acceptaple to upload
const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg" ||
    file.mimetype === "image/JPG" ||
    file.mimetype === "image/JPEG"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

app.use(
  multer({ storage: fileStorage, fileFilter: fileFilter }).array("imageUrl", 5)
);

app.use("/images", express.static(path.join(__dirname, "images")));

// INFO: logging error middleware
require("./middleware/log")();

app.use("/api/v1/users", users);
app.use("/api/v1/articles", articles);
app.use("/api/v1/comments", comments);
app.use("/api/v1/categories", categories);
app.use(errors);

const MONGO_URL = process.env.MONGO_URL;
const PORT = process.env.PORT || 5000;
mongoose
  .connect(MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useNewUrlParser: true,
  })
  .then(() => {
    app.listen(PORT, () => winston.info(`server running on port ${PORT} ...`));
  });
