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
  deleteTvs,
  getTv,
} = require("../../controllers/tvs");
const { auth, admin } = require("../../config/authMiddlewares");

router.route("/add").post(auth, admin, addTv);
router.route("/get").get(auth, admin, getTvs);
router.route("/get-one/:productId").get(auth, admin, getTv);
router.route("/update-info").put(auth, admin, updateTvInfo);
router.route("/delete-many").delete(auth, admin, deleteTvs);
router.route("/delete/:productId").delete(auth, admin, deleteTv);
router.route("/add-size").put(auth, admin, addTvSize);
router.route("/delete-size").put(auth, admin, deleteTvSize);
router.route("/edit-size").put(auth, admin, editTvSize);
router.route("/add-image").put(auth, admin, addImage);
router.route("/change-image-status").put(auth, admin, changeImageStatus);
router.route("/delete-image").put(auth, admin, deleteImage);

module.exports = router;
