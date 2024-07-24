"use strict";

/** Routes for review */
const jsonschema = require("jsonschema");
const Review = require("../models/review");
const express = require("express");
const router = new express.Router();
const reviewAddSchema = require("../schemas/reviewAdd.json");
const reviewUpdateSchema = require("../schemas/reviewUpdate.json");
const { BadRequestError } = require("../expressError");
const { ensureCorrectUserOrAdmin } = require("../middleware/auth");
const Service = require("../models/service");

/**
 * GET /reviews/:reviewId
 *
 * Retrieves a specific review by its ID.
 *
 * Path parameters:
 *   - reviewId: The ID of the review to retrieve.
 *
 * Response format:
 *   {
 *     review: {
 *       reviewId,
 *       userId,
 *       username,
 *       firstName,
 *       reviewText,
 *       rating,
 *       time,
 *       serviceId
 *     }
 *   }
 *
 * Authorization required: none
 */
router.get("/:reviewId", async function (req, res, next) {
  try {
    const review = await Review.getReview(req.params.reviewId);
    return res.json({ review });
  } catch (err) {
    return next(err);
  }
});

/**
 * POST /reviews/:username
 *
 * Adds a new review.
 *
 * Path parameters:
 *   - username: The username of the user adding the review.
 *
 * Request body:
 *   {
 *     userId: number,
 *     serviceId: number,
 *     reviewText: string,
 *     rating: number
 *   }
 *
 * Response format:
 *   {
 *     review: {
 *       reviewId,
 *       userId,
 *       serviceId,
 *       reviewText,
 *       rating,
 *       time
 *     }
 *   }
 *
 * Authorization required: correct user or admin
 */
router.post(
  "/:username",
  ensureCorrectUserOrAdmin,
  async function (req, res, next) {
    try {
      const validator = jsonschema.validate(req.body, reviewAddSchema);
      if (!validator.valid) {
        const errs = validator.errors.map((e) => e.stack);
        throw new BadRequestError(errs);
      }

      const review = await Review.addReview(req.body);
      return res.status(201).json({ review });
    } catch (err) {
      return next(err);
    }
  }
);

/**
 * PATCH /reviews/:reviewId/:username
 *
 * Updates a review.
 *
 * Path parameters:
 *   - reviewId: The ID of the review to update.
 *   - username: The username of the user updating the review.
 *
 * Request body:
 *   {
 *     reviewText: string,
 *     rating: number
 *   }
 *
 * Response format:
 *   {
 *     review: {
 *       reviewId,
 *       reviewText,
 *       rating,
 *       time
 *     }
 *   }
 *
 * Authorization required: correct user or admin
 */

router.patch(
  "/:reviewId/:username",
  ensureCorrectUserOrAdmin,
  async function (req, res, next) {
    try {
      const validator = jsonschema.validate(req.body, reviewUpdateSchema);
      if (!validator.valid) {
        const errs = validator.errors.map((e) => e.stack);
        throw new BadRequestError(errs);
      }

      const review = await Review.update(req.params.reviewId, req.body);
      return res.json({ review });
    } catch (err) {
      return next(err);
    }
  }
);

/**
 * DELETE /reviews/:reviewId/:username
 *
 * Deletes a review.
 *
 * Path parameters:
 *   - reviewId: The ID of the review to delete.
 *   - username: The username of the user deleting the review.
 *
 * Response format:
 *   {
 *     deleted: reviewId
 *   }
 *
 * Authorization required: correct user or admin
 */
router.delete(
  "/:reviewId/:username",
  ensureCorrectUserOrAdmin,
  async function (req, res, next) {
    try {
      await Review.remove(req.params.reviewId);
      return res.json({ deleted: req.params.reviewId });
    } catch (err) {
      return next(err);
    }
  }
);

module.exports = router;
