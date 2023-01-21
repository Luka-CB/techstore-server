const mongoose = require("mongoose");

const tvSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    brand: { type: String, required: true },
    year: { type: Number, required: true },
    type: { type: String, required: true },
    resolution: { type: String, required: true },
    sizes: [
      {
        size: { type: Number },
        qty: { type: Number, default: 0 },
        price: { type: Number },
      },
    ],
    images: [
      {
        imageUrl: { type: String },
        publicId: { type: String },
        isMain: { type: Boolean, default: false },
      },
    ],
    totalQty: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Tv", tvSchema);
