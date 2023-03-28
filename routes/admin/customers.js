const router = require("express").Router();
const {
  getCustomers,
  changeAdminStatus,
  deleteCustomer,
  deleteCustomers,
} = require("../../controllers/customers");
const { admin } = require("../../config/authMiddlewares");

router.route("/get-all").get(admin, getCustomers);
router.route("/change-status/:userId").put(admin, changeAdminStatus);
router.route("/delete-many").delete(admin, deleteCustomers);
router.route("/delete-one/:userId").delete(admin, deleteCustomer);

module.exports = router;
