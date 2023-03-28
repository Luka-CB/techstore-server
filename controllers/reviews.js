const asyncHandler = require("express-async-handler");
const Review = require("../models/Review");
const User = require("../models/User");

//////////////////////////////-----ADD REVIEW-----//////////////////////////////

const addReview = asyncHandler(async (req, res) => {
  const { productId, post } = req.body;

  if (!req.user) throw new Error("Not Authorized!");

  const newReview = await Review.create({
    author: req.user._id,
    productId,
    post,
  });

  await User.updateOne(
    { _id: req.user._id },
    { $push: { reviews: newReview._id } }
  );

  const review = await Review.findOne({ _id: newReview._id }).populate(
    "author",
    "username"
  );

  if (!newReview) throw new Error("Create new review request has failed!");

  res.status(200).json(review);
});

//////////////////////////////-----GET REVIEWS-----//////////////////////////////

const getReviews = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  const reviews = await Review.find({ productId })
    .populate("author", "username")
    .sort({ createdAt: -1 });
  if (!reviews) throw new Error("Get reviews request has failed!");

  res.status(200).json(reviews);
});

//////////////////////////////-----UPDATE REVIEW-----//////////////////////////////

const updateReview = asyncHandler(async (req, res) => {
  const { reviewId, post } = req.body;

  const updatedReview = await Review.updateOne({ _id: reviewId }, { post });
  if (!updatedReview) throw new Error("Update review request has failed!");

  res.status(200).json({ msg: "Updated Successfully!" });
});

//////////////////////////////-----DELETE REVIEW-----//////////////////////////////

const deleteReview = asyncHandler(async (req, res) => {
  const { reviewId } = req.params;

  await User.updateOne({ _id: req.user._id }, { $pull: { reviews: reviewId } });

  const deletedReview = await Review.deleteOne({ _id: reviewId });
  if (!deletedReview) throw new Error("Delete review request has failed!");

  res.status(200).json({ msg: "Deleted Successfully!" });
});

module.exports = {
  addReview,
  getReviews,
  updateReview,
  deleteReview,
};
