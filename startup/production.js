const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const xss = require("xss-clean");
const rateLimit = require("express-rate-limit");

module.exports = function (app) {
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
};
