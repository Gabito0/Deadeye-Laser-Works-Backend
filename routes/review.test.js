"use strict";

const request = require("supertest");
const app = require("../app");
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

/************************************** GET /reviews/:reviewId */

describe("GET /reviews/:reviewId", function () {
  test("works for anonymous", async function () {
    const resp = await request(app).get(`/reviews/1`);
    expect(resp.statusCode).toEqual(200);
    expect(resp.body).toEqual({
      review: {
        reviewId: 1,
        userId: expect.any(Number),
        username: expect.any(String),
        firstName: expect.any(String),
        reviewText: "Great service!",
        rating: 5,
        time: expect.any(String),
        serviceId: expect.any(Number),
      },
    });
  });

  test("not found for non-existent review", async function () {
    const resp = await request(app).get(`/reviews/9999`);
    expect(resp.statusCode).toEqual(404);
  });
});

/************************************** POST /reviews/:username */

describe("POST /reviews/:username", function () {
  test("works for correct user", async function () {
    const resp = await request(app)
      .post(`/reviews/u1`)
      .send({
        userId: 1,
        serviceId: 1,
        reviewText: "Excellent service!",
        rating: 5,
      })
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(201);
    expect(resp.body).toEqual({
      review: {
        reviewId: expect.any(Number),
        userId: 1,
        serviceId: 1,
        reviewText: "Excellent service!",
        rating: 5,
        time: expect.any(String),
      },
    });
  });

  test("works for admin", async function () {
    const resp = await request(app)
      .post(`/reviews/u1`)
      .send({
        userId: 1,
        serviceId: 1,
        reviewText: "Excellent service!",
        rating: 5,
      })
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(201);
    expect(resp.body).toEqual({
      review: {
        reviewId: expect.any(Number),
        userId: 1,
        serviceId: 1,
        reviewText: "Excellent service!",
        rating: 5,
        time: expect.any(String),
      },
    });
  });

  test("bad request with missing data", async function () {
    const resp = await request(app)
      .post(`/reviews/u1`)
      .send({
        userId: 1,
        serviceId: 1,
        rating: 5,
      })
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("unauthorized for wrong user", async function () {
    const resp = await request(app)
      .post(`/reviews/u2`)
      .send({
        userId: 1,
        serviceId: 1,
        reviewText: "Excellent service!",
        rating: 5,
      })
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("unauthorized for anonymous users", async function () {
    const resp = await request(app).post(`/reviews/u1`).send({
      userId: 1,
      serviceId: 1,
      reviewText: "Excellent service!",
      rating: 5,
    });
    expect(resp.statusCode).toEqual(401);
  });
});

/************************************** PATCH /reviews/:reviewId/:username */

describe("PATCH /reviews/:reviewId/:username", function () {
  test("works for correct user", async function () {
    const resp = await request(app)
      .patch(`/reviews/1/u1`)
      .send({
        reviewText: "Updated review text",
        rating: 4,
      })
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(200);
    expect(resp.body).toEqual({
      review: {
        reviewId: 1,
        reviewText: "Updated review text",
        rating: 4,
        time: expect.any(String),
      },
    });
  });

  test("works for admin", async function () {
    const resp = await request(app)
      .patch(`/reviews/1/u1`)
      .send({
        reviewText: "Admin updated review text",
        rating: 3,
      })
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(200);
    expect(resp.body).toEqual({
      review: {
        reviewId: 1,
        reviewText: "Admin updated review text",
        rating: 3,
        time: expect.any(String),
      },
    });
  });

  test("unauthorized for wrong user", async function () {
    const resp = await request(app)
      .patch(`/reviews/1/u1`)
      .send({
        reviewText: "Unauthorized updated review text",
        rating: 3,
      })
      .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("unauthorized for anonymous users", async function () {
    const resp = await request(app).patch(`/reviews/1/u1`).send({
      reviewText: "Anonymous updated review text",
      rating: 2,
    });
    expect(resp.statusCode).toEqual(401);
  });

  test("bad request with invalid data", async function () {
    const resp = await request(app)
      .patch(`/reviews/1/u1`)
      .send({
        reviewText: "Updated review text",
        rating: "not-a-number",
      })
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(400);
  });
});

/************************************** DELETE /reviews/:reviewId/:username */

describe("DELETE /reviews/:reviewId/:username", function () {
  test("works for correct user", async function () {
    const resp = await request(app)
      .delete(`/reviews/1/u1`)
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(200);
    expect(resp.body).toEqual({ deleted: "1" });
  });

  test("works for admin", async function () {
    const resp = await request(app)
      .delete(`/reviews/1/u1`)
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(200);
    expect(resp.body).toEqual({ deleted: "1" });
  });

  test("unauthorized for wrong user", async function () {
    const resp = await request(app)
      .delete(`/reviews/1/u1`)
      .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("unauthorized for anonymous users", async function () {
    const resp = await request(app).delete(`/reviews/1/u1`);
    expect(resp.statusCode).toEqual(401);
  });

  test("not found for no such review", async function () {
    const resp = await request(app)
      .delete(`/reviews/9999/u1`)
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(404);
  });
});
