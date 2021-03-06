require("dotenv").config();
const winston = require("winston");
const express = require("express");
const app = express();

// INFO: logging error middleware
require("./startup/db")();
require("./middleware/log")();
require("./startup/validation")();
require("./startup/production")(app);
require("./startup/fileUpload")(app);
require("./startup/routes")(app);

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Server Listening on port ${port}...`));
