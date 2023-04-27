const asyncHandler = require("express-async-handler");
const Review = require("../models/Review");
const User = require("../models/User");
const date = require("date-and-time");

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

  const modifiedReviews = reviews.map((review) => {
    const newDate = date.format(new Date(review.createdAt), "DD/MM/YYYY");
    return {
      ...review._doc,
      createdAt: newDate,
    };
  });

  res.status(200).json(modifiedReviews);
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

//////////////////////////////-----GET REVIEWS FOR ADMIN-----//////////////////////////////

const getReviewsForAdmin = asyncHandler(async (req, res) => {
  const { rppn, sort } = req.query;

  const sortOptions = {
    createdAt: sort === "asc" ? 1 : sort === "desc" ? -1 : -1,
  };

  const reviewCount = await Review.countDocuments();

  const reviews = await Review.find()
    .populate("author", "username")
    .sort(sortOptions);

  if (!reviews) throw new Error("Get reviews request has failed");

  const num = rppn == 0 ? 20 : rppn;

  const slicedReviews = reviews.slice(0, num);

  const modifiedReviews = slicedReviews.map((review) => {
    const newDate = date.format(new Date(review.createdAt), "DD/MM/YYYY");
    return {
      ...review._doc,
      createdAt: newDate,
    };
  });

  res.status(200).json({ reviews: modifiedReviews, count: reviewCount });
});

//////////////////////////////-----DELETE REVIEW BY ADMIN-----//////////////////////////////

const deleteReviewByAdmin = asyncHandler(async (req, res) => {
  const { reviewId, userId } = req.query;

  const deletedReview = await Review.deleteOne({ _id: reviewId });
  if (!deletedReview)
    throw new Error("Delete review by admin request has failed!");

  await User.updateOne({ _id: userId }, { $pull: { reviews: reviewId } });

  res.status(200).json({ msg: "Deleted Successfully!" });
});

//////////////////////////////-----GET REVIEWS BY USER ID FOR ADMIN-----//////////////////////////////

const getReviewsByUserId = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const reviews = await Review.find({ author: userId })
    .populate("author", "username")
    .sort({ createdAt: -1 });
  if (!reviews)
    throw new Error("Get reviews by userId for admin request has failed!");

  const modifiedReviews = reviews.map((review) => {
    const newDate = date.format(new Date(review.createdAt), "DD/MM/YYYY");
    return {
      ...review._doc,
      createdAt: newDate,
    };
  });

  res.status(200).json(modifiedReviews);
});

module.exports = {
  addReview,
  getReviews,
  updateReview,
  deleteReview,
  getReviewsForAdmin,
  deleteReviewByAdmin,
  getReviewsByUserId,
};
