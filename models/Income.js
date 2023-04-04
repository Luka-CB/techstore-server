const mongoose = require("mongoose");

const incomeSchema = mongoose.Schema({
  lastPayment: {
    payer: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    amount: { type: Number, required: true },
    date: { type: Date, default: Date.now },
  },
  totalAmount: { type: Number, required: true },
});

module.exports = mongoose.model("Income", incomeSchema);
