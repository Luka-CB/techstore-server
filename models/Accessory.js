const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const accessorySchema = mongoose.Schema(
  {
    category: { type: String, required: true },
    name: { type: String, required: true },
    brand: { type: String, required: true },
    description: { type: String },
    colors: [
      {
        name: { type: String },
        code: { type: String },
        qty: { type: Number, default: 0 },
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
    price: { type: Number, required: true },
    totalQty: { type: Number, default: 0 },
  },
  { timestamps: true }
);

accessorySchema.plugin(mongoosePaginate);

module.exports = mongoose.model("Accessory", accessorySchema);
