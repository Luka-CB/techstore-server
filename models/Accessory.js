const mongoose = require("mongoose");

const accessorySchema = mongoose.Schema(
  {
    category: { type: String, required: true },
    name: { type: String, required: true },
    brand: { type: String, required: true },
    type: { type: String, required: true },
    description: { type: String, required: true },
    colors: {
      name: { type: String },
      code: { type: String },
      qty: { type: Number, default: 0 },
    },
    images: [
      {
        imageUrl: { type: String },
        publicId: { type: String },
        isMain: { type: Boolean, default: false },
      },
    ],
    price: { type: Number, required: true },
    totalQty: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Accessory", accessorySchema);
