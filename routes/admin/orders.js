const router = require("express").Router();
const { getOrdersAdmin } = require("../../controllers/orders");
const { admin } = require("../../config/authMiddlewares");

router.route("/get-all").get(admin, getOrdersAdmin);

module.exports = router;
