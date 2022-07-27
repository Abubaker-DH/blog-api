const dotenv = require("dotenv");
const express = require("express");
const mongoose = require("mongoose");
const Joi = require("joi");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const xss = require("xss-clean");
const rateLimit = require("express-rate-limit");
const users = require("../routes/users");
const categories = require("../routes/categories");
const articles = require("../routes/articles");
const comments = require("../routes/comments");

const app = express();
Joi.objectId = require("joi-objectid")(Joi);

app.use(express.json());
dotenv.config();

// INFO: if we behind a proxy
app.set("trust proxy", 1);
// INFO: use it to limit number of reqest
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
  })
);

//  INFO: production packages
app.use(cors());
app.use(xss());
app.use(helmet());
app.use(compression());

// INFO: path for ststic file
app.use("/images", express.static(path.join(__dirname, "images")));

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
