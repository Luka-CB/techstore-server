const router = require("express").Router();
const {
  addCellphone,
  getCellphones,
  addImage,
  changeImageStatus,
  deleteImage,
  addCellphoneColor,
  editCellphoneColor,
  deleteCellphoneColor,
  getCellphone,
  updateCellphoneInfo,
  deleteCellphones,
  deleteCellphone,
  getImageColorCode,
  editImageColorName,
} = require("../../controllers/cellphones");
const { auth, admin } = require("../../config/authMiddlewares");

router.route("/add").post(auth, admin, addCellphone);
router.route("/get").get(auth, admin, getCellphones);
router.route("/get-one/:productId").get(auth, admin, getCellphone);
router.route("/update-info").put(auth, admin, updateCellphoneInfo);
router.route("/delete-many").delete(auth, admin, deleteCellphones);
router.route("/delete/:productId").delete(auth, admin, deleteCellphone);
router.route("/add-color").put(auth, admin, addCellphoneColor);
router.route("/edit-color").put(auth, admin, editCellphoneColor);
router.route("/delete-color").put(auth, admin, deleteCellphoneColor);
router.route("/add-image").put(auth, admin, addImage);
router.route("/change-image-status").put(auth, admin, changeImageStatus);
router.route("/delete-image").put(auth, admin, deleteImage);
router.route("/image-color-code").get(auth, admin, getImageColorCode);
router.route("/image-color-name").put(auth, admin, editImageColorName);

module.exports = router;
