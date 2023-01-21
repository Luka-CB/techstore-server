const router = require("express").Router();
const {
  addTv,
  getTvs,
  addTvSize,
  deleteTvSize,
  editTvSize,
  addImage,
  changeImageStatus,
  deleteImage,
  updateTvInfo,
  deleteTv,
} = require("../controllers/tvs");
const admin = require("../config/authMiddlewares");

router.route("/add").post(admin, addTv);
router.route("/get").get(admin, getTvs);
router.route("/update-info").put(admin, updateTvInfo);
router.route("/delete/:productId").delete(deleteTv);
router.route("/add-size").put(admin, addTvSize);
router.route("/delete-size").put(admin, deleteTvSize);
router.route("/edit-size").put(admin, editTvSize);
router.route("/add-image").put(admin, addImage);
router.route("/change-image-status").put(admin, changeImageStatus);
router.route("/delete-image").put(admin, deleteImage);

module.exports = router;
