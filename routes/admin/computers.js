const router = require("express").Router();
const {
  addComputer,
  getComputers,
  addComputerColor,
  deleteComputerColor,
  addImage,
  changeImageStatus,
  deleteImage,
  updateComputerInfo,
  getComputer,
  deleteComputer,
  deleteComputers,
  editComputerColor,
  getImageColorCode,
  editImageColorName,
} = require("../../controllers/computers");
const { admin } = require("../../config/authMiddlewares");

router.route("/add").post(admin, addComputer);
router.route("/get").get(admin, getComputers);
router.route("/get-one/:productId").get(admin, getComputer);
router.route("/update-info").put(admin, updateComputerInfo);
router.route("/delete-many").delete(admin, deleteComputers);
router.route("/delete/:productId").delete(admin, deleteComputer);
router.route("/add-color").put(admin, addComputerColor);
router.route("/edit-color").put(admin, editComputerColor);
router.route("/delete-color").put(admin, deleteComputerColor);
router.route("/add-image").put(admin, addImage);
router.route("/change-image-status").put(admin, changeImageStatus);
router.route("/delete-image").put(admin, deleteImage);
router.route("/image-color-code").get(admin, getImageColorCode);
router.route("/image-color-name").put(admin, editImageColorName);

module.exports = router;
