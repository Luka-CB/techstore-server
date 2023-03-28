const mongoose = require("mongoose");

const reviewSchema = mongoose.Schema(
  {
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    productId: { type: String, required: true },
    post: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Review", reviewSchema);
