const asyncHandler = require("express-async-handler");
const date = require("date-and-time");
const Accessory = require("../models/Accessory");
const {
  uploadImage,
  removeImage,
  removeImages,
} = require("../utils/cloudinaryFuncs");

//////////////////////////////-----ADD ACCESSORY-----//////////////////////////////

const addAccessory = asyncHandler(async (req, res) => {
  const accessoryData = req.body;

  const totalQty = accessoryData.colors.reduce(
    (acc, curr) => acc + curr.qty,
    0
  );

  const accessory = await Accessory.findOne({ name: accessoryData.name });
  if (accessory) throw new Error("This accessory is already in store!");

  const result = await uploadImage(
    accessoryData.imageData,
    "accessory_assets",
    accessoryData.name
  );
  if (!result) throw new Error("Failed to upload image!");

  const newAccessory = await Accessory.create({
    category: accessoryData.category,
    name: accessoryData.name,
    brand: accessoryData.brand,
    description: accessoryData.description,
    colors: accessoryData.colors,
    images: [],
    price: accessoryData.price,
    totalQty,
  });

  if (!newAccessory)
    throw new Error("Request for adding new accessory has failed!");

  await Accessory.updateOne(
    { _id: newAccessory._id },
    {
      $push: {
        images: {
          imageUrl: result.url,
          publicId: result.public_id,
          colorName: accessoryData.imageData.imageColorName,
          isMain: true,
        },
      },
    }
  );

  res.status(200).json({ msg: "Added Successfully!" });
});

//////////////////////////////-----GET ACCESSORIES-----//////////////////////////////

const getAccessories = asyncHandler(async (req, res) => {
  const { searchQ, page, perPage } = req.query;

  const keyword = searchQ
    ? {
        $or: [
          { name: { $regex: searchQ, $options: "i" } },
          { brand: { $regex: searchQ, $options: "i" } },
        ],
      }
    : {};

  const limit = searchQ ? 20 : perPage ? perPage : 10;

  const options = {
    page: page || 1,
    limit,
  };

  const accessories = await Accessory.paginate({ ...keyword }, options);
  if (!accessories) throw new Error("Get Accessories Request has Failed!");

  const paginationData = {
    totalDocs: accessories.totalDocs,
    limit: accessories.limit,
    totalPages: accessories.totalPages,
    page: accessories.page,
    pagingCounter: accessories.pagingCounter,
    hasPrevPage: accessories.hasPrevPage,
    hasNextPage: accessories.hasNextPage,
    prevPage: accessories.prevPage,
    nextPage: accessories.nextPage,
  };

  res.status(200).json({ products: accessories.docs, paginationData });
});

//////////////////////////////-----GET ACCESSORY-----//////////////////////////////

const getAccessory = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  const accessory = await Accessory.findById(productId);
  if (!accessory) throw new Error("Get accessory request has Failed!");

  const newDate = date.format(new Date(accessory.createdAt), "DD/MM/YYYY");

  res.status(200).json({ ...accessory._doc, createdAt: newDate });
});

//////////////////////////////-----UPDATE ACCESSORY INFO-----//////////////////////////////

const updateAccessoryInfo = asyncHandler(async (req, res) => {
  const data = req.body;

  let accessory = await Accessory.findById(data._id);

  if (accessory) {
    accessory.category = data.category || accessory.category;
    accessory.name = data.name || accessory.name;
    accessory.brand = data.brand || accessory.brand;
    accessory.description = data.description || accessory.description;
    accessory.price = data.price || accessory.price;
  }

  const updatedAccessory = await accessory.save();
  if (!updatedAccessory)
    throw new Error("Update accessory info request has failed!");

  res.status(200).json({ msg: "Updated Successfully!" });
});

//////////////////////////////-----DELETE ACCESSORIES-----//////////////////////////////

const deleteAccessories = asyncHandler(async (req, res) => {
  const { productIds } = req.body;

  const accessories = await Accessory.find({ _id: { $in: productIds } });
  const imgPublicIds = accessories
    .map((accessory) => accessory.images)
    .flat()
    .map((img) => img.publicId);

  if (imgPublicIds.length > 0) {
    const result = await removeImages(imgPublicIds);
    if (!result) throw new Error("Remove Images Failed!");
  }

  const deletedAccessories = await Accessory.deleteMany({
    _id: { $in: productIds },
  });
  if (!deletedAccessories)
    throw new Error("Delete accessories request has failed!");

  res.status(200).json({ msg: "Deleted Successfullyy!" });
});

//////////////////////////////-----DELETE ACCESSORY-----//////////////////////////////

const deleteAccessory = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  const accessory = await Accessory.findById(productId);

  if (accessory.images.length > 0) {
    const imgPublicIds = accessory.images.map((img) => img.publicId);

    const result = imgPublicIds && (await removeImages(imgPublicIds));
    if (!result) throw new Error("Remove Images Failed!");
  }

  const deletedAccessory = await Accessory.deleteOne({ _id: productId });
  if (!deletedAccessory)
    throw new Error("Delete accessory request has Failed!");

  res.status(200).json({ msg: "Deleted Successfully" });
});

//////////////////////////////-----ADD ACCESSORY COLOR-----//////////////////////////////

const addAccessoryColor = asyncHandler(async (req, res) => {
  const { productId, name, code, qty } = req.body;

  const accessory = await Accessory.findById(productId);
  const colorExists = accessory.colors.some((dbColor) => dbColor.name === name);

  if (colorExists) throw new Error("This color already exists!");

  const updatedAccessory = await Accessory.updateOne(
    { _id: productId },
    { $push: { colors: { name, code, qty } } }
  );

  if (!updatedAccessory)
    throw new Error("Add new accessory color request has failed!");

  await Accessory.updateOne(
    { _id: productId },
    { totalQty: accessory.totalQty + qty }
  );

  const editedAccessory = await Accessory.findById(productId);
  const addedColor = editedAccessory.colors.pop();

  res.status(200).json({ msg: "Added Successfully!", addedColor });
});

//////////////////////////////-----EDIT ACCESSORY COLOR-----//////////////////////////////

const editAccessoryColor = asyncHandler(async (req, res) => {
  const { productId, name, code, qty, _id } = req.body;
  const accessory = await Accessory.findById(productId);

  const currentQty = accessory.colors.find((color) => color._id == _id).qty;

  const updatedColor = await Accessory.updateOne(
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

  await Accessory.updateOne(
    { _id: productId },
    { totalQty: accessory.totalQty - currentQty + qty }
  );

  res.status(200).json({ msg: "Updated Successfully!" });
});

//////////////////////////////-----DELETE ACCESSORY COLOR-----//////////////////////////////

const deleteAccessoryColor = asyncHandler(async (req, res) => {
  const { productId, colorId } = req.query;

  const accessory = await Accessory.findById(productId);
  const color = accessory.colors.find((color) => color._id == colorId);

  const deletedColor = await Accessory.updateOne(
    { _id: productId },
    { $pull: { colors: color } }
  );
  if (!deletedColor)
    throw new Error("Delete accessory color request has failed!");

  await Accessory.updateOne(
    { _id: productId },
    { totalQty: accessory.totalQty - color.qty }
  );

  res.status(200).json({ msg: "Deleted Successfully!" });
});

//////////////////////////////-----ADD ACCESSORY IMAGE-----//////////////////////////////

const addImage = asyncHandler(async (req, res) => {
  const data = req.body;

  const accessory = await Accessory.findById(data.productId);

  const result = await uploadImage(
    data.imageData,
    "accessory_assets",
    accessory.name
  );
  if (!result) throw new Error("Failed to upload image!");

  const modifiedColorName = data.imageData.colorName
    ? data.imageData.colorName
        .toLowerCase()
        .split(" ")
        .map((s) => s.charAt(0).toUpperCase() + s.substring(1))
        .join(" ")
    : "";

  const colorExists = accessory.colors.find(
    (color) => color.name === modifiedColorName
  );

  const updatedImage = await Accessory.updateOne(
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

  const updatedAccessory = await Accessory.findById(data.productId);
  const addedImage = updatedAccessory.images.find(
    (image) => image.publicId == result.public_id
  );

  res.status(200).json({ msg: "Added successfully!", image: addedImage });
});

//////////////////////////////-----CHANGE ACCESSORY IMAGE STATUS-----//////////////////////////////

const changeImageStatus = asyncHandler(async (req, res) => {
  const { productId, imageId } = req.query;

  const accessory = await Accessory.findById(productId);
  const mainImage = accessory.images.find((image) => image.isMain);

  const setMainStatus = await Accessory.updateOne(
    { _id: productId, "images._id": imageId },
    {
      $set: {
        "images.$.isMain": true,
      },
    }
  );
  if (!setMainStatus) throw new Error("something went wrong!");

  if (mainImage) {
    const removeMainStatus = await Accessory.updateOne(
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

//////////////////////////////-----DELETE ACCESSORY IMAGE-----//////////////////////////////

const deleteImage = asyncHandler(async (req, res) => {
  const { productId, imageId } = req.query;

  const accessory = await Accessory.findById(productId);
  const image = accessory.images.find((img) => img._id == imageId);

  const { result } = await removeImage(image.publicId);
  if (!result) throw new Error("Delete image request has failed!");

  await Accessory.updateOne({ _id: productId }, { $pull: { images: image } });

  res.status(200).json({ msg: "Image Deleted Successfully!" });
});

//////////////////////////////-----GET ACCESSORY IMAGE COLOR CODE-----//////////////////////////////

const getImageColorCode = asyncHandler(async (req, res) => {
  const { productId, colorName } = req.query;

  const modifiedColorName = colorName
    ? colorName
        .toLowerCase()
        .split(" ")
        .map((s) => s.charAt(0).toUpperCase() + s.substring(1))
        .join(" ")
    : "";

  const accessory = await Accessory.findById(productId);
  const colorCode = accessory.colors.find(
    (color) => color.name === modifiedColorName
  ).code;

  res.status(200).json(colorCode);
});

//////////////////////////////-----EDIT ACCESSORY IMAGE COLOR NAME-----//////////////////////////////

const editImageColorName = asyncHandler(async (req, res) => {
  const { productId, imageId, colorName } = req.body;

  const modifiedColorName = colorName
    ? colorName
        .toLowerCase()
        .split(" ")
        .map((s) => s.charAt(0).toUpperCase() + s.substring(1))
        .join(" ")
    : "";

  const accessory = await Accessory.findById(productId);

  const colorExists = accessory.colors.find(
    (color) => color.name === modifiedColorName
  );
  if (colorName && !colorExists)
    throw new Error(`No Match Found for Color Name "${modifiedColorName}"!`);

  await Accessory.updateOne(
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

//////////////////////////////-----GET ACCESSORY FILTERS-----//////////////////////////////
const getFilters = asyncHandler(async (req, res) => {
  let brands = [];
  let categories = [];

  const accessories = await Accessory.find().select("category brand");

  accessories.map((acc) => {
    !brands.some((brand) => brand === acc.brand) && brands.push(acc.brand);
    !categories.some((cat) => cat === acc.category) &&
      categories.push(acc.category);
  });

  const result = [
    {
      title: "brands",
      values: brands,
    },
    {
      title: "categories",
      values: categories,
    },
  ];

  res.status(200).json(result);
});

//////////////////////////////-----GET FILTERED ACCESSORIES-----//////////////////////////////

const GetFilteredAccessories = asyncHandler(async (req, res) => {
  const { brand, category } = req.query;

  const filter = {
    brand: {
      $regex: brand,
      $options: "i",
    },
    category: {
      $regex: category,
      $options: "i",
    },
  };

  const accessories = await Accessory.find(filter);

  res.status(200).json(accessories);
});

module.exports = {
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
  getFilters,
  GetFilteredAccessories,
};
