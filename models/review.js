"use strict";
const db = require("../db");
const { sqlForPartialUpdate } = require("../helpers/sql");
const { NotFoundError, BadRequestError } = require("../expressError");

class Review {
  /**
   * Retrieve a review by its ID.
   *
   * @param {number} reviewId - The ID of the review to retrieve.
   * @returns {Object} - The review object.
   *   Contains: { reviewId, userId, username, firstName, reviewText, rating, time, serviceId }
   * @throws {NotFoundError} - If no review is found with the given ID.
   */
  static async getReview(reviewId) {
    const result = await db.query(
      `
      SELECT 
        r.id AS "reviewId",
        r.user_id AS "userId",
        u.username AS "username",
        u.first_name AS "firstName",
        r.review_text AS "reviewText",
        r.rating,
        r.time,
        r.service_id AS "serviceId"
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      WHERE r.id = $1
      `,
      [reviewId]
    );

    const review = result.rows[0];
    if (!review) {
      throw new NotFoundError(`No review found with ID: ${reviewId}`);
    }

    return review;
  }

  /**
   * Add a new review to the database.
   *
   * @param {Object} data - An object containing the fields for the new review.
   *   Contains: { userId, serviceId, reviewText, rating }
   * @returns {Object} - The newly created review object.
   *   Contains: { reviewId, userId, serviceId, reviewText, rating, time }
   * @throws {BadRequestError} - If any required data is missing.
   */
  static async addReview({ userId, serviceId, reviewText, rating }) {
    if (!userId || !serviceId || !reviewText || typeof rating !== "number") {
      throw new BadRequestError("Missing required fields");
    }

    const result = await db.query(
      `
      INSERT INTO reviews (user_id, service_id, review_text, rating, time)
      VALUES ($1, $2, $3, $4, NOW())
      RETURNING id AS "reviewId", user_id AS "userId", service_id AS "serviceId", review_text AS "reviewText", rating, time
      `,
      [userId, serviceId, reviewText, rating]
    );

    return result.rows[0];
  }

  /**
   * Update a review in the database.
   *
   * @param {number} reviewId - The ID of the review to update.
   * @param {Object} data - An object containing the fields to update.
   * @returns {Object} - The updated review object.
   *   Contains: { reviewId, reviewText, rating, time }
   * @throws {NotFoundError} - If no review is found with the given ID.
   */
  static async update(reviewId, data) {
    const reviewRes = await db.query(
      `
      SELECT id
      FROM reviews
      WHERE id = $1
    `,
      [reviewId]
    );

    const checkReview = reviewRes.rows[0];
    if (!checkReview) throw new NotFoundError(`No review: ${reviewId}`);

    const { setCols, values } = sqlForPartialUpdate(data, {
      reviewText: "review_text",
      rating: "rating",
      time: "time",
    });

    const reviewIdVarIdx = "$" + (values.length + 1);

    const querySql = `UPDATE reviews
                      SET ${setCols}
                      WHERE id = ${reviewIdVarIdx}
                      RETURNING id AS "reviewId",
                                review_text AS "reviewText",
                                rating,
                                time`;
    const result = await db.query(querySql, [...values, reviewId]);

    const review = result.rows[0];
    if (!review) throw new NotFoundError(`No review: ${reviewId}`);

    return review;
  }

  /**
   * Remove a review from the database.
   *
   * @param {number} reviewId - The ID of the review to remove.
   * @throws {NotFoundError} - If no review is found with the given ID.
   * @returns {void}
   */
  static async remove(reviewId) {
    const result = await db.query(
      `
      DELETE FROM reviews
      WHERE id = $1
      RETURNING id
      `,
      [reviewId]
    );

    const review = result.rows[0];
    if (!review) {
      throw new NotFoundError(`No review found with ID: ${reviewId}`);
    }
  }
}
module.exports = Review;
