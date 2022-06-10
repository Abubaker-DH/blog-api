require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");

const app = express();

const MONGO_URL = process.env.MONGO_URI;
const PORT = process.env.PORT || 5000;
mongoose
  .connect(MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useNewUrlParser: true,
  })
  .then(() => {
    app.listen(PORT, () => console.log(`server running on port ${PORT} ...`));
  });
