const express = require("express");
const swaggerUI = require("swagger-ui-express");
const YAML = require("yamljs");
const users = require("../routes/users");
const categories = require("../routes/categories");
const articles = require("../routes/articles");
const comments = require("../routes/comments");
const error = require("../middleware/error");

module.exports = function (app) {
  app.use(express.json());
  // INFO: Swagger
  const swaggerDocument = YAML.load("./swagger.yaml");

  app.use("/", swaggerUI.serve, swaggerUI.setup(swaggerDocument));
  app.use("/api/v1/users", users);
  app.use("/api/v1/articles", articles);
  app.use("/api/v1/comments", comments);
  app.use("/api/v1/categories", categories);
  app.use(error);
};
