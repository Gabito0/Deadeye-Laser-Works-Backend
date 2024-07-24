"use strict";

const db = require("../db");
const UserService = require("../models/userService");
const { NotFoundError, UnauthorizedError } = require("../expressError");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** completeService */

describe("completeService", function () {
  test("works", async function () {
    const userServiceId = 1;
    const result = await UserService.completeService(userServiceId);
    expect(result).toEqual({
      userServiceId: userServiceId,
      confirmationCode: "CONFIRM123",
      userId: expect.any(Number),
      serviceId: expect.any(Number),
      confirmedPrice: "100.00",
      isCompleted: true,
      additionInfo: expect.any(String),
      requestedDate: expect.any(Date),
      fulfilledDate: expect.any(Date),
    });

    // Verify the database has been updated correctly
    const dbResult = await db.query(
      "SELECT is_completed, fulfilled_date FROM users_services WHERE id = $1",
      [userServiceId]
    );
    expect(dbResult.rows[0].is_completed).toEqual(true);
    expect(dbResult.rows[0].fulfilled_date).not.toBeNull();
  });

  test("throws NotFoundError if no such user service", async function () {
    try {
      await UserService.completeService(9999);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

describe("changePrice", function () {
  test("works", async function () {
    const userServiceId = 1;
    const newPrice = 150.0;
    const result = await UserService.changePrice(newPrice, userServiceId);
    expect(result).toEqual({
      userServiceId: userServiceId,
      userId: expect.any(Number),
      serviceId: expect.any(Number),
      confirmedPrice: "150.00",
      isCompleted: expect.any(Boolean),
      additionInfo: expect.any(String),
      confirmationCode: expect.any(String),
      supportTicketId: null,
      requestedDate: expect.any(Date),
      fulfilledDate: expect.any(Date),
    });

    // Verify the database has been updated correctly
    const dbResult = await db.query(
      "SELECT confirmed_price FROM users_services WHERE id = $1",
      [userServiceId]
    );
    expect(dbResult.rows[0].confirmed_price).toEqual("150.00");
  });

  test("throws NotFoundError if no such user service", async function () {
    try {
      await UserService.changePrice(999.99, 9999);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

/************************************** changePrice */

describe("changePrice", function () {
  test("works", async function () {
    const userServiceId = 1;
    const newPrice = 150.0;
    const result = await UserService.changePrice(newPrice, userServiceId);
    expect(result).toEqual({
      userServiceId: userServiceId,
      userId: expect.any(Number),
      serviceId: expect.any(Number),
      confirmedPrice: "150.00",
      isCompleted: expect.any(Boolean),
      additionInfo: expect.any(String),
      confirmationCode: expect.any(String),
      supportTicketId: null,
      requestedDate: expect.any(Date),
      fulfilledDate: expect.any(Date),
    });

    // Verify the database has been updated correctly
    const dbResult = await db.query(
      "SELECT confirmed_price FROM users_services WHERE id = $1",
      [userServiceId]
    );
    expect(dbResult.rows[0].confirmed_price).toEqual("150.00");
  });

  test("throws NotFoundError if no such user service", async function () {
    try {
      await UserService.changePrice(999.99, 9999);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

describe("getUserServices", function () {
  test("works", async function () {
    const services = await UserService.getUserServices("u1");
    expect(services).toEqual([
      {
        serviceId: expect.any(Number),
        title: "Service1",
        description: "Description1",
        price: "100.00",
        isActive: true,
        confirmedPrice: "100.00",
        isCompleted: false,
        additionInfo: "Additional info for user 1 service 1",
        confirmationCode: "CONFIRM123",
        requestedDate: expect.any(Date),
        fulfilledDate: expect.any(Date),
        userServiceId: 1,
      },
      {
        serviceId: expect.any(Number),
        title: "Service2",
        description: "Description2",
        price: "200.00",
        isActive: true,
        confirmedPrice: "200.00",
        isCompleted: true,
        additionInfo: "Additional info for user 1 service 2",
        confirmationCode: "CONFIRM456",
        requestedDate: expect.any(Date),
        fulfilledDate: null,
        userServiceId: 2,
      },
    ]);
  });

  test("returns empty array if no services", async function () {
    const services = await UserService.getUserServices("u2");
    expect(services).toEqual([]);
  });
});

describe("addServiceToUser", function () {
  test("works", async function () {
    const userService = await UserService.addServiceToUser(
      "u1",
      2,
      150.0,
      "Additional info for service"
    );

    expect(userService).toEqual({
      userId: expect.any(Number),
      serviceId: 2,
      confirmedPrice: "150.00",
      isCompleted: false,
      additionInfo: "Additional info for service",
      userServiceId: 3,
    });
  });

  test("bad request with invalid data", async function () {
    try {
      await UserService.addServiceToUser(
        "invalidUser",
        0,
        150.0,
        "Invalid service"
      );
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});
