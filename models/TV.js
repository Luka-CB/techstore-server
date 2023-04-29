const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const tvSchema = mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    brand: { type: String, required: true, trim: true },
    year: { type: Number, required: true },
    type: { type: String, required: true, trim: true },
    resolution: { type: String, required: true, trim: true },
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
        colorName: { type: String, default: "no" },
        isMain: { type: Boolean, default: false },
      },
    ],
    totalQty: { type: Number, default: 0 },
  },
  { timestamps: true }
);

tvSchema.plugin(mongoosePaginate);

module.exports = mongoose.model("Tv", tvSchema);
