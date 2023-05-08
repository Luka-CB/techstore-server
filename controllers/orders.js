const asyncHandler = require("express-async-handler");
const { v4: uuidv4 } = require("uuid");
const Order = require("../models/Order");
const User = require("../models/User");
const date = require("date-and-time");

// dsddd

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
    { $push: { orders: newOrder.orderId } }
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
  }).select(
    "_id orderId isPaid payDate isDelivered deliverDate createdAt updatedAt"
  );
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

//////////////////////////////-----UPDATE DELIVERED STATE-----//////////////////////////////

const updateDeliveredState = asyncHandler(async (req, res) => {
  const { orderId } = req.params;

  const updatedOrder = await Order.updateMany(
    { orderId },
    { isDelivered: true, deliverDate: Date.now() }
  );
  if (!updatedOrder)
    throw new Error("Update order delivered state request has failed!");

  res.status(200).json({ msg: "Updated Successfully!" });
});

//////////////////////////////-----DELETE ORDER-----//////////////////////////////

const deleteOrder = asyncHandler(async (req, res) => {
  const { orderId } = req.params;

  const deletedOrder = await Order.deleteOne({ orderId, isForAdmin: false });
  if (!deletedOrder) throw new Error("Delete order request has failed!");

  await User.updateOne({ _id: req.user._id }, { $pull: { orders: orderId } });

  res.status(200).json({ msg: "Deleted Successfully!" });
});

//////////////////////////////-----DELETE ORDER BY ADMIN-----//////////////////////////////

const deleteOrderByAdmin = asyncHandler(async (req, res) => {
  const { orderId, userId } = req.query;

  let deletedOrder;

  const order = await Order.findOne({
    orderId,
  });

  if (!order.isPaid) {
    deletedOrder = await Order.deleteMany({ orderId });
    await User.updateOne({ _id: userId }, { $pull: { orders: orderId } });
  } else {
    deletedOrder = await Order.deleteOne({ orderId, isForAdmin: true });
  }

  if (!deletedOrder)
    throw new Error("Delete order by admin request has failed!");

  res.status(200).json({ msg: "Deleted Successfullly!", order });
});

//////////////////////////////-----DELETE ORDERS BY ADMIN-----//////////////////////////////

const deleteOrdersByAdmin = asyncHandler(async (req, res) => {
  const { orderIds } = req.body;

  const orders = await Order.find({
    orderId: { $in: orderIds },
    isForAdmin: true,
  });

  // Delete paid orders
  const paidOrders = orders.filter((order) => order.isPaid);
  const paidOrderIds = paidOrders.map((order) => order.orderId);
  const deletedPaidOrders = await Order.deleteMany({
    orderId: { $in: paidOrderIds },
    isForAdmin: true,
  });
  if (!deletedPaidOrders)
    throw new Error("Delete paid orders request has failed!");

  // Delete unpaid orders
  const unpaidOrders = orders.filter((order) => !order.isPaid);
  const unpaidOrderIds = unpaidOrders.map((order) => order.orderId);
  const userIds = unpaidOrders.map((order) => order.author);
  const deletedUnpaidOrders = await Order.deleteMany({
    orderId: { $in: unpaidOrderIds },
  });
  if (!deletedUnpaidOrders)
    throw new Error("Delete unpaid orders request has failed!");
  await User.updateMany(
    { _id: { $in: userIds } },
    { $pullAll: { orders: unpaidOrderIds } }
  );

  res.status(200).json({ msg: "Deleted Successfully!" });
});

//////////////////////////////-----GET ORDERS FOR ADMIN-----//////////////////////////////

const getOrdersAdmin = asyncHandler(async (req, res) => {
  const { rppn, orderId, userId, sortBy } = req.query;

  const keyword = orderId
    ? {
        orderId,
      }
    : userId
    ? {
        author: userId,
      }
    : sortBy === "paid"
    ? {
        isPaid: true,
      }
    : sortBy === "unpaid"
    ? {
        isPaid: false,
      }
    : sortBy === "delivered"
    ? {
        isDelivered: true,
      }
    : sortBy === "undelivered"
    ? {
        isDelivered: false,
      }
    : {};

  const orders = await Order.find({ ...keyword, isForAdmin: true })
    .populate("author", "username")
    .select(
      "_id orderId author items totalPrice createdAt isPaid payDate isDelivered deliverDate"
    );

  const orderCount = await Order.countDocuments();

  const num = rppn == 0 ? 20 : rppn;

  const slicedOrders = orders.slice(0, num);

  const modifiedOrders = slicedOrders.map((order) => {
    const newDate = date.format(new Date(order.createdAt), "DD/MM/YYYY");
    const newPayDate = date.format(new Date(order.payDate), "DD/MM/YYYY");
    const newDeliverDate = date.format(
      new Date(order.deliverDate),
      "DD/MM/YYYY"
    );
    return {
      ...order._doc,
      createdAt: newDate,
      payDate: newPayDate,
      deliverDate: newDeliverDate,
    };
  });

  res.status(200).json({ orders: modifiedOrders, orderCount });
});

module.exports = {
  saveOrder,
  getOrders,
  getOrder,
  updatePaidState,
  updateDeliveredState,
  deleteOrder,
  getOrdersAdmin,
  deleteOrderByAdmin,
  deleteOrdersByAdmin,
};
