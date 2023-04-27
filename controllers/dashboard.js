const asyncHandler = require("express-async-handler");
const Accessory = require("../models/Accessory");
const Cellphone = require("../models/Cellphone");
const Computer = require("../models/Computer");
const TV = require("../models/TV");
const User = require("../models/User");
const Order = require("../models/Order");
const Review = require("../models/Review");
const Income = require("../models/Income");
const date = require("date-and-time");

//////////////////////////////-----GET DASHBOARD INFO FOR ADMIN-----//////////////////////////////

const getDashboardInfo = asyncHandler(async (req, res) => {
  // Tvs
  const tvs = await TV.find();

  let tvBrands = [];
  let tvTypes = [];

  tvs.map((tv) => {
    !tvBrands.some((tvBrand) => tvBrand === tv.brand) &&
      tvBrands.push(tv.brand);
    !tvTypes.some((tvType) => tvType === tv.type) && tvTypes.push(tv.type);
  });

  // Computers
  const computers = await Computer.find();

  let computerBrands = [];
  let computerTypes = [];
  let computerRams = [];

  computers.map((comp) => {
    !computerBrands.some((brand) => brand === comp.brand) &&
      computerBrands.push(comp.brand);
    !computerTypes.some((type) => type === comp.type) &&
      computerTypes.push(comp.type);
    !computerRams.some((ram) => ram === comp.ram) &&
      computerRams.push(comp.ram);
  });

  // Cellphones
  const cellphones = await Cellphone.find();

  let cellphoneBrands = [];
  let cellphoneYears = [];
  let cellphoneSizes = [];
  let cellphoneStorages = [];
  let cellphoneRams = [];

  cellphones.map((cell) => {
    !cellphoneBrands.some((brand) => brand === cell.brand) &&
      cellphoneBrands.push(cell.brand);
    !cellphoneYears.some((year) => year === cell.year) &&
      cellphoneYears.push(cell.year);
    !cellphoneSizes.some((size) => size === cell.display.size) &&
      cellphoneSizes.push(cell.display.size);
    !cellphoneStorages.some((storage) => storage === cell.memory.internal) &&
      cellphoneStorages.push(cell.memory.internal);
    !cellphoneRams.some((ram) => ram === cell.memory.ram) &&
      cellphoneRams.push(cell.memory.ram);
  });

  // Accessories
  const accessories = await Accessory.find();

  let accessoryBrands = [];
  let accessoryCategories = [];

  accessories.map((acc) => {
    !accessoryBrands.some((brand) => brand === acc.brand) &&
      accessoryBrands.push(acc.brand);
    !accessoryCategories.some((category) => category === acc.category) &&
      accessoryCategories.push(acc.category);
  });

  // Incomes
  const income = await Income.findOne({}).populate(
    "lastPayment.payer",
    "username"
  );

  // Reviews
  const reviews = await Review.find();

  let productsReviewed = [];

  reviews.map(
    (review) =>
      !productsReviewed.some((rev) => rev === review.productId) &&
      productsReviewed.push(review.productId)
  );

  const dashboardInfo = {
    customers: {
      totalCustomers: await User.countDocuments(),
      withGoogle: await User.countDocuments({ provider: "google" }),
      withFacebook: await User.countDocuments({ provider: "facebook" }),
      withLocal: await User.countDocuments({ provider: "local" }),
    },
    tvs: {
      totalTvs: await TV.countDocuments(),
      brands: tvBrands,
      types: tvTypes,
    },
    computers: {
      totalComputers: await Computer.countDocuments(),
      brands: computerBrands,
      types: computerTypes,
      rams: computerRams,
    },
    cellphones: {
      totalCellphones: await Cellphone.countDocuments(),
      brands: cellphoneBrands,
      years: cellphoneYears,
      sizes: cellphoneSizes,
      storages: cellphoneStorages,
      rams: cellphoneRams,
    },
    accessories: {
      totalAccessories: await Accessory.countDocuments(),
      brands: accessoryBrands,
      categories: accessoryCategories,
    },
    orders: {
      totalOrders: await Order.countDocuments({ isForAdmin: true }),
      paidOrders: await Order.countDocuments({
        isPaid: true,
        isForAdmin: true,
      }),
      unpaidOrders: await Order.countDocuments({
        isPaid: false,
        isForAdmin: true,
      }),
      deliveredOrders: await Order.countDocuments({
        isDelivered: true,
        isForAdmin: true,
      }),
      undeliveredOrders: await Order.countDocuments({
        isDelivered: false,
        isForAdmin: true,
      }),
    },
    incomes: {
      totalIncome: income.totalAmount,
      lastPayment: date.format(new Date(income.lastPayment.date), "DD/MM/YYYY"),
      payer: income.lastPayment.payer.username,
      amount: income.lastPayment.amount,
    },
    reviews: {
      totalReviews: await Review.countDocuments(),
      productsReviewed: productsReviewed.length,
    },
  };

  res.status(200).json(dashboardInfo);
});

module.exports = {
  getDashboardInfo,
};
