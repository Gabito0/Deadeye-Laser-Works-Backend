"use strict";

const db = require("../db");
const Service = require("../models/service");
const {
  NotFoundError,
  BadRequestError,
  UnauthorizedError,
} = require("../expressError");
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

describe("getAllServices", function () {
  test("works: with services", async function () {
    const services = await Service.getAllServices();
    expect(services).toEqual([
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
    ]);
  });
});

describe("deactivate", function () {
  test("works", async function () {
    const service = await Service.deactivate(1);
    expect(service).toEqual({
      serviceId: 1,
      title: "Service1",
      description: "Description1",
      price: "100.00",
      isActive: false,
    });

    const res = await db.query("SELECT is_active FROM services WHERE id = 1");
    expect(res.rows[0].is_active).toBe(false);
  });

  test("not found if no such service", async function () {
    try {
      await Service.deactivate(9999);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

describe("addService", function () {
  test("works", async function () {
    const newService = await Service.addService(
      "New Service",
      "New Description",
      300.0,
      true
    );
    expect(newService).toEqual({
      serviceId: expect.any(Number),
      title: "New Service",
      description: "New Description",
      price: "300.00",
      isActive: true,
    });

    const res = await db.query(
      "SELECT * FROM services WHERE title = 'New Service'"
    );
    expect(res.rows.length).toEqual(1);
    expect(res.rows[0]).toEqual({
      id: newService.serviceId,
      title: "New Service",
      description: "New Description",
      price: "300.00",
      is_active: true,
    });
  });

  test("throws BadRequestError if missing required fields", async function () {
    try {
      await Service.addService("New Service", "New Description");
      fail();
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }

    try {
      await Service.addService("New Service");
      fail();
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }

    try {
      await Service.addService();
      fail();
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});

describe("update", function () {
  test("works", async function () {
    const updatedService = await Service.update(1, {
      title: "Updated Service",
      price: 150.0,
    });
    expect(updatedService).toEqual({
      serviceId: 1,
      title: "Updated Service",
      description: "Description1",
      price: "150.00",
      isActive: true,
    });

    const res = await db.query("SELECT * FROM services WHERE id = 1");
    expect(res.rows.length).toEqual(1);
    expect(res.rows[0]).toEqual({
      id: 1,
      title: "Updated Service",
      description: "Description1",
      price: "150.00",
      is_active: true,
    });
  });

  test("throws NotFoundError if no such service", async function () {
    try {
      await Service.update(9999, { title: "No Service" });
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });

  test("throws BadRequestError if no data provided", async function () {
    try {
      await Service.update(1, {});
      fail();
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});

describe("getService", function () {
  test("works", async function () {
    const service = await Service.getService(1);
    expect(service).toEqual({
      serviceId: 1,
      title: "Service1",
      description: "Description1",
      price: "100.00",
      isActive: true,
    });
  });

  test("throws NotFoundError if no such service", async function () {
    try {
      await Service.getService(9999);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

describe("remove", function () {
  test("works", async function () {
    await Service.remove(1);
    const res = await db.query("SELECT * FROM services WHERE id = 1");
    expect(res.rows.length).toEqual(0);
  });

  test("throws NotFoundError if no such service", async function () {
    try {
      await Service.remove(9999);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

describe("getServiceReviews", function () {
  test("works", async function () {
    const reviews = await Service.getServiceReviews(1);
    expect(reviews).toEqual([
      {
        reviewId: expect.any(Number),
        userId: expect.any(Number),
        username: "u1",
        firstName: "U1F",
        reviewText: "Great service!",
        rating: 5,
        time: expect.any(Date),
        serviceId: 1,
      },
    ]);
  });

  test("throws NotFoundError if no reviews for service", async function () {
    try {
      await Service.getServiceReviews(9999);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});
