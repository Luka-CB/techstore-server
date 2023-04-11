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
const { auth, admin } = require("../../config/authMiddlewares");

router.route("/add").post(auth, admin, addAccessory);
router.route("/get").get(auth, admin, getAccessories);
router.route("/get-one/:productId").get(auth, admin, getAccessory);
router.route("/update-info").put(auth, admin, updateAccessoryInfo);
router.route("/delete-many").delete(auth, admin, deleteAccessories);
router.route("/delete/:productId").delete(auth, admin, deleteAccessory);
router.route("/add-color").put(auth, admin, addAccessoryColor);
router.route("/edit-color").put(auth, admin, editAccessoryColor);
router.route("/delete-color").put(auth, admin, deleteAccessoryColor);
router.route("/add-image").put(auth, admin, addImage);
router.route("/change-image-status").put(auth, admin, changeImageStatus);
router.route("/delete-image").put(auth, admin, deleteImage);
router.route("/image-color-code").get(auth, admin, getImageColorCode);
router.route("/image-color-name").put(auth, admin, editImageColorName);

module.exports = router;
