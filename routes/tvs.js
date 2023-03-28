const router = require("express").Router();
const {
  getTvs,
  getTv,
  getFilters,
  GetFilteredTvs,
} = require("../controllers/tvs");

router.route("/get-all").get(getTvs);
router.route("/get-one/:productId").get(getTv);
router.route("/filters").get(getFilters);
router.route("/filtered").get(GetFilteredTvs);

module.exports = router;
