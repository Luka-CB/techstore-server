const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const accessorySchema = mongoose.Schema(
  {
    category: { type: String, required: true, trim: true },
    name: { type: String, required: true, trim: true },
    brand: { type: String, required: true, trim: true },
    description: { type: String },
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
    price: { type: Number, required: true },
    totalQty: { type: Number, default: 0 },
  },
  { timestamps: true }
);

accessorySchema.plugin(mongoosePaginate);

module.exports = mongoose.model("Accessory", accessorySchema);
