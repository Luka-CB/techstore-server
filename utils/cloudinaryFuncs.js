const cloudinary = require("../config/cloudinary");

const uploadImage = async (imageData, folderName, productName) => {
  const result = await cloudinary.uploader.unsigned_upload(
    imageData.image,
    "techstore",
    {
      public_id: `${productName}_img_${new Date().getTime()}`,
      folder: `techstore/${folderName}`,
    }
  );

  return result;
};

const removeImage = async (public_id) => {
  const result = await cloudinary.uploader.destroy(public_id);
  return result;
};

const removeImages = async (public_ids) => {
  const result = await cloudinary.api.delete_resources(public_ids);
  return result;
};

module.exports = {
  uploadImage,
  removeImage,
  removeImages,
};
