const mongoose = require("mongoose");

const computerSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    brand: { type: String, required: true },
    type: { type: String, required: true },
    processor: { type: String, required: true },
    os: { type: String, required: true },
    graphics: { type: String, required: true },
    display: { type: String, required: true },
    memory: { type: String, required: true },
    storage: {
      type: { type: String, required: true },
      interface: { type: String, required: true },
      size: { type: Number, required: true },
    },
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
    camera: { type: String, required: true },
    weight: { type: String, required: true },
    price: { type: Number, required: true },
    totalQty: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Computer", computerSchema);
