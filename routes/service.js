"use strict";

/** Routes for service */
const jsonschema = require("jsonschema");
const Service = require("../models/service");
const express = require("express");
const router = new express.Router();
const serviceAddSchema = require("../schemas/serviceAdd.json");
const serviceUpdateSchema = require("../schemas/serviceUpdate.json");
const { BadRequestError } = require("../expressError");
const { ensureAdmin } = require("../middleware/auth");

/**
 * GET /services/ => { services }
 *
 * Retrieves a list of all services.
 *
 * Response format:
 *   {
 *     services: [
 *       {
 *         serviceId,
 *         title,
 *         description,
 *         price,
 *         isActive
 *       },
 *       ...
 *     ]
 *   }
 *
 * Authorization required: none
 */
router.get("/", async function (req, res, next) {
  try {
    const services = await Service.getAllServices();
    return res.json({ services });
  } catch (err) {
    return next(err);
  }
});

/**
 * GET /services/:serviceId => { service }
 *
 * Retrieves the details of a specific service by its ID.
 *
 * Path parameters:
 *   - serviceId: The ID of the service to retrieve.
 *
 * Response format:
 *   {
 *     service: {
 *       serviceId,
 *       title,
 *       description,
 *       price,
 *       isActive
 *     }
 *   }
 *
 * Authorization required: none
 */
router.get("/:serviceId", async function (req, res, next) {
  try {
    const service = await Service.getService(req.params.serviceId);
    return res.json({ service });
  } catch (err) {
    return next(err);
  }
});

/**
 * POST /services/ => { service }
 *
 * Adds a new service.
 *
 * Request body:
 *   { title, description, price, isActive }
 *
 * Response format:
 *   {
 *     service: {
 *       serviceId,
 *       title,
 *       description,
 *       price,
 *       isActive
 *     }
 *   }
 *
 * Authorization required: admin
 */
router.post("/", ensureAdmin, async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, serviceAddSchema);
    if (!validator.valid) {
      const errs = validator.errors.map((e) => e.stack);
      throw new BadRequestError(errs);
    }

    const { title, description, price, isActive } = req.body;
    const service = await Service.addService(
      title,
      description,
      price,
      isActive
    );
    return res.status(201).json({ service });
  } catch (err) {
    return next(err);
  }
});

/**
 * GET /services/:serviceId/reviews => { reviews }
 *
 * Retrieves all reviews for a specific service by its ID.
 *
 * Path parameters:
 *   - serviceId: The ID of the service to retrieve reviews for.
 *
 * Response format:
 *   {
 *     reviews: [
 *       {
 *         reviewId,
 *         userId,
 *         username,
 *         firstName,
 *         reviewText,
 *         rating,
 *         time,
 *         serviceId
 *       },
 *       ...
 *     ]
 *   }
 *
 * Authorization required: none
 */
router.get("/:serviceId/reviews", async function (req, res, next) {
  try {
    const reviews = await Service.getServiceReviews(req.params.serviceId);
    return res.json({ reviews });
  } catch (err) {
    return next(err);
  }
});

/**
 * PATCH /services/:serviceId/deactivate
 *
 * Deactivates a specific service by its ID.
 *
 * Path parameters:
 *   - serviceId: The ID of the service to deactivate.
 *
 * Response format:
 *   {
 *     service: {
 *       serviceId,
 *       title,
 *       description,
 *       price,
 *       isActive
 *     }
 *   }
 *
 * Authorization required: admin
 */
router.patch(
  "/:serviceId/activate",
  ensureAdmin,
  async function (req, res, next) {
    try {
      const service = await Service.activate(req.params.serviceId);
      return res.json({ service });
    } catch (err) {
      return next(err);
    }
  }
);

/**
 * PATCH /services/:serviceId/activate
 *
 * Deactivates a specific service by its ID.
 *
 * Path parameters:
 *   - serviceId: The ID of the service to activate.
 *
 * Response format:
 *   {
 *     service: {
 *       serviceId,
 *       title,
 *       description,
 *       price,
 *       isActive
 *     }
 *   }
 *
 * Authorization required: admin
 */
router.patch(
  "/:serviceId/deactivate",
  ensureAdmin,
  async function (req, res, next) {
    try {
      const service = await Service.deactivate(req.params.serviceId);
      return res.json({ service });
    } catch (err) {
      return next(err);
    }
  }
);

/**
 * PATCH /services/:serviceId
 *
 * Updates details of a specific service by its ID.
 *
 * Path parameters:
 *   - serviceId: The ID of the service to update.
 *
 * Request body should contain:
 *   - title: The new title of the service.
 *   - description: The new description of the service.
 *   - price: The new price of the service.
 *   - isActive: The new active status of the service.
 *
 * Response format:
 *   {
 *     service: {
 *       serviceId,
 *       title,
 *       description,
 *       price,
 *       isActive
 *     }
 *   }
 *
 * Authorization required: admin
 */
router.patch("/:serviceId", ensureAdmin, async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, serviceUpdateSchema);
    if (!validator.valid) {
      const errs = validator.errors.map((e) => e.stack);
      throw new BadRequestError(errs);
    }

    const service = await Service.update(req.params.serviceId, req.body);
    return res.json({ service });
  } catch (err) {
    return next(err);
  }
});

/**
 * DELETE /services/:serviceId
 *
 * Deletes a specific service by its ID.
 *
 * Path parameters:
 *   - serviceId: The ID of the service to delete.
 *
 * Response format:
 *   {
 *     deleted: serviceId
 *   }
 *
 * Authorization required: admin
 */
router.delete("/:serviceId", ensureAdmin, async function (req, res, next) {
  try {
    await Service.remove(req.params.serviceId);
    return res.json({ deleted: req.params.serviceId });
  } catch (err) {
    return next(err);
  }
});
module.exports = router;
