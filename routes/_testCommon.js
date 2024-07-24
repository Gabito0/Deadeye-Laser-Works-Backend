"use strict";

const db = require("../db");
const User = require("../models/user");
const { createToken } = require("../helpers/tokens");

async function commonBeforeAll() {
  // Clean out tables and reset IDs to prevent interference from other tests
  await db.query(
    "TRUNCATE users, services, users_services, reviews RESTART IDENTITY CASCADE"
  );

  // Register test users
  await User.register({
    username: "u1",
    firstName: "U1F",
    lastName: "U1L",
    email: "user1@user.com",
    password: "password1",
    birthDate: "1990-01-01",
    status: "regular",
  });
  await User.register({
    username: "u2",
    firstName: "U2F",
    lastName: "U2L",
    email: "user2@user.com",
    password: "password2",
    birthDate: "1990-01-01",
    status: "regular",
  });

  // Insert test services
  await db.query(`
    INSERT INTO services (title, description, price, is_active)
    VALUES 
      ('Service1', 'Description1', 100.00, true),
      ('Service2', 'Description2', 200.00, true)`);

  // Get user and service IDs
  const service1 = await db.query(
    `SELECT id FROM services WHERE title = 'Service1'`
  );
  const service2 = await db.query(
    `SELECT id FROM services WHERE title = 'Service2'`
  );
  const user1 = await db.query(`SELECT id FROM users WHERE username = 'u1'`);

  // Insert user services
  await db.query(
    `
    INSERT INTO users_services (user_id, service_id, confirmed_price, is_completed, addition_info, confirmation_code, requested_date, fulfilled_date)
    VALUES 
      ($1, $2, 100.00, false, 'Additional info for user 1 service 1', 'CONFIRM123', NOW(), NOW()),
      ($1, $3, 200.00, true, 'Additional info for user 1 service 2', 'CONFIRM456', NOW(), NULL)`,
    [user1.rows[0].id, service1.rows[0].id, service2.rows[0].id]
  );

  // Insert reviews for the services
  await db.query(
    `
    INSERT INTO reviews (user_id, service_id, review_text, rating, time)
    VALUES 
      ($1, $2, 'Great service!', 5, NOW()),
      ($1, $3, 'Good service.', 4, NOW())`,
    [user1.rows[0].id, service1.rows[0].id, service2.rows[0].id]
  );
}

async function commonBeforeEach() {
  await db.query("BEGIN");
}

async function commonAfterEach() {
  await db.query("ROLLBACK");
}

async function commonAfterAll() {
  await db.end();
}

const u1Token = createToken({ username: "u1", status: "regular" });
const u2Token = createToken({ username: "u2", status: "regular" });
const adminToken = createToken({ username: "nope", status: "admin" });

module.exports = {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  u1Token,
  u2Token,
  adminToken,
};
