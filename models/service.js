"use strict";
const db = require("../db");
const { sqlForPartialUpdate } = require("../helpers/sql");
const { NotFoundError, BadRequestError } = require("../expressError");

class Service {
  /**
   * Retrieve all services from the database.
   *
   * @returns {Array} - An array of service objects.
   *   Each object contains: { serviceId, title, description, price, isActive }
   */
  static async getAllServices() {
    const results = await db.query(
      `
      SELECT
        id AS "serviceId", 
        title,
        description,
        price,
        is_active AS "isActive"
      FROM services
      `
    );
    return results.rows;
  }

  /**
   * Retrieve a service by its ID.
   *
   * @param {number} serviceId - The ID of the service to retrieve.
   * @returns {Object} - The service object.
   *   Contains: { serviceId, title, description, price, isActive }
   * @throws {NotFoundError} - If no service is found with the given ID.
   */
  static async getService(serviceId) {
    const result = await db.query(
      `
      SELECT 
        id AS "serviceId",
        title,
        description,
        price,
        is_active AS "isActive"
      FROM services
      WHERE id = $1
      `,
      [serviceId]
    );

    const service = result.rows[0];
    if (!service)
      throw new NotFoundError(`No service found with ID: ${serviceId}`);

    return service;
  }

  /**
   * Add a new service to the database.
   *
   * @param {string} title - The title of the service.
   * @param {string} description - The description of the service.
   * @param {number} price - The price of the service.
   * @param {boolean} isActive - The active status of the service.
   * @returns {Object} - The newly created service object.
   *   Contains: { serviceId, title, description, price, isActive }
   * @throws {BadRequestError} - If any required data is missing.
   */
  static async addService(title, description, price, isActive = true) {
    if (
      !title ||
      !description ||
      typeof price !== "number" ||
      typeof isActive !== "boolean"
    ) {
      throw new BadRequestError("Missing required fields");
    }

    const result = await db.query(
      `
      INSERT INTO services (title, description, price, is_active)
      VALUES ($1, $2, $3, $4)
      RETURNING id AS "serviceId",
                title,
                description,
                price,
                is_active AS "isActive"
      `,
      [title, description, price, isActive]
    );

    return result.rows[0];
  }
  /**
   * Deactivate a service by setting its isActive status to false.
   *
   * @param {number} serviceId - The ID of the service to deactivate.
   * @returns {Object} - The deactivated service object.
   *   Contains: { serviceId, title, description, price, isActive }
   * @throws {NotFoundError} - If no service is found with the given ID.
   */
  static async deactivate(serviceId) {
    const result = await db.query(
      `
      UPDATE services
      SET is_active = false
      WHERE id = $1
      RETURNING id AS "serviceId",
                title,
                description,
                price,
                is_active AS "isActive"
      `,
      [serviceId]
    );

    const service = result.rows[0];

    if (!service)
      throw new NotFoundError(`No service found with ID: ${serviceId}`);

    return service;
  }

  /**
   * Activate a service by setting its isActive status to true.
   *
   * @param {number} serviceId - The ID of the service to deactivate.
   * @returns {Object} - The activated service object.
   *   Contains: { serviceId, title, description, price, isActive }
   * @throws {NotFoundError} - If no service is found with the given ID.
   */
  static async activate(serviceId) {
    const result = await db.query(
      `
      UPDATE services
      SET is_active = true
      WHERE id = $1
      RETURNING id AS "serviceId",
                title,
                description,
                price,
                is_active AS "isActive"
      `,
      [serviceId]
    );

    const service = result.rows[0];

    if (!service)
      throw new NotFoundError(`No service found with ID: ${serviceId}`);

    return service;
  }

  /**
   * Update a service in the database.
   *
   * @param {number} serviceId - The ID of the service to update.
   * @param {Object} data - An object containing the fields to update.
   * @returns {Object} - The updated service object.
   *   Contains: { serviceId, title, description, price, isActive }
   * @throws {NotFoundError} - If no service is found with the given ID.
   */
  static async update(serviceId, data) {
    const serviceRes = await db.query(
      `
      SELECT id
      FROM services
      WHERE id = $1
    `,
      [serviceId]
    );

    const checkService = serviceRes.rows[0];
    if (!checkService) throw new NotFoundError(`No service: ${serviceId}`);

    const { setCols, values } = sqlForPartialUpdate(data, {
      title: "title",
      description: "description",
      price: "price",
      isActive: "is_active",
    });

    const serviceIdVarIdx = "$" + (values.length + 1);

    const querySql = `UPDATE services
                    SET ${setCols}
                    WHERE id = ${serviceIdVarIdx}
                    RETURNING id AS "serviceId",
                              title,
                              description,
                              price,
                              is_active AS "isActive"`;
    const result = await db.query(querySql, [...values, serviceId]);

    const service = result.rows[0];
    if (!service) throw new NotFoundError(`No service: ${serviceId}`);

    return service;
  }

  /**
   * Remove a service by its ID.
   *
   * @param {number} serviceId - The ID of the service to remove.
   * @throws {NotFoundError} - If no service is found with the given ID.
   * @returns {void}
   */
  static async remove(serviceId) {
    const result = await db.query(
      `
    DELETE FROM services
    WHERE id = $1
    RETURNING id
    `,
      [serviceId]
    );

    const service = result.rows[0];
    if (!service) {
      throw new NotFoundError(`No service found with service ID: ${serviceId}`);
    }
  }

  /**
   * Retrieve all reviews for a specific service by its ID.
   *
   * @param {number} serviceId - The ID of the service to retrieve reviews for.
   * @returns {Array} - An array of review objects.
   *   Each object contains: { reviewId, userId, username, firstName, reviewText, rating, time, serviceId }
   * @throws {NotFoundError} - If no reviews are found for the given service ID.
   */
  static async getServiceReviews(serviceId) {
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
    WHERE r.service_id = $1
    `,
      [serviceId]
    );

    const reviews = result.rows;
    if (reviews.length === 0) {
      throw new NotFoundError(`No reviews found for service ID: ${serviceId}`);
    }

    return reviews;
  }
}
module.exports = Service;
