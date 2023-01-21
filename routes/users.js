const router = require("express").Router();
const {
  register,
  getUser,
  logout,
  getUserAccount,
  updateUser,
  loginAdmin,
  logoutAdmin,
} = require("../controllers/users");
const passport = require("passport");

router.route("/register").post(register);
router.route("/admin/login").post(loginAdmin);
router.route("/user").get(getUser);
router.route("/user-account").get(getUserAccount);
router.route("/update").put(updateUser);
router.route("/logout").post(logout);
router.route("/admin/logout").post(logoutAdmin);

router.post(
  "/login",
  passport.authenticate("local", { failureRedirect: "/login" }),
  async function (req, res) {
    try {
      if (req.user) {
        res.json({
          msg: "Successfully Logged In!",
        });
      }
    } catch (error) {
      res.status(500).json({ msg: "Username or Password is Incorrect!" });
    }
  }
);

router.get(
  "/login/google",
  passport.authenticate("google", { scope: ["profile"] })
);
router.get(
  "/login/google/callback",
  passport.authenticate("google", {
    successRedirect: process.env.CLIENT_URL,
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
    successRedirect: process.env.CLIENT_URL,
    failureRedirect: "/login/failed",
  })
);

module.exports = router;
