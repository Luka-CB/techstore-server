const router = require("express").Router();
const jwt = require("jsonwebtoken");
const {
  register,
  logout,
  getUserAccount,
  updateUser,
  deleteUser,
  login,
  getOauthUser,
} = require("../controllers/users");
const passport = require("passport");
const { auth } = require("../config/authMiddlewares");

router.route("/register").post(register);
router.route("/login").post(login);
router.route("/oauth/user").get(getOauthUser);
router.route("/user-account").get(auth, getUserAccount);
router.route("/update").put(auth, updateUser);
router.route("/delete").delete(auth, deleteUser);
router.route("/logout").post(logout);

router.get(
  "/login/google",
  passport.authenticate("google", { scope: ["profile"] })
);
router.get(
  "/login/google/callback",
  passport.authenticate("google", {
    successRedirect:
      process.env.NODE_ENV === "development"
        ? process.env.CLIENT_URL
        : process.env.CLIENT_URL_PRODUCTION,
    failureRedirect: "/login/failed",
  })
);

router.get(
  "/login/facebook",
  passport.authenticate("facebook", { scope: ["email", "user_location"] })
);
router.get(
  "/login/facebook/callback",
  passport.authenticate("facebook", {
    successRedirect:
      process.env.NODE_ENV === "development"
        ? process.env.CLIENT_URL
        : process.env.CLIENT_URL_PRODUCTION,
    failureRedirect: "/login/failed",
  })
);

module.exports = router;
