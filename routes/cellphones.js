const router = require("express").Router();
const {
  getCellphones,
  getCellphone,
  getFilters,
  GetFilteredCellphones,
} = require("../controllers/cellphones");

router.route("/get-all").get(getCellphones);
router.route("/get-one/:productId").get(getCellphone);
router.route("/filters").get(getFilters);
router.route("/filtered").get(GetFilteredCellphones);

module.exports = router;
