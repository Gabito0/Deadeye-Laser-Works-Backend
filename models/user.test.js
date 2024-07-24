"use strict";

const db = require("../db");
const User = require("../models/user");
const bcrypt = require("bcrypt");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
} = require("./_testCommon");
const {
  NotFoundError,
  BadRequestError,
  UnauthorizedError,
} = require("../expressError");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

describe("authenticate", function () {
  test("works", async function () {
    const user = await User.authenticate("u1", "password1");
    expect(user).toEqual({
      username: "u1",
      firstName: "U1F",
      lastName: "U1L",
      email: "user1@user.com",
      status: "regular",
      isVerified: false,
      isActive: true,
      birthDate: expect.any(Date),
    });
  });

  test("unauth if no such user", async function () {
    try {
      await User.authenticate("nope", "password");
      fail();
    } catch (err) {
      expect(err instanceof UnauthorizedError).toBeTruthy();
    }
  });

  test("unauth if wrong password", async function () {
    try {
      await User.authenticate("u1", "wrong");
      fail();
    } catch (err) {
      expect(err instanceof UnauthorizedError).toBeTruthy();
    }
  });
});

describe("register", function () {
  const newUser = {
    username: "new",
    firstName: "Test",
    lastName: "Tester",
    email: "test@test.com",
    birthDate: "1990-01-01",
    status: "regular",
  };

  test("works", async function () {
    let user = await User.register({
      ...newUser,
      password: "password",
    });
    expect(user).toEqual({
      username: "new",
      firstName: "Test",
      lastName: "Tester",
      email: "test@test.com",
      birthDate: expect.any(Date),
      status: "regular",
      isVerified: false,
      isActive: true,
    });
    const found = await db.query("SELECT * FROM users WHERE username = 'new'");
    expect(found.rows.length).toEqual(1);
    expect(found.rows[0].is_active).toEqual(true);
    expect(found.rows[0].is_verified).toEqual(false);
  });

  test("bad request with dup data", async function () {
    try {
      await User.register({
        ...newUser,
        password: "password",
      });
      await User.register({
        ...newUser,
        password: "password",
      });
      fail();
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});

describe("verifyUser", function () {
  test("works", async function () {
    const user = await User.verifyUser("u1");
    expect(user).toEqual({
      username: "u1",
      id: 1,
      firstName: "U1F",
      lastName: "U1L",
      email: "user1@user.com",
      birthDate: expect.any(Date),
      status: "regular",
      isVerified: true,
      isActive: true,
    });
  });

  test("not found if no such user", async function () {
    try {
      await User.verifyUser("nope");
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

describe("getUser", function () {
  test("works", async function () {
    const user = await User.getUser("u1");
    expect(user).toEqual({
      username: "u1",
      firstName: "U1F",
      lastName: "U1L",
      id: 1,
      email: "user1@user.com",
      birthDate: expect.any(Date),
      status: "regular",
      isVerified: false,
      isActive: true,
    });
  });

  test("not found if no such user", async function () {
    try {
      await User.getUser("nope");
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

describe("deactivate", function () {
  test("works", async function () {
    const user = await User.deactivate("u1");
    expect(user).toEqual({
      username: "u1",
      firstName: "U1F",
      id: 1,
      lastName: "U1L",
      email: "user1@user.com",
      birthDate: expect.any(Date),
      status: "regular",
      isVerified: false,
      isActive: false,
    });
  });

  test("not found if no such user", async function () {
    try {
      await User.deactivate("nope");
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

describe("remove", function () {
  test("works", async function () {
    await User.remove("u1");
    const res = await db.query("SELECT * FROM users WHERE username='u1'");
    expect(res.rows.length).toEqual(0);
  });

  test("not found if no such user", async function () {
    try {
      await User.remove("nope");
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

describe("update", function () {
  test("works", async function () {
    const user = await User.update("u1", {
      firstName: "NewFirst",
      lastName: "NewLast",
      email: "newemail@test.com",
    });
    expect(user).toEqual({
      username: "u1",
      firstName: "NewFirst",
      id: 1,
      isVerified: false,
      status: "regular",
      lastName: "NewLast",
      email: "newemail@test.com",
      birthDate: expect.any(Date),
      isActive: true,
    });
  });

  test("works with password change", async function () {
    const user = await User.update("u1", {
      password: "password1",
      newPassword: "newpassword",
    });
    const userRes = await db.query(
      `SELECT password FROM users WHERE username='u1'`
    );
    const isValid = await bcrypt.compare(
      "newpassword",
      userRes.rows[0].password
    );
    expect(isValid).toBe(true);
  });

  test("throws UnauthorizedError with invalid password", async function () {
    try {
      await User.update("u1", {
        password: "wrongpassword",
        newPassword: "newpassword",
      });
      fail();
    } catch (err) {
      expect(err instanceof UnauthorizedError).toBeTruthy();
    }
  });

  test("not found if no such user", async function () {
    try {
      await User.update("nope", { firstName: "test" });
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });

  test("bad request with no data", async function () {
    try {
      await User.update("u1", {});
      fail();
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});
