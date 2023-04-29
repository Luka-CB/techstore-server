const router = require("express").Router();
const { getDashboardInfo } = require("../../controllers/dashboard");

router.route("/info").get(getDashboardInfo);

module.exports = router;
