"use strict";

/** Routes for userServices */
const jsonschema = require("jsonschema");
const UserService = require("../models/userService");
const express = require("express");
const userServiceAddSchema = require("../schemas/userService.json");
const router = new express.Router();
const { BadRequestError } = require("../expressError");
const { ensureCorrectUserOrAdmin, ensureAdmin } = require("../middleware/auth");

/**
 * GET /user-services => { userServices }
 *
 * Returns all user services with user details.
 *
 * Response format:
 *   {
 *     userServices: [
 *       {
 *         userServiceId,
 *         userId,
 *         username,
 *         firstName,
 *         serviceId,
 *         title,
 *         description,
 *         price,
 *         isActive,
 *         confirmedPrice,
 *         isCompleted,
 *         additionInfo,
 *         confirmationCode,
 *         requestedDate,
 *         fulfilledDate
 *       },
 *       ...
 *     ]
 *   }
 *
 * Authorization required: admin
 */
router.get("/", ensureAdmin, async function (req, res, next) {
  try {
    const userServices = await UserService.getAllUserServices();
    return res.json({ userServices });
  } catch (err) {
    return next(err);
  }
});

/**
 * GET /user-services/:username => { userServices }
 *
 * Retrieves all services associated with a specific user.
 *
 * Path parameters:
 *   - username: The username of the user whose services are to be fetched.
 *
 * Response format:
 *   {
 *     userServices: [
 *       {
 *         serviceId,
 *         title,
 *         description,
 *         price,
 *         isActive,
 *         userServiceId,
 *         confirmedPrice,
 *         isCompleted,
 *         additionInfo,
 *         confirmationCode,
 *         requestedDate,
 *         fulfilledDate
 *       },
 *       ...
 *     ]
 *   }
 *
 * Authorization required: correct user or admin
 */
router.get(
  "/:username",
  ensureCorrectUserOrAdmin,
  async function (req, res, next) {
    try {
      const userServices = await UserService.getUserServices(
        req.params.username
      );
      return res.json({ userServices });
    } catch (err) {
      console.error("Error fetching user services:", err);
      return next(err);
    }
  }
);

/**
 * POST /:username => { userService }
 *
 * Adds a service to a user.
 *
 * Request body:
 *   { username, serviceId, confirmedPrice, additionInfo }
 *
 * Returns:
 *   { userService:
 *      { userServiceId, userId, serviceId, confirmedPrice, isCompleted, additionInfo } }
 *
 * Authorization required: correct user or admin
 */
router.post(
  "/:username",
  ensureCorrectUserOrAdmin,
  async function (req, res, next) {
    try {
      const validator = jsonschema.validate(req.body, userServiceAddSchema);
      if (!validator.valid) {
        const errs = validator.errors.map((e) => e.stack);
        throw new BadRequestError(errs);
      }

      const { username, serviceId, confirmedPrice, additionInfo } = req.body;
      const userService = await UserService.addServiceToUser(
        username,
        serviceId,
        confirmedPrice,
        additionInfo
      );
      return res.status(201).json({ userService });
    } catch (err) {
      return next(err);
    }
  }
);

/**
 * PATCH /user-services/:username/complete/:userServiceId => { userService }
 *
 * Marks a user service as completed and updates the fulfilled date to the current date.
 *
 * Path parameters:
 *   - username: The username of the user whose service is to be marked complete.
 *   - userServiceId: The ID of the user service to be marked complete.
 *
 * Response format:
 *   {
 *     userService: {
 *       userServiceId,
 *       userId,
 *       serviceId,
 *       confirmedPrice,
 *       isCompleted,
 *       additionInfo,
 *       confirmationCode,
 *       requestedDate,
 *       fulfilledDate
 *     }
 *   }
 *
 * Authorization required: admin
 */
router.patch(
  "/:username/complete/:userServiceId",
  ensureAdmin,
  async function (req, res, next) {
    try {
      const userService = await UserService.completeService(
        req.params.userServiceId
      );
      return res.json({ userService });
    } catch (err) {
      return next(err);
    }
  }
);

/**
 * PATCH /user-services/:username/price/:userServiceId => { result }
 *
 * Updates the price of a user's service to a new value.
 *
 * Request body:
 *   { price: newPrice }
 *
 * Path parameters:
 *   - username: The username of the user whose service price is to be updated.
 *   - userServiceId: The ID of the user service to be updated.
 *
 * Response format:
 *   { result: { userServiceId, userId, serviceId, confirmedPrice, isCompleted, additionInfo } }
 *
 * Authorization required: admin
 */
router.patch(
  "/:username/price/:userServiceId",
  ensureAdmin,
  async function (req, res, next) {
    try {
      const { price } = req.body;

      // Check if price is a positive number
      if (price <= 0) {
        throw new BadRequestError("Price must be a positive number");
      }

      const result = await UserService.changePrice(
        price,
        req.params.userServiceId
      );
      return res.json({ result });
    } catch (err) {
      return next(err);
    }
  }
);
module.exports = router;
