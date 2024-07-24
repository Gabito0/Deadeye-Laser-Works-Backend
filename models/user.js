"use strict";
const db = require("../db");
const bcrypt = require("bcrypt");
const { sqlForPartialUpdate } = require("../helpers/sql");
const {
  NotFoundError,
  BadRequestError,
  UnauthorizedError,
} = require("../expressError");

const { BCRYPT_WORK_FACTOR } = require("../config");

/** Related functions for users. */

class User {
  /**
   * Authenticate user with username and password.
   *
   * @param {string} username - The username of the user.
   * @param {string} password - The password of the user.
   * @returns {Object} - An object containing user details { username, firstName, lastName, email, status, isVerified, isActive }.
   * @throws {UnauthorizedError} - If user not found or wrong password.
   */
  static async authenticate(username, password) {
    // try to find the user first
    const result = await db.query(
      `SELECT     
                  username,
                  password,
                  first_name AS "firstName",
                  last_name AS "lastName",
                  email,
                  status AS "status",
                  is_verified as "isVerified",
                  is_active as "isActive",
                  birth_date AS "birthDate"
           FROM users
           WHERE username = $1`,
      [username]
    );

    const user = result.rows[0];

    if (user) {
      // compare hashed password to a new hash from password
      const isValid = await bcrypt.compare(password, user.password);
      if (isValid === true) {
        delete user.password;
        return user;
      }
    }

    throw new UnauthorizedError("Invalid username/password");
  }

  /**
   * Register user with data.
   *
   * @param {Object} data - The user data.
   * @returns {Object} - An object containing user details { username, firstName, lastName, email, birthDate, status, isVerified, isActive }.
   * @throws {BadRequestError} - On duplicates.
   */
  static async register({
    username,
    password,
    firstName,
    lastName,
    email,
    birthDate,
    status,
  }) {
    const duplicateCheck = await db.query(
      `SELECT username
           FROM users
           WHERE username = $1`,
      [username]
    );

    if (duplicateCheck.rows[0]) {
      throw new BadRequestError(`Duplicate username: ${username}`);
    }

    const hashedPassword = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);

    const result = await db.query(
      `INSERT INTO users
           (username,
            password,
            first_name,
            last_name,
            email,
            birth_date,
            status)
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           RETURNING username, first_name AS "firstName", last_name AS "lastName", email, birth_date AS "birthDate", status, is_verified as "isVerified", is_active as "isActive"`,
      [username, hashedPassword, firstName, lastName, email, birthDate, status]
    );

    const user = result.rows[0];

    return user;
  }

  /**
   * Sets "is_verified" to true.
   *
   * @param {string} username - The username of the user to verify.
   * @returns {Object} - The verified user object.
   * @throws {NotFoundError} - If no user is found with the given username.
   */
  static async verifyUser(username) {
    const result = await db.query(
      `UPDATE users
       SET is_verified = true
       WHERE username = $1
       RETURNING id, username, first_name AS "firstName", last_name AS "lastName", email, birth_date AS "birthDate", status, is_verified as "isVerified", is_active as "isActive"`,
      [username]
    );

    const user = result.rows[0];

    if (!user) {
      throw new NotFoundError(`No user found with username: ${username}`);
    }

    return user;
  }

  /**
   * Given a username, return data about user.
   *
   * @param {string} username - The username of the user to retrieve.
   * @returns {Object} - The user object containing { username, firstName, lastName, email, birthDate, status, isVerified, isActive }.
   * @throws {NotFoundError} - If user not found.
   */
  static async getUser(username) {
    const userRes = await db.query(
      `SELECT     id,
                  username,
                  password,
                  first_name AS "firstName",
                  last_name AS "lastName",
                  email,
                  birth_date AS "birthDate",
                  status AS "status",
                  is_verified as "isVerified",
                  is_active as "isActive"
         FROM users
         WHERE username = $1`,
      [username]
    );

    const user = userRes.rows[0];

    if (!user) throw new NotFoundError(`No user: ${username}`);

    delete user.password; // Remove the password from the returned user object

    return user;
  }

  /**
   * Mark user as inactive.
   *
   * @param {string} username - The username of the user to deactivate.
   * @returns {Object} - The deactivated user object containing username, firstName, lastName, email, birthDate, status, isVerified, isActive.
   * @throws {NotFoundError} - If no user is found with the given username.
   */
  static async deactivate(username) {
    const result = await db.query(
      `UPDATE users
     SET is_active = FALSE
     WHERE username = $1
     RETURNING id,
                  username,
                  first_name AS "firstName",
                  last_name AS "lastName",
                  email,
                  birth_date AS "birthDate",
                  status AS "status",
                  is_verified as "isVerified",
                  is_active as "isActive"`,
      [username]
    );

    const user = result.rows[0];
    if (!user)
      throw new NotFoundError(`No user found with username: ${username}`);

    return user;
  }

  /**
   * Mark user as active.
   *
   * @param {string} username - The username of the user to activate.
   * @returns {Object} - The activated user object containing username, firstName, lastName, email, birthDate, status, isVerified, isActive.
   * @throws {NotFoundError} - If no user is found with the given username.
   */
  static async activate(username) {
    const result = await db.query(
      `UPDATE users
     SET is_active = true
     WHERE username = $1
     RETURNING id,
                  username,
                  first_name AS "firstName",
                  last_name AS "lastName",
                  email,
                  birth_date AS "birthDate",
                  status AS "status",
                  is_verified as "isVerified",
                  is_active as "isActive"`,
      [username]
    );

    const user = result.rows[0];
    if (!user)
      throw new NotFoundError(`No user found with username: ${username}`);

    return user;
  }

  /**
   * Delete user and handle references.
   *
   * @param {string} username - The username of the user to delete.
   * @throws {NotFoundError} - If no user is found with the given username.
   */
  static async remove(username) {
    const result = await db.query(
      `DELETE FROM users
       WHERE username = $1
       RETURNING username`,
      [username]
    );

    const user = result.rows[0];
    if (!user)
      throw new NotFoundError(`No user found with username: ${username}`);
  }

  /**
   * Update user data.
   *
   * @param {string} username - The username of the user to update.
   * @param {Object} data - The data to update for the user. Can include: { firstName, lastName, email, birthDate, isActive, password, newPassword }.
   * @returns {Object} - The updated user object containing { username, firstName, lastName, email, birthDate, isActive }.
   * @throws {NotFoundError} - If no user is found with the given username.
   * @throws {UnauthorizedError} - If the provided password is invalid.
   */
  static async update(username, data) {
    if (data.password) {
      const userRes = await db.query(
        `SELECT password FROM users WHERE username=$1`,
        [username]
      );

      const user = userRes.rows[0];

      if (!user) throw new NotFoundError(`No user: ${username}`);

      const isValid = await bcrypt.compare(data.password, user.password);
      if (!isValid) throw new UnauthorizedError("Invalid password");

      // If there is a new password, hash it
      if (data.newPassword) {
        data.password = await bcrypt.hash(data.newPassword, BCRYPT_WORK_FACTOR);
        delete data.newPassword;
      } else {
        // Remove password from data to avoid rehashing it
        delete data.password;
      }
    }

    const { setCols, values } = sqlForPartialUpdate(data, {
      firstName: "first_name",
      lastName: "last_name",
      email: "email",
      birthDate: "birth_date",
      isActive: "is_active",
    });
    const usernameVarIdx = "$" + (values.length + 1);

    const querySql = `UPDATE users 
                      SET ${setCols} 
                      WHERE username = ${usernameVarIdx} 
                      RETURNING id,
                      username,
                      first_name AS "firstName",
                      last_name AS "lastName",
                      email,
                      birth_date AS "birthDate",
                      status AS "status",
                      is_verified as "isVerified",
                      is_active as "isActive"`;
    const result = await db.query(querySql, [...values, username]);
    const user = result.rows[0];

    if (!user) throw new NotFoundError(`No user: ${username}`);

    return user;
  }
}

module.exports = User;
