"use strict";

/** Database setup for Deadeye Laserworks */

const { Client } = require("pg");
const { getDatabaseUri } = require("./config");

let db;
// const connectionString = getDatabaseUri();
// console.log("Database connection string:", connectionString);
if (process.env.NODE_ENV === "production") {
  db = new Client({
    connectionString: getDatabaseUri(),
    ssl: {
      rejectUnauthorized: false,
    },
  });
} else {
  db = new Client({
    connectionString: getDatabaseUri(),
  });
}

db.connect();
module.exports = db;
