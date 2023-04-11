const router = require("express").Router();
const {
  getCustomers,
  changeAdminStatus,
  deleteCustomer,
  deleteCustomers,
} = require("../../controllers/customers");
const { auth, admin } = require("../../config/authMiddlewares");

router.route("/get-all").get(auth, admin, getCustomers);
router.route("/change-status/:userId").put(auth, admin, changeAdminStatus);
router.route("/delete-many").delete(auth, admin, deleteCustomers);
router.route("/delete-one/:userId").delete(auth, admin, deleteCustomer);

module.exports = router;
