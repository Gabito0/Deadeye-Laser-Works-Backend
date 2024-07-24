"use strict";

/** Routes for user */
const jsonschema = require("jsonschema");
const User = require("../models/user");
const express = require("express");
const userUpdateSchema = require("../schemas/userUpdate.json");
const router = new express.Router();
const { BadRequestError } = require("../expressError");
const {
  ensureLoggedIn,
  ensureCorrectUserOrAdmin,
} = require("../middleware/auth");

/**
 * GET /[username] => { user }
 *
 * Returns the details of the user specified by the username parameter.
 *
 * Response format:
 *   { user: { username, firstName, lastName, email, status, isActive, isVerified, birthDate} }
 *
 * Authorization required: correct user or admin
 */
router.get(
  "/:username",
  ensureCorrectUserOrAdmin,
  async function (req, res, next) {
    try {
      const user = await User.getUser(req.params.username);
      return res.status(200).json({ user });
    } catch (err) {
      return next(err);
    }
  }
);

/**
 * PUT /:username { user } => { user }
 *
 * Data can include:
 *   { firstName, lastName, password, email, birthDate, isActive }
 *
 * Returns { username, firstName, lastName, email, birthDate, isActive }
 *
 * Authorization required: correct user or admin
 */
router.put(
  "/:username",
  ensureCorrectUserOrAdmin,
  async function (req, res, next) {
    try {
      const validator = jsonschema.validate(req.body, userUpdateSchema);
      if (!validator.valid) {
        const errs = validator.errors.map((e) => e.stack);
        throw new BadRequestError(errs);
      }

      const username = req.params.username;
      const data = req.body;
      const user = await User.update(username, data);
      return res.json({ user });
    } catch (err) {
      return next(err);
    }
  }
);

/**
 * DELETE /:username => { deleted: username }
 *
 * Deletes the specified user.
 *
 * Authorization required: correct user or admin
 */
router.delete(
  "/:username",
  ensureCorrectUserOrAdmin,
  async function (req, res, next) {
    try {
      await User.remove(req.params.username);
      return res.json({ deleted: req.params.username });
    } catch (err) {
      return next(err);
    }
  }
);

/**
 * PATCH /:username/deactivate => { user }
 *
 * Deactivates the specified user account by setting the `isActive` status to `false`.
 *
 * Authorization required: correct user or admin
 */
router.patch(
  "/:username/deactivate",
  ensureCorrectUserOrAdmin,
  async function (req, res, next) {
    try {
      let user = await User.deactivate(req.params.username);
      return res.json({ user });
    } catch (err) {
      return next(err);
    }
  }
);

/**
 * PATCH /users/:username/activate
 *
 * Activates a user by setting their is_active status to true.
 *
 * Path parameters:
 *   - username: The username of the user to activate.
 *
 * Response format:
 *   {
 *     user: {
 *       username,
 *       firstName,
 *       lastName,
 *       email,
 *       birthDate,
 *       status,
 *       isVerified,
 *       isActive
 *     }
 *   }
 *
 * Authorization required: correct user or admin
 */
router.patch(
  "/:username/activate",
  ensureCorrectUserOrAdmin,
  async function (req, res, next) {
    try {
      let user = await User.activate(req.params.username);
      return res.json({ user });
    } catch (err) {
      return next(err);
    }
  }
);

module.exports = router;
