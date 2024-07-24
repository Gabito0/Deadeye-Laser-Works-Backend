"use strict";
const db = require("../db");
const { NotFoundError } = require("../expressError");

class UserService {
  /**
   * Mark a user service as completed and update the fulfilled date to the current date.
   *
   * @param {number} id - The ID of the user service to update.
   * @returns {Object} - An object containing the updated user service fields.
   * @throws {NotFoundError} - If no user service is found with the given ID.
   */
  static async completeService(id) {
    const result = await db.query(
      `
      UPDATE users_services 
      SET is_completed = true, fulfilled_date = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING id AS "userServiceId",
                user_id AS "userId",
                service_id AS "serviceId",
                confirmation_code AS "confirmationCode",
                requested_date AS "requestedDate",
                confirmed_price AS "confirmedPrice",
                is_completed AS "isCompleted",
                addition_info AS "additionInfo",
                fulfilled_date AS "fulfilledDate"
      `,
      [id]
    );

    const userService = result.rows[0];
    if (!userService) {
      throw new NotFoundError(`No user service found with ID: ${id}`);
    }
    return userService;
  }

  /**
   * Change the confirmed price of a user service.
   *
   * @param {number} price - The new price to set.
   * @param {number} id - The ID of the user service to update.
   * @returns {Object} - An object containing the updated user service fields.
   * @throws {NotFoundError} - If no user service is found with the given ID.
   */
  static async changePrice(price, id) {
    const result = await db.query(
      `
      UPDATE users_services 
      SET confirmed_price = $1
      WHERE id = $2
      RETURNING id AS "userServiceId",
                user_id AS "userId",
                service_id AS "serviceId",
                confirmed_price AS "confirmedPrice",
                is_completed AS "isCompleted",
                addition_info AS "additionInfo",
                confirmation_code AS "confirmationCode",
                support_ticket_id AS "supportTicketId",
                requested_date AS "requestedDate",
                fulfilled_date AS "fulfilledDate"
      `,
      [price, id]
    );

    const userService = result.rows[0];
    if (!userService) {
      throw new NotFoundError(`No user service found with ID: ${id}`);
    }

    return userService;
  }

  /**
   * Get all services for a specific user by their username.
   *
   * @param {string} username - The username of the user.
   * @returns {Array} - An array of service objects associated with the user.
   *   Each object contains: { serviceId, title, description, price, isActive, userServiceId, confirmedPrice, isCompleted, additionInfo, confirmationCode, requestedDate, fulfilledDate }
   * @throws {NotFoundError} - If no user is found with the given username.
   */
  static async getUserServices(username) {
    const userRes = await db.query(
      `SELECT id
     FROM users
     WHERE username = $1`,
      [username]
    );

    const user = userRes.rows[0];
    if (!user) throw new NotFoundError(`No user: ${username}`);

    const result = await db.query(
      `
      SELECT 
        s.id AS "serviceId",
        s.title AS "title",
        s.description AS "description",
        s.price AS "price",
        s.is_active AS "isActive",
        us.id AS "userServiceId",
        us.confirmed_price AS "confirmedPrice",
        us.is_completed AS "isCompleted",
        us.addition_info AS "additionInfo",
        us.confirmation_code AS "confirmationCode",
        us.requested_date AS "requestedDate",
        us.fulfilled_date AS "fulfilledDate"
      FROM 
        services s
      JOIN 
        users_services us ON s.id = us.service_id
      WHERE 
        us.user_id = $1
    `,
      [user.id]
    );
    return result.rows;
  }

  /**
   * Add a service to a user.
   *
   * @param {string} username - The username of the user.
   * @param {number} serviceId - The ID of the service to be added.
   * @param {number} confirmedPrice - The confirmed price of the service.
   * @param {string} additionInfo - Additional information related to the service.
   * @param {boolean} [isCompleted=false] - Whether the service is completed or not.
   * @returns {Object} - An object containing the user service details.
   *   Contains: { userServiceId, userId, serviceId, confirmedPrice, isCompleted, additionInfo }
   * @throws {NotFoundError} - If no user or service is found with the given IDs.
   * @throws {BadRequestError} - If the service cannot be added to the user.
   */
  static async addServiceToUser(
    username,
    serviceId,
    confirmedPrice,
    additionInfo,
    isCompleted = false
  ) {
    const preCheck = await db.query(
      `SELECT id
     FROM users
     WHERE username = $1`,
      [username]
    );

    const user = preCheck.rows[0];
    if (!user) throw new NotFoundError(`No user: ${username}`);

    const preCheck2 = await db.query(
      `SELECT id 
     FROM services
     WHERE id = $1`,
      [serviceId]
    );

    const serviceRes = preCheck2.rows[0];
    if (!serviceRes) throw new NotFoundError(`No service: ${serviceId}`);

    const result = await db.query(
      `INSERT INTO users_services (user_id, service_id, confirmed_price, is_completed, addition_info)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id AS "userServiceId", user_id AS "userId", service_id AS "serviceId", confirmed_price AS "confirmedPrice", is_completed AS "isCompleted", addition_info AS "additionInfo"`,
      [user.id, serviceId, confirmedPrice, isCompleted, additionInfo]
    );

    const userService = result.rows[0];
    if (!userService)
      throw new BadRequestError(`Could not add service to user: ${username}`);

    return userService;
  }

  /**
   * Get user info and their services.
   *
   * @param {string} username - The username of the user.
   * @returns {Object} - An object containing the user's information and their associated services.
   *   User object contains: { username, firstName, lastName, email, birthDate, status, isVerified, isActive }
   *   Services object contains: { serviceId, title, description, price, isActive, userServiceId, confirmedPrice, isCompleted, additionInfo, confirmationCode, requestedDate, fulfilledDate }
   * @throws {NotFoundError} - If no user is found with the given username.
   */
  static async getUserWithServices(username) {
    const user = await this.getUser(username);
    const services = await this.getUserServices(username);
    user.services = services;
    return user;
  }

  /**
   * Get all user services with user details.
   *
   * @returns {Array} - An array of service objects associated with users.
   *   Each object contains: { userServiceId, userId, username, firstName, serviceId, title, description, price, isActive, confirmedPrice, isCompleted, additionInfo, confirmationCode, requestedDate, fulfilledDate }
   * @throws {NotFoundError} - If no services are found.
   */
  static async getAllUserServices() {
    const result = await db.query(
      `
      SELECT 
        us.id AS "userServiceId",
        us.user_id AS "userId",
        u.username AS "username",
        u.first_name AS "firstName",
        us.service_id AS "serviceId",
        s.title AS "title",
        s.description AS "description",
        s.price AS "price",
        s.is_active AS "isActive",
        us.confirmed_price AS "confirmedPrice",
        us.is_completed AS "isCompleted",
        us.addition_info AS "additionInfo",
        us.confirmation_code AS "confirmationCode",
        us.requested_date AS "requestedDate",
        us.fulfilled_date AS "fulfilledDate"
      FROM 
        users_services us
      JOIN 
        users u ON us.user_id = u.id
      JOIN 
        services s ON us.service_id = s.id
      `
    );

    if (result.rows.length === 0) {
      throw new NotFoundError(`No user services found`);
    }

    return result.rows;
  }
}

module.exports = UserService;
