const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");

const cellphoneSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    brand: { type: String, required: true },
    year: { type: Number, required: true },
    network: { type: String, required: true },
    body: {
      dimensions: { type: String, required: true },
      weight: { type: String, required: true },
      sim: { type: String, required: true },
    },
    display: {
      type: { type: String, required: true },
      size: { type: Number, required: true },
      resolution: { type: String, required: true },
      protection: { type: String, required: true },
    },
    platform: {
      os: { type: String, required: true },
      chipset: { type: String, required: true },
      cpu: { type: String, required: true },
      gpu: { type: String, required: true },
    },
    memory: {
      cardSlot: { type: String, required: true },
      internal: { type: Number, required: true },
      ram: { type: Number, required: true },
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
    totalQty: { type: Number, default: 0 },
  },
  { timestamps: true }
);

cellphoneSchema.plugin(mongoosePaginate);

module.exports = mongoose.model("Cellphone", cellphoneSchema);
