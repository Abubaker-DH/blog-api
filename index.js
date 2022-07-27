const dotenv = require("dotenv");
const express = require("express");
const mongoose = require("mongoose");
const users = require("../routes/users");
const categories = require("../routes/categories");
const articles = require("../routes/articles");
const comments = require("../routes/comments");

const app = express();
app.use(express.json());
dotenv.config();

app.use("/api/v1/articles", articles);
app.use("/api/v1/categories", categories);
app.use("/api/v1/comments", comments);
app.use("/api/v1/users", users);
app.use(error);

const MONGO_URL = process.env.MONGO_URI;
const PORT = process.env.PORT || 5000;

mongoose
  .connect(MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useNewUrlParser: true,
  })
  .then(() =>
    app.listen(PORT, () => console.log(`server running on port ${PORT} ...`))
  );
