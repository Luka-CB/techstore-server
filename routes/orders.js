const router = require("express").Router();
const {
  saveOrder,
  getOrders,
  getOrder,
  updatePaidState,
  deleteOrder,
} = require("../controllers/orders");
const { auth } = require("../config/authMiddlewares");

router.route("/save").post(auth, saveOrder);
router.route("/get-many").get(auth, getOrders);
router.route("/get-one/:orderId").get(auth, getOrder);
router.route("/update").put(auth, updatePaidState);
router.route("/delete/:orderId").delete(auth, deleteOrder);

module.exports = router;
