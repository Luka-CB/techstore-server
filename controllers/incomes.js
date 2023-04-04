const asyncHandler = require("express-async-handler");
const Income = require("../models/Income");

//////////////////////////////-----UPDATE TOTAL INCOME-----//////////////////////////////

const updateIncome = asyncHandler(async (req, res) => {
  const { amount } = req.body;

  const income = await Income.findOne({});

  if (!income) {
    const newIncome = await Income.create({
      lastPayment: {
        payer: req.user._id,
        amount,
      },
      totalAmount: amount,
    });

    if (!newIncome) throw new Error("Create new income request has failed!");

    res.status(200).json({ msg: "Created Successfully!" });
  } else {
    const updatedIncome = await Income.updateOne(
      {},
      {
        lastPayment: {
          payer: req.user._id,
          amount,
          date: Date.now(),
        },
        totalAmount: income.totalAmount + amount,
      }
    );

    if (!updatedIncome) throw new Error("Update income request has failed!");

    res.status(200).json({ msg: "Updated Successfully!" });
  }
});

module.exports = {
  updateIncome,
};
