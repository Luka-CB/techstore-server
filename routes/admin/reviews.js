const router = require("express").Router();
const {
  getReviewsForAdmin,
  deleteReviewByAdmin,
  getReviewsByUserId,
} = require("../../controllers/reviews");
const { auth, admin } = require("../../config/authMiddlewares");

router.route("/get-all").get(auth, admin, getReviewsForAdmin);
router.route("/get-many/:userId").get(auth, admin, getReviewsByUserId);
router.route("/delete-one").delete(auth, admin, deleteReviewByAdmin);

module.exports = router;
