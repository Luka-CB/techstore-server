const router = require("express").Router();
const { getOrdersAdmin } = require("../../controllers/orders");
const { auth, admin } = require("../../config/authMiddlewares");

router.route("/get-all").get(auth, admin, getOrdersAdmin);

module.exports = router;
