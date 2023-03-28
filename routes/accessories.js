const router = require("express").Router();
const {
  getAccessories,
  getAccessory,
  getFilters,
  GetFilteredAccessories,
} = require("../controllers/accessories");

router.route("/get-all").get(getAccessories);
router.route("/get-one/:productId").get(getAccessory);
router.route("/filters").get(getFilters);
router.route("/filtered").get(GetFilteredAccessories);

module.exports = router;
