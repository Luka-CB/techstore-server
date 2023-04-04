const asyncHandler = require("express-async-handler");
const { v4: uuidv4 } = require("uuid");
const Order = require("../models/Order");
const User = require("../models/User");
const date = require("date-and-time");

//////////////////////////////-----SAVE NEW ORDER-----//////////////////////////////

const saveOrder = asyncHandler(async (req, res) => {
  const data = req.body;

  const newOrder = await Order.create({
    author: req.user._id,
    orderId: uuidv4(),
    ...data,
  });
  if (!newOrder) throw new Error("Save new order request has failed!");

  await Order.create({
    author: req.user._id,
    orderId: newOrder.orderId,
    ...data,
    isForAdmin: true,
  });

  await User.updateOne(
    { _id: req.user._id },
    { $push: { orders: newOrder._id } }
  );

  res.status(200).json({
    orderIds: { orderObjId: newOrder._id, orderId: newOrder.orderId },
    msg: "Order saved successfully!",
  });
});

//////////////////////////////-----GET ORDERS-----//////////////////////////////

const getOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({
    author: req.user._id,
    isForAdmin: false,
  }).select("_id isPaid payDate isDelivered deliverDate createdAt updatedAt");
  if (!orders) throw new Error("Get orders request has failed!");

  res.status(200).json(orders);
});

//////////////////////////////-----GET ORDER-----//////////////////////////////

const getOrder = asyncHandler(async (req, res) => {
  const { orderId } = req.params;

  const order = await Order.findById(orderId);
  if (!order) throw new Error("Get order request has failed!");

  res.status(200).json(order);
});

//////////////////////////////-----UPDATE PAID STATE-----//////////////////////////////

const updatePaidState = asyncHandler(async (req, res) => {
  const data = req.body;

  const updatedOrder = await Order.updateMany(
    { orderId: data.orderId },
    { isPaid: true, payDate: data.create_time }
  );
  if (!updatedOrder)
    throw new Error("Update order paid state request has failed!");

  res.status(200).json({ msg: "Paid Successfully!" });
});

//////////////////////////////-----DELETE ORDER-----//////////////////////////////

const deleteOrder = asyncHandler(async (req, res) => {
  const { orderId } = req.params;

  const deletedOrder = await Order.deleteOne({ _id: orderId });
  if (!deletedOrder) throw new Error("Delete order request has failed!");

  await User.updateOne({ _id: req.user._id }, { $pull: { orders: orderId } });

  res.status(200).json({ msg: "Deleted Successfully!" });
});

//////////////////////////////-----GET ORDERS FOR ADMIN-----//////////////////////////////

const getOrdersAdmin = asyncHandler(async (req, res) => {
  const { rppn } = req.query;

  const orders = await Order.find({ isForAdmin: true })
    .populate("author", "username")
    .select(
      "_id orderId author items totalPrice createdAt isPaid payDate isDelivered deliverDate"
    );

  const num = rppn == 0 ? 20 : rppn;

  const slicedOrders = orders.slice(0, num);

  const modifiedOrders = slicedOrders.map((order) => {
    const newDate = date.format(new Date(order.createdAt), "DD/MM/YYYY");
    return { ...order._doc, createdAt: newDate };
  });

  res.status(200).json(modifiedOrders);
});

module.exports = {
  saveOrder,
  getOrders,
  getOrder,
  updatePaidState,
  deleteOrder,
  getOrdersAdmin,
};
