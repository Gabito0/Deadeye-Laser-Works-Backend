"user strict";

/** Routes for authentication. */

const jsonschema = require("jsonschema");
const User = require("../models/user");
const express = require("express");
const router = new express.Router();
const { createToken } = require("../helpers/tokens");
const userAuthSchema = require("../schemas/userAuth.json");
const userRegisterSchema = require("../schemas/userRegister.json");
const { BadRequestError } = require("../expressError");
const { sendConfirmationEmail } = require("../helpers/emails");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const { SECRET_KEY } = require("../config");
const EMAIL_SECRET = process.env.EMAIL_SCERET_KEY;
const GMAIL_USER = process.env.GMAIL_USER;
const { ensureCorrectUserOrAdmin } = require("../middleware/auth");
/** POST /auth/token:  { username, password } => { token }
 *
 * Returns JWT token which can be used to authenticate further requests.
 *
 * Authorization required: none
 */

router.post("/token", async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, userAuthSchema);
    if (!validator.valid) {
      const errs = validator.errors.map((e) => e.stack);
      throw new BadRequestError(errs);
    }

    const { username, password } = req.body;
    const user = await User.authenticate(username, password);
    const token = createToken(user);
    return res.json({ token });
  } catch (err) {
    return next(err);
  }
});

/** POST /auth/register:   { user } => { token }
 *
 * user must include { username, password, firstName, lastName, email, birthDate }
 *
 * Returns JWT token which can be used to authenticate further requests.
 *
 * Authorization required: none
 */

router.post("/register", async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, userRegisterSchema);
    if (!validator.valid) {
      const errs = validator.errors.map((e) => e.stack);
      throw new BadRequestError(errs);
    }
    const newUser = await User.register({ ...req.body, status: "regular" });
    const token = createToken(newUser);

    // async email
    sendConfirmationEmail(
      EMAIL_SECRET,
      req.body.username,
      GMAIL_USER,
      req.body.email,
      next
    );
    return res.status(201).json({ token });
  } catch (err) {
    return next(err);
  }
});

router.get("/confirmation/:token", async (req, res, next) => {
  try {
    const { user: username } = jwt.verify(req.params.token, EMAIL_SECRET);
    const user = await User.verifyUser(username);
    return res.json({ user });
  } catch (err) {
    return next(err);
  }
});

/**
 * POST /send-verification/:username
 *
 * Sends a verification email to the user.
 *
 * Path parameters:
 *   - username: The username of the user to send the verification email to.
 *
 * Body parameters:
 *   - email: The email address to send the verification email to.
 *
 * Authorization required: correct user or admin
 */
router.post(
  "/send-verification/:username",
  ensureCorrectUserOrAdmin,
  async (req, res, next) => {
    try {
      const { email } = req.body;
      const username = req.params.username;

      sendConfirmationEmail(EMAIL_SECRET, username, GMAIL_USER, email, next);
      return res.json({ success: true });
    } catch (err) {
      return next(err);
    }
  }
);
module.exports = router;
