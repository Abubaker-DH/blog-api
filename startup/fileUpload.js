const path = require("path");
const express = require("express");

module.exports = function (app) {
  app.use("/images", express.static(path.join(__dirname, "images")));
};
