const router = require("express").Router();
const { getDashboardInfo } = require("../../controllers/dashboard");
const { auth, admin } = require("../../config/authMiddlewares");

router.route("/info").get(auth, admin, getDashboardInfo);

module.exports = router;
