const asyncHandler = require("express-async-handler");
const date = require("date-and-time");
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
          colorName: tvData.imageData.imageColorName,
          isMain: true,
        },
      },
    }
  );

  res.status(200).json({ msg: "Added Successfully!" });
});

//////////////////////////////-----GET TVs-----//////////////////////////////

const getTvs = asyncHandler(async (req, res) => {
  const { searchQ, page, perPage } = req.query;

  const keyword = searchQ
    ? {
        $or: [
          { name: { $regex: searchQ, $options: "i" } },
          { brand: { $regex: searchQ, $options: "i" } },
        ],
      }
    : {};

  const limit = searchQ ? 20 : perPage;

  const options = {
    page: page || 1,
    limit,
  };

  const tvs = await TV.paginate({ ...keyword }, options);
  if (!tvs) throw new Error("Get Tvs Request has Failed!");

  const paginationData = {
    totalDocs: tvs.totalDocs,
    limit: tvs.limit,
    totalPages: tvs.totalPages,
    page: tvs.page,
    pagingCounter: tvs.pagingCounter,
    hasPrevPage: tvs.hasPrevPage,
    hasNextPage: tvs.hasNextPage,
    prevPage: tvs.prevPage,
    nextPage: tvs.nextPage,
  };

  res.status(200).json({ products: tvs.docs, paginationData });
});

//////////////////////////////-----GET TV-----//////////////////////////////

const getTv = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  const tv = await TV.findById(productId);
  if (!tv) throw new Error("Get TV request has Failed!");

  const newDate = date.format(new Date(tv.createdAt), "DD/MM/YYYY");

  res.status(200).json({ ...tv._doc, createdAt: newDate });
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

//////////////////////////////-----DELETE TVs-----//////////////////////////////

const deleteTvs = asyncHandler(async (req, res) => {
  const { productIds } = req.body;

  const tvs = await TV.find({ _id: { $in: productIds } });
  const imgPublicIds = tvs
    .map((tv) => tv.images)
    .flat()
    .map((img) => img.publicId);

  if (imgPublicIds.length > 0) {
    const result = await removeImages(imgPublicIds);
    if (!result) throw new Error("Remove Images Failed!");
  }

  const deletedTvs = await TV.deleteMany({ _id: { $in: productIds } });
  if (!deletedTvs) throw new Error("Delete tvs request has failed!");

  res.status(200).json({ msg: "Deleted Successfullyy!" });
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
  const { id, size, qty, price, sizeId } = req.body;

  const tv = await TV.findById(id);
  const sizeExists = tv.sizes.some((dbSize) => dbSize.size === size);

  if (sizeExists) throw new Error("This size already exists!");

  const updatedTv = await TV.updateOne(
    { _id: id },
    { $push: { sizes: { size, qty, price } } }
  );

  if (!updatedTv) throw new Error("Add new tv size request has failed!");

  await TV.updateOne({ _id: id }, { totalQty: tv.totalQty + qty });

  const editedTv = await TV.findById(id);
  const addedSize = editedTv.sizes.pop();

  res.status(200).json({ msg: "Updated Successfully!", addedSize });
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

//////////////////////////////-----ADD TV IMAGE-----//////////////////////////////

const addImage = asyncHandler(async (req, res) => {
  const data = req.body;

  const tv = await TV.findById(data.productId);

  const result = await uploadImage(data.imageData, "tv_assets", tv.name);
  if (!result) throw new Error("Failed to upload image!");

  const updatedImage = await TV.updateOne(
    { _id: data.productId },
    {
      $push: {
        images: {
          imageUrl: result.url,
          publicId: result.public_id,
          colorName: data.imageData.colorName,
        },
      },
    }
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
  getTv,
  updateTvInfo,
  addTvSize,
  deleteTvSize,
  editTvSize,
  addImage,
  changeImageStatus,
  deleteImage,
  deleteTv,
  deleteTvs,
};
