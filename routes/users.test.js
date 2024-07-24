"use strict";

const request = require("supertest");
const db = require("../db");
const app = require("../app");
const { createToken } = require("../helpers/tokens");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  u1Token,
  u2Token,
  adminToken,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** GET /:username */

describe("GET /:username", function () {
  test("works for same user", async function () {
    const resp = await request(app)
      .get(`/users/u1`)
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(200);
    expect(resp.body).toEqual({
      user: {
        username: "u1",
        firstName: "U1F",
        id: 1,
        lastName: "U1L",
        email: "user1@user.com",
        birthDate: expect.any(String),
        status: "regular",
        isActive: true,
        isVerified: false,
      },
    });
  });

  test("works for admin", async function () {
    const adminToken = createToken({ username: "admin", status: "admin" });
    const resp = await request(app)
      .get(`/users/u1`)
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(200);
    expect(resp.body).toEqual({
      user: {
        username: "u1",
        firstName: "U1F",
        lastName: "U1L",
        id: 1,
        email: "user1@user.com",
        birthDate: expect.any(String),
        status: "regular",
        isActive: true,
        isVerified: false,
      },
    });
  });

  test("unauth for other users", async function () {
    const resp = await request(app)
      .get(`/users/u1`)
      .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("unauth for anon", async function () {
    const resp = await request(app).get(`/users/u1`);
    expect(resp.statusCode).toEqual(401);
  });

  test("not found if user not found", async function () {
    const resp = await request(app)
      .get(`/users/nope`)
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(404);
  });
});

/************************************** PUT /:username */

describe("PUT /users/:username", function () {
  test("works for same user", async function () {
    const resp = await request(app)
      .put(`/users/u1`)
      .send({
        firstName: "NewFirst",
        lastName: "NewLast",
        email: "newemail@example.com",
        birthDate: "2000-01-01",
        id: 1,
        isVerified: "false",
        status: "regular",
      })
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(200);
    expect(resp.body).toEqual({
      user: {
        username: "u1",
        firstName: "NewFirst",
        lastName: "NewLast",
        email: "newemail@example.com",
        birthDate: expect.any(String),
        isActive: true,
      },
    });
  });

  test("unauth for different user", async function () {
    const resp = await request(app)
      .put(`/users/u1`)
      .send({
        firstName: "NewFirst",
        lastName: "NewLast",
        email: "newemail@example.com",
        birthDate: "2000-01-01",
      })
      .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("unauth for anon", async function () {
    const resp = await request(app).put(`/users/u1`).send({
      firstName: "NewFirst",
      lastName: "NewLast",
      email: "newemail@example.com",
      birthDate: "2000-01-01",
    });
    expect(resp.statusCode).toEqual(401);
  });

  test("not found on no such user", async function () {
    const resp = await request(app)
      .put(`/users/nope`)
      .send({
        firstName: "NewFirst",
        lastName: "NewLast",
        email: "newemail@example.com",
        birthDate: "2000-01-01",
      })
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(404);
  });

  test("bad request on invalid data", async function () {
    const resp = await request(app)
      .put(`/users/u1`)
      .send({
        firstName: "NewFirst",
        lastName: "NewLast",
        email: "not-an-email",
        birthDate: "2000-01-01",
      })
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(400);
  });
});

/************************************** PATCH /users/:username/deactivate */

describe("PATCH /users/:username/deactivate", function () {
  test("works for same user", async function () {
    const resp = await request(app)
      .patch(`/users/u1/deactivate`)
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(200);
    expect(resp.body).toEqual({
      user: {
        username: "u1",
        firstName: "U1F",
        lastName: "U1L",
        email: "user1@user.com",
        birthDate: expect.any(String),
        status: "regular",
        id: 1,
        isVerified: false,
        isActive: false,
      },
    });

    // Verify user is actually deactivated
    const res = await db.query(
      "SELECT is_active FROM users WHERE username = 'u1'"
    );
    expect(res.rows[0].is_active).toEqual(false);
  });

  test("works for admin", async function () {
    const resp = await request(app)
      .patch(`/users/u1/deactivate`)
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(200);
    expect(resp.body).toEqual({
      user: {
        username: "u1",
        firstName: "U1F",
        lastName: "U1L",
        email: "user1@user.com",
        id: 1,
        birthDate: expect.any(String),
        status: "regular",
        isVerified: false,
        isActive: false,
      },
    });

    // Verify user is actually deactivated
    const res = await db.query(
      "SELECT is_active FROM users WHERE username = 'u1'"
    );
    expect(res.rows[0].is_active).toEqual(false);
  });

  test("unauth for non-admin deactivating another user", async function () {
    const resp = await request(app)
      .patch(`/users/u2/deactivate`)
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("unauth for anon", async function () {
    const resp = await request(app).patch(`/users/u1/deactivate`);
    expect(resp.statusCode).toEqual(401);
  });

  test("not found on no such user", async function () {
    const resp = await request(app)
      .patch(`/users/nope/deactivate`)
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(404);
  });
});

/************************************** DELETE /users/:username */

describe("DELETE /users/:username", function () {
  test("works for same user", async function () {
    const resp = await request(app)
      .delete(`/users/u1`)
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(200);
    expect(resp.body).toEqual({ deleted: "u1" });

    // Verify user is actually deleted
    const res = await db.query("SELECT * FROM users WHERE username = 'u1'");
    expect(res.rows.length).toEqual(0);
  });

  test("works for admin", async function () {
    const resp = await request(app)
      .delete(`/users/u1`)
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(200);
    expect(resp.body).toEqual({ deleted: "u1" });

    // Verify user is actually deleted
    const res = await db.query("SELECT * FROM users WHERE username = 'u1'");
    expect(res.rows.length).toEqual(0);
  });

  test("unauth for non-admin deleting another user", async function () {
    const resp = await request(app)
      .delete(`/users/u2`)
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("unauth for anon", async function () {
    const resp = await request(app).delete(`/users/u1`);
    expect(resp.statusCode).toEqual(401);
  });

  test("not found on no such user", async function () {
    const resp = await request(app)
      .delete(`/users/nope`)
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(404);
  });
});

/************************************** PATCH /users/:username/activate */

describe("PATCH /users/:username/activate", function () {
  test("works for correct user", async function () {
    const resp = await request(app)
      .patch(`/users/u1/activate`)
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(200);
    expect(resp.body).toEqual({
      user: {
        username: "u1",
        firstName: "U1F",
        lastName: "U1L",
        id: 1,
        email: "user1@user.com",
        birthDate: expect.any(String),
        status: "regular",
        isVerified: false,
        isActive: true,
      },
    });
  });

  test("works for admin", async function () {
    const resp = await request(app)
      .patch(`/users/u1/activate`)
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(200);
    expect(resp.body).toEqual({
      user: {
        username: "u1",
        firstName: "U1F",
        lastName: "U1L",
        id: 1,
        email: "user1@user.com",
        birthDate: expect.any(String),
        status: "regular",
        isVerified: false,
        isActive: true,
      },
    });
  });

  test("unauthorized for wrong user", async function () {
    const resp = await request(app)
      .patch(`/users/u2/activate`)
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("unauthorized for anonymous users", async function () {
    const resp = await request(app).patch(`/users/u1/activate`);
    expect(resp.statusCode).toEqual(401);
  });

  test("not found for no such user", async function () {
    const resp = await request(app)
      .patch(`/users/nope/activate`)
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(404);
  });
});
