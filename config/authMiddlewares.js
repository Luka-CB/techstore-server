const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const cookie = require("cookie");
const User = require("../models/User");

const admin = asyncHandler(async (req, res, next) => {
  if (req.headers.cookie) {
    try {
      const { techstoreusertoken } = cookie.parse(req.headers.cookie);
      const decoded = jwt.verify(techstoreusertoken, process.env.JWT_SECRET);
      req.admin = await User.findById(decoded.id).select("-password");

      next();
    } catch (error) {
      res.status(401);
      throw new Error("Not Authorized Token!");
    }
  }
});

module.exports = admin;
