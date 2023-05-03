const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const cellphoneSchema = mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    brand: { type: String, required: true, trim: true },
    year: { type: Number, required: true },
    network: { type: String, required: true, trim: true },
    body: {
      dimensions: { type: String, required: true, trim: true },
      weight: { type: String, required: true, trim: true },
      sim: { type: String, required: true, trim: true },
    },
    display: {
      type: { type: String, required: true, trim: true },
      size: { type: Number, required: true },
      resolution: { type: String, required: true, trim: true },
      protection: { type: String, required: true, trim: true },
    },
    platform: {
      os: { type: String, required: true, trim: true },
      chipset: { type: String, required: true, trim: true },
      cpu: { type: String, required: true, trim: true },
      gpu: { type: String, required: true, trim: true },
    },
    memory: {
      cardSlot: { type: String, required: true, trim: true },
      internal: { type: String, required: true, trim: true },
      ram: { type: String, required: true, trim: true },
    },
    mainCamera: {
      picture: {
        type: { type: String, required: true },
        details: [{ type: String }],
      },
      features: { type: String, required: true },
      video: { type: String, required: true },
    },
    selfieCamera: {
      picture: {
        type: { type: String, required: true },
        details: [{ type: String }],
      },
      features: { type: String, required: true },
      video: { type: String, required: true },
    },
    battery: { type: String, required: true },
    price: { type: Number, required: true },
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
    totalQty: { type: Number, default: 0 },
  },
  { timestamps: true }
);

cellphoneSchema.plugin(mongoosePaginate);

module.exports = mongoose.model("Cellphone", cellphoneSchema);
