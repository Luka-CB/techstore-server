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
const { auth, admin } = require("../../config/authMiddlewares");

router.route("/add").post(auth, admin, addComputer);
router.route("/get").get(auth, admin, getComputers);
router.route("/get-one/:productId").get(auth, admin, getComputer);
router.route("/update-info").put(auth, admin, updateComputerInfo);
router.route("/delete-many").delete(auth, admin, deleteComputers);
router.route("/delete/:productId").delete(auth, admin, deleteComputer);
router.route("/add-color").put(auth, admin, addComputerColor);
router.route("/edit-color").put(auth, admin, editComputerColor);
router.route("/delete-color").put(auth, admin, deleteComputerColor);
router.route("/add-image").put(auth, admin, addImage);
router.route("/change-image-status").put(auth, admin, changeImageStatus);
router.route("/delete-image").put(auth, admin, deleteImage);
router.route("/image-color-code").get(auth, admin, getImageColorCode);
router.route("/image-color-name").put(auth, admin, editImageColorName);

module.exports = router;
