"use strict";

describe("config can come from env", function () {
  test("works", function () {
    // Set environment variables
    process.env.SECRET_KEY = "abc";
    process.env.PORT = "5000";
    process.env.DB_URL = "other";
    process.env.NODE_ENV = "other";

    // Require the config module
    const config = require("./config");
    expect(config.SECRET_KEY).toEqual("abc");
    expect(config.PORT).toEqual(5000);
    expect(config.getDatabaseUri()).toEqual("other");
    expect(config.BCRYPT_WORK_FACTOR).toEqual(13);

    // Delete environment variables
    delete process.env.SECRET_KEY;
    delete process.env.PORT;
    delete process.env.DB_URL;

    // Reset modules to pick up changes
    jest.resetModules();
    const configAfterDelete = require("./config");

    process.env.NODE_ENV = "development";
    expect(configAfterDelete.getDatabaseUri()).toMatch("deadeye_laserworks");

    // Set NODE_ENV to 'test'
    process.env.NODE_ENV = "test";

    // Reset modules to pick up changes
    jest.resetModules();
    const configForTestEnv = require("./config");

    expect(configForTestEnv.getDatabaseUri()).toMatch(
      "deadeye_laserworks_test"
    );
  });
});
