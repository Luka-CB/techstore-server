const mongoose = require("mongoose");

const orderSchema = mongoose.Schema(
  {
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    orderId: { type: String, required: true },
    items: [
      {
        itemId: { type: String, required: true },
        name: { type: String, required: true },
        itemType: { type: String, required: true },
        qty: { type: Number, required: true },
        price: { type: Number, required: true },
        color: {
          name: { type: String, default: "" },
          code: { type: String, default: "" },
        },
        size: { type: String, default: null },
        imageUrl: { type: String, required: true },
      },
    ],
    shippingData: {
      firstName: { type: String, required: true },
      lastName: { type: String, required: true },
      phoneNumber: { type: Number, required: true },
      emailAddress: { type: String, required: true },
      country: { type: String, required: true },
      city: { type: String, required: true },
      street: { type: String, required: true },
      address: { type: String, required: true },
    },
    totalItems: { type: Number, required: true },
    tax: { type: Number, required: true },
    totalPrice: { type: Number, required: true },
    isPaid: { type: Boolean, default: false },
    payDate: { type: String, default: null },
    isDelivered: { type: Boolean, default: false },
    deliverDate: { type: Date, default: null },
    isForAdmin: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
