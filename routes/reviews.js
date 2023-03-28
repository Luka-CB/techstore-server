const router = require("express").Router();
const {
  addReview,
  getReviews,
  deleteReview,
  updateReview,
} = require("../controllers/reviews");
const { auth } = require("../config/authMiddlewares");

router.route("/add").post(auth, addReview);
router.route("/get-many/:productId").get(getReviews);
router.route("/update").put(auth, updateReview);
router.route("/delete-one/:reviewId").delete(auth, deleteReview);

module.exports = router;
