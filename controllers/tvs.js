const asyncHandler = require("express-async-handler");
const TV = require("../models/TV");
const {
  uploadImage,
  removeImage,
  removeImages,
} = require("../utils/cloudinaryFuncs");

//////////////////////////////-----ADD TV-----//////////////////////////////

const addTv = asyncHandler(async (req, res) => {
  const tvData = req.body;

  const totalQty = tvData.sizes.reduce((acc, curr) => acc + curr.qty, 0);

  const tv = await TV.findOne({ name: tvData.name });
  if (tv) throw new Error("This TV is already in store!");

  const result = await uploadImage(tvData.imageData, "tv_assets", tvData.name);
  if (!result) throw new Error("Failed to upload image!");

  const newTv = await TV.create({
    name: tvData.name,
    brand: tvData.brand,
    year: tvData.year,
    type: tvData.type,
    resolution: tvData.resolution,
    sizes: tvData.sizes,
    images: [],
    totalQty,
  });

  if (!newTv) throw new Error("Request for adding new tv has failed!");

  await TV.updateOne(
    { _id: newTv._id },
    {
      $push: {
        images: {
          imageUrl: result.url,
          publicId: result.public_id,
          isMain: true,
        },
      },
    }
  );

  res.status(200).json({ msg: "Added Successfully!" });
});

//////////////////////////////-----GET TV-----//////////////////////////////

const getTvs = asyncHandler(async (req, res) => {
  const tvs = await TV.find();
  if (!tvs) throw new Error("Get Tvs Request has Failed!");

  res.status(200).json(tvs);
});

//////////////////////////////-----UPDATE TV INFO-----//////////////////////////////

const updateTvInfo = asyncHandler(async (req, res) => {
  const data = req.body;

  let tv = await TV.findById(data._id);

  if (tv) {
    tv.name = data.name || tv.name;
    tv.brand = data.brand || tv.brand;
    tv.year = data.year || tv.year;
    tv.type = data.type || tv.type;
    tv.resolution = data.resolution || tv.resolution;
  }

  const updatedTv = await tv.save();
  if (!updatedTv) throw new Error("Update tv info request has failed!");

  res.status(200).json({ msg: "Updated Successfully!" });
});

//////////////////////////////-----DELETE TV-----//////////////////////////////

const deleteTv = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  const tv = await TV.findById(productId);

  if (tv.images.length > 0) {
    const imgPublicIds = tv.images.map((img) => img.publicId);

    const result = imgPublicIds && (await removeImages(imgPublicIds));
    if (!result) throw new Error("Remove Images Failed!");
  }

  const deletedTv = await TV.deleteOne({ _id: productId });
  if (!deletedTv) throw new Error("Delete tv request has Failed!");

  res.status(200).json({ msg: "Deleted Successfully" });
});

//////////////////////////////-----ADD TV SIZE-----//////////////////////////////

const addTvSize = asyncHandler(async (req, res) => {
  const { id, size, qty, price } = req.body;

  const tv = await TV.findById(id);
  const sizeExists = tv.sizes.some((dbSize) => dbSize.size === size);

  if (sizeExists) throw new Error("This size already exists!");

  const updatedTv = await TV.updateOne(
    { _id: id },
    { $push: { sizes: { size, qty, price } } }
  );

  if (!updatedTv) throw new Error("Add new tv size request has failed!");

  await TV.updateOne({ _id: id }, { totalQty: tv.totalQty + qty });

  res.status(200).json({ msg: "Updated Successfully!" });
});

//////////////////////////////-----DELETE TV SIZE-----//////////////////////////////

const deleteTvSize = asyncHandler(async (req, res) => {
  const { productId, sizeId } = req.query;

  const tv = await TV.findById(productId);
  const size = tv.sizes.find((size) => size._id == sizeId);

  const deletedSize = await TV.updateOne(
    { _id: productId },
    { $pull: { sizes: size } }
  );
  if (!deletedSize) throw new Error("Delete tv size request has failed!");

  await TV.updateOne({ _id: productId }, { totalQty: tv.totalQty - size.qty });

  res.json({ msg: "Deleted Successfully!" });
});

//////////////////////////////-----EDIT TV SIZE-----//////////////////////////////

const editTvSize = asyncHandler(async (req, res) => {
  const { productId, size, qty, price, _id } = req.body;
  const tv = await TV.findById(productId);

  const currentQty = tv.sizes.find((s) => s._id == _id).qty;

  const updatedSize = await TV.updateOne(
    { _id: productId, "sizes._id": _id },
    {
      $set: {
        "sizes.$.size": size,
        "sizes.$.qty": qty,
        "sizes.$.price": price,
      },
    }
  );

  if (!updatedSize) throw new Error("Update Size Request has Failed!");

  await TV.updateOne(
    { _id: productId },
    { totalQty: tv.totalQty - currentQty + qty }
  );

  res.status(200).json({ msg: "Updated Successfully!" });
});

//////////////////////////////-----ADD TV IMAGE-----//////////////////////////////

const addImage = asyncHandler(async (req, res) => {
  const data = req.body;

  const tv = await TV.findById(data.productId);

  const result = await uploadImage(data.imageData, "tv_assets", tv.name);
  if (!result) throw new Error("Failed to upload image!");

  const updatedImage = await TV.updateOne(
    { _id: data.productId },
    { $push: { images: { imageUrl: result.url, publicId: result.public_id } } }
  );
  if (!updatedImage) throw new Error("Add new image request has failed!");

  const updatedTv = await TV.findById(data.productId);
  const addedImage = updatedTv.images.find(
    (image) => image.publicId == result.public_id
  );

  res.status(200).json({ msg: "Added successfully!", image: addedImage });
});

//////////////////////////////-----CHANGE TV IMAGE STATUS-----//////////////////////////////

const changeImageStatus = asyncHandler(async (req, res) => {
  const { productId, imageId } = req.query;

  const tv = await TV.findById(productId);
  const mainImage = tv.images.find((image) => image.isMain);

  const setMainStatus = await TV.updateOne(
    { _id: productId, "images._id": imageId },
    {
      $set: {
        "images.$.isMain": true,
      },
    }
  );
  if (!setMainStatus) throw new Error("something went wrong!");

  if (mainImage) {
    const removeMainStatus = await TV.updateOne(
      { _id: productId, "images._id": mainImage._id },
      {
        $set: {
          "images.$.isMain": false,
        },
      }
    );
    if (!removeMainStatus) throw new Error("something went wrong!");
  }

  res.status(200).json({ msg: "Status Changed Successfully!" });
});

//////////////////////////////-----DELETE TV IMAGE-----//////////////////////////////

const deleteImage = asyncHandler(async (req, res) => {
  const { productId, imageId } = req.query;

  const tv = await TV.findById(productId);
  const image = tv.images.find((img) => img._id == imageId);

  const { result } = await removeImage(image.publicId);
  if (!result) throw new Error("Delete image request has failed!");

  await TV.updateOne({ _id: productId }, { $pull: { images: image } });

  res.status(200).json({ msg: "Image Deleted Successfully!" });
});

module.exports = {
  addTv,
  getTvs,
  updateTvInfo,
  addTvSize,
  deleteTvSize,
  editTvSize,
  addImage,
  changeImageStatus,
  deleteImage,
  deleteTv,
};
