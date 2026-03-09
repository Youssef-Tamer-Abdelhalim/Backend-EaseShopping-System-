const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const generateAccessToken = (userId, role) =>
  jwt.sign({ userId, role }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRE_TIME,
  });

const generateRefreshToken = (userId) =>
  jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET_KEY, {
    expiresIn: process.env.JWT_REFRESH_EXPIRE_TIME || "7d",
  });

const hashToken = (token) =>
  crypto.createHash("sha256").update(token).digest("hex");

module.exports = { generateAccessToken, generateRefreshToken, hashToken };
 
// t