const router = require("express").Router();
const {
  getComputers,
  getComputer,
  getFilters,
  GetFilteredComputers,
} = require("../controllers/computers");

router.route("/get-all").get(getComputers);
router.route("/get-one/:productId").get(getComputer);
router.route("/filters").get(getFilters);
router.route("/filtered").get(GetFilteredComputers);

module.exports = router;
