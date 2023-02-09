const asyncHandler = require("express-async-handler");
const date = require("date-and-time");
const Computer = require("../models/Computer");
const {
  uploadImage,
  removeImage,
  removeImages,
} = require("../utils/cloudinaryFuncs");

//////////////////////////////-----ADD COMPUTER-----//////////////////////////////

const addComputer = asyncHandler(async (req, res) => {
  const computerData = req.body;

  const totalQty = computerData.colors.reduce((acc, curr) => acc + curr.qty, 0);

  const computer = await Computer.findOne({ name: computerData.name });
  if (computer) throw new Error("This Computer is already in store!");

  const result = await uploadImage(
    computerData.imageData,
    "computer_assets",
    computerData.name
  );
  if (!result) throw new Error("Failed to upload image!");

  const newComputer = await Computer.create({
    name: computerData.name,
    brand: computerData.brand,
    type: computerData.type,
    processor: computerData.processor,
    os: computerData.os,
    graphics: computerData.graphics,
    display: computerData.display,
    ram: computerData.ram,
    storage: {
      type: computerData.storagetype,
      interface: computerData.interface,
      size: computerData.size,
    },
    colors: computerData.colors,
    images: [],
    camera: computerData.camera,
    weight: computerData.weight,
    price: computerData.price,
    totalQty,
  });

  if (!newComputer)
    throw new Error("Request for adding new computer has failed!");

  await Computer.updateOne(
    { _id: newComputer._id },
    {
      $push: {
        images: {
          imageUrl: result.url,
          publicId: result.public_id,
          colorName: computerData.imageData.imageColorName,
          isMain: true,
        },
      },
    }
  );

  res.status(200).json({ msg: "Added Successfully!" });
});

//////////////////////////////-----GET COMPUTERS-----//////////////////////////////

const getComputers = asyncHandler(async (req, res) => {
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

  const computers = await Computer.paginate({ ...keyword }, options);
  if (!computers) throw new Error("Get Computers Request has Failed!");

  const paginationData = {
    totalDocs: computers.totalDocs,
    limit: computers.limit,
    totalPages: computers.totalPages,
    page: computers.page,
    pagingCounter: computers.pagingCounter,
    hasPrevPage: computers.hasPrevPage,
    hasNextPage: computers.hasNextPage,
    prevPage: computers.prevPage,
    nextPage: computers.nextPage,
  };

  res.status(200).json({ products: computers.docs, paginationData });
});

//////////////////////////////-----GET COMPUTER-----//////////////////////////////

const getComputer = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  const computer = await Computer.findById(productId);
  if (!computer) throw new Error("Get computer request has Failed!");

  const newDate = date.format(new Date(computer.createdAt), "DD/MM/YYYY");

  res.status(200).json({ ...computer._doc, createdAt: newDate });
});

//////////////////////////////-----UPDATE COMPUTER INFO-----//////////////////////////////

const updateComputerInfo = asyncHandler(async (req, res) => {
  const data = req.body;

  let computer = await Computer.findById(data._id);

  if (computer) {
    computer.name = data.name || computer.name;
    computer.brand = data.brand || computer.brand;
    computer.type = data.type || computer.type;
    computer.processor = data.processor || computer.processor;
    computer.os = data.os || computer.os;
    computer.graphics = data.graphics || computer.graphics;
    computer.display = data.display || computer.display;
    computer.memory = data.memory || computer.memory;
    computer.storage.type = data.storagetype || computer.storage.type;
    computer.storage.interface = data.interface || computer.storage.interface;
    computer.storage.size = data.size || computer.storage.size;
    computer.camera = data.camera || computer.camera;
    computer.weight = data.weight || computer.weight;
    computer.price = data.price || computer.price;
  }

  const updatedComputer = await computer.save();
  if (!updatedComputer)
    throw new Error("Update computer info request has failed!");

  res.status(200).json({ msg: "Updated Successfully!" });
});

//////////////////////////////-----DELETE COMPUTERS-----//////////////////////////////

const deleteComputers = asyncHandler(async (req, res) => {
  const { productIds } = req.body;

  const computers = await Computer.find({ _id: { $in: productIds } });
  const imgPublicIds = computers
    .map((computer) => computer.images)
    .flat()
    .map((img) => img.publicId);

  if (imgPublicIds.length > 0) {
    const result = await removeImages(imgPublicIds);
    if (!result) throw new Error("Remove Images Failed!");
  }

  const deletedComputers = await Computer.deleteMany({
    _id: { $in: productIds },
  });
  if (!deletedComputers)
    throw new Error("Delete computers request has failed!");

  res.status(200).json({ msg: "Deleted Successfullyy!" });
});

//////////////////////////////-----DELETE COMPUTER-----//////////////////////////////

const deleteComputer = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  const computer = await Computer.findById(productId);

  if (computer.images.length > 0) {
    const imgPublicIds = computer.images.map((img) => img.publicId);

    const result = imgPublicIds && (await removeImages(imgPublicIds));
    if (!result) throw new Error("Remove Images Failed!");
  }

  const deletedComputer = await Computer.deleteOne({ _id: productId });
  if (!deletedComputer) throw new Error("Delete computer request has Failed!");

  res.status(200).json({ msg: "Deleted Successfully" });
});

//////////////////////////////-----ADD COMPUTER COLOR-----//////////////////////////////

const addComputerColor = asyncHandler(async (req, res) => {
  const { productId, name, code, qty } = req.body;

  const computer = await Computer.findById(productId);
  const colorExists = computer.colors.some((dbColor) => dbColor.name === name);

  if (colorExists) throw new Error("This color already exists!");

  const updatedComputer = await Computer.updateOne(
    { _id: productId },
    { $push: { colors: { name, code, qty } } }
  );

  if (!updatedComputer)
    throw new Error("Add new computer color request has failed!");

  await Computer.updateOne(
    { _id: productId },
    { totalQty: computer.totalQty + qty }
  );

  const editedComputer = await Computer.findById(productId);
  const addedColor = editedComputer.colors.pop();

  res.status(200).json({ msg: "Added Successfully!", addedColor });
});

//////////////////////////////-----EDIT COMPUTER COLOR-----//////////////////////////////

const editComputerColor = asyncHandler(async (req, res) => {
  const { productId, name, code, qty, _id } = req.body;
  const computer = await Computer.findById(productId);

  const currentQty = computer.colors.find((color) => color._id == _id).qty;

  const updatedColor = await Computer.updateOne(
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

  await Computer.updateOne(
    { _id: productId },
    { totalQty: computer.totalQty - currentQty + qty }
  );

  res.status(200).json({ msg: "Updated Successfully!" });
});

//////////////////////////////-----DELETE COMPUTER COLOR-----//////////////////////////////

const deleteComputerColor = asyncHandler(async (req, res) => {
  const { productId, colorId } = req.query;

  const computer = await Computer.findById(productId);
  const color = computer.colors.find((color) => color._id == colorId);

  const deletedColor = await Computer.updateOne(
    { _id: productId },
    { $pull: { colors: color } }
  );
  if (!deletedColor)
    throw new Error("Delete computer color request has failed!");

  await Computer.updateOne(
    { _id: productId },
    { totalQty: computer.totalQty - color.qty }
  );

  res.status(200).json({ msg: "Deleted Successfully!" });
});

//////////////////////////////-----ADD COMPUTER IMAGE-----//////////////////////////////

const addImage = asyncHandler(async (req, res) => {
  const data = req.body;

  const computer = await Computer.findById(data.productId);

  const result = await uploadImage(
    data.imageData,
    "computer_assets",
    computer.name
  );
  if (!result) throw new Error("Failed to upload image!");

  const modifiedColorName = data.imageData.colorName
    ? data.imageData.colorName
        .toLowerCase()
        .split(" ")
        .map((s) => s.charAt(0).toUpperCase() + s.substring(1))
        .join(" ")
    : "";

  const colorExists = computer.colors.find(
    (color) => color.name === modifiedColorName
  );

  const updatedImage = await Computer.updateOne(
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

  const updatedComputer = await Computer.findById(data.productId);
  const addedImage = updatedComputer.images.find(
    (image) => image.publicId == result.public_id
  );

  res.status(200).json({ msg: "Added successfully!", image: addedImage });
});

//////////////////////////////-----CHANGE COMPUTER IMAGE STATUS-----//////////////////////////////

const changeImageStatus = asyncHandler(async (req, res) => {
  const { productId, imageId } = req.query;

  const computer = await Computer.findById(productId);
  const mainImage = computer.images.find((image) => image.isMain);

  const setMainStatus = await Computer.updateOne(
    { _id: productId, "images._id": imageId },
    {
      $set: {
        "images.$.isMain": true,
      },
    }
  );
  if (!setMainStatus) throw new Error("something went wrong!");

  if (mainImage) {
    const removeMainStatus = await Computer.updateOne(
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

//////////////////////////////-----DELETE COMPUTER IMAGE-----//////////////////////////////

const deleteImage = asyncHandler(async (req, res) => {
  const { productId, imageId } = req.query;

  const computer = await Computer.findById(productId);
  const image = computer.images.find((img) => img._id == imageId);

  const { result } = await removeImage(image.publicId);
  if (!result) throw new Error("Delete image request has failed!");

  await Computer.updateOne({ _id: productId }, { $pull: { images: image } });

  res.status(200).json({ msg: "Image Deleted Successfully!" });
});

//////////////////////////////-----GET COMPUTER IMAGE COLOR CODE-----//////////////////////////////

const getImageColorCode = asyncHandler(async (req, res) => {
  const { productId, colorName } = req.query;

  const modifiedColorName = colorName
    ? colorName
        .toLowerCase()
        .split(" ")
        .map((s) => s.charAt(0).toUpperCase() + s.substring(1))
        .join(" ")
    : "";

  const computer = await Computer.findById(productId);
  const colorCode = computer.colors.find(
    (color) => color.name === modifiedColorName
  ).code;

  res.status(200).json(colorCode);
});

//////////////////////////////-----EDIT COMPUTER IMAGE COLOR NAME-----//////////////////////////////

const editImageColorName = asyncHandler(async (req, res) => {
  const { productId, imageId, colorName } = req.body;

  const modifiedColorName = colorName
    ? colorName
        .toLowerCase()
        .split(" ")
        .map((s) => s.charAt(0).toUpperCase() + s.substring(1))
        .join(" ")
    : "";

  const computer = await Computer.findById(productId);

  const colorExists = computer.colors.find(
    (color) => color.name === modifiedColorName
  );
  if (colorName && !colorExists)
    throw new Error(`No Match Found for Color Name "${modifiedColorName}"!`);

  await Computer.updateOne(
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
  addComputer,
  getComputers,
  getComputer,
  updateComputerInfo,
  deleteComputers,
  deleteComputer,
  addComputerColor,
  editComputerColor,
  deleteComputerColor,
  addImage,
  changeImageStatus,
  deleteImage,
  getImageColorCode,
  editImageColorName,
};
