require("dotenv").config();
const express = require("express");
const app = express();

// INFO: logging error middleware
require("./middleware/log")();
require("./startup/db")();
require("./startup/validation")();
require("./startup/production")(app);
require("./startup/fileUpload")(app);
require("./startup/routes")(app);

const port = process.env.PORT;
const server = app.listen(port, () =>
  winston.info(`Server Listening on port ${port}...`)
);

module.exports = server;
