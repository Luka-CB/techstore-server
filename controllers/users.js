const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const cookie = require("cookie");
const User = require("../models/User");
const Order = require("../models/Order");
const Review = require("../models/Review");

//////////////////////////////-----REGISTER USER-----//////////////////////////////

const register = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  const user = await User.findOne({ email });

  if (user) throw new Error("User with this email already exists!");
  const newUser = await User.create({ username, email, password });
  if (!newUser) throw new Error("Something went wrong!");

  res.json({ msg: "Registered Successfully!" });
});

//////////////////////////////-----LOGIN ADMIN-----//////////////////////////////

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
      maxAge: 24 * 60 * 60 * 100 * 30,
      sameSite: "none",
      secure: process.env.NODE_ENV !== "development",
      path: "/",
    })
  );

  res.status(200).json({
    id: user._id,
    username: user.username,
  });
});

//////////////////////////////-----GET USER-----//////////////////////////////

const getUser = (req, res) => {
  if (req.user === undefined) {
    res.json({ user: null, isExpired: true, msg: "Token Expired!" });
  } else {
    res.json({
      user: {
        id: req.user._id,
        username: req.user.username,
        isAdmin: req.user.isAdmin,
      },
      isExpired: false,
      msg: "Token Active!",
    });
  }
};

//////////////////////////////-----GET USER ACCOUNT INFO-----//////////////////////////////

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

//////////////////////////////-----UPDATE ACCOUNT INFO-----//////////////////////////////

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

//////////////////////////////-----DELETE USER ACCOUNT-----//////////////////////////////

const deleteUser = asyncHandler(async (req, res) => {
  const deletedOrders = await Order.deleteMany({
    author: req.user._id,
    isForAdmin: false,
  });
  const deletedReviews = await Review.deleteMany({ author: req.user._id });

  if (!deletedOrders) throw new Error("Delete orders request has failed!");
  if (!deletedReviews) throw new Error("Delete reviews request has failed!");

  const deletedUser = await User.deleteOne({ _id: req.user._id });
  if (!deletedUser) throw new Error("Delete user account request has failed!");

  res.status(200).json({ msg: "Account Deleted Successfully!" });
});

//////////////////////////////-----LOGOUT USER-----//////////////////////////////

const logout = (req, res, next) => {
  req.session = null;
  res.send("success");
};

//////////////////////////////-----LOGOUT ADMIN-----//////////////////////////////

const logoutAdmin = asyncHandler(async (req, res) => {
  res.setHeader(
    "Set-Cookie",
    cookie.serialize("techstoreusertoken", "", {
      httpOnly: false,
      maxAge: new Date(0),
      sameSite: "none",
      secure: process.env.NODE_ENV !== "development",
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
  deleteUser,
};
