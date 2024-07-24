"use strict";

const request = require("supertest");
const db = require("../db");
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

/************************************** GET /services */

describe("GET /services", function () {
  test("works for anonymous", async function () {
    const resp = await request(app).get(`/services`);
    expect(resp.statusCode).toEqual(200);
    expect(resp.body).toEqual({
      services: [
        {
          serviceId: expect.any(Number),
          title: "Service1",
          description: "Description1",
          price: "100.00",
          isActive: true,
        },
        {
          serviceId: expect.any(Number),
          title: "Service2",
          description: "Description2",
          price: "200.00",
          isActive: true,
        },
      ],
    });
  });

  test("empty if no services", async function () {
    await db.query("DELETE FROM services");
    const resp = await request(app).get(`/services`);
    expect(resp.body).toEqual({ services: [] });
  });
});

/************************************** GET /services/:serviceId */

describe("GET /services/:serviceId", function () {
  test("works for anonymous", async function () {
    const resp = await request(app).get(`/services/1`);
    expect(resp.statusCode).toEqual(200);
    expect(resp.body).toEqual({
      service: {
        serviceId: 1,
        title: "Service1",
        description: "Description1",
        price: "100.00",
        isActive: true,
      },
    });
  });

  test("not found for non-existent service", async function () {
    const resp = await request(app).get(`/services/9999`);
    expect(resp.statusCode).toEqual(404);
  });
});

/************************************** POST /services */

describe("POST /services", function () {
  test("works for admin", async function () {
    const resp = await request(app)
      .post(`/services`)
      .send({
        title: "New Service",
        description: "New Description",
        price: 150.0,
        isActive: true,
      })
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(201);
    expect(resp.body).toEqual({
      service: {
        serviceId: expect.any(Number),
        title: "New Service",
        description: "New Description",
        price: "150.00",
        isActive: true,
      },
    });
  });

  test("unauth for non-admin", async function () {
    const resp = await request(app)
      .post(`/services`)
      .send({
        title: "New Service",
        description: "New Description",
        price: 150.0,
        isActive: true,
      })
      .set("authorization", `Bearer ${u1Token}`); // Assuming u1Token is a non-admin token
    expect(resp.statusCode).toEqual(401);
  });

  test("bad request with missing data", async function () {
    const resp = await request(app)
      .post(`/services`)
      .send({
        title: "New Service",
        // Missing description, price, isActive
      })
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request with invalid data", async function () {
    const resp = await request(app)
      .post(`/services`)
      .send({
        title: "New Service",
        description: "New Description",
        price: "not-a-number",
        isActive: true,
      })
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(400);
  });
});

/************************************** GET /services/:serviceId/reviews */

describe("GET /services/:serviceId/reviews", function () {
  test("works for anonymous", async function () {
    const resp = await request(app).get(`/services/1/reviews`);
    expect(resp.statusCode).toEqual(200);
    expect(resp.body).toEqual({
      reviews: [
        {
          reviewId: expect.any(Number),
          userId: expect.any(Number),
          username: "u1",
          firstName: "U1F",
          reviewText: "Great service!",
          rating: 5,
          time: expect.any(String),
          serviceId: 1,
        },
      ],
    });
  });

  test("not found for non-existent service", async function () {
    const resp = await request(app).get(`/services/9999/reviews`);
    expect(resp.statusCode).toEqual(404);
  });
});

/************************************** PATCH /services/:serviceId/deactivate */

describe("PATCH /services/:serviceId/deactivate", function () {
  test("works for admin", async function () {
    const resp = await request(app)
      .patch(`/services/1/deactivate`)
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(200);
    expect(resp.body).toEqual({
      service: {
        serviceId: 1,
        title: "Service1",
        description: "Description1",
        price: "100.00",
        isActive: false,
      },
    });
  });

  test("unauthorized for non-admin users", async function () {
    const resp = await request(app)
      .patch(`/services/1/deactivate`)
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("not found for non-existent service", async function () {
    const resp = await request(app)
      .patch(`/services/9999/deactivate`)
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(404);
  });
});

/************************************** PATCH /services/:serviceId */

describe("PATCH /services/:serviceId", function () {
  test("works for admin", async function () {
    const resp = await request(app)
      .patch(`/services/1`)
      .send({
        title: "Updated Service",
        description: "Updated Description",
        price: 150.0,
        isActive: true,
      })
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(200);
    expect(resp.body).toEqual({
      service: {
        serviceId: 1,
        title: "Updated Service",
        description: "Updated Description",
        price: "150.00",
        isActive: true,
      },
    });
  });

  test("unauthorized for non-admin users", async function () {
    const resp = await request(app)
      .patch(`/services/1`)
      .send({
        title: "Updated Service",
      })
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("not found for non-existent service", async function () {
    const resp = await request(app)
      .patch(`/services/9999`)
      .send({
        title: "Updated Service",
      })
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(404);
  });

  test("bad request with invalid data", async function () {
    const resp = await request(app)
      .patch(`/services/1`)
      .send({
        price: -10.0,
      })
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(400);
  });
});

/************************************** PATCH /services/:serviceId/activate */

describe("PATCH /services/:serviceId/activate", function () {
  test("works for admin", async function () {
    const resp = await request(app)
      .patch(`/services/1/activate`)
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(200);
    expect(resp.body).toEqual({
      service: {
        serviceId: 1,
        title: "Service1",
        description: "Description1",
        price: "100.00",
        isActive: true,
      },
    });
  });

  test("unauthorized for non-admin users", async function () {
    const resp = await request(app)
      .patch(`/services/1/activate`)
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("not found for non-existent service", async function () {
    const resp = await request(app)
      .patch(`/services/9999/activate`)
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(404);
  });
});

/************************************** DELETE /services/:serviceId */

describe("DELETE /services/:serviceId", function () {
  test("works for admin", async function () {
    const resp = await request(app)
      .delete(`/services/1`)
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(200);
    expect(resp.body).toEqual({ deleted: "1" });
  });

  test("unauthorized for non-admin users", async function () {
    const resp = await request(app)
      .delete(`/services/1`)
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("not found for non-existent service", async function () {
    const resp = await request(app)
      .delete(`/services/9999`)
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(404);
  });
});
