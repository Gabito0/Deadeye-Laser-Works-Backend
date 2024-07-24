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

/************************************** GET /user-services */

describe("GET /user-services", function () {
  test("works for admin", async function () {
    const resp = await request(app)
      .get(`/user-services`)
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(200);
    expect(resp.body).toEqual({
      userServices: [
        {
          userServiceId: expect.any(Number),
          userId: expect.any(Number),
          username: "u1",
          firstName: "U1F",
          serviceId: expect.any(Number),
          title: "Service1",
          description: "Description1",
          price: "100.00",
          isActive: true,
          confirmedPrice: "100.00",
          isCompleted: false,
          additionInfo: "Additional info for user 1 service 1",
          confirmationCode: "CONFIRM123",
          requestedDate: expect.any(String),
          fulfilledDate: expect.any(String),
        },
        {
          userServiceId: expect.any(Number),
          userId: expect.any(Number),
          username: "u1",
          firstName: "U1F",
          serviceId: expect.any(Number),
          title: "Service2",
          description: "Description2",
          price: "200.00",
          isActive: true,
          confirmedPrice: "200.00",
          isCompleted: true,
          additionInfo: "Additional info for user 1 service 2",
          confirmationCode: "CONFIRM456",
          requestedDate: expect.any(String),
          fulfilledDate: null,
        },
      ],
    });
  });

  test("unauth for non-admin user", async function () {
    const resp = await request(app)
      .get(`/user-services`)
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("unauth for anon", async function () {
    const resp = await request(app).get(`/user-services`);
    expect(resp.statusCode).toEqual(401);
  });
});

/************************************** POST /user-services/:username */

describe("POST /user-services/:username", function () {
  test("works for correct user", async function () {
    const resp = await request(app)
      .post(`/user-services/u1`)
      .send({
        username: "u1",
        serviceId: 1,
        confirmedPrice: 150.0,
        additionInfo: "Additional info for test service",
      })
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(201);
    expect(resp.body).toEqual({
      userService: {
        userServiceId: expect.any(Number),
        userId: expect.any(Number),
        serviceId: 1,
        confirmedPrice: "150.00",
        isCompleted: false,
        additionInfo: "Additional info for test service",
      },
    });
  });

  test("unauth for different user", async function () {
    const resp = await request(app)
      .post(`/user-services/u2`)
      .send({
        username: "u2",
        serviceId: 1,
        confirmedPrice: 150.0,
        additionInfo: "Additional info for test service",
      })
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("unauth for anon", async function () {
    const resp = await request(app).post(`/user-services/u1`).send({
      serviceId: 1,
      confirmedPrice: 150.0,
      additionInfo: "Additional info for test service",
    });
    expect(resp.statusCode).toEqual(401);
  });

  test("bad request with missing data", async function () {
    const resp = await request(app)
      .post(`/user-services/u1`)
      .send({
        serviceId: 1,
        confirmedPrice: 150.0,
      })
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request with invalid data", async function () {
    const resp = await request(app)
      .post(`/user-services/u1`)
      .send({
        serviceId: "not-a-number",
        confirmedPrice: 150.0,
        additionInfo: "Additional info for test service",
      })
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(400);
  });
});

/************************************** GET /user-services/:username */

describe("GET /user-services/:username", function () {
  test("works for correct user", async function () {
    const resp = await request(app)
      .get(`/user-services/u1`)
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(200);
    expect(resp.body).toEqual({
      userServices: [
        {
          serviceId: expect.any(Number),
          title: "Service1",
          description: "Description1",
          price: "100.00",
          isActive: true,
          userServiceId: expect.any(Number),
          confirmedPrice: "100.00",
          isCompleted: false,
          additionInfo: "Additional info for user 1 service 1",
          confirmationCode: "CONFIRM123",
          requestedDate: expect.any(String),
          fulfilledDate: expect.any(String),
        },
        expect.any(Object),
      ],
    });
  });

  test("unauth for different user", async function () {
    const resp = await request(app)
      .get(`/user-services/u2`)
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("unauth for anon", async function () {
    const resp = await request(app).get(`/user-services/u1`);
    expect(resp.statusCode).toEqual(401);
  });

  test("not found for non-existent user", async function () {
    const resp = await request(app)
      .get(`/user-services/nonexistent`)
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(404);
  });
});

/************************************** PATCH /user-services/:username/complete/:id */

describe("PATCH /user-services/:username/complete/:id", function () {
  test("works for admin", async function () {
    const resp = await request(app)
      .patch(`/user-services/u1/complete/1`)
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(200);
    expect(resp.body).toEqual({
      userService: {
        userServiceId: 1,
        userId: expect.any(Number),
        serviceId: expect.any(Number),
        confirmedPrice: "100.00",
        isCompleted: true,
        additionInfo: "Additional info for user 1 service 1",
        confirmationCode: "CONFIRM123",
        requestedDate: expect.any(String),
        fulfilledDate: expect.any(String),
      },
    });
  });

  test("unauth for non-admin user", async function () {
    const resp = await request(app)
      .patch(`/user-services/u1/complete/1`)
      .set("authorization", `Bearer ${u1Token}`); // Assuming u1Token is a non-admin token
    expect(resp.statusCode).toEqual(401);
  });

  test("not found for non-existent user service", async function () {
    const resp = await request(app)
      .patch(`/user-services/u1/complete/9999`)
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(404);
  });
});

/************************************** PATCH /user-services/:username/price/:id */

describe("PATCH /user-services/:username/price/:id", function () {
  test("works for admin with valid price", async function () {
    const resp = await request(app)
      .patch(`/user-services/u1/price/1`)
      .send({
        price: 150.0,
      })
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(200);
    expect(resp.body).toEqual({
      result: {
        userServiceId: 1,
        userId: expect.any(Number),
        serviceId: expect.any(Number),
        confirmedPrice: "150.00",
        confirmationCode: "CONFIRM123",
        isCompleted: expect.any(Boolean),
        additionInfo: expect.any(String),
        requestedDate: expect.any(String),
        fulfilledDate: expect.any(String),
        supportTicketId: null,
      },
    });
  });

  test("unauth for non-admin user", async function () {
    const resp = await request(app)
      .patch(`/user-services/u1/price/1`)
      .send({
        price: 150.0,
      })
      .set("authorization", `Bearer ${u1Token}`); // Assuming u1Token is a non-admin token
    expect(resp.statusCode).toEqual(401);
  });

  test("bad request with negative price", async function () {
    const resp = await request(app)
      .patch(`/user-services/u1/price/1`)
      .send({
        price: -150.0,
      })
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request with zero price", async function () {
    const resp = await request(app)
      .patch(`/user-services/u1/price/1`)
      .send({
        price: 0,
      })
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("not found for non-existent user service", async function () {
    const resp = await request(app)
      .patch(`/user-services/u1/price/9999`)
      .send({
        price: 150.0,
      })
      .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(404);
  });
});
