const router = require("express").Router();
const {
  addAccessory,
  getAccessories,
  getAccessory,
  updateAccessoryInfo,
  deleteAccessories,
  deleteAccessory,
  addAccessoryColor,
  editAccessoryColor,
  deleteAccessoryColor,
  addImage,
  changeImageStatus,
  deleteImage,
  getImageColorCode,
  editImageColorName,
} = require("../../controllers/accessories");
const { admin } = require("../../config/authMiddlewares");

router.route("/add").post(admin, addAccessory);
router.route("/get").get(admin, getAccessories);
router.route("/get-one/:productId").get(admin, getAccessory);
router.route("/update-info").put(admin, updateAccessoryInfo);
router.route("/delete-many").delete(admin, deleteAccessories);
router.route("/delete/:productId").delete(admin, deleteAccessory);
router.route("/add-color").put(admin, addAccessoryColor);
router.route("/edit-color").put(admin, editAccessoryColor);
router.route("/delete-color").put(admin, deleteAccessoryColor);
router.route("/add-image").put(admin, addImage);
router.route("/change-image-status").put(admin, changeImageStatus);
router.route("/delete-image").put(admin, deleteImage);
router.route("/image-color-code").get(admin, getImageColorCode);
router.route("/image-color-name").put(admin, editImageColorName);

module.exports = router;
