"use strict";

const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");
const { UnauthorizedError } = require("../expressError");
const {
  authenticateJWT,
  ensureLoggedIn,
  ensureAdmin,
  ensureCorrectUserOrAdmin,
} = require("./auth");

describe("authenticateJWT", function () {
  test("works: valid token", function () {
    const token = jwt.sign({ username: "test", status: "regular" }, SECRET_KEY);
    const req = { headers: { authorization: `Bearer ${token}` } };
    const res = { locals: {} };
    const next = jest.fn();

    authenticateJWT(req, res, next);
    expect(res.locals.user).toEqual({
      iat: expect.any(Number),
      username: "test",
      status: "regular",
    });
    expect(next).toHaveBeenCalled();
  });

  test("works: no header", function () {
    const req = {};
    const res = { locals: {} };
    const next = jest.fn();

    authenticateJWT(req, res, next);
    expect(res.locals.user).toBeUndefined();
    expect(next).toHaveBeenCalled();
  });

  test("works: invalid token", function () {
    const req = { headers: { authorization: `Bearer invalidtoken` } };
    const res = { locals: {} };
    const next = jest.fn();

    authenticateJWT(req, res, next);
    expect(res.locals.user).toBeUndefined();
    expect(next).toHaveBeenCalled();
  });
});

describe("ensureLoggedIn", function () {
  test("works", function () {
    const req = {};
    const res = { locals: { user: { username: "test" } } };
    const next = jest.fn();

    ensureLoggedIn(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  test("unauth if no login", function () {
    const req = {};
    const res = { locals: {} };
    const next = jest.fn();

    try {
      ensureLoggedIn(req, res, next);
    } catch (err) {
      expect(err instanceof UnauthorizedError).toBeTruthy();
    }
  });
});

describe("ensureAdmin", function () {
  test("works", function () {
    const req = {};
    const res = { locals: { user: { username: "test", status: "admin" } } };
    const next = jest.fn();

    ensureAdmin(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  test("unauth if not admin", function () {
    const req = {};
    const res = { locals: { user: { username: "test", status: "regular" } } };
    const next = jest.fn();

    try {
      ensureAdmin(req, res, next);
    } catch (err) {
      expect(err instanceof UnauthorizedError).toBeTruthy();
    }
  });

  test("unauth if no login", function () {
    const req = {};
    const res = { locals: {} };
    const next = jest.fn();

    try {
      ensureAdmin(req, res, next);
    } catch (err) {
      expect(err instanceof UnauthorizedError).toBeTruthy();
    }
  });
});

describe("ensureCorrectUserOrAdmin", function () {
  test("works: admin", function () {
    const req = { params: { username: "test" } };
    const res = { locals: { user: { username: "admin", status: "admin" } } };
    const next = jest.fn();

    ensureCorrectUserOrAdmin(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  test("works: same user", function () {
    const req = { params: { username: "test" } };
    const res = { locals: { user: { username: "test", status: "regular" } } };
    const next = jest.fn();

    ensureCorrectUserOrAdmin(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  test("unauth: mismatch", function () {
    const req = { params: { username: "test1" } };
    const res = { locals: { user: { username: "test2", status: "regular" } } };
    const next = jest.fn();

    try {
      ensureCorrectUserOrAdmin(req, res, next);
    } catch (err) {
      expect(err instanceof UnauthorizedError).toBeTruthy();
    }
  });

  test("unauth: no login", function () {
    const req = { params: { username: "test" } };
    const res = { locals: {} };
    const next = jest.fn();

    try {
      ensureCorrectUserOrAdmin(req, res, next);
    } catch (err) {
      expect(err instanceof UnauthorizedError).toBeTruthy();
    }
  });
});
