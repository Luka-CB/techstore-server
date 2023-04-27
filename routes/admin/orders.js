const router = require("express").Router();
const {
  getOrdersAdmin,
  updateDeliveredState,
  deleteOrderByAdmin,
  deleteOrdersByAdmin,
} = require("../../controllers/orders");
const { auth, admin } = require("../../config/authMiddlewares");

router.route("/get-all").get(auth, admin, getOrdersAdmin);
router.route("/delete-one").delete(auth, admin, deleteOrderByAdmin);
router.route("/delete-many").delete(auth, admin, deleteOrdersByAdmin);
router
  .route("/update/deliver_state/:orderId")
  .put(auth, admin, updateDeliveredState);

module.exports = router;
