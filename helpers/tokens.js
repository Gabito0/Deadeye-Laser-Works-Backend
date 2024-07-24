const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");

/** return signed JWT from user data. */

function createToken(user) {
  console.assert(
    user.status !== undefined,
    "createToken passed user without status property"
  );

  let payload = {
    username: user.username,
    status: user.status || "regular",
    isVerified: user.isVerified,
  };

  return jwt.sign(payload, SECRET_KEY);
}

module.exports = { createToken };
