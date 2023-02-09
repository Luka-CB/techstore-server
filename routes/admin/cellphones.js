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
const admin = require("../../config/authMiddlewares");

router.route("/add").post(admin, addCellphone);
router.route("/get").get(admin, getCellphones);
router.route("/get-one/:productId").get(admin, getCellphone);
router.route("/update-info").put(admin, updateCellphoneInfo);
router.route("/delete-many").delete(admin, deleteCellphones);
router.route("/delete/:productId").delete(admin, deleteCellphone);
router.route("/add-color").put(admin, addCellphoneColor);
router.route("/edit-color").put(admin, editCellphoneColor);
router.route("/delete-color").put(admin, deleteCellphoneColor);
router.route("/add-image").put(admin, addImage);
router.route("/change-image-status").put(admin, changeImageStatus);
router.route("/delete-image").put(admin, deleteImage);
router.route("/image-color-code").get(admin, getImageColorCode);
router.route("/image-color-name").put(admin, editImageColorName);

module.exports = router;
