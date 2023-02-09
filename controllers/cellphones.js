const asyncHandler = require("express-async-handler");
const date = require("date-and-time");
const Cellphone = require("../models/Cellphone");
const {
  uploadImage,
  removeImage,
  removeImages,
} = require("../utils/cloudinaryFuncs");

//////////////////////////////-----ADD CELLPHONE-----//////////////////////////////

const addCellphone = asyncHandler(async (req, res) => {
  const cellphoneData = req.body;

  const totalQty = cellphoneData.colors.reduce(
    (acc, curr) => acc + curr.qty,
    0
  );

  const cellphone = await Cellphone.findOne({ name: cellphoneData.name });
  if (cellphone) throw new Error("This Cellphone is already in store!");

  const result = await uploadImage(
    cellphoneData.imageData,
    "cellphone_assets",
    cellphoneData.name
  );
  if (!result) throw new Error("Failed to upload image!");

  const newCellphone = await Cellphone.create({
    name: cellphoneData.name,
    brand: cellphoneData.brand,
    year: cellphoneData.year,
    network: cellphoneData.network,
    body: {
      dimensions: cellphoneData.dimensions,
      weight: cellphoneData.weight,
      sim: cellphoneData.sim,
    },
    display: {
      type: cellphoneData.displayType,
      size: cellphoneData.displaySize,
      resolution: cellphoneData.resolution,
      protection: cellphoneData.protection,
    },
    platform: {
      os: cellphoneData.os,
      chipset: cellphoneData.chipset,
      cpu: cellphoneData.cpu,
      gpu: cellphoneData.gpu,
    },
    memory: {
      cardSlot: cellphoneData.cardSlot,
      internal: cellphoneData.internalMemory,
      ram: cellphoneData.ram,
    },
    mainCamera: {
      picture: {
        type: cellphoneData.mainCamInfo.type,
        details: cellphoneData.mainCamInfo.details,
      },
      features: cellphoneData.mainCameraFeatures,
      video: cellphoneData.mainCameraVideo,
    },
    selfieCamera: {
      picture: {
        type: cellphoneData.selfieCamInfo.type,
        details: cellphoneData.selfieCamInfo.details,
      },
      features: cellphoneData.selfieCameraFeatures,
      video: cellphoneData.selfieCameraVideo,
    },
    battery: cellphoneData.battery,
    price: cellphoneData.price,
    colors: cellphoneData.colors,
    images: [],
    totalQty,
  });

  if (!newCellphone)
    throw new Error("Request for adding new cellphone has failed!");

  await Cellphone.updateOne(
    { _id: newCellphone._id },
    {
      $push: {
        images: {
          imageUrl: result.url,
          publicId: result.public_id,
          colorName: cellphoneData.imageData.imageColorName,
          isMain: true,
        },
      },
    }
  );

  res.status(200).json({ msg: "Added Successfully!" });
});

//////////////////////////////-----GET CELLPHONES-----//////////////////////////////

const getCellphones = asyncHandler(async (req, res) => {
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

  const cellphones = await Cellphone.paginate({ ...keyword }, options);
  if (!cellphones) throw new Error("Get Cellphones Request has Failed!");

  const paginationData = {
    totalDocs: cellphones.totalDocs,
    limit: cellphones.limit,
    totalPages: cellphones.totalPages,
    page: cellphones.page,
    pagingCounter: cellphones.pagingCounter,
    hasPrevPage: cellphones.hasPrevPage,
    hasNextPage: cellphones.hasNextPage,
    prevPage: cellphones.prevPage,
    nextPage: cellphones.nextPage,
  };

  res.status(200).json({ products: cellphones.docs, paginationData });
});

//////////////////////////////-----GET CELLPHONE-----//////////////////////////////

const getCellphone = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  const cellphone = await Cellphone.findById(productId);
  if (!cellphone) throw new Error("Get cellphone request has Failed!");

  const newDate = date.format(new Date(cellphone.createdAt), "DD/MM/YYYY");

  res.status(200).json({ ...cellphone._doc, createdAt: newDate });
});

//////////////////////////////-----UPDATE CELLPHONE INFO-----//////////////////////////////

const updateCellphoneInfo = asyncHandler(async (req, res) => {
  const data = req.body;

  let cellphone = await Cellphone.findById(data._id);

  if (cellphone) {
    cellphone.name = data.name || cellphone.name;
    cellphone.brand = data.brand || cellphone.brand;
    cellphone.year = data.year || cellphone.year;
    cellphone.network = data.network || cellphone.network;
    cellphone.body.dimensions = data.dimensions || cellphone.body.dimensions;
    cellphone.body.weight = data.weight || cellphone.body.weight;
    cellphone.body.sim = data.sim || cellphone.body.sim;
    cellphone.display.type = data.displayType || cellphone.display.type;
    cellphone.display.size = data.displaySize || cellphone.display.size;
    cellphone.display.resolution =
      data.resolution || cellphone.display.resolution;
    cellphone.display.protection =
      data.protection || cellphone.display.protection;
    cellphone.platform.os = data.os || cellphone.platform.os;
    cellphone.platform.chipset = data.chipset || cellphone.platform.chipset;
    cellphone.platform.cpu = data.cpu || cellphone.platform.cpu;
    cellphone.platform.gpu = data.gpu || cellphone.platform.gpu;
    cellphone.memory.cardSlot = data.cardSlot || cellphone.memory.cardSlot;
    cellphone.memory.internal =
      data.internalMemory || cellphone.memory.internal;
    cellphone.memory.ram = data.ram || cellphone.memory.ram;
    cellphone.mainCamera.picture.type =
      data.mainCamInfo.type || cellphone.mainCamera.picture.type;
    cellphone.mainCamera.picture.details =
      data.mainCamInfo.details || cellphone.mainCamera.picture.details;
    cellphone.mainCamera.features =
      data.mainCameraFeatures || cellphone.mainCamera.features;
    cellphone.mainCamera.video =
      data.mainCameraVideo || cellphone.mainCamera.video;
    cellphone.selfieCamera.picture.type =
      data.selfieCamInfo.type || cellphone.selfieCamera.picture.type;
    cellphone.selfieCamera.picture.details =
      data.selfieCamInfo.details || cellphone.selfieCamera.picture.details;
    cellphone.selfieCamera.features =
      data.selfieCameraFeatures || cellphone.selfieCamera.features;
    cellphone.selfieCamera.video =
      data.selfieCameraVideo || cellphone.selfieCamera.video;
    cellphone.battery = data.battery || cellphone.battery;
    cellphone.price = data.price || cellphone.price;
  }

  const updatedCellphone = await cellphone.save();
  if (!updatedCellphone)
    throw new Error("Update cellphone info request has failed!");

  res.status(200).json({ msg: "Updated Successfully!" });
});

//////////////////////////////-----DELETE CELLPHONES-----//////////////////////////////

const deleteCellphones = asyncHandler(async (req, res) => {
  const { productIds } = req.body;

  const cellphones = await Cellphone.find({ _id: { $in: productIds } });
  const imgPublicIds = cellphones
    .map((cellphone) => cellphone.images)
    .flat()
    .map((img) => img.publicId);

  if (imgPublicIds.length > 0) {
    const result = await removeImages(imgPublicIds);
    if (!result) throw new Error("Remove Images Failed!");
  }

  const deletedCellphones = await Cellphone.deleteMany({
    _id: { $in: productIds },
  });
  if (!deletedCellphones)
    throw new Error("Delete cellphones request has failed!");

  res.status(200).json({ msg: "Deleted Successfullyy!" });
});

//////////////////////////////-----DELETE CELLPHONE-----//////////////////////////////

const deleteCellphone = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  const cellphone = await Cellphone.findById(productId);

  if (cellphone.images.length > 0) {
    const imgPublicIds = cellphone.images.map((img) => img.publicId);

    const result = imgPublicIds && (await removeImages(imgPublicIds));
    if (!result) throw new Error("Remove Images Failed!");
  }

  const deletedCellphone = await Cellphone.deleteOne({ _id: productId });
  if (!deletedCellphone)
    throw new Error("Delete cellphone request has Failed!");

  res.status(200).json({ msg: "Deleted Successfully" });
});

//////////////////////////////-----ADD CELLPHONE COLOR-----//////////////////////////////

const addCellphoneColor = asyncHandler(async (req, res) => {
  const { productId, name, code, qty } = req.body;

  const cellphone = await Cellphone.findById(productId);
  const colorExists = cellphone.colors.some((dbColor) => dbColor.name === name);

  if (colorExists) throw new Error("This color already exists!");

  const updatedCellphone = await Cellphone.updateOne(
    { _id: productId },
    { $push: { colors: { name, code, qty } } }
  );

  if (!updatedCellphone)
    throw new Error("Add new cellphone color request has failed!");

  await Cellphone.updateOne(
    { _id: productId },
    { totalQty: cellphone.totalQty + qty }
  );

  const editedCellphone = await Cellphone.findById(productId);
  const addedColor = editedCellphone.colors.pop();

  res.status(200).json({ msg: "Added Successfully!", addedColor });
});

//////////////////////////////-----EDIT CELLPHONE COLOR-----//////////////////////////////

const editCellphoneColor = asyncHandler(async (req, res) => {
  const { productId, name, code, qty, _id } = req.body;
  const cellphone = await Cellphone.findById(productId);

  const currentQty = cellphone.colors.find((color) => color._id == _id).qty;

  const updatedColor = await Cellphone.updateOne(
    { _id: productId, "colors._id": _id },
    {
      $set: {
        "colors.$.name": name,
        "colors.$.code": code,
        "colors.$.qty": qty,
      },
    }
  );

  if (!updatedColor) throw new Error("Update Color Request has Failed!");

  await Cellphone.updateOne(
    { _id: productId },
    { totalQty: cellphone.totalQty - currentQty + qty }
  );

  res.status(200).json({ msg: "Updated Successfully!" });
});

//////////////////////////////-----DELETE CELLPHONE COLOR-----//////////////////////////////

const deleteCellphoneColor = asyncHandler(async (req, res) => {
  const { productId, colorId } = req.query;

  const cellphone = await Cellphone.findById(productId);
  const color = cellphone.colors.find((color) => color._id == colorId);

  const deletedColor = await Cellphone.updateOne(
    { _id: productId },
    { $pull: { colors: color } }
  );
  if (!deletedColor)
    throw new Error("Delete cellphone color request has failed!");

  await Cellphone.updateOne(
    { _id: productId },
    { totalQty: cellphone.totalQty - color.qty }
  );

  res.status(200).json({ msg: "Deleted Successfully!" });
});

//////////////////////////////-----ADD CELLPHONE IMAGE-----//////////////////////////////

const addImage = asyncHandler(async (req, res) => {
  const data = req.body;

  const cellphone = await Cellphone.findById(data.productId);

  const result = await uploadImage(
    data.imageData,
    "cellphone_assets",
    cellphone.name
  );
  if (!result) throw new Error("Failed to upload image!");

  const modifiedColorName = data.imageData.colorName
    ? data.imageData.colorName
        .toLowerCase()
        .split(" ")
        .map((s) => s.charAt(0).toUpperCase() + s.substring(1))
        .join(" ")
    : "";

  const colorExists = cellphone.colors.find(
    (color) => color.name === modifiedColorName
  );

  const updatedImage = await Cellphone.updateOne(
    { _id: data.productId },
    {
      $push: {
        images: {
          imageUrl: result.url,
          publicId: result.public_id,
          colorName: colorExists && modifiedColorName,
        },
      },
    }
  );
  if (!updatedImage) throw new Error("Add new image request has failed!");

  const updatedCellphone = await Cellphone.findById(data.productId);
  const addedImage = updatedCellphone.images.find(
    (image) => image.publicId == result.public_id
  );

  res.status(200).json({ msg: "Added successfully!", image: addedImage });
});

//////////////////////////////-----CHANGE CELLPHONE IMAGE STATUS-----//////////////////////////////

const changeImageStatus = asyncHandler(async (req, res) => {
  const { productId, imageId } = req.query;

  const cellphone = await Cellphone.findById(productId);
  const mainImage = cellphone.images.find((image) => image.isMain);

  const setMainStatus = await Cellphone.updateOne(
    { _id: productId, "images._id": imageId },
    {
      $set: {
        "images.$.isMain": true,
      },
    }
  );
  if (!setMainStatus) throw new Error("something went wrong!");

  if (mainImage) {
    const removeMainStatus = await Cellphone.updateOne(
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

//////////////////////////////-----DELETE CELLPHONE IMAGE-----//////////////////////////////

const deleteImage = asyncHandler(async (req, res) => {
  const { productId, imageId } = req.query;

  const cellphone = await Cellphone.findById(productId);
  const image = cellphone.images.find((img) => img._id == imageId);

  const { result } = await removeImage(image.publicId);
  if (!result) throw new Error("Delete image request has failed!");

  await Cellphone.updateOne({ _id: productId }, { $pull: { images: image } });

  res.status(200).json({ msg: "Image Deleted Successfully!" });
});

//////////////////////////////-----GET CELLPHONE IMAGE COLOR CODE-----//////////////////////////////

const getImageColorCode = asyncHandler(async (req, res) => {
  const { productId, colorName } = req.query;

  const cellphone = await Cellphone.findById(productId);

  const modifiedColorName = colorName
    ? colorName
        .toLowerCase()
        .split(" ")
        .map((s) => s.charAt(0).toUpperCase() + s.substring(1))
        .join(" ")
    : "";

  const colorCode = cellphone.colors.find(
    (color) => color.name === modifiedColorName
  ).code;

  res.status(200).json(colorCode);
});

//////////////////////////////-----EDIT CELLPHONE IMAGE COLOR NAME-----//////////////////////////////

const editImageColorName = asyncHandler(async (req, res) => {
  const { productId, imageId, colorName } = req.body;

  const modifiedColorName = colorName
    ? colorName
        .toLowerCase()
        .split(" ")
        .map((s) => s.charAt(0).toUpperCase() + s.substring(1))
        .join(" ")
    : "";

  const cellphone = await Cellphone.findById(productId);

  const colorExists = cellphone.colors.find(
    (color) => color.name === modifiedColorName
  );
  if (colorName && !colorExists)
    throw new Error(`No Match Found for Color Name "${modifiedColorName}"!`);

  await Cellphone.updateOne(
    { _id: productId, "images._id": imageId },
    { $set: { "images.$.colorName": modifiedColorName } }
  );

  res.status(200).json({
    msg: "Color Name Updated Successfully!",
    updatedImgColor: {
      code: colorExists ? colorExists.code : "",
      name: colorExists ? colorExists.name : "",
    },
  });
});

module.exports = {
  addCellphone,
  getCellphones,
  getCellphone,
  updateCellphoneInfo,
  deleteCellphones,
  deleteCellphone,
  addCellphoneColor,
  editCellphoneColor,
  deleteCellphoneColor,
  addImage,
  changeImageStatus,
  deleteImage,
  getImageColorCode,
  editImageColorName,
};
