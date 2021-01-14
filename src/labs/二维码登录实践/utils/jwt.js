const jwt = require("jsonwebtoken");

const verify = (token, secret) => {
  try {
    return jwt.verify(token, secret);
  } catch (e) {
    return false;
  }
}

const generateToken = (uid, exp = 1000) => {
  return jwt.sign({
    userId: uid
  }, "KEY", {
    expiresIn: exp
  });
}

module.exports = {
  verify,
  generateToken
}