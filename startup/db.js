const winston = require("winston");
const mongoose = require("mongoose");

module.exports = function () {
  const MONGO_URL = process.env.MONGO_URL;
  mongoose
    .connect(MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useNewUrlParser: true,
    })
    .then(() => winston.info(`Connect to Database...`));
};
