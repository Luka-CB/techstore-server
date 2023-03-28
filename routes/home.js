const router = require("express").Router();
const {
  getRandom,
  getLatestAccessories,
  getLatestCellphones,
  getLatestComputers,
  getLatestTvs,
  searchProduct,
} = require("../controllers/home");

router.route("/get-random").get(getRandom);
router.route("/accessories/latest").get(getLatestAccessories);
router.route("/cellphones/latest").get(getLatestCellphones);
router.route("/computers/latest").get(getLatestComputers);
router.route("/tvs/latest").get(getLatestTvs);
router.route("/search").get(searchProduct);

module.exports = router;
