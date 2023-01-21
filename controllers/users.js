const asyncHandler = require("express-async-handler");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const cookie = require("cookie");

const register = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  const user = await User.findOne({ email });

  if (user) throw new Error("User with this email already exists!");
  const newUser = await User.create({ username, email, password });
  if (!newUser) throw new Error("Something went wrong!");

  res.json({ msg: "Registered Successfully!" });
});

const loginAdmin = asyncHandler(async (req, res) => {
  const { username, password } = req.body;

  const user = await User.findOne({ username });

  if (!user) throw new Error("Username is Incorrect!");
  if (!user.isAdmin) throw new Error("Not Authorized as an Admin!");
  if (!(await user.matchPassword(password)))
    throw new Error("Password is Incorrect!");

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

  res.setHeader(
    "Set-Cookie",
    cookie.serialize("techstoreusertoken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== "development",
      maxAge: 24 * 60 * 60 * 100 * 30,
      sameSite: "strict",
      path: "/",
    })
  );

  res.status(200).json({
    id: user._id,
    username: user.username,
  });
});

const getUser = (req, res) => {
  res.json({
    id: req.user._id,
    username: req.user.username,
    isAdmin: req.user.isAdmin,
  });
};

const getUserAccount = asyncHandler(async (req, res) => {
  if (!req.user) throw new Error("Not Authorized!");

  const user = await User.findById(req.user._id);

  res.status(200).json({
    id: user._id,
    username: user.username,
    email: user.email,
    provider: user.provider,
    date: user.createdAt,
  });
});

const updateUser = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  let user = await User.findById(req.user._id);

  if (user) {
    user.username = username || user.username;
    user.email = email || user.email;
    if (password) user.password = password;
  }

  const newUser = await user.save();

  if (!newUser) throw new Error("Something went wrong!");

  res.status(200).send("Updated Successfully!");
});

const logout = (req, res, next) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.clearCookie("connect.sid").send("success");
  });
};

const logoutAdmin = asyncHandler(async (req, res) => {
  res.setHeader(
    "Set-Cookie",
    cookie.serialize("techstoreusertoken", "", {
      httpOnly: false,
      secure: process.env.NODE_ENV !== "development",
      maxAge: new Date(0),
      sameSite: "strict",
      path: "/",
    })
  );

  res.status(200).send("Logged Out Successfully!");
});

module.exports = {
  register,
  getUser,
  getUserAccount,
  updateUser,
  loginAdmin,
  logout,
  logoutAdmin,
};
