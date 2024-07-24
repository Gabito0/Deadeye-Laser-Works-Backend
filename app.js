"use strict";

/**Express app for Deadeye LaserWorks */
const express = require("express");
const cors = require("cors");

const { NotFoundError } = require("./expressError");

// authenticatJWT
const { authenticateJWT } = require("./middleware/auth");

const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const userServiceRoutes = require("./routes/userServices");
const services = require("./routes/service");
const reviews = require("./routes/review");
const morgan = require("morgan");

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("tiny"));
app.use(authenticateJWT);

app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/user-services", userServiceRoutes);
app.use("/services", services);
app.use("/reviews", reviews);

/** Handle 404 erros -- this mathces everything */
app.use(function (req, res, next) {
  return next(new NotFoundError());
});

/*** Generic error handler; anything unhandled goes here. */
app.use(function (err, req, res, next) {
  if (process.env.NODE_ENV !== "test") console.error(err.stack);
  const status = err.status || 500;
  const message = err.message;

  return res.status(status).json({
    error: { message, status },
  });
});

module.exports = app;
