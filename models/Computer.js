const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const computerSchema = mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    brand: { type: String, required: true, trim: true },
    type: { type: String, required: true, trim: true },
    processor: { type: String, required: true, trim: true },
    os: { type: String, required: true, trim: true },
    graphics: { type: String, required: true, trim: true },
    screen: { type: String, trim: true },
    ram: { type: String, required: true, trim: true },
    storage: {
      type: { type: String, required: true, trim: true },
      interface: { type: String, trim: true },
      size: { type: String, required: true, trim: true },
    },
    colors: [
      {
        name: { type: String, trim: true },
        code: { type: String, trim: true },
        qty: { type: Number, default: 0 },
      },
    ],
    images: [
      {
        imageUrl: { type: String },
        publicId: { type: String },
        colorName: { type: String, default: "no", trim: true },
        isMain: { type: Boolean, default: false },
      },
    ],
    camera: { type: String },
    weight: { type: String, required: true },
    price: { type: Number, required: true },
    totalQty: { type: Number, default: 0 },
  },
  { timestamps: true }
);

computerSchema.plugin(mongoosePaginate);

module.exports = mongoose.model("Computer", computerSchema);
