const asyncHandler = require("express-async-handler");
const Accessory = require("../models/Accessory");
const Cellphone = require("../models/Cellphone");
const Computer = require("../models/Computer");
const TV = require("../models/TV");

//////////////////////////////-----GET RANDOM PRODUCTS-----//////////////////////////////

const getRandom = asyncHandler(async (req, res) => {
  const accessories = await Accessory.find().select(
    "_id name brand category images price"
  );
  const randomAccNum = Math.floor(Math.random() * accessories.length);
  const randomAccessory = accessories[randomAccNum];

  const cellphones = await Cellphone.find().select(
    "_id name brand year platform.chipset platform.os display.size display.type memory.internal memory.ram price images"
  );
  const randomCellNum = Math.floor(Math.random() * cellphones.length);
  const randomCellphone = cellphones[randomCellNum];

  const computers = await Computer.find().select(
    "_id name brand type processor display graphics storage.size storage.type ram price images"
  );
  const randomCompNum = Math.floor(Math.random() * computers.length);
  const randomComputer = computers[randomCompNum];

  const tvs = await TV.find().select(
    "_id name brand year type resolution images"
  );
  const randomTvNum = Math.floor(Math.random() * tvs.length);
  const randomTv = tvs[randomTvNum];

  const randomProducts = [
    { ...randomAccessory._doc, contentType: "accessories" },
    { ...randomCellphone._doc, contentType: "cellphones" },
    { ...randomComputer._doc, contentType: "computers" },
    { ...randomTv._doc, contentType: "tvs" },
  ].map((prod) => {
    const mainImg = prod.images.find((img) => img.isMain);

    return { ...prod, images: mainImg };
  });

  res.status(200).json(randomProducts);
});

//////////////////////////////-----GET LATEST ACCESSORIES-----//////////////////////////////

const getLatestAccessories = asyncHandler(async (req, res) => {
  const accessories = await Accessory.find()
    .select("_id name category price images")
    .sort({ createdAt: -1 });

  const modifiedAccessories = accessories.map((acc) => {
    const mainImg = acc.images.find((img) => img.isMain);
    return { ...acc._doc, images: mainImg };
  });

  res
    .status(200)
    .json(
      modifiedAccessories.length > 4
        ? modifiedAccessories.slice(1, 4)
        : modifiedAccessories
    );
});

//////////////////////////////-----GET LATEST CELLPHONES-----//////////////////////////////

const getLatestCellphones = asyncHandler(async (req, res) => {
  const cellphones = await Cellphone.find()
    .select(
      "_id name year display.size memory.internal memory.ram price images"
    )
    .sort({ createdAt: -1 });

  const modifiedCellphones = cellphones.map((cell) => {
    const mainImg = cell.images.find((img) => img.isMain);
    return { ...cell._doc, images: mainImg };
  });

  res
    .status(200)
    .json(
      modifiedCellphones.length > 3
        ? modifiedCellphones.slice(1, 4)
        : modifiedCellphones
    );
});

//////////////////////////////-----GET LATEST COMPUTERS-----//////////////////////////////

const getLatestComputers = asyncHandler(async (req, res) => {
  const computers = await Computer.find()
    .select("_id name storage.size storage.type ram price images")
    .sort({ createdAt: -1 });

  const modifiedComputers = computers.map((comp) => {
    const mainImg = comp.images.find((img) => img.isMain);
    return { ...comp._doc, images: mainImg };
  });

  res
    .status(200)
    .json(
      modifiedComputers.length > 3
        ? modifiedComputers.slice(1, 4)
        : modifiedComputers
    );
});

//////////////////////////////-----GET LATEST TVS-----//////////////////////////////

const getLatestTvs = asyncHandler(async (req, res) => {
  const tvs = await TV.find()
    .select("_id name type resolution images")
    .sort({ createdAt: -1 });

  const modifiedTvs = tvs.map((tv) => {
    const mainImg = tv.images.find((img) => img.isMain);
    return { ...tv._doc, images: mainImg };
  });

  res
    .status(200)
    .json(modifiedTvs.length > 4 ? modifiedTvs.slice(1, 4) : modifiedTvs);
});

//////////////////////////////-----SEARCH PRODUCT-----//////////////////////////////

const searchProduct = asyncHandler(async (req, res) => {
  const { q } = req.query;

  const keyword = q
    ? {
        $or: [
          { name: { $regex: q, $options: "i" } },
          { brand: { $regex: q, $options: "i" } },
        ],
      }
    : {};

  const accessorySearchResult = await Accessory.find({ ...keyword }).select(
    "_id name brand images"
  );
  const cellphoneSearchResult = await Cellphone.find({ ...keyword }).select(
    "_id name brand images"
  );
  const computerSearchResult = await Computer.find({ ...keyword }).select(
    "_id name brand images"
  );
  const tvSearchResult = await TV.find({ ...keyword }).select(
    "_id name brand images"
  );

  const accSearchRes = accessorySearchResult.map((asr) => ({
    ...asr._doc,
    contentType: "accessory",
  }));
  const cellSearchRes = cellphoneSearchResult.map((csr) => ({
    ...csr._doc,
    contentType: "cellphone",
  }));
  const compSearchRes = computerSearchResult.map((csr) => ({
    ...csr._doc,
    contentType: "computer",
  }));
  const tvSearchRes = tvSearchResult.map((tsr) => ({
    ...tsr._doc,
    contentType: "tv",
  }));

  const result = [
    ...accSearchRes,
    ...cellSearchRes,
    ...compSearchRes,
    ...tvSearchRes,
  ].map((res) => {
    const mainImg = res.images.find((img) => img.isMain);
    return { ...res, images: mainImg };
  });

  res.status(200).json(result);
});

module.exports = {
  getRandom,
  getLatestAccessories,
  getLatestCellphones,
  getLatestComputers,
  getLatestTvs,
  searchProduct,
};
